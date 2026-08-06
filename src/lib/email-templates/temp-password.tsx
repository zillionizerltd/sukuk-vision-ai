import React from 'react'
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
import type { TemplateEntry } from './registry'

interface Props {
  fullName?: string
  email?: string
  tempPassword?: string
  org?: string
  loginUrl?: string
}

const Email = ({ fullName, email, tempPassword, org, loginUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Sukuk Data Room access credentials</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>AGROFEED GLOBAL</Text>
        <Heading style={heading}>Your Sukuk Data Room access</Heading>
        <Text style={text}>
          {fullName ? `Hello ${fullName},` : 'Hello,'}
        </Text>
        <Text style={text}>
          An account has been created for you on the Agrofeed Global Sukuk Data Room
          {org ? ` under ${org}` : ''}. Use the temporary password below to sign in for the
          first time — you will be asked to set a permanent password immediately after.
        </Text>

        <Section style={credentials}>
          <Text style={label}>Email</Text>
          <Text style={value}>{email ?? 'your registered email address'}</Text>
          <Text style={label}>Temporary password</Text>
          <Text style={mono}>{tempPassword ?? '(provided by your administrator)'}</Text>
        </Section>

        {loginUrl ? (
          <Section style={{ margin: '24px 0' }}>
            <Button href={loginUrl} style={button}>
              Sign in to the Data Room
            </Button>
          </Section>
        ) : null}

        <Text style={muted}>
          For your security, this temporary password can only be used once. If you did not
          expect this email, please contact your Agrofeed Global administrator.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          Agrofeed Global — Sukuk Data Room. Secure collaboration, Sukuk structuring and
          compliance intelligence.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Your Sukuk Data Room access credentials',
  displayName: 'Temporary password (new user)',
  previewData: {
    fullName: 'Amina Yusuf',
    email: 'amina@alhudacibe.com',
    tempPassword: 'Agro-7Kd2Pq4x',
    org: 'Al Huda CIBE',
    loginUrl: 'https://agrofeedglobal.com/dataroom/login',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px', margin: '0 auto' }
const brand = {
  fontSize: '11px',
  letterSpacing: '2px',
  color: '#006B5E',
  fontWeight: 700 as const,
  margin: '0 0 8px',
}
const heading = { fontSize: '22px', color: '#0F172A', margin: '0 0 20px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#0F172A', lineHeight: '1.6', margin: '0 0 14px' }
const credentials = {
  backgroundColor: '#F5F7FA',
  borderLeft: '3px solid #D4AF37',
  borderRadius: '6px',
  padding: '18px 20px',
  margin: '22px 0',
}
const label = {
  fontSize: '11px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  color: '#5A6472',
  margin: '0 0 4px',
}
const value = { fontSize: '15px', color: '#0F172A', margin: '0 0 14px', fontWeight: 600 as const }
const mono = {
  fontSize: '17px',
  fontFamily: 'Courier New, monospace',
  color: '#006B5E',
  fontWeight: 700 as const,
  margin: '0',
}
const button = {
  backgroundColor: '#D4AF37',
  color: '#0F172A',
  fontSize: '15px',
  fontWeight: 700 as const,
  padding: '12px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
}
const muted = { fontSize: '13px', color: '#5A6472', lineHeight: '1.6', margin: '18px 0 0' }
const hr = { borderColor: '#E3E7ED', margin: '24px 0 14px' }
const footer = { fontSize: '12px', color: '#8A93A0', lineHeight: '1.5', margin: '0' }
