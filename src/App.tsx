import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/pages/LoginPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/catalog" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/catalog"
        element={
          <div className="flex min-h-screen items-center justify-center">
            <p className="text-lg">Catalog page — a ser implementada pelo react-developer</p>
          </div>
        }
      />
      <Route path="*" element={<Navigate to="/catalog" replace />} />
    </Routes>
  );
}
