import { Inter } from 'next/font/google';
import './globals.css';
import { FormProvider } from '../context/FormContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Script from 'next/script';
import ClientWrapper from '../components/ClientWrapper';
import { metadata as siteMetadata } from './metadata';

export const metadata = siteMetadata;

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://offer.xvrbuyshouses.com" />
        <meta name="google-site-verification" content="your-google-verification-code" />
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="beforeInteractive"
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
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              "name": "XVR Buys Houses",
              "url": "https://offer.xvrbuyshouses.com",
              "logo": "https://offer.xvrbuyshouses.com/JR Home Buyer Header Logo.png",
              "description": "We buy houses in any condition. Get a fast, no-obligation cash offer for your property.",
              "areaServed": ["California", "Nevada", "Arizona", "Oregon"],
              "serviceType": "Cash Home Buying",
              "priceRange": "$$",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
                "areaServed": "US"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <ClientWrapper>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </ClientWrapper>
      </body>
    </html>
  );
} 