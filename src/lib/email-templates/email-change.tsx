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

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  oldEmail,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your new email for {siteName}</Preview>
    <Body style={s.main}>
      <Container style={s.container}>
        <Text style={s.brand}>Agrofeed Global</Text>
        <Heading style={s.h1}>Confirm your new email</Heading>
        <Text style={s.text}>
          A request was made to change the email address on your {siteName}
          account.
        </Text>
        <Section style={s.panel}>
          <Text style={{ ...s.text, margin: '0 0 6px' }}>
            <strong>From:</strong> {oldEmail || email}
          </Text>
          <Text style={{ ...s.text, margin: '0' }}>
            <strong>To:</strong> {newEmail || email}
          </Text>
        </Section>
        <Section style={{ margin: '24px 0' }}>
          <Button style={s.button} href={confirmationUrl}>
            Confirm change
          </Button>
        </Section>
        <Text style={s.muted}>
          If you didn&apos;t request this change, contact your Agrofeed Global
          administrator immediately.
        </Text>
        <Hr style={s.hr} />
        <Text style={s.footer}>{s.footerNote}</Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
