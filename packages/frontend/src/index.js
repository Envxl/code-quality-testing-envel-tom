import ReactDOM from 'react-dom/client';

import App from './App';

const startTime = performance.now();

const isDevelopment = process.env.NODE_ENV === 'development';

const root = document.querySelector('#root');

if (!root) {
  throw new Error('Failed to find root element');
}

const renderApp = () => {
  try {
    const appRoot = ReactDOM.createRoot(root);

    appRoot.render(<App />);

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

window.addEventListener('error', (event) => {
  console.error('Runtime error:', event.error);
});

if (isDevelopment) {
  const reportWebVitals = (metric) => {
    console.log(metric);
  };

  const loadWebVitals = async () => {
    const { onCLS, onFCP, onLCP, onTTFB } = await import('web-vitals');
    onCLS(reportWebVitals);
    onFCP(reportWebVitals);
    onLCP(reportWebVitals);
    onTTFB(reportWebVitals);
  };

  loadWebVitals();
}
