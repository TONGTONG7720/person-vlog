import { Body, Container, Head, Heading, Html, Preview, Section, Text } from 'react-email';

export type ContactReceivedEmailProps = Readonly<{
  readonly budget?: string;
  readonly company?: string;
  readonly email: string;
  readonly leadId: string;
  readonly name: string;
  readonly service?: string;
  readonly source?: string;
}>;

export function ContactReceivedEmail({
  budget,
  company,
  email,
  leadId,
  name,
  service,
  source,
}: ContactReceivedEmailProps): React.JSX.Element {
  return (
    <Html lang="zh-CN">
      <Head />
      <Preview>新的 CRM 合作线索：{name}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={accentStyle} />
          <Heading style={headingStyle}>新的合作线索</Heading>
          <Text style={textStyle}>请在 CRM 看板中安排下一步跟进。</Text>
          <Section style={detailStyle}>
            <Text style={detailLineStyle}>联系人：{name}</Text>
            <Text style={detailLineStyle}>邮箱：{email}</Text>
            <Text style={detailLineStyle}>公司：{company ?? '未填写'}</Text>
            <Text style={detailLineStyle}>服务：{service ?? '未选择'}</Text>
            <Text style={detailLineStyle}>预算：{budget ?? '未填写'}</Text>
            <Text style={detailLineStyle}>来源：{source ?? '直接访问'}</Text>
            <Text style={detailLineStyle}>线索编号：{leadId}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = {
  backgroundColor: '#050505',
  color: '#F7F7F8',
  fontFamily: 'Arial, PingFang SC, Microsoft YaHei, sans-serif',
  margin: '0',
  padding: '32px 16px',
} as const;

const containerStyle = {
  backgroundColor: '#111114',
  border: '1px solid #2A2A30',
  borderRadius: '14px',
  margin: '0 auto',
  maxWidth: '560px',
  overflow: 'hidden',
  padding: '32px',
} as const;

const accentStyle = {
  backgroundColor: '#22D3EE',
  height: '4px',
  margin: '-32px -32px 28px',
} as const;

const headingStyle = {
  color: '#F7F7F8',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '0 0 16px',
} as const;

const textStyle = {
  color: '#B4B4BC',
  fontSize: '16px',
  lineHeight: '1.7',
  margin: '0 0 16px',
} as const;

const detailStyle = {
  backgroundColor: '#1A1A1F',
  border: '1px solid #2A2A30',
  borderRadius: '10px',
  margin: '0',
  padding: '16px 20px',
} as const;

const detailLineStyle = {
  color: '#B4B4BC',
  fontSize: '14px',
  lineHeight: '1.65',
  margin: '0 0 8px',
} as const;
