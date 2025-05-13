import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-footer-bg text-footer-text">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Image
                src="/XVRsimple-white.png"
                alt="XVR Buys Houses"
                width={600}
                height={160}
                className="mr-2"
              />
            </div>
            <p className="text-footer-text/90">
              We buy houses in any condition. Get your fair cash offer today.
            </p>
            <div className="space-y-2">
              <a 
                href="tel:(415) 843-7975"
                className="flex items-center space-x-2 text-footer-text/80 hover:text-footer-hover transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>(415) 843-7975</span>
              </a>
              <a 
                href="mailto:caesar@xvrbuyshouses.com"
                className="flex items-center space-x-2 text-footer-text/80 hover:text-footer-hover transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>caesar@xvrbuyshouses.com</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#how-it-works" className="text-footer-text/80 hover:text-footer-hover transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-footer-text/80 hover:text-footer-hover transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#testimonials" className="text-footer-text/80 hover:text-footer-hover transition-colors">
                  Testimonials
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Service Areas</h3>
            <ul className="space-y-2">
              <li className="text-footer-text/80">California</li>
              <li className="text-footer-text/80">Nevada</li>
              <li className="text-footer-text/80">Arizona</li>
              <li className="text-footer-text/80">Oregon</li>
            </ul>
          </div>

          {/* Get Started */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Get Started</h3>
            <p className="text-footer-text/90 mb-4">
              Ready to sell your house? Get your cash offer today!
            </p>
            <Link
              href="/"
              className="inline-block bg-secondary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Get Your Offer
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-footer-text/20 text-center text-footer-text/80">
          <p>© {new Date().getFullYear()} XVR Buys Houses. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy-policy" className="hover:text-footer-hover transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-footer-hover transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 
