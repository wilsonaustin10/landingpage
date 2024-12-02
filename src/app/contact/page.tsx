'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '../../context/FormContext';
import { trackEvent } from '../../utils/analytics';
import { Loader2, AlertCircle } from 'lucide-react';
import AddressForm from '../../components/AddressForm';

export default function ContactPage() {
  const router = useRouter();
  const { formData, updateFormData } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddressSelected = (address: string) => {
    updateFormData({ address });
    trackEvent('address_selected');
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(formData.email || '')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      trackEvent('contact_details_submitted');
      
      // TODO: Add final form submission logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to thank you page
      router.push('/thank-you');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Almost Done! Just a Few More Details
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Address
              </label>
              <AddressForm onAddressSelected={handleAddressSelected} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => updateFormData({ email: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Get Your Offer</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
} 