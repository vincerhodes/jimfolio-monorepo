"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "powerbi-course-progress-v1";

function loadState(): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveState(state: Record<string, boolean>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Non-blocking
  }
}

export default function ProgressCheckbox({ sectionId }: { sectionId: string }) {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const state = loadState();
    setChecked(!!state[sectionId]);
  }, [sectionId]);

  function handleChange() {
    const next = !checked;
    setChecked(next);
    const state = loadState();
    state[sectionId] = next;
    saveState(state);
  }

  return (
    <label className="complete-control">
      <input
        className="complete-checkbox"
        type="checkbox"
        checked={checked}
        onChange={handleChange}
      />
      Mark section as complete
    </label>
  );
}
