'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { FormProvider } from '../context/FormContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Script from 'next/script';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

// Development mode fallback key (this is not a real key, just for development)
const DEV_FALLBACK_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the reCAPTCHA site key from env, use fallback in development
  const reCaptchaSiteKey = 
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || 
    (process.env.NODE_ENV === 'development' ? DEV_FALLBACK_SITE_KEY : '');

  return (
    <html lang="en">
      <head>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="beforeInteractive"
          onLoad={() => {
            console.log('Google Maps script loaded');
          }}
          onError={(e) => {
            console.error('Error loading Google Maps script:', e);
          }}
        />
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=AW-16967791791"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-16967791791');
              
              // Google Conversion Tracking
              function gtag_report_conversion(url) {
                var callback = function () {
                  if (typeof(url) != 'undefined') {
                    window.location = url;
                  }
                };
                gtag('event', 'conversion', {
                  'send_to': 'AW-16967791791/q_jACIuaq7IaEK_p75o_',
                  'value': 1.0,
                  'currency': 'USD',
                  'event_callback': callback
                });
                return false;
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <GoogleReCaptchaProvider
          reCaptchaKey={reCaptchaSiteKey}
          scriptProps={{
            async: true,
            defer: true,
            appendTo: 'head',
          }}
        >
          <FormProvider>
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </FormProvider>
        </GoogleReCaptchaProvider>
      </body>
    </html>
  );
} 