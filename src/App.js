import React, { useState } from "react";

function App() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedBook, setExpandedBook] = useState(null);
  const [descriptions, setDescriptions] = useState({});

  const fetchBooks = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setBooks([]);

    try {
      const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(
        query
      )}`;

      const res = await fetch(url);
      const data = await res.json();
      setBooks(Array.isArray(data.docs) ? data.docs : []);
    } catch (err) {
      setError("❌ Failed to fetch books. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const fetchDescription = async (bookKey) => {
    try {
      const res = await fetch("https://openlibrary.org${bookKey}.json");
      const data = await res.json();
      return (
        data.description?.value ||
        data.description ||
        "No description available."
      );
    } catch {
      return "No description available.";
    }
  };

  const toggleExpand = async (b) => {
    if (expandedBook === b.key) {
      setExpandedBook(null);
      return;
    }
    if (!descriptions[b.key]) {
      const desc = await fetchDescription(b.key);
      setDescriptions((prev) => ({ ...prev, [b.key]: desc }));
    }

    setExpandedBook(b.key);
  };
  return (
    <div
      style={{ padding: 20, fontFamily: "Arial, sans-serif", maxWidth: 800 }}
    >
      <h1>📚 Book Finder</h1>
      <p>Search for books by title using the Open Library API.</p>

      <div style={{ marginBottom: 12 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a book title (e.g. harry potter)"
          style={{
            padding: "10px",
            width: "60%",
            maxWidth: 400,
            fontSize: 16,
            marginRight: 8,
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={fetchBooks}
          style={{ padding: "10px 14px", fontSize: 16, cursor: "pointer" }}
        >
          🔍 Search
        </button>
      </div>
      {loading && <p>⏳ Loading…</p>}
      {!loading && books.length === 0 && query && <p>No results found.</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginTop: 18 }}>
        {!loading &&
          books.slice(0, 10).map((b, i) => {
            const coverId = b.cover_i;
            const coverUrl = coverId
              ? "https://covers.openlibrary.org/b/id/${coverId}-M.jpg"
              : null;
            const isOpen = expandedBook === b.key;

            return (
              <div
                key={i}
                onClick={() => toggleExpand(b)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  border: "1px solid #eee",
                  borderRadius: 6,
                  padding: 10,
                  marginBottom: 14,
                  cursor: "pointer",
                  background: isOpen ? "#f9f9f9" : "#fff",
                }}
              >
                <div style={{ display: "flex", gap: 12 }}>
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt="cover"
                      style={{
                        width: 64,
                        height: 96,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 64,
                        height: 96,
                        background: "#eee",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: 12,
                        color: "#777",
                      }}
                    >
                      No cover
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>
                      {b.title}
                    </div>
                    <div style={{ color: "#555", marginTop: 6 }}>
                      ✍ {b.author_name?.join(", ") || "Unknown author"}
                    </div>
                    {b.first_publish_year && (
                      <div style={{ marginTop: 6 }}>
                        📆 First: {b.first_publish_year}
                      </div>
                    )}
                  </div>
                </div>
                {isOpen && (
                  <div style={{ marginLeft: 5 }}>
                    <div>
                      📖 {descriptions[b.key] || "Loading description..."}
                    </div>
                    {b.subject && (
                      <div style={{ marginTop: 6 }}>
                        {b.subject.slice(0, 5).join(" • ")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
export default App;
