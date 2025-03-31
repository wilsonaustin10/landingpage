declare global {
  namespace google.maps.places {
    interface ComponentRestrictions {
      country: string | string[] | null;
    }

    interface PlaceAutocompleteElementOptions {
      types?: string[] | null;
      componentRestrictions?: ComponentRestrictions | null;
    }

    interface PlaceAutocompleteElement extends HTMLElement {
      getPlace(): google.maps.places.Place;
      value: string;
    }

    interface PlaceAutocompleteElementConstructor {
      new(options?: PlaceAutocompleteElementOptions): PlaceAutocompleteElement;
    }

    interface Place {
      fetchFields(options: { fields: string[] }): Promise<void>;
      toJSON(): PlaceResult;
    }

    interface PlaceResult {
      address_components?: google.maps.GeocoderAddressComponent[];
      formatted_address?: string;
      place_id?: string;
    }

    interface AddressComponent {
      long_name: string;
      short_name: string;
      types: string[];
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

// Ensure this is recognized as a module
export {};