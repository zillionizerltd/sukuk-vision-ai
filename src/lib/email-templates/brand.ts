// Shared Agrofeed Global Sukuk Data Room email styling.
// Body background stays #ffffff for email-client compatibility.

export const emerald = '#006B5E'
export const gold = '#D4AF37'
export const navy = '#0F172A'
export const softGrey = '#F5F7FA'

export const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Helvetica, Arial, sans-serif',
}

export const container = {
  padding: '32px 28px',
  maxWidth: '560px',
  margin: '0 auto',
}

export const brand = {
  fontSize: '11px',
  letterSpacing: '2px',
  color: emerald,
  fontWeight: 700 as const,
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
}

export const h1 = {
  fontSize: '22px',
  color: navy,
  fontWeight: 700 as const,
  lineHeight: '1.3',
  margin: '0 0 20px',
}

export const text = {
  fontSize: '15px',
  color: navy,
  lineHeight: '1.6',
  margin: '0 0 16px',
}

export const link = { color: emerald, textDecoration: 'underline' }

export const button = {
  backgroundColor: gold,
  color: navy,
  fontSize: '15px',
  fontWeight: 700 as const,
  borderRadius: '8px',
  padding: '12px 24px',
  textDecoration: 'none',
  display: 'inline-block',
}

export const panel = {
  backgroundColor: softGrey,
  borderLeft: `3px solid ${gold}`,
  borderRadius: '6px',
  padding: '18px 20px',
  margin: '22px 0',
}

export const code = {
  fontSize: '28px',
  fontFamily: 'Courier New, monospace',
  letterSpacing: '6px',
  color: emerald,
  fontWeight: 700 as const,
  margin: '0',
}

export const muted = {
  fontSize: '13px',
  color: '#5A6472',
  lineHeight: '1.6',
  margin: '18px 0 0',
}

export const hr = { borderColor: '#E3E7ED', margin: '24px 0 14px' }

export const footer = {
  fontSize: '12px',
  color: '#8A93A0',
  lineHeight: '1.5',
  margin: '0',
}

export const footerNote =
  'Agrofeed Global — Sukuk Data Room. Secure collaboration, Sukuk structuring and compliance intelligence.'
