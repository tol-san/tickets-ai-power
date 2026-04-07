import { useEffect, useState } from "react";
import "./App.css";

type HealthResponse = {
  status: string;
};

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/health");
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data: HealthResponse = await response.json();
      setHealth(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchHealth();
  }, []);

  return (
    <main className="app">
      <h1>Helpdesk</h1>
      <p className="status">
        {loading
          ? "Loading status..."
          : error
            ? `Status unavailable: ${error}`
            : `Status: ${health?.status ?? "unknown"}`}
      </p>
    </main>
  );
}

export default App;
