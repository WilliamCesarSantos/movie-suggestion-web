import { Routes, Route, Navigate } from "react-router-dom";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/catalog" replace />} />
      <Route
        path="/login"
        element={
          <div className="flex min-h-screen items-center justify-center">
            <p className="text-lg">Login page — a ser implementada pelo react-developer</p>
          </div>
        }
      />
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
