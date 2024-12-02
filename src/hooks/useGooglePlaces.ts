'use client';

import { useEffect, useRef } from 'react';

export interface AddressData {
  formattedAddress: string;
  placeId?: string;
  streetNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export function useGooglePlaces(
  inputRef: React.RefObject<HTMLInputElement>,
  onAddressSelect: (addressData: AddressData) => void
) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    // Wait for both input ref and Google Maps to be available
    if (!inputRef.current || !window.google?.maps?.places) {
      console.log('Waiting for dependencies...');
      return;
    }

    try {
      // Initialize autocomplete
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          componentRestrictions: { country: 'us' },
          fields: ['formatted_address', 'place_id'],
          types: ['address']
        }
      );

      // Add place_changed listener
      const listener = autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (!place?.formatted_address) return;

        const addressData: AddressData = {
          formattedAddress: place.formatted_address,
          placeId: place.place_id
        };

        // Parse address components
        place.address_components?.forEach(component => {
          const type = component.types[0];
          switch (type) {
            case 'street_number': addressData.streetNumber = component.long_name; break;
            case 'route': addressData.street = component.long_name; break;
            case 'locality': addressData.city = component.long_name; break;
            case 'administrative_area_level_1': addressData.state = component.short_name; break;
            case 'postal_code': addressData.postalCode = component.long_name; break;
          }
        });

        onAddressSelect(addressData);
      });

      // Cleanup
      return () => {
        if (listener) google.maps.event.removeListener(listener);
        if (autocompleteRef.current) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }
      };
    } catch (error) {
      console.error('Error initializing Places Autocomplete:', error);
    }
  }, [inputRef, onAddressSelect]);
} 