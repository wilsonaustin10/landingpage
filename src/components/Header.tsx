'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            {/* Replace with your actual logo */}
            <div className="text-xl font-bold text-primary">FastCashOffer</div>
          </Link>

          <div className="flex items-center space-x-6">
            <a 
              href="tel:(512)-792-4086"
              className="hidden md:flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
              onClick={() => trackEvent('header_phone_click')}
            >
              <Phone className="h-5 w-5" />
              <span className="font-semibold">(512) 792-4086</span>
            </a>
            
            <Link
              href="/"
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Get Cash Offer
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 