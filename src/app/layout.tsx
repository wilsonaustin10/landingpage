'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { FormProvider } from '../context/FormContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Script from 'next/script';
import Analytics from '../components/Analytics';
import { createContext, useContext, useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places&v=beta`}
          strategy="afterInteractive"
          async
          defer
          onLoad={() => {
            console.log('Google Maps Places API loaded successfully');
          }}
          onError={(e) => {
            console.error('Error loading Google Maps Places API:', e);
          }}
        />
      </head>
      <body className={inter.className}>
        <FormProvider>
          <Analytics />
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </FormProvider>
      </body>
    </html>
  );
} 