'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThumbsUp, ThumbsDown, Phone } from 'lucide-react';
import { useForm } from '../../context/FormContext';
import { trackEvent, trackConversion } from '../../utils/analytics';
import Link from 'next/link';

export default function PropertyListedPage() {
  const router = useRouter();
  const { updateFormData, formState } = useForm();

  useEffect(() => {
    // Only track partial conversion if we haven't tracked a full conversion yet
    if (!sessionStorage.getItem('fullConversionTracked')) {
      trackConversion('partial');
      // Store leadId in sessionStorage to prevent double counting
      if (formState.leadId) {
        sessionStorage.setItem('leadId', formState.leadId);
      }
    }
  }, [formState.leadId]);

  const handleChoice = (isListed: boolean) => {
    updateFormData({ isPropertyListed: isListed });
    trackEvent('property_listed_response', { isListed });
    router.push('/timeline');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-gray-50 pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center text-gray-900">
            <h1 className="text-3xl md:text-4xl font-bold mb-12">
              Help Us Out With A Few More Bits Of Info
            </h1>

            <div className="text-2xl mb-8">OR</div>

            <div className="mb-12">
              <Link
                href="tel:(929)-499-2303"
                className="inline-block bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-md text-xl font-medium transition-colors"
              >
                Call Us Now: (929)-499-2303
              </Link>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl mb-8">Is your property already listed?</h2>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleChoice(true)}
                  className="flex-1 max-w-xs bg-primary hover:bg-primary/90 text-white py-4 px-6 rounded-md flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span>Yes</span>
                  <ThumbsUp className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleChoice(false)}
                  className="flex-1 max-w-xs bg-primary hover:bg-primary/90 text-white py-4 px-6 rounded-md flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span>No</span>
                  <ThumbsDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-24">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              WE WANT TO HELP!
            </h2>
            <p className="text-center text-gray-600 leading-relaxed">
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