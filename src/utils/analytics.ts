import { GA4Config } from '@analytics/google-analytics4';

interface EnvironmentConfig {
  measurementId: string;
  debug: boolean;
  cookieDomain: string;
}

const analyticsConfig: Record<string, EnvironmentConfig> = {
  development: {
    measurementId: process.env.NEXT_PUBLIC_GA_TRACKING_ID || '',
    debug: true,
    cookieDomain: 'dev-getoffer.jrhomebuyer.com'
  },
  staging: {
    measurementId: process.env.NEXT_PUBLIC_GA_TRACKING_ID || '',
    debug: true,
    cookieDomain: 'staging-getoffer.jrhomebuyer.com'
  },
  production: {
    measurementId: process.env.NEXT_PUBLIC_GA_TRACKING_ID || '',
    debug: false,
    cookieDomain: 'getoffer.jrhomebuyer.com'
  }
};

export const getAnalyticsConfig = (): GA4Config => {
  const environment = process.env.NEXT_PUBLIC_VERCEL_ENV || 'development';
  const config = analyticsConfig[environment];

  return {
    measurementId: config.measurementId,
    debug: config.debug,
    cookieDomain: config.cookieDomain,
    customDimensions: {
      environment,
    },
    customMetrics: {
      loadTime: 'metric1',
      userTiming: 'metric2',
    },
    anonymizeIp: true,
    respectDNT: true,
    // Track form interactions
    events: {
      formStart: true,
      formComplete: true,
      formAbandoned: true,
    },
    // Enhanced measurement
    scrollTracking: true,
    mediaTracking: true,
    outboundLinks: true,
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

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
} 