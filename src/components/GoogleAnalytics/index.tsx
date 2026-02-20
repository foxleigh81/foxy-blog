'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

interface GoogleAnalyticsProps {
  gaId: string;
}

const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({ gaId }) => {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'accepted') {
      setHasConsent(true);
    }

    const handleConsent = (event: Event) => {
      if (event.type === 'cookie-consent-accepted') {
        setHasConsent(true);
      }
    };

    window.addEventListener('cookie-consent-accepted', handleConsent);
    window.addEventListener('cookie-consent-declined', handleConsent);

    return () => {
      window.removeEventListener('cookie-consent-accepted', handleConsent);
      window.removeEventListener('cookie-consent-declined', handleConsent);
    };
  }, []);

  if (!hasConsent) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga4-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');`,
        }}
      />
    </>
  );
};

export default GoogleAnalytics;
