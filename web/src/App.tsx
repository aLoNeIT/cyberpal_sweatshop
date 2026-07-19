import React from 'react';
import { RouterProvider } from 'react-router-dom';
import ThemeProvider from './theme/ThemeProvider';
import router from './router';

const App: React.FC = () => (
  <ThemeProvider>
    <RouterProvider router={router} />
  </ThemeProvider>
);

export default App;
