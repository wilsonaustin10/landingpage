'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { AddressData } from '../types/GooglePlacesTypes';
import { Loader2 } from 'lucide-react';
import { useForm } from '../context/FormContext';

interface AddressInputProps {
  onAddressSelect?: (addressData: AddressData) => void;
  className?: string;
  defaultValue?: string;
  error?: string;
  readOnly?: boolean;
}

export default function AddressInput({ 
  onAddressSelect, 
  className = '',
  defaultValue = '',
  error: externalError,
  readOnly = false
}: AddressInputProps) {
  const placeElementRef = useRef<HTMLElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null);
  const [localError, setLocalError] = useState<string>('');
  const { formState, updateFormData, errors } = useForm();

  useEffect(() => {
    if (readOnly || !window.google?.maps?.places?.PlaceAutocompleteElement) {
      setIsLoading(false);
      return;
    }

    try {
      // Create and configure the PlaceAutocompleteElement
      const placeElement = new window.google.maps.places.PlaceAutocompleteElement({
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });
      placeElementRef.current = placeElement;

      // Configure the element
      placeElement.setAttribute('placeholder', 'Enter your property address');
      placeElement.setAttribute('class', `w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${localError ? 'border-red-500' : 'border-gray-300'}`);
      
      // Set initial value if provided
      if (defaultValue || formState.address) {
        placeElement.setAttribute('value', defaultValue || formState.address);
      }

      // Add event listener for place selection
      placeElement.addEventListener('gmp-placeselect', async () => {
        const place = placeElement.getPlace();
        await place.fetchFields({ fields: ['address_components', 'formatted_address', 'place_id'] });
        
        const placeJson = place.toJSON();
        if (!placeJson.formatted_address) {
          setLocalError('Invalid address selected');
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

        // Update form data with all address components
        const addressUpdate = {
          address: addressData.formattedAddress,
          streetAddress: `${addressData.streetNumber} ${addressData.street}`.trim(),
          city: addressData.city,
          state: addressData.state,
          postalCode: addressData.postalCode,
          placeId: addressData.placeId
        };
        
        setSelectedAddress(addressData);
        updateFormData(addressUpdate);
        
        if (onAddressSelect) {
          onAddressSelect(addressData);
        }
      });

      // Replace the existing input with the new element
      const container = document.getElementById('address-input-container');
      if (container) {
        container.innerHTML = '';
        container.appendChild(placeElement);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing Places Autocomplete:', error);
      setLocalError(error instanceof Error ? error.message : 'Failed to initialize address lookup');
      setIsLoading(false);
    }

    return () => {
      if (placeElementRef.current) {
        placeElementRef.current.remove();
      }
    };
  }, [defaultValue, formState.address, localError, onAddressSelect, readOnly, updateFormData]);

  const error = externalError || localError || errors?.address;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative w-full">
        {readOnly ? (
          <div className="w-full px-4 py-3 text-lg border rounded-lg bg-gray-50">
            {formState.address}
          </div>
        ) : (
          <div id="address-input-container" className="relative">
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            )}
          </div>
        )}

        {error && !readOnly && (
          <p id="address-error" className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      {selectedAddress && !error && !readOnly && (
        <div className="flex flex-col space-y-2">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              Selected: {selectedAddress.formattedAddress}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
