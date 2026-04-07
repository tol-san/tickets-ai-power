import { Navigate, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar.tsx";
import { useAuth } from "./context/useAuth.ts";
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";

function AppLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-slate-100 to-slate-200 text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <DashboardPage />
      </main>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 px-4 text-slate-700">
        <p className="text-base font-medium sm:text-lg">
          Checking your session...
        </p>
      </main>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route path="/" element={<AppLayout />} />
      <Route
        path="*"
        element={<Navigate to={user ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
