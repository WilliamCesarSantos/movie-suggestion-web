import { JSX } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../guards/ProtectedRoute';
import { LoginPage } from '../../pages/auth/LoginPage';
import { HomePage } from '../../pages/home/HomePage';
import { UserListPage } from '../../pages/users/UserListPage';
import { UserRegisterPage } from '../../pages/users/UserRegisterPage';
import { MovieImportPage } from '../../pages/movies/MovieImportPage';
import { MovieDetailPage } from '../../pages/movies/MovieDetailPage';
import { MovieRatingPage } from '../../pages/movies/MovieRatingPage';

export function AppRouter(): JSX.Element {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute requiredRoles={['movies:read', 'movies-watch:write', 'movies:write', '*']}>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requiredRoles={['users:read', '*']}>
            <UserListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/register"
        element={
          <ProtectedRoute requiredRoles={['users:write', '*']}>
            <UserRegisterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/movies/import"
        element={
          <ProtectedRoute requiredRoles={['movies:write', '*']}>
            <MovieImportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/movies/:id"
        element={
          <ProtectedRoute requiredRoles={['movies:read', 'movies-watch:write', 'movies:write', '*']}>
            <MovieDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/movies/:id/rating"
        element={
          <ProtectedRoute requiredRoles={['movies-watch:write', 'movies:write', '*']}>
            <MovieRatingPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
