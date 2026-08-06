import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

import * as s from './brand'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your {siteName} password</Preview>
    <Body style={s.main}>
      <Container style={s.container}>
        <Text style={s.brand}>Agrofeed Global</Text>
        <Heading style={s.h1}>Reset your password</Heading>
        <Text style={s.text}>
          We received a request to reset the password for your {siteName}
          account. Choose a new password using the button below.
        </Text>
        <Section style={{ margin: '24px 0' }}>
          <Button style={s.button} href={confirmationUrl}>
            Reset password
          </Button>
        </Section>
        <Text style={s.muted}>
          If you didn&apos;t request a password reset, no action is needed — your
          current password remains active.
        </Text>
        <Hr style={s.hr} />
        <Text style={s.footer}>{s.footerNote}</Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
