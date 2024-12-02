export interface AddressData {
  formattedAddress: string;
  location?: google.maps.LatLng;
  placeId?: string;
}

declare global {
  namespace google.maps.places {
    interface Autocomplete {
      Autocomplete: new (
        input: HTMLInputElement,
        opts?: google.maps.places.AutocompleteOptions
      ) => google.maps.places.Autocomplete;
    }
    
    interface AutocompleteOptions {
      types?: string[];
      componentRestrictions?: google.maps.places.ComponentRestrictions;
      fields?: string[];
    }
  }
}

export {};