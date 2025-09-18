'use client';

import React, { useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '../context/FormContext';
import dynamic from 'next/dynamic';
import type { AddressData } from '../types/GooglePlacesTypes';
import { trackEvent, trackConversion } from '../utils/analytics';
import { Loader2, AlertCircle } from 'lucide-react';

// Lazy load AddressInput only when needed
const AddressInput = dynamic(() => import('./AddressInput'), {
  loading: () => (
    <div className="w-full px-4 py-3 text-lg border rounded-lg bg-gray-100 animate-pulse">
      <span className="text-gray-400">Loading address input...</span>
    </div>
  ),
  ssr: false
});

interface FormErrors {
  address?: string;
  phone?: string;
  consent?: string;
  submit?: string;
}

const PropertyFormOptimized = memo(function PropertyForm() {
  const router = useRouter();
  const { formState, updateFormData } = useForm();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [consentGiven, setConsentGiven] = useState(formState.consent || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePhone = useCallback((phone: string): boolean => {
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  }, []);

  const handleAddressSelect = useCallback((addressData: AddressData) => {
    trackEvent('property_address_selected', { 
      address: addressData.formattedAddress,
      placeId: addressData.placeId 
    });
    updateFormData({ 
      address: addressData.formattedAddress,
      placeId: addressData.placeId,
      ...(addressData.streetNumber && addressData.street ? {
        streetAddress: `${addressData.streetNumber} ${addressData.street}`.trim()
      } : {}),
      ...(addressData.city ? { city: addressData.city } : {}),
      ...(addressData.state ? { state: addressData.state } : {}),
      ...(addressData.postalCode ? { postalCode: addressData.postalCode } : {})
    });
    setErrors(prev => ({ ...prev, address: undefined }));
    setTouched(prev => ({ ...prev, address: true }));
    setStep(2);
  }, [updateFormData]);

  const formatPhoneNumber = useCallback((value: string) => {
    const phone = value.replace(/\D/g, '');
    if (phone.length < 4) return phone;
    if (phone.length < 7) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
  }, []);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    updateFormData({ phone: formatted });
    
    if (touched.phone) {
      setErrors(prev => ({
        ...prev,
        phone: validatePhone(formatted) ? undefined : 'Please enter a valid phone number'
      }));
    }
  }, [formatPhoneNumber, updateFormData, validatePhone, touched.phone]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formState.address?.trim()) {
      newErrors.address = 'Please select your property address';
    }

    if (!formState.phone?.trim() || !validatePhone(formState.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!consentGiven) {
      newErrors.consent = 'You must agree to be contacted to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formState.address, formState.phone, consentGiven, validatePhone]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setTouched({ address: true, phone: true, consent: true });
      return;
    }

    setIsSubmitting(true);
    
    try {
      updateFormData({ consent: consentGiven });
      
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formState,
          consent: consentGiven,
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form');
      }

      trackConversion();
      trackEvent('form_submitted_successfully', { 
        address: formState.address,
        source: 'property_form'
      });
      
      router.push('/property-listed');
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors(prev => ({ 
        ...prev, 
        submit: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.' 
      }));
      
      trackEvent('form_submission_failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        address: formState.address 
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, formState, consentGiven, updateFormData, router]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto" style={{ contain: 'layout' }}>
      <h2 className="text-2xl font-bold mb-6 text-center">Get Your Cash Offer Today!</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 && (
          <div className="space-y-4">
            <AddressInput
              onAddressSelect={handleAddressSelect}
              error={touched.address ? errors.address : undefined}
            />
            <button
              type="button"
              onClick={() => {
                if (formState.address) {
                  setStep(2);
                } else {
                  setErrors(prev => ({ ...prev, address: 'Please select your property address' }));
                  setTouched(prev => ({ ...prev, address: true }));
                }
              }}
              className="w-full py-3 px-6 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors"
              aria-label="Continue to phone number"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                value={formState.phone || ''}
                onChange={handlePhoneChange}
                onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                placeholder="(555) 555-5555"
                className={`w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all
                  ${touched.phone && errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                required
                disabled={isSubmitting}
              />
              {touched.phone && errors.phone && (
                <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => {
                    setConsentGiven(e.target.checked);
                    setErrors(prev => ({ ...prev, consent: undefined }));
                  }}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-600">
                  By submitting, I agree to be contacted about my property inquiry via call, text, and email. 
                  Message and data rates may apply. Reply STOP to opt-out.
                </span>
              </label>
              {touched.consent && errors.consent && (
                <p className="text-sm text-red-600">{errors.consent}</p>
              )}
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-6 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Get My Cash Offer'
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isSubmitting}
            >
              ← Back to address
            </button>
          </div>
        )}
      </form>
    </div>
  );
});

export default PropertyFormOptimized;