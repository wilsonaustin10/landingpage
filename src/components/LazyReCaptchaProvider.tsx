'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const DEV_FALLBACK_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

interface LazyReCaptchaProviderProps {
  children: React.ReactNode;
}

export default function LazyReCaptchaProvider({ children }: LazyReCaptchaProviderProps) {
  const [shouldLoadReCaptcha, setShouldLoadReCaptcha] = useState(false);
  const pathname = usePathname();
  
  const reCaptchaSiteKey = 
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || 
    (process.env.NODE_ENV === 'development' ? DEV_FALLBACK_SITE_KEY : '');

  useEffect(() => {
    // Only load reCAPTCHA on the contact page where it's actually needed
    if (pathname === '/contact') {
      setShouldLoadReCaptcha(true);
    }
  }, [pathname]);

  // If reCAPTCHA shouldn't be loaded, just render children
  if (!shouldLoadReCaptcha) {
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={reCaptchaSiteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'body',
        nonce: undefined,
      }}
      container={{ parameters: { badge: 'bottomright' } }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}