"use client";

import { useState, ReactNode } from "react";

interface TabItem {
  label: string;
  children: ReactNode;
}

export default function Tabs({ items }: { items: TabItem[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="tabs">
      <div className="tab-list" role="tablist">
        {items.map((item, i) => (
          <button
            key={i}
            className={`tab-button${i === active ? " active" : ""}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, i) => (
        <div
          key={i}
          className={`tab-panel${i === active ? " active" : ""}`}
          style={{ display: i === active ? "block" : "none" }}
        >
          {item.children}
        </div>
      ))}
    </div>
  );
}
