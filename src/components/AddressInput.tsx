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
  const containerRef = useRef<HTMLDivElement>(null);
  const placeElementRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null);
  const [localError, setLocalError] = useState<string>('');
  const { formState, updateFormData, errors } = useForm();
  const { isGoogleMapsLoaded } = useScriptLoading();

  useEffect(() => {
    if (readOnly || !containerRef.current || !isGoogleMapsLoaded) {
      if (isGoogleMapsLoaded && !containerRef.current) {
         console.error("AddressInput container ref is not available.");
      }
      setIsInitializing(false);
      return;
    }

    if (!window.google?.maps?.places?.PlaceAutocompleteElement) {
      console.warn('PlaceAutocompleteElement object not found even after script load signal.');
      setLocalError('Address lookup component failed to load.');
      setIsInitializing(false);
      return;
    }

    if (placeElementRef.current || isInitializing) {
      return;
    }

    setIsInitializing(true);
    setLocalError('');

    try {
      const placeElement = new window.google.maps.places.PlaceAutocompleteElement({
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });

      placeElement.setAttribute('placeholder', 'Enter your property address');
      placeElement.setAttribute('class', `w-full px-4 py-3 text-lg outline-none ${localError ? 'text-red-600' : 'text-gray-900'}`);
      
      placeElement.value = defaultValue || formState.address || '';

      placeElement.addEventListener('gmp-placeselect', async (event) => {
        console.log('gmp-placeselect event fired:', event);
        
        const placeDetail = (event as CustomEvent<{ place: google.maps.places.Place }>).detail;
        if (!placeDetail || !placeDetail.place) {
            console.error('Place selection event missing detail or place data:', event);
            setLocalError('Could not retrieve address details from selection.');
            return;
        }
        
        const place = placeDetail.place;
        
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

        const addressUpdate = {
          address: addressData.formattedAddress,
          streetAddress: `${addressData.streetNumber || ''} ${addressData.street || ''}`.trim(),
          city: addressData.city || '',
          state: addressData.state || '',
          postalCode: addressData.postalCode || '',
          placeId: addressData.placeId || ''
        };
        
        setSelectedAddress(addressData);
        updateFormData(addressUpdate);
        setLocalError('');
        
        if (onAddressSelect) {
          onAddressSelect(addressData);
        }
      });

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(placeElement);
      placeElementRef.current = placeElement;

    } catch (error) {
      console.error('Error initializing Places Autocomplete:', error);
      setLocalError(error instanceof Error ? error.message : 'Failed to initialize address lookup');
    } finally {
      setIsInitializing(false);
    }

    return () => {
      if (placeElementRef.current && containerRef.current?.contains(placeElementRef.current)) {
        try {
            containerRef.current.removeChild(placeElementRef.current);
        } catch (e) {
            console.error("Error during PlaceAutocompleteElement cleanup:", e);
        }
      }
      placeElementRef.current = null;
    };
  }, [isGoogleMapsLoaded, readOnly, defaultValue, formState.address, onAddressSelect, updateFormData, isInitializing]);

  const error = externalError || localError || errors?.address;
  const isLoading = !isGoogleMapsLoaded || isInitializing;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative w-full">
        {readOnly ? (
          <div className="w-full px-4 py-3 text-lg border rounded-lg bg-gray-50">
            {formState.address}
          </div>
        ) : (
          <div ref={containerRef} id="address-input-container" className="relative min-h-[50px]">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                 <input
                   type="text"
                   placeholder={!isGoogleMapsLoaded ? "Waiting for map service..." : "Initializing address lookup..."}
                   disabled
                   className="w-full px-4 py-3 text-lg border rounded-lg border-gray-300 bg-gray-100 opacity-50 pointer-events-none"
                 />
                 <Loader2 className="absolute h-6 w-6 animate-spin text-primary" />
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
