import { Inter } from 'next/font/google';
import './globals.css';
import { FormProvider } from '../context/FormContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Script from 'next/script';
import ClientWrapper from '../components/ClientWrapper';
import { metadata as siteMetadata } from './metadata';

export const metadata = siteMetadata;

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true
});

const criticalCSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; scroll-behavior: smooth; overflow-y: scroll; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5; color: #1a202c; }
  .min-h-screen { min-height: 100vh; }
  .bg-gradient-to-b { background-image: linear-gradient(to bottom, var(--tw-gradient-stops)); }
  .from-gray-50 { --tw-gradient-from: #f9fafb; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
  .to-white { --tw-gradient-to: #ffffff; }
  .pt-20 { padding-top: 5rem; }
  .pb-16 { padding-bottom: 4rem; }
  .px-4 { padding-left: 1rem; padding-right: 1rem; }
  .bg-cover { background-size: cover; }
  .bg-center { background-position: center; }
  .max-w-6xl { max-width: 72rem; }
  .mx-auto { margin-left: auto; margin-right: auto; }
  .text-center { text-align: center; }
  .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
  .font-bold { font-weight: 700; }
  .text-white { color: #ffffff; }
  .mb-6 { margin-bottom: 1.5rem; }
  .mb-8 { margin-bottom: 2rem; }
  .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
  .max-w-md { max-width: 28rem; }
  .bg-white { background-color: #ffffff; }
  .rounded-lg { border-radius: 0.5rem; }
  .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
  .p-6 { padding: 1.5rem; }
  .text-outline-black { text-shadow: 1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8), 1px -1px 2px rgba(0,0,0,0.8), -1px 1px 2px rgba(0,0,0,0.8); }
  @media (min-width: 768px) { .md\\:text-5xl { font-size: 3rem; line-height: 1; } }
  @media (min-width: 1024px) { .lg\\:text-6xl { font-size: 3.75rem; line-height: 1; } }
  [style*="contain"] { contain: layout; }
  *:focus-visible { outline: 2px solid #3b82f6; outline-offset: 2px; }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        <link rel="canonical" href="https://offer.xvrbuyshouses.com" />
        <meta name="google-site-verification" content="your-google-verification-code" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.gstatic.com" />
        <link rel="dns-prefetch" href="https://www.google.com" />
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