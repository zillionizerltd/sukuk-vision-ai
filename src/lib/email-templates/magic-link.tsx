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

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your secure sign-in link for {siteName}</Preview>
    <Body style={s.main}>
      <Container style={s.container}>
        <Text style={s.brand}>Agrofeed Global</Text>
        <Heading style={s.h1}>Your secure sign-in link</Heading>
        <Text style={s.text}>
          Use the button below to sign in to {siteName}. This link can only be
          used once and expires shortly.
        </Text>
        <Section style={{ margin: '24px 0' }}>
          <Button style={s.button} href={confirmationUrl}>
            Sign in
          </Button>
        </Section>
        <Text style={s.muted}>
          If you didn&apos;t request this link, you can safely ignore this email.
        </Text>
        <Hr style={s.hr} />
        <Text style={s.footer}>{s.footerNote}</Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail
