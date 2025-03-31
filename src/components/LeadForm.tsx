'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { LeadFormData } from '../types';
import type { AddressData } from '../types/GooglePlacesTypes';
import { trackEvent } from '../utils/analytics';
import { Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useScriptLoading } from '../context/ScriptLoadingContext';

interface FormErrors {
  address?: string;
  phone?: string;
  submit?: string;
  consent?: string;
}

export default function LeadForm() {
  const [formData, setFormData] = useState<Partial<LeadFormData>>({
    address: '',
    phone: '',
    consent: false,
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    placeId: '',
    firstName: '',
    lastName: '',
    email: '',
    isPropertyListed: false,
    propertyCondition: '',
    timeframe: '',
    price: '',
    leadId: '',
    timestamp: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const addressContainerRef = useRef<HTMLDivElement>(null);
  const placeElementRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);
  const router = useRouter();
  const { isGoogleMapsLoaded } = useScriptLoading();
  
  // Initialize Google Places when script is loaded
  useEffect(() => {
    if (!isGoogleMapsLoaded || !addressContainerRef.current || placeElementRef.current) {
      return;
    }
    
    try {
      // Create and configure PlaceAutocompleteElement
      const placeElement = new window.google.maps.places.PlaceAutocompleteElement({
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });
      
      // Set placeholder and styling
      placeElement.setAttribute('placeholder', 'Enter your property address');
      placeElement.setAttribute('class', `w-full px-4 py-3 text-lg outline-none ${errors.address && touched.address ? 'text-red-600' : 'text-gray-900'}`);
      
      // Add place selection handler
      placeElement.addEventListener('gmp-placeselect', async (event) => {
        console.log('gmp-placeselect event fired:', event);
        
        // Safely access place data
        const placeDetail = (event as CustomEvent<{ place: google.maps.places.Place }>).detail;
        if (!placeDetail || !placeDetail.place) {
          console.error('Place selection event missing detail or place data:', event);
          setErrors(prev => ({ ...prev, address: 'Could not retrieve address details from selection.' }));
          return;
        }
        
        const place = placeDetail.place;
        await place.fetchFields({ fields: ['address_components', 'formatted_address', 'place_id'] });
        
        const placeJson = place.toJSON();
        if (!placeJson.formatted_address) {
          setErrors(prev => ({ ...prev, address: 'Invalid address selected' }));
          return;
        }

        const addressData: AddressData = {
          formattedAddress: placeJson.formatted_address,
          placeId: placeJson.place_id
        };

        // Parse address components
        placeJson.address_components?.forEach(component => {
          const type = component.types[0];
          switch (type) {
            case 'street_number': addressData.streetNumber = component.long_name; break;
            case 'route': addressData.street = component.long_name; break;
            case 'locality': addressData.city = component.long_name; break;
            case 'administrative_area_level_1': addressData.state = component.short_name; break;
            case 'postal_code': addressData.postalCode = component.long_name; break;
          }
        });
        
        // Handle address selected
        handleAddressSelect(addressData);
      });
      
      // Clear container and append the element
      addressContainerRef.current.innerHTML = '';
      addressContainerRef.current.appendChild(placeElement);
      placeElementRef.current = placeElement;
      
    } catch (error) {
      console.error('Error initializing Places Autocomplete:', error);
      setErrors(prev => ({ ...prev, address: 'Failed to initialize address lookup' }));
    }
    
    // Cleanup function
    return () => {
      if (placeElementRef.current && addressContainerRef.current?.contains(placeElementRef.current)) {
        try {
          addressContainerRef.current.removeChild(placeElementRef.current);
        } catch (e) {
          console.error("Error during PlaceAutocompleteElement cleanup:", e);
        }
      }
      placeElementRef.current = null;
    };
  }, [isGoogleMapsLoaded, errors.address, touched.address]);

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const validateAddress = (address: string) => {
    return address.trim().length > 0;
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!validateAddress(formData.address || '')) {
      newErrors.address = 'Please enter a valid property address';
    }

    if (!validatePhone(formData.phone || '')) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.consent) {
      newErrors.consent = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddressSelect = (addressData: AddressData) => {
    console.log('Address selected:', addressData);
    
    // Create a complete address string including zip code
    const fullAddress = addressData.formattedAddress.includes(addressData.postalCode || '')
      ? addressData.formattedAddress
      : `${addressData.formattedAddress} ${addressData.postalCode || ''}`.trim();

    setFormData(prev => ({
      ...prev,
      address: fullAddress
    }));
    setErrors(prev => ({ ...prev, address: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setTouched({ address: true, phone: true });
      trackEvent('form_validation_failed', { errors });
      return;
    }

    setLoading(true);
    trackEvent('form_submission', { step: 1 });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/property-listed');
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Something went wrong. Please try again.'
      }));
      trackEvent('form_submission_error', { error });
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const phone = value.replace(/\D/g, '');
    if (phone.length < 4) return phone;
    if (phone.length < 7) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
  };

  const handleBlur = (field: keyof FormErrors) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateForm();
  };

  if (!isGoogleMapsLoaded) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="animate-spin h-5 w-5" />
          <span>Loading address lookup...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <div className="relative">
            {/* Replace input with div container for PlaceAutocompleteElement */}
            <div 
              ref={addressContainerRef}
              id="lead-form-address-container" 
              className="w-full min-h-[50px]"
            />
          </div>
          {errors.address && touched.address && (
            <div className="flex items-center space-x-1 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.address}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="relative">
            <input
              type="tel"
              placeholder="Your phone number"
              className={`w-full px-4 py-3 border rounded-lg transition-colors
                ${errors.phone && touched.phone 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-primary'}
                focus:ring-2 focus:border-transparent`}
              value={formData.phone}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                setFormData({ ...formData, phone: formatted });
                if (touched.phone) validateForm();
              }}
              onBlur={() => handleBlur('phone')}
              maxLength={14}
              required
            />
          </div>
          {errors.phone && touched.phone && (
            <div className="flex items-center space-x-1 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.phone}</span>
            </div>
          )}
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-600 text-sm">
            {errors.submit}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
              Processing...
            </>
          ) : (
            'Get Your Cash Offer'
          )}
        </button>
      </form>
    </div>
  );
} 