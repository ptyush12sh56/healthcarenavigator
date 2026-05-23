import { useState, useEffect } from "react";
import SearchPage from "./pages/SearchPage";
import ResultsPage from "./pages/ResultsPage";

export default function App() {
  const [page, setPage]       = useState("search");
  const [results, setResults] = useState(null);
  const [query, setQuery]     = useState("");
  const [theme, setTheme]     = useState(() =>
    localStorage.getItem("medinav-theme") || "dark"
  );

  useEffect(() => {
    localStorage.setItem("medinav-theme", theme);
    document.body.style.background = theme === "light" ? "#f0f4f8" : "#060d1a";
  }, [theme]);

  const handleResults = (data, rawQuery) => {
    setResults(data);
    setQuery(rawQuery);
    setPage("results");
  };

  const handleBack = () => {
    setPage("search");
    setResults(null);
  };

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  return (
    <div className="app-root">
      {page === "search" ? (
        <SearchPage onResults={handleResults} theme={theme} onToggleTheme={toggleTheme} />
      ) : (
        <ResultsPage
          results={results}
          query={query}
          onBack={handleBack}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
    </div>
  );
}
