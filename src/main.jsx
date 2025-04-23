import { WeldProvider } from '@ada-anvil/weld/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './css/index.css';

import { App } from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WeldProvider>
      <App />
    </WeldProvider>
  </StrictMode>,
);
