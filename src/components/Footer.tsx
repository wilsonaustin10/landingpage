import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">FastCashOffer</h3>
            <p className="text-gray-400">
              We buy houses in any condition. Get your fair cash offer today.
            </p>
            <div className="space-y-2">
              <a 
                href="tel:(512)-792-4086"
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>(512) 792-4086</span>
              </a>
              <a 
                href="mailto:info@fastcashoffer.com"
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>info@fastcashoffer.com</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/how-it-works" className="text-gray-400 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="text-gray-400 hover:text-white transition-colors">
                  Testimonials
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Service Areas</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Dallas, TX</li>
              <li className="text-gray-400">Fort Worth, TX</li>
              <li className="text-gray-400">Arlington, TX</li>
              <li className="text-gray-400">Plano, TX</li>
            </ul>
          </div>

          {/* Get Started */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Get Started</h3>
            <p className="text-gray-400 mb-4">
              Ready to sell your house? Get your cash offer today!
            </p>
            <Link
              href="/"
              className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Get Your Offer
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>© {new Date().getFullYear()} FastCashOffer. All rights reserved.</p>
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