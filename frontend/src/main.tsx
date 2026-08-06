import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppTheme from './theme/AppTheme';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from './theme/customizations';
import App from './App';
import { AuthProvider } from './context/AuthContext';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppTheme themeComponents={xThemeComponents}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AppTheme>
    </BrowserRouter>
  </StrictMode>,
);
