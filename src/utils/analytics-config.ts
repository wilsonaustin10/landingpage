export const config = {
  measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
  debug: process.env.NODE_ENV === 'development',
  cookieDomain: 'auto',
  anonymizeIp: true,
}; 