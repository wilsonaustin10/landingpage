import React from 'react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center text-primary mb-8">About JR Home Buyer</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="prose max-w-none">
            <p className="text-lg leading-relaxed text-gray-700 mb-6">
              At JR Home Buyer, we're more than just a real estate company – we're two family men who are passionate about helping our community thrive. As young fathers ourselves, we understand the importance of home and family, and we've made it our mission to help homeowners who are facing challenging situations with their properties.
            </p>
            
            <p className="text-lg leading-relaxed text-gray-700 mb-6">
              Our approach is simple and heartfelt: we work directly with homeowners to provide fair, cash offers for their properties, regardless of the condition. Whether you're dealing with a difficult inheritance, facing foreclosure, or simply need to sell quickly, we're here to help with compassion and understanding.
            </p>

            <p className="text-lg leading-relaxed text-gray-700 mb-6">
              What truly drives us is our love for bringing houses back to life. We take pride in renovating properties and transforming them into beautiful homes that new families can enjoy. Every project we take on is a chance to improve our community and help another family find their path forward.
            </p>

            <p className="text-lg leading-relaxed text-gray-700">
              When you work with JR Home Buyer, you're not just working with a company – you're working with real people who care about your situation and are committed to finding the best solution for you and your family.
            </p>
          </div>
        </div>

        <div className="text-center">
          <a 
            href="/#property-form" 
            className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors text-lg font-semibold"
          >
            Get Your Cash Offer Today
          </a>
        </div>
      </div>
    </div>
  );
} 