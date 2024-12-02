import React from 'react';
import LeadForm from '../components/LeadForm';
import Testimonials from '../components/Testimonials';
import TrustBadges from '../components/TrustBadges';
import { CheckCircle } from 'lucide-react';
import { Benefits } from '../components/Benefits';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            The fastest and easiest way to sell your house
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sell your house in as little as 7 days - no repairs, no fees, and we cover closing costs
          </p>
          <LeadForm />
          <Benefits />
        </div>
      </section>

      <TrustBadges />
      
      {/* Benefits Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Sell Your House To Us?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Fast Closing',
                description: 'Close in as little as 7 days or on your timeline'
              },
              {
                title: 'No Repairs Needed',
                description: 'We buy houses in any condition - you won\'t need to fix anything'
              },
              {
                title: 'No Fees or Commissions',
                description: 'Save thousands in realtor fees and closing costs'
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center p-6 rounded-lg shadow-lg bg-white">
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <Testimonials />
    </main>
  );
} 