"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/api-base";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordsMatch = newPassword === confirmPassword;

  async function submit() {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          setError("Your current password is incorrect.");
        } else if (res.status === 400) {
          setError("Check your details — password needs at least 8 characters.");
        } else {
          setError("Couldn't change password. Try again.");
        }
        return;
      }
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
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
        if (
          !loading &&
          currentPassword &&
          newPassword.length >= 8 &&
          passwordsMatch
        )
          submit();
      }}
    >
      <div>
        <label htmlFor="current-password" className="block text-sm font-medium">
          Current password
        </label>
        <input
          id="current-password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="input"
        />
      </div>

      <div>
        <label htmlFor="new-password" className="block text-sm font-medium">
          New password{" "}
          <span className="text-[#7a6a5d]">(min 8 characters)</span>
        </label>
        <input
          id="new-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="input"
        />
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium">
          Confirm new password
        </label>
        <input
          id="confirm-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input"
        />
        {confirmPassword && !passwordsMatch && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            Passwords don't match.
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-[#5f7a52]" role="status">
          Password changed.
        </p>
      )}

      <button
        type="submit"
        disabled={
          loading ||
          !currentPassword ||
          newPassword.length < 8 ||
          !passwordsMatch
        }
        className="btn-primary"
      >
        {loading ? "Changing…" : "Change password"}
      </button>
    </form>
  );
}
