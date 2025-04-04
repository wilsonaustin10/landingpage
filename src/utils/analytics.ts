declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    gtag_report_conversion: (url?: string) => boolean;
  }
}

export const initializeAnalytics = () => {
  if (typeof window !== 'undefined') {
    const script = document.createElement('script');
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: any[]) {
      window.dataLayer.push(args);
    };
    
    window.gtag('js', new Date());
    window.gtag('config', gaId);
  }
};

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

export const trackConversion = (url?: string) => {
  if (typeof window !== 'undefined' && window.gtag_report_conversion) {
    return window.gtag_report_conversion(url);
  }
  return false;
}; 