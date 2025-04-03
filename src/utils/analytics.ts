interface AnalyticsConfig {
  measurementId: string;
  debug: boolean;
  cookieDomain: string;
  anonymizeIp?: boolean;
  customMap?: Record<string, string>;
}

const analyticsConfig: Record<string, AnalyticsConfig> = {
  development: {
    measurementId: process.env.NEXT_PUBLIC_GA_TRACKING_ID || '',
    debug: true,
    cookieDomain: 'dev.FastCashForHomesJR.com'
  },
  staging: {
    measurementId: process.env.NEXT_PUBLIC_GA_TRACKING_ID || '',
    debug: true,
    cookieDomain: 'staging.FastCashForHomesJR.com'
  },
  production: {
    measurementId: process.env.NEXT_PUBLIC_GA_TRACKING_ID || '',
    debug: false,
    cookieDomain: 'FastCashForHomesJR.com'
  }
};

export const getAnalyticsConfig = (): AnalyticsConfig => {
  const environment = process.env.NEXT_PUBLIC_VERCEL_ENV || 'development';
  const config = analyticsConfig[environment];

  return {
    ...config,
    anonymizeIp: true,
    customMap: {
      dimension1: 'environment',
      metric1: 'loadTime',
      metric2: 'userTiming',
    }
  };
};

// Basic event tracking without type checking
export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  try {
    if (typeof window !== 'undefined') {
      (window as any).gtag?.('event', eventName, properties);
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

// Custom event types for property leads
export const LeadEvents = {
  FORM_START: 'property_form_start',
  FORM_STEP_COMPLETE: 'property_form_step_complete',
  FORM_COMPLETE: 'property_form_complete',
  FORM_ABANDONED: 'property_form_abandoned',
} as const;

// Helper function to track lead events
export const trackLeadEvent = (
  eventName: keyof typeof LeadEvents,
  properties: Record<string, any> = {}
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', LeadEvents[eventName], {
      ...properties,
      environment: process.env.NEXT_PUBLIC_VERCEL_ENV,
      timestamp: new Date().toISOString(),
    });
  }
};

// Type-safe wrapper for gtag
const safeGtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
};

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Conversion IDs for different actions
export const CONVERSION_IDS = {
  FORM_START: 'AW-16509338772/form_start',
  FORM_COMPLETE: 'AW-16509338772/form_complete',
  PHONE_CALL: 'AW-16509338772/phone_call',
};

export const trackConversion = (conversionId: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: conversionId,
      value: value,
      currency: 'USD',
    });
  }
};

// Utility functions for specific conversion events
export const trackFormStart = () => {
  trackConversion(CONVERSION_IDS.FORM_START);
};

export const trackFormComplete = (value?: number) => {
  trackConversion(CONVERSION_IDS.FORM_COMPLETE, value);
};

export const trackPhoneCall = () => {
  trackConversion(CONVERSION_IDS.PHONE_CALL);
}; 