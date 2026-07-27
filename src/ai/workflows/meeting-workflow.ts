import { LeadActivityType, type PrismaClient } from '@/generated/prisma/client';
import { parseMeetingAgentResult } from '@/ai/agents/meeting-agent';
import { isSafeAiAutomationInput } from '@/ai/lib/automation-safety';
import { buildMeetingAgentPrompt } from '@/ai/prompts/automation';
import { runAiGeneration } from '@/server/ai/model-runner';
import { appendManagedPrompt } from '@/server/ai/prompt-config';

type MeetingWorkflowInput = Readonly<{
  readonly content: string;
  readonly leadId?: string;
}>;

export type MeetingWorkflowResult = 'completed' | 'manual-review';

export async function runMeetingWorkflow(
  database: PrismaClient,
  input: MeetingWorkflowInput,
): Promise<MeetingWorkflowResult> {
  if (!isSafeAiAutomationInput(input.content)) {
    return 'manual-review';
  }

  const prompt = await appendManagedPrompt(
    database,
    'meeting-agent',
    buildMeetingAgentPrompt(input.content),
  );
  const generated = await runAiGeneration(database, {
    agent: 'meeting',
    maxTokens: 1_100,
    systemPrompt: prompt,
    taskPrompt: '请生成会议总结。',
  });

  if (generated.kind !== 'generated') {
    return 'manual-review';
  }

  const summary = parseMeetingAgentResult(generated.text);

  if (summary === undefined) {
    return 'manual-review';
  }

  const meeting = await database.meetingNote.create({
    data: {
      content: input.content,
      summary: [
        `会议总结：${summary.summary}`,
        `客户目标：${summary.target}`,
        `确定事项：${summary.confirmed.join('；') || '待确认'}`,
        `待确认事项：${summary.openQuestions.join('；') || '无'}`,
        `下一步行动：${summary.nextActions.join('；')}`,
      ].join('\n'),
      ...(input.leadId === undefined ? {} : { leadId: input.leadId }),
    },
  });

  if (input.leadId !== undefined) {
    await database.leadActivity.create({
      data: {
        content: 'AI 已生成会议总结，等待人工确认下一步行动。',
        leadId: input.leadId,
        type: LeadActivityType.MEETING,
      },
    });
  }

  await database.adminActivity.create({
    data: {
      action: 'ai_meeting_summary_created',
      resource: 'meeting_note',
      resourceId: meeting.id,
      summary: 'AI 已生成待审核会议总结',
    },
  });

  return 'completed';
}
