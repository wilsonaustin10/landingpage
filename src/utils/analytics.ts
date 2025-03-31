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

// Legacy tracking function for compatibility
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...params,
      environment: process.env.NEXT_PUBLIC_VERCEL_ENV,
      timestamp: new Date().toISOString(),
    });
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

// Conversion tracking for Google Ads
export const trackConversion = (type: 'partial' | 'full') => {
  if (typeof window === 'undefined' || !window.gtag) return;

  const conversionLabel = type === 'partial' ? 'GjdBCMuwqrIaEJSJosA9' : 'QFoaCM6wqrIaEJSJosA9';
  
  window.gtag('event', 'conversion', {
    'send_to': `AW-16509338772/${conversionLabel}`,
    'transaction_id': sessionStorage.getItem('leadId') // Use leadId to prevent double counting
  });
};

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
} 