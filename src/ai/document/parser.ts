import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

export const supportedAiDocumentSourceTypes = ['TEXT', 'MARKDOWN', 'PDF', 'DOCX'] as const;

export type SupportedAiDocumentSourceType = (typeof supportedAiDocumentSourceTypes)[number];

export class DocumentParseError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'DocumentParseError';
  }
}

type ExtractDocumentTextInput = Readonly<{
  readonly binary?: Buffer;
  readonly content?: string | null;
  readonly sourceType: SupportedAiDocumentSourceType;
}>;

export async function extractDocumentText(input: ExtractDocumentTextInput): Promise<string> {
  switch (input.sourceType) {
    case 'TEXT':
    case 'MARKDOWN':
      return normalizeExtractedText(input.content ?? '');
    case 'PDF':
      return extractPdfText(requireDocumentBinary(input.binary));
    case 'DOCX':
      return extractDocxText(requireDocumentBinary(input.binary));
  }
}

export function normalizeExtractedText(value: string): string {
  return value
    .replaceAll(/\u0000/gu, '')
    .replaceAll(/\s+/gu, ' ')
    .trim();
}

async function extractPdfText(binary: Buffer): Promise<string> {
  try {
    const parser = new PDFParse({ data: binary });

    try {
      const result = await parser.getText();

      return normalizeExtractedText(result.text);
    } finally {
      await parser.destroy();
    }
  } catch {
    throw new DocumentParseError('PDF 文本解析失败。');
  }
}

async function extractDocxText(binary: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer: binary });

    return normalizeExtractedText(result.value);
  } catch {
    throw new DocumentParseError('DOCX 文本解析失败。');
  }
}

function requireDocumentBinary(value: Buffer | undefined): Buffer {
  if (value === undefined || value.byteLength === 0) {
    throw new DocumentParseError('文档内容为空。');
  }

  return value;
}
