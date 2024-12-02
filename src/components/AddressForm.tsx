'use client';

import React, { useRef, useState } from 'react';
import { useGooglePlaces } from '../hooks/useGooglePlaces';
import type { AddressData } from '../types/GooglePlacesTypes';
import { Loader2 } from 'lucide-react';

interface AddressFormProps {
  onAddressSelected?: (address: string) => void;
}

export default function AddressForm({ onAddressSelected }: AddressFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleAddressSelect = (addressData: AddressData) => {
    setIsLoading(true);
    try {
      if (onAddressSelected) {
        onAddressSelected(addressData.formattedAddress);
      }
    } catch (err) {
      setError('Error processing address');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useGooglePlaces(inputRef, handleAddressSelect);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        placeholder="Enter your property address"
        className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
        disabled={isLoading}
        aria-label="Property address"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}