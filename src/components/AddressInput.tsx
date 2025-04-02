'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { AddressData } from '../types/GooglePlacesTypes';
import { Loader2 } from 'lucide-react';
import { useForm } from '../context/FormContext';
import { useScriptLoading } from '../context/ScriptLoadingContext';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null);
  const [localError, setLocalError] = useState<string>('');
  const { formState, updateFormData, errors } = useForm();
  const { isGoogleMapsLoaded } = useScriptLoading();

  useEffect(() => {
    if (readOnly || !inputRef.current || !isGoogleMapsLoaded) {
      setIsInitializing(false);
      return;
    }

    if (!window.google?.maps?.places) {
      console.warn('Google Maps Places API not found even after script load signal.');
      setLocalError('Address lookup component failed to load.');
      setIsInitializing(false);
      return;
    }

    if (autocompleteRef.current || isInitializing) {
      return;
    }

    setIsInitializing(true);
    setLocalError('');

    try {
      // Use the standard Autocomplete instead of PlaceAutocompleteElement
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });
      
      // Set reference for cleanup
      autocompleteRef.current = autocomplete;
      
      // Add place_changed event listener
      autocomplete.addListener('place_changed', () => {
        console.log('Place changed event fired');
        
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.formatted_address) {
          console.error('Invalid place selected:', place);
          setLocalError('Please select a valid address from the dropdown.');
          return;
        }
        
        console.log('Valid place selected:', place);
        
        const addressData: AddressData = {
          formattedAddress: place.formatted_address,
          placeId: place.place_id || ''
        };
        
        if (place.address_components) {
          place.address_components.forEach((component) => {
            const types = component.types;
            if (types.includes('street_number')) {
              addressData.streetNumber = component.long_name;
            } else if (types.includes('route')) {
              addressData.street = component.long_name;
            } else if (types.includes('locality')) {
              addressData.city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              addressData.state = component.short_name;
            } else if (types.includes('postal_code')) {
              addressData.postalCode = component.long_name;
            }
          });
        }
        
        const addressUpdate = {
          address: addressData.formattedAddress,
          streetAddress: `${addressData.streetNumber || ''} ${addressData.street || ''}`.trim(),
          city: addressData.city || '',
          state: addressData.state || '',
          postalCode: addressData.postalCode || '',
          placeId: addressData.placeId || ''
        };
        
        console.log('Updating form data with address:', addressUpdate);
        
        setSelectedAddress(addressData);
        updateFormData(addressUpdate);
        setLocalError('');
        
        console.log('Calling onAddressSelect with:', addressData);
        if (onAddressSelect) {
          // Small timeout to ensure the state updates first
          setTimeout(() => {
            onAddressSelect(addressData);
          }, 50);
        }
      });
      
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
      setLocalError(error instanceof Error ? error.message : 'Failed to initialize address lookup');
    } finally {
      setIsInitializing(false);
    }

    return () => {
      if (autocompleteRef.current) {
        // Clean up event listeners
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [isGoogleMapsLoaded, readOnly, onAddressSelect, updateFormData]);

  const error = externalError || localError || errors?.address;
  const isLoading = !isGoogleMapsLoaded;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative w-full">
        {readOnly ? (
          <div className="w-full px-4 py-3 text-lg border rounded-lg bg-gray-50">
            {formState.address}
          </div>
        ) : (
          <div className="relative min-h-[50px]">
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter your property address"
              defaultValue={defaultValue || formState.address || ''}
              className={`w-full px-4 py-3 text-lg border rounded-lg ${error ? 'border-red-500' : 'border-gray-300'}`}
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
        )}

        {error && !isLoading && !readOnly && (
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
