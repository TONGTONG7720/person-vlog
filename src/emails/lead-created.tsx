import { Body, Container, Head, Heading, Html, Preview, Section, Text } from 'react-email';

export type LeadCreatedEmailProps = Readonly<{
  readonly name: string;
  readonly service?: string;
}>;

export function LeadCreatedEmail({ name, service }: LeadCreatedEmailProps): React.JSX.Element {
  const serviceLine = service === undefined ? '你提交的合作咨询' : `关于「${service}」的合作咨询`;

  return (
    <Html lang="zh-CN">
      <Head />
      <Preview>已收到你的合作咨询</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={accentStyle} />
          <Heading style={headingStyle}>已收到你的咨询，{name}</Heading>
          <Text style={textStyle}>{serviceLine} 已进入处理队列。</Text>
          <Text style={textStyle}>
            我会先阅读你的需求，再通过邮箱与你确认下一步。若你有补充信息，也可以直接回复这封邮件。
          </Text>
          <Text style={signatureStyle}>Tong · Java · Python · Vue · AI</Text>
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
  backgroundColor: '#564DDC',
  height: '4px',
  margin: '-32px -32px 28px',
} as const;

const headingStyle = {
  color: '#F7F7F8',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '0 0 20px',
} as const;

const textStyle = {
  color: '#B4B4BC',
  fontSize: '16px',
  lineHeight: '1.75',
  margin: '0 0 16px',
} as const;

const signatureStyle = {
  color: '#7D7D87',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '28px 0 0',
} as const;
