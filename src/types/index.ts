export interface LeadFormData {
  address: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  placeId?: string;
  phone: string;
  email?: string;
  timeframe?: string;
  propertyCondition?: string;
  reasonForSelling?: string;
  askingPrice?: string;
  bedrooms?: string;
  bathrooms?: string;
  squareFeet?: string;
  isPropertyListed?: boolean;
}

export interface FormErrors {
  address?: string;
  phone?: string;
  email?: string;
}

export type FormStep = 'initial' | 'property-details' | 'timeline' | 'contact';

export interface Testimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
  image?: string;
} 