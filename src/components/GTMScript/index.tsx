'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

interface GTMScriptProps {
  gtmId: string;
}

const GTMScript: React.FC<GTMScriptProps> = ({ gtmId }) => {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check initial consent state
    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'accepted') {
      setHasConsent(true);
    }

    // Listen for consent changes
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
        id="gtm-script"
        strategy="afterInteractive"
        crossOrigin="anonymous"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');`,
        }}
      />
      <Script
        id="gtm-dataLayer"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];`,
        }}
      />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
          loading="lazy"
        />
      </noscript>
    </>
  );
};

export default GTMScript;
