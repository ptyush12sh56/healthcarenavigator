const BASE_URL = "http://localhost:8000";

/**
 * POST /query
 * Sends a natural language medical query to the FastAPI backend.
 * Returns full structured response including hospitals, cost, condition,
 * and distribution data for charts.
 */
export async function queryBackend(query) {
  const response = await fetch(`${BASE_URL}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    let message = `Server error: ${response.status}`;
    try {
      const err = await response.json();
      message = err.detail || err.message || message;
    } catch (_) {}
    throw new Error(message);
  }

  return response.json();
}

/**
 * POST /chat
 * Sends a conversational message to the AI assistant endpoint.
 * @param {string} message     - User's question
 * @param {object} context     - Current search result context
 * @param {Array}  history     - Previous conversation turns [{role, text}]
 */
export async function chatBackend(message, context = null, history = []) {
  const response = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, context, history }),
  });

  if (!response.ok) {
    let message = `Chat error: ${response.status}`;
    try {
      const err = await response.json();
      message = err.detail || err.message || message;
    } catch (_) {}
    throw new Error(message);
  }

  return response.json(); // { reply: "..." }
}

/**
 * GET /health
 * Quick connectivity check.
 */
export async function healthCheck() {
  const response = await fetch(`${BASE_URL}/health`);
  return response.json();
}
