import * as React from 'react'

import {
  Body,
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

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={s.main}>
      <Container style={s.container}>
        <Text style={s.brand}>Agrofeed Global</Text>
        <Heading style={s.h1}>Confirm your identity</Heading>
        <Text style={s.text}>
          Use the verification code below to confirm this sensitive action in the
          Sukuk Data Room.
        </Text>
        <Section style={s.panel}>
          <Text style={s.code}>{token}</Text>
        </Section>
        <Text style={s.muted}>
          This code expires shortly. If you didn&apos;t request it, you can safely
          ignore this email.
        </Text>
        <Hr style={s.hr} />
        <Text style={s.footer}>{s.footerNote}</Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail
