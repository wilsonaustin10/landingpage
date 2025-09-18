'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  namespace google.maps.places {
    interface AutocompleteOptions {
      componentRestrictions?: ComponentRestrictions;
      fields?: string[];
      types?: string[];
      sessionToken?: google.maps.places.AutocompleteSessionToken;
    }
  }
}

export interface AddressData {
  formattedAddress: string;
  placeId?: string;
  streetNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

let googleMapsPromise: Promise<void> | null = null;

function loadGoogleMapsScript(): Promise<void> {
  if (googleMapsPromise) return googleMapsPromise;
  
  if (window.google?.maps?.places) {
    return Promise.resolve();
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

export function useGooglePlacesLazy(
  inputRef: React.RefObject<HTMLInputElement>,
  onAddressSelect: (addressData: AddressData) => void
) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const initAttemptedRef = useRef(false);

  const initializeAutocomplete = useCallback(async () => {
    if (initAttemptedRef.current || !inputRef.current) return;
    initAttemptedRef.current = true;
    
    setIsLoading(true);
    try {
      await loadGoogleMapsScript();
      
      if (!inputRef.current || !window.google?.maps?.places) {
        throw new Error('Google Maps not available');
      }

      // Create a new session token
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();

      // Initialize autocomplete with session token
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          componentRestrictions: { country: 'us' },
          fields: ['address_components', 'formatted_address', 'place_id'],
          types: ['address'],
          sessionToken: sessionTokenRef.current
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
        
        // Create a new session token after selection
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
      });

      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing Places Autocomplete:', error);
      initAttemptedRef.current = false; // Allow retry
    } finally {
      setIsLoading(false);
    }
  }, [inputRef, onAddressSelect]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (autocompleteRef.current) {
        google.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
      sessionTokenRef.current = null;
    };
  }, []);

  return { initializeAutocomplete, isLoading, isInitialized };
}