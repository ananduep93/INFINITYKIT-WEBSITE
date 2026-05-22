'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReusableLoading from '../ui/ReusableLoading';

interface LegacyToolBridgeProps {
  toolId: string;
}

export default function LegacyToolBridge({ toolId }: LegacyToolBridgeProps) {
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Map certain toolIds if their HTML file name differs from the config toolId
  const getHtmlFileName = (id: string) => {
    // Standardize IDs to match filename formats
    if (id === 'yesnogerator') return 'yesnogerator';
    return id;
  };

  const fileName = getHtmlFileName(toolId);

  const handleIframeLoad = () => {
    setLoading(false);
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Dynamic theme synchronization
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (doc.documentElement) {
          doc.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        }

        // Inject custom CSS to remove legacy navigation, footer, backlink, background canvas
        const style = doc.createElement('style');
        style.textContent = `
          .navbar, .breadcrumb, .back-link, .footer, #footerPwaContainer {
            display: none !important;
          }
          body {
            background: transparent !important;
            margin: 0 !important;
            padding: 0 !important;
            color: var(--text-color) !important;
          }
          .tool-page-container {
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
            background: transparent !important;
          }
          #toolContent {
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
            padding: 10px !important;
          }
          canvas#bgCanvas {
            display: none !important;
          }
        `;
        doc.head.appendChild(style);

        // Periodically adjust height if needed or keep a comfortable preset
        const resizeIframe = () => {
          const contentHeight = doc.body.scrollHeight;
          if (iframe && contentHeight > 200) {
            iframe.style.height = `${contentHeight + 40}px`;
          }
        };

        // Resize on load and after short periods to handle dynamic calculations
        resizeIframe();
        setTimeout(resizeIframe, 500);
        setTimeout(resizeIframe, 1500);
      }
    } catch (err) {
      console.warn("Same-origin styling bridge exception (expected on standard port transitions):", err);
    }
  };

  // Synchronize themes on theme change in parent document
  useEffect(() => {
    const syncTheme = () => {
      try {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
          const doc = iframe.contentDocument || iframe.contentWindow.document;
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          if (doc.documentElement) {
            doc.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
          }
        }
      } catch (err) {}
    };

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '550px' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 5,
          background: 'var(--glass-bg)',
          borderRadius: 'var(--card-radius)',
          backdropFilter: 'blur(10px)',
          minHeight: '400px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <ReusableLoading type="spinner" />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Loading Premium Tool Workspace...</span>
          </div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={`/legacy/tools/${fileName}.html`}
        onLoad={handleIframeLoad}
        style={{
          width: '100%',
          height: '750px',
          border: 'none',
          borderRadius: 'var(--card-radius)',
          background: 'transparent',
          boxShadow: 'none',
          transition: 'opacity 0.2s ease',
          opacity: loading ? 0 : 1,
          overflow: 'hidden'
        }}
        title={`Premium Utility ${toolId}`}
      />
    </div>
  );
}
