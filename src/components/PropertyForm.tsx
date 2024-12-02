'use client';

import React, { useState } from 'react';
import AddressInput from './AddressInput';
import { useForm } from '../context/FormContext';
import { trackEvent } from '../utils/analytics';
import type { AddressData } from '../hooks/useGooglePlaces';

export default function PropertyForm() {
  const { formData, updateFormData } = useForm();
  const [step, setStep] = useState(1);

  const handleAddressSelect = (addressData: AddressData) => {
    // Save all address components
    updateFormData({
      address: addressData.formattedAddress,
      streetAddress: `${addressData.streetNumber ?? ''} ${addressData.street ?? ''}`.trim(),
      city: addressData.city ?? '',
      state: addressData.state ?? '',
      postalCode: addressData.postalCode ?? '',
      placeId: addressData.placeId
    });

    trackEvent('property_address_selected', { 
      address: addressData.formattedAddress,
      placeId: addressData.placeId 
    });

    // Auto-advance to next step when address is selected
    setStep(2);
  };

  return (
    <div className="space-y-4">
      {step === 1 && (
        <>
          <AddressInput onAddressSelect={handleAddressSelect} />
          {formData.address && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                Selected address: {formData.address}
              </p>
            </div>
          )}
        </>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Property Details</h2>
          {/* Add your Step 2 form fields here */}
          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full p-2 border rounded"
            value={formData.phone || ''}
            onChange={(e) => updateFormData({ phone: e.target.value })}
          />
          {/* Add additional property details fields */}
        </div>
      )}
    </div>
  );
}