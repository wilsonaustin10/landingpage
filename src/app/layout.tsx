'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { FormProvider } from '../context/FormContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Script from 'next/script';
import Analytics from '../components/Analytics';
import { ScriptLoadingProvider } from '../context/ScriptLoadingContext';
import { useScriptLoading } from '../context/ScriptLoadingContext';

const inter = Inter({ subsets: ['latin'] });

function GoogleTagManager() {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=AW-16509338772"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-16509338772');
        `}
      </Script>
    </>
  );
}

function GoogleMapsLoader() {
  const { setGoogleMapsLoaded } = useScriptLoading();

  return (
    <Script
      src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places&v=beta`}
      strategy="afterInteractive"
      async
      defer
      onLoad={() => {
        console.log('Google Maps Places API loaded successfully (via Script tag)');
        setGoogleMapsLoaded(true);
      }}
      onError={(e) => {
        console.error('Error loading Google Maps Places API:', e);
        setGoogleMapsLoaded(false);
      }}
    />
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Script loading is handled within the provider now */}
      </head>
      <body className={inter.className}>
        <ScriptLoadingProvider>
          <FormProvider>
            <GoogleTagManager />
            <GoogleMapsLoader />
            <Analytics />
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </FormProvider>
        </ScriptLoadingProvider>
      </body>
    </html>
  );
} 