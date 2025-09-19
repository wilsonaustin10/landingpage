'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '../../context/FormContext';
import { trackEvent } from '../../utils/analytics';
import { Loader2, AlertCircle } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export default function ContactPage() {
  const router = useRouter();
  const { formState, updateFormData, submitForm } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get reCAPTCHA execute function
  const { executeRecaptcha } = useGoogleReCaptcha();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (loading) {
      console.log('Form submission already in progress, preventing duplicate');
      return;
    }
    
    // Comprehensive validation before submission
    const validationErrors: string[] = [];
    
    if (!formState.firstName?.trim()) {
      validationErrors.push('First name is required');
    }
    
    if (!formState.lastName?.trim()) {
      validationErrors.push('Last name is required');
    }
    
    if (!validateEmail(formState.email || '')) {
      validationErrors.push('Valid email address is required');
    }
    
    // Verify all previous steps were completed
    if (!formState.address?.trim()) {
      validationErrors.push('Property address is missing - please go back and complete step 1');
    }
    
    if (!formState.phone?.trim()) {
      validationErrors.push('Phone number is missing - please go back and complete step 1');
    }
    
    if (!formState.propertyCondition) {
      validationErrors.push('Property condition is missing - please go back and complete previous steps');
    }
    
    if (!formState.timeframe) {
      validationErrors.push('Timeframe is missing - please go back and complete previous steps');
    }
    
    if (!formState.price) {
      validationErrors.push('Price expectation is missing - please go back and complete previous steps');
    }
    
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Generate reCAPTCHA token for form submission
      let recaptchaToken = null;
      if (executeRecaptcha) {
        try {
          // Use a short timeout to prevent blocking the submission if reCAPTCHA is slow
          const tokenPromise = executeRecaptcha('submit_form');
          const timeoutPromise = new Promise<string | null>((resolve) => {
            setTimeout(() => resolve(null), 1000); // Wait max 1 second
          });
          
          recaptchaToken = await Promise.race([tokenPromise, timeoutPromise]);
          
          if (recaptchaToken) {
            console.log('Generated reCAPTCHA token for final form submission');
          } else {
            console.warn('reCAPTCHA token generation timed out, proceeding anyway');
          }
        } catch (recaptchaError) {
          console.error('Failed to execute reCAPTCHA:', recaptchaError);
          // Continue anyway, as this is the final step
        }
      } else {
        console.warn('reCAPTCHA not available for final form submission');
      }

      console.log('Submitting complete form data to API with reCAPTCHA:', {
        hasRecaptchaToken: !!recaptchaToken,
        formFields: Object.keys(formState)
      });

      // Submit the form data to the API with reCAPTCHA token
      const result = await submitForm(recaptchaToken || undefined);

      if (result.success) {
        // Track successful submission
        trackEvent('form_submitted', {
          hasEmail: !!formState.email,
          hasPhone: !!formState.phone,
          hasAddress: !!formState.address,
          hasPropertyCondition: !!formState.propertyCondition,
          isPropertyListed: formState.isPropertyListed,
          hasTimeframe: !!formState.timeframe,
          hasPrice: !!formState.price
        });

        router.push('/thank-you');
      } else {
        throw new Error(result.error || 'Form submission failed');
      }
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
          This is the last step!  
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formState.firstName || ''}
                  onChange={(e) => updateFormData({ firstName: e.target.value })}
                  placeholder="First name"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formState.lastName || ''}
                  onChange={(e) => updateFormData({ lastName: e.target.value })}
                  placeholder="Last name"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formState.email || ''}
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