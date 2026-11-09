import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import 'moment/locale/fr';
import 'moment/locale/es';
import 'moment/locale/de';

globalThis._ = _;
globalThis.moment = moment;

console.log('Lodash version:', _.VERSION);
console.log('Moment loaded with locales:', moment.locales());

globalThis.onerror = function(message, source, lineno, colno, error) {
  console.error('Global error:', { colno, error, lineno, message, source });
  return false;
};

globalThis.onunhandledrejection = function(event) {
  console.error('Unhandled promise rejection:', event.reason);
};

const startTime = performance.now();

const isDevelopment = process.env.NODE_ENV === 'development';

const root = document.querySelector('#root');

if (!root) {
  throw new Error('Failed to find root element');
}

globalThis.APP_VERSION = '1.0.0';
globalThis.DEBUG = isDevelopment;

globalThis.API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const renderApp = () => {
  try {
    const appRoot = ReactDOM.createRoot(root);

    appRoot.render(
        <App />
    );

    if (isDevelopment) {
      const endTime = performance.now();
      console.log(`App rendered in ${endTime - startTime}ms`);
    }
  } catch (error) {
    console.error('Failed to render app:', error);
    root.innerHTML = '<div style="color: red;">Failed to load application.</div>';
  }
};

renderApp();

if (module.hot) {
  module.hot.accept('./App', () => {
    renderApp();
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
        .register('/service-worker.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          console.error('SW registration failed:', error);
        });
  });
}

window.addEventListener('unload', () => {
  console.log('App cleanup');
});

globalThis.addEventListener('error', (event) => {
  console.error('Runtime error:', event.error);
});

if (isDevelopment) {
  const reportWebVitals = (metric) => {
    console.log(metric);
  };

  import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB }) => {
    onCLS(reportWebVitals);
    onFCP(reportWebVitals);
    onLCP(reportWebVitals);
    onTTFB(reportWebVitals);
  });
}
