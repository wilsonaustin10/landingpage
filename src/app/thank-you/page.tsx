'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Clock, Phone, ArrowRight } from 'lucide-react';
import { useForm } from '../../context/FormContext';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export default function ThankYouPage() {
  const router = useRouter();
  const { formState } = useForm();

  useEffect(() => {
    // Only track conversion if we haven't tracked it yet in this session
    const conversionTracked = sessionStorage.getItem('fullConversionTracked');
    if (!conversionTracked && typeof window !== 'undefined' && window.gtag) {
      // Track the Google Ads conversion
      window.gtag('event', 'conversion', {
        'send_to': 'AW-16509338772/QFoaCM6wqrIaEJSJosA9',
        'value': 1.0,
        'currency': 'USD'
      });

      // Store leadId and mark conversion as tracked
      if (formState.leadId) {
        sessionStorage.setItem('leadId', formState.leadId);
      }
      sessionStorage.setItem('fullConversionTracked', 'true');
      
      console.log('Full conversion tracked successfully');
    }
  }, [formState.leadId]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Thank You! We've Received Your Information
          </h1>
          <p className="text-xl text-gray-600">
            One of our property specialists will contact you shortly with your cash offer
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">What Happens Next?</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Quick Response</h3>
                <p className="text-gray-600">
                  We'll review your property details and contact you immediately with a fair cash offer
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Personal Consultation</h3>
                <p className="text-gray-600">
                  We'll discuss your specific situation and answer any questions you have about the process
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <ArrowRight className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Close On Your Timeline</h3>
                <p className="text-gray-600">
                  Once you accept our offer, we can close as quickly as 7 days or on your preferred timeline
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 text-center">
          <h3 className="font-semibold text-lg mb-2">Need Immediate Assistance?</h3>
          <p className="text-gray-600 mb-4">
            Our team is available to help answer any questions
          </p>
          <a 
            href="tel:(929)-499-2303" 
            className="inline-flex items-center justify-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Phone className="h-5 w-5" />
            <span>Call Us Now</span>
          </a>
        </div>
      </div>
    </main>
  );
} 