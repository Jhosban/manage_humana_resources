import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { MainLayout } from '../components/layout/MainLayout';
import { PrivateRoutes } from './PrivateRoutes';
import { 
  SignInPage, 
  SignUpPage 
} from '../pages';
import { ROUTES } from './constants';
import { DataProvider } from '../context/DataContext';

export const AppRoutes = () => {
  return (
    <Router>
      <DataProvider>
        <Routes>
          {/* Ruta inicial redirige al signin */}
          <Route path={ROUTES.ROOT} element={<Navigate to={ROUTES.SIGNIN} replace />} />
          
          {/* Rutas públicas (no requieren autenticación) */}
          <Route path={ROUTES.SIGNIN} element={
            <ProtectedRoute requireAuth={false}>
              <SignInPage />
            </ProtectedRoute>
          } />
          
          <Route path={ROUTES.SIGNUP} element={
            <ProtectedRoute requireAuth={false}>
              <SignUpPage />
            </ProtectedRoute>
          } />
          
          {/* Rutas protegidas (requieren autenticación) */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            {/* Rutas anidadas dentro del MainLayout */}
            <Route path="*" element={<PrivateRoutes />} />
          </Route>
          
          {/* Ruta 404 - redirige al signin */}
          <Route path={ROUTES.FALLBACK} element={<Navigate to={ROUTES.SIGNIN} replace />} />
        </Routes>
      </DataProvider>
    </Router>
  );
};
