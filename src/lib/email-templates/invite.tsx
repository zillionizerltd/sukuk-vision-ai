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

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You&apos;ve been invited to {siteName}</Preview>
    <Body style={s.main}>
      <Container style={s.container}>
        <Text style={s.brand}>Agrofeed Global</Text>
        <Heading style={s.h1}>You&apos;ve been invited</Heading>
        <Text style={s.text}>
          You have been invited to join{' '}
          <Link href={siteUrl} style={s.link}>
            <strong>{siteName}</strong>
          </Link>{' '}
          — the secure workspace for Sukuk structuring, compliance and document
          collaboration.
        </Text>
        <Section style={{ margin: '24px 0' }}>
          <Button style={s.button} href={confirmationUrl}>
            Accept invitation
          </Button>
        </Section>
        <Text style={s.muted}>
          Access is invitation-only. If this wasn&apos;t expected, you can ignore
          this email.
        </Text>
        <Hr style={s.hr} />
        <Text style={s.footer}>{s.footerNote}</Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail
