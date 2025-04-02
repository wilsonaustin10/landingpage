'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '../context/FormContext';
import AddressInput from './AddressInput';
import type { AddressData } from '../types/GooglePlacesTypes';
import { trackEvent } from '../utils/analytics';
import { Loader2, AlertCircle } from 'lucide-react';
import Script from 'next/script';

interface FormErrors {
  address?: string;
  phone?: string;
  consent?: string;
  submit?: string;
}

export default function PropertyForm() {
  const router = useRouter();
  const { formState, updateFormData } = useForm();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showConversion, setShowConversion] = useState(false);
  
  useEffect(() => {
    const hasTrackedPartial = sessionStorage.getItem('partialConversionTracked');
    if (!hasTrackedPartial) {
      setShowConversion(true);
      sessionStorage.setItem('partialConversionTracked', 'true');
    }
  }, []);

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const handleBlur = (field: keyof FormErrors) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateForm();
  };

  const handleAddressSelect = (addressData: AddressData) => {
    trackEvent('property_address_selected', { 
      address: addressData.formattedAddress,
      placeId: addressData.placeId 
    });
    updateFormData(addressData);
    setErrors(prev => ({ ...prev, address: undefined }));
    setTouched(prev => ({ ...prev, address: true }));
    setStep(2);
  };

  const formatPhoneNumber = (value: string) => {
    const phone = value.replace(/\D/g, '');
    if (phone.length < 4) return phone;
    if (phone.length < 7) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    updateFormData({ phone: formatted });
    
    // Validate phone if touched
    if (touched.phone) {
      setErrors(prev => ({
        ...prev,
        phone: validatePhone(formatted) ? undefined : 'Please enter a valid phone number'
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formState.address?.trim()) {
      newErrors.address = 'Please enter a valid property address';
    }

    if (!formState.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formState.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formState.consent) {
      newErrors.consent = 'You must consent to be contacted';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Mark all fields as touched on submit attempt
    setTouched({ address: true, phone: true });

    if (!validateForm()) {
      trackEvent('form_validation_failed', { errors });
      return;
    }
    
    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, submit: undefined }));

    try {
      const dataToSubmit = {
        ...formState,
        lastUpdated: new Date().toISOString()
      };

      const response = await fetch('/api/submit-partial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit)
      });

      const result = await response.json();
      
      // Even if there was an HTTP error, we process the JSON response
      if (!response.ok && !result.success) {
        console.error('API error response:', result);
        throw new Error(result.error || `API error: ${response.status}`);
      }
      
      // Handle warning but still continue
      if (result.warning) {
        console.warn('API warning:', result.warning);
      }
      
      if (!result.success && !result.leadId) {
        throw new Error(result.error || 'Failed to save lead data');
      }

      // Store leadId in form state for later use
      updateFormData({ leadId: result.leadId });

      trackEvent('form_submitted', { 
        address: formState.address,
        hasPhone: !!formState.phone
      });

      router.push('/property-listed');

    } catch (error) {
      console.error('Form submission error:', error);
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error 
          ? error.message.includes('Unauthorized') 
            ? 'We\'re experiencing issues with our system. Your information was saved locally.' 
            : error.message 
          : 'An error occurred'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showConversion && (
        <Script id="property-form-conversion" strategy="afterInteractive">
          {`
            gtag('event', 'conversion', {
              'send_to': 'AW-16509338772/GjdBCMuwqrIaEJSJosA9',
              'value': 1.0,
              'currency': 'USD'
            });
          `}
        </Script>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-white/90 p-6 rounded-lg shadow-lg">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Enter Your Property Address</h2>
            <AddressInput 
              onAddressSelect={handleAddressSelect}
              error={touched.address ? errors.address : undefined}
            />
            {errors.address && touched.address && (
              <div className="flex items-center space-x-1 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.address}</span>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Enter Your Phone Number</h2>
            <div className="space-y-1">
              <input
                type="tel"
                placeholder="(555) 555-5555"
                className={`w-full px-4 py-3 text-lg border rounded-lg transition-colors
                  ${errors.phone && touched.phone 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-primary'}
                  focus:ring-2 focus:border-transparent`}
                value={formState.phone || ''}
                onChange={handlePhoneChange}
                onBlur={() => handleBlur('phone')}
                maxLength={14}
                required
                aria-invalid={Boolean(errors.phone && touched.phone)}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
              />
              
              {errors.phone && touched.phone && (
                <div id="phone-error" className="flex items-center space-x-1 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.phone}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 text-secondary border-gray-300 rounded focus:ring-secondary"
                  checked={formState.consent || false}
                  onChange={(e) => updateFormData({ consent: e.target.checked })}
                  onBlur={() => handleBlur('consent')}
                  required
                />
                <span className="text-sm text-gray-600">
                  By checking this box, I consent to being contacted by phone, email, or text message about my property sale inquiry, including through auto-dialed or pre-recorded messages.
                </span>
              </label>
              {errors.consent && touched.consent && (
                <div className="flex items-center space-x-1 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.consent}</span>
                </div>
              )}
            </div>
            
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !formState.phone || !formState.consent || !!errors.phone}
              className={`w-full px-4 py-3 text-lg font-semibold text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors
                ${(isSubmitting || !formState.phone || !formState.consent || !!errors.phone) ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Submitting...
                </span>
              ) : (
                'Get Your Cash Offer'
              )}
            </button>
          </div>
        )}
      </form>
    </>
  );
}