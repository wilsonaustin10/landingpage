'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { FormProvider } from '../context/FormContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Script from 'next/script';
import { ScriptLoadingProvider } from '../context/ScriptLoadingContext';
import { useScriptLoading } from '../context/ScriptLoadingContext';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

function GoogleMapsLoader() {
  const { setGoogleMapsLoaded } = useScriptLoading();

  return (
    <Script
      src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`}
      strategy="afterInteractive"
      onLoad={() => {
        console.log('Google Maps script tag loaded and ready.');
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
        {/* Load Google Tag Manager first */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-16509338772"
          strategy="beforeInteractive"
          onLoad={() => {
            console.log('Google Tag Manager loaded');
            window.dataLayer = window.dataLayer || [];
            window.gtag = function(...args) {
              window.dataLayer.push(args);
            };
            window.gtag('js', new Date());
            window.gtag('config', 'AW-16509338772');
          }}
        />
      </head>
      <body className={inter.className}>
        <ScriptLoadingProvider>
          <FormProvider>
            <GoogleMapsLoader />
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