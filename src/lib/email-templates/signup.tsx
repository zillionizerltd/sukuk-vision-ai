import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

import * as s from './brand'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email for {siteName}</Preview>
    <Body style={s.main}>
      <Container style={s.container}>
        <Text style={s.brand}>Agrofeed Global</Text>
        <Heading style={s.h1}>Confirm your email address</Heading>
        <Text style={s.text}>
          Thanks for signing up for{' '}
          <Link href={siteUrl} style={s.link}>
            <strong>{siteName}</strong>
          </Link>
          .
        </Text>
        <Text style={s.text}>
          Please confirm{' '}
          <Link href={`mailto:${recipient}`} style={s.link}>
            {recipient}
          </Link>{' '}
          to activate your Data Room access.
        </Text>
        <Section style={{ margin: '24px 0' }}>
          <Button style={s.button} href={confirmationUrl}>
            Verify email
          </Button>
        </Section>
        <Text style={s.muted}>
          If you didn&apos;t create an account, you can safely ignore this email.
        </Text>
        <Hr style={s.hr} />
        <Text style={s.footer}>{s.footerNote}</Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
