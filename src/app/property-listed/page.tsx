'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ThumbsUp, ThumbsDown, Phone } from 'lucide-react';
import { useForm } from '../../context/FormContext';
import { trackEvent } from '../../utils/analytics';
import Link from 'next/link';

export default function PropertyListedPage() {
  const router = useRouter();
  const { updateFormData } = useForm();

  const handleChoice = (isListed: boolean) => {
    updateFormData({ isPropertyListed: isListed });
    trackEvent('property_listed_response', { isListed });
    router.push('/property-details');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-blue-800">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-12">
              Help Us Out With A Few More Bits Of Info
            </h1>

            <div className="text-2xl mb-8">OR</div>

            <div className="mb-12">
              <Link
                href="tel:(512)-792-4086"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-md text-xl font-medium transition-colors"
                onClick={() => trackEvent('phone_call_clicked')}
              >
                Call Us Now: (512) 792-4086
              </Link>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl mb-8">Is your property already listed?</h2>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleChoice(true)}
                  className="flex-1 max-w-xs bg-white hover:bg-gray-100 text-blue-800 py-4 px-6 rounded-md flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Yes</span>
                  <ThumbsUp className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleChoice(false)}
                  className="flex-1 max-w-xs bg-white hover:bg-gray-100 text-blue-800 py-4 px-6 rounded-md flex items-center justify-center gap-2 transition-colors"
                >
                  <span>No</span>
                  <ThumbsDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-24">
            <h2 className="text-3xl font-bold text-center text-white mb-8">
              WE WANT TO HELP!
            </h2>
            <p className="text-center text-white/90 leading-relaxed">
              Life is hard enough without having to worry about trying to sell your home. 
              We do everything possible to make selling your home as convenient and stress-free as possible. 
              After you've completed the form above, we'll give you a call to determine the best solution for your situation.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 