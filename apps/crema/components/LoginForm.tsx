"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/api-base";

export default function LoginForm({ next }: { next: string }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError(res.status === 401 ? "Wrong password." : "Couldn't log in. Try again.");
        return;
      }
      // Full navigation so middleware re-runs with the new cookie.
      window.location.href = `${API_BASE}${next}`;
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="card space-y-4 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!loading && password) submit();
      }}
    >
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading || !password} className="btn-primary">
        {loading ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}
