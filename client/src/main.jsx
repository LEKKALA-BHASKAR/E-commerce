import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { store, persistor } from './store/index.js';
import { ThemeProvider } from './theme/ThemeProvider.jsx';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <BrowserRouter>
            <App />
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: 'rgba(15,23,42,0.95)',
                  color: '#F8FAFC',
                  border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(12px)',
                },
              }}
            />
          </BrowserRouter>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
