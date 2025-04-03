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
    console.log(
      '[AddressInput useEffect] Running. isGoogleMapsLoaded:',
      isGoogleMapsLoaded,
      'readOnly:',
      readOnly,
      'inputRef.current:',
      !!inputRef.current
    );

    if (readOnly || !inputRef.current) {
      console.log('[AddressInput useEffect] Exiting: readOnly or no inputRef.');
      setIsInitializing(false);
      return;
    }

    if (!isGoogleMapsLoaded) {
      console.log('[AddressInput useEffect] Exiting: Google Maps script not loaded yet.');
      setIsInitializing(false);
      return;
    }

    // Check if the google object and places library are available
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn(
        '[AddressInput useEffect] Warning: isGoogleMapsLoaded is true, but window.google.maps.places is not available yet.',
        {
          'window.google': typeof window.google,
          'window.google.maps': typeof window.google?.maps,
          'window.google.maps.places': typeof window.google?.maps?.places,
        }
      );
      setLocalError('Address lookup is taking longer than expected to load. Please wait...');
      // Optional: Add a small delay and retry? For now, just warn.
      setIsInitializing(false);
      return;
    }

    // Prevent re-initialization
    if (autocompleteRef.current || isInitializing) {
      console.log(
        '[AddressInput useEffect] Exiting: Already initialized or is initializing.',
        {
          'autocompleteRef.current': !!autocompleteRef.current,
          isInitializing,
        }
      );
      return;
    }

    console.log('[AddressInput useEffect] Proceeding with initialization...');
    setIsInitializing(true);
    setLocalError('');

    try {
      console.log('[AddressInput useEffect] Creating Autocomplete instance.');
      const autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'us' }
        }
      );

      autocompleteRef.current = autocomplete;
      console.log('[AddressInput useEffect] Autocomplete instance created.');

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
      console.error(
        '[AddressInput useEffect] Error initializing Google Places Autocomplete:',
        error
      );
      setLocalError(
        error instanceof Error
          ? error.message
          : 'Failed to initialize address lookup'
      );
    } finally {
      console.log('[AddressInput useEffect] Setting isInitializing to false.');
      setIsInitializing(false);
    }

    // Cleanup function
    return () => {
      if (autocompleteRef.current) {
        console.log('[AddressInput useEffect Cleanup] Clearing listeners and ref.');
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      } else {
        console.log('[AddressInput useEffect Cleanup] No autocomplete instance to clean.');
      }
    };
  }, [isGoogleMapsLoaded, readOnly, onAddressSelect, updateFormData, isInitializing]);

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
