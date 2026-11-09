import type { ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/pages/LoginPage";
import { CatalogPage } from "@/pages/CatalogPage";
import { MovieRatingPage } from "@/pages/MovieRatingPage";
import { UsersListPage } from "@/pages/stubs/UsersListPage";
import { UserFormPage } from "@/pages/stubs/UserFormPage";
import { MovieImportPage } from "@/pages/stubs/MovieImportPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function guard(element: ReactNode, requireRoles?: string[]) {
  return (
    <ProtectedRoute requireAuth requireRoles={requireRoles}>
      {element}
    </ProtectedRoute>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/catalog" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/catalog" element={guard(<CatalogPage />, ["movies:read", "movies:write"])} />
      <Route path="/movies/:id/rate" element={guard(<MovieRatingPage />, ["movies-watch:write"])} />
      <Route path="/users" element={guard(<UsersListPage />, ["users:read", "users:write"])} />
      <Route path="/users/new" element={guard(<UserFormPage />, ["users:write"])} />
      <Route path="/users/:id/edit" element={guard(<UserFormPage />, ["users:write"])} />
      <Route path="/movies-import" element={guard(<MovieImportPage />, ["movies:write"])} />
      <Route path="*" element={<Navigate to="/catalog" replace />} />
    </Routes>
  );
}
