"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/api-base";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        if (res.status === 409) {
          setError("That email already has an account. Try logging in.");
        } else if (res.status === 400) {
          setError("Check your details — password needs at least 8 characters.");
        } else {
          setError("Couldn't sign up. Try again.");
        }
        return;
      }
      // Full navigation so middleware re-runs with the new cookie.
      window.location.href = `${API_BASE}/`;
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
        if (!loading && name && email && password.length >= 8) submit();
      }}
    >
      <div>
        <label htmlFor="signup-name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="signup-name"
          type="text"
          required
          autoFocus
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
        />
      </div>

      <div>
        <label htmlFor="signup-email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
      </div>

      <div>
        <label htmlFor="signup-password" className="block text-sm font-medium">
          Password <span className="text-[#7a6a5d]">(min 8 characters)</span>
        </label>
        <input
          id="signup-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
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

      <button
        type="submit"
        disabled={loading || !name || !email || password.length < 8}
        className="btn-primary"
      >
        {loading ? "Creating…" : "Sign up"}
      </button>
    </form>
  );
}
