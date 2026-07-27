import { Body, Container, Head, Heading, Html, Preview, Section, Text } from 'react-email';

export type ProjectUpdateEmailProps = Readonly<{
  readonly name: string;
  readonly projectTitle: string;
  readonly statusLabel: string;
}>;

export function ProjectUpdateEmail({
  name,
  projectTitle,
  statusLabel,
}: ProjectUpdateEmailProps): React.JSX.Element {
  return (
    <Html lang="zh-CN">
      <Head />
      <Preview>{projectTitle} 的项目状态已更新</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={accentStyle} />
          <Heading style={headingStyle}>项目进度更新</Heading>
          <Text style={textStyle}>你好，{name}。</Text>
          <Text style={textStyle}>
            「{projectTitle}」当前已更新为「{statusLabel}
            」。如有需要确认的事项，我会通过邮件进一步说明。
          </Text>
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
