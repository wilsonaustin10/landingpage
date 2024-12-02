'use client';

import React, { useEffect, useRef } from 'react';
import type { AddressData } from '../hooks/useGooglePlaces';

interface AddressInputProps {
  onAddressSelect: (addressData: AddressData) => void;
}

export default function AddressInput({ onAddressSelect }: AddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!inputRef.current || !window.google) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'us' },
      fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
      types: ['address']
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (!place?.address_components) return;

      // Extract address components
      const addressComponents = place.address_components;
      const streetNumber = addressComponents.find(component => 
        component.types.includes('street_number'))?.long_name;
      const street = addressComponents.find(component => 
        component.types.includes('route'))?.long_name;
      const city = addressComponents.find(component => 
        component.types.includes('locality'))?.long_name;
      const state = addressComponents.find(component => 
        component.types.includes('administrative_area_level_1'))?.short_name;
      const postalCode = addressComponents.find(component => 
        component.types.includes('postal_code'))?.long_name;

      onAddressSelect({
        formattedAddress: place.formatted_address || '',
        placeId: place.place_id || '',
        streetNumber,
        street,
        city,
        state,
        postalCode
      });
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onAddressSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Enter your address"
      className="w-full p-2 border rounded"
    />
  );
}