import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-accent text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Image
                src="/JRHomeBuyer Transparent.png"
                alt="JR Home Buyer"
                width={600}
                height={160}
                className="mr-2"
              />
            </div>
            <p className="text-white/90">
              We buy houses in any condition. Get your fair cash offer today.
            </p>
            <div className="space-y-2">
              <a 
                href="tel: (929)-499-2303"
                className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>(929)-499-2303</span>
              </a>
              <a 
                href="mailto:info@FastCashForHomesJR.com"
                className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>info@FastCashForHomesJR.com</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#how-it-works" className="text-white/80 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/80 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#testimonials" className="text-white/80 hover:text-white transition-colors">
                  Testimonials
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Specializing In</h3>
            <ul className="space-y-2">
              <li className="text-white/80">Pre-Foreclosure</li>
              <li className="text-white/80">Probate</li>
              <li className="text-white/80">Storm Damage</li>
              <li className="text-white/80">Tax Liens</li>
              <li className="text-white/80">Evictions</li>
              <li className="text-white/80">Fire Damage</li>
              <li className="text-white/80">Water Damage</li>
              <li className="text-white/80">Code Violations</li>
              
            </ul>
          </div>

          {/* Get Started */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Get Started</h3>
            <p className="text-white/90 mb-4">
              Ready to sell your house? Get your cash offer today!
            </p>
            <Link
              href="/"
              className="inline-block bg-secondary text-white px-6 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Get Your Offer
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20 text-center text-white/80">
          <p>© {new Date().getFullYear()} JR Home Buyer. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 
