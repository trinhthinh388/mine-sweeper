import React from 'react';
import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';

import ReactDOM from 'react-dom/client';

import App from './App';

const rootEl = window.document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<App />);
}
