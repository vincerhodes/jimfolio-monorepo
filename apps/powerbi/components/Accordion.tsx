"use client";

import { useState, ReactNode } from "react";

interface AccordionItem {
  title: string;
  children: ReactNode;
}

export default function Accordion({
  items,
  single = true,
  openFirst = true,
}: {
  items: AccordionItem[];
  single?: boolean;
  openFirst?: boolean;
}) {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(
    openFirst ? new Set([0]) : new Set()
  );

  function toggle(index: number) {
    setOpenIndexes((prev) => {
      const next = new Set(single ? [] : prev);
      if (prev.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <div className="accordion">
      {items.map((item, i) => {
        const isOpen = openIndexes.has(i);
        return (
          <article key={i} className={`accordion-item${isOpen ? " is-open" : ""}`}>
            <button
              className="accordion-trigger"
              type="button"
              aria-expanded={isOpen}
              onClick={() => toggle(i)}
            >
              {item.title}
            </button>
            {isOpen && <div className="accordion-panel">{item.children}</div>}
          </article>
        );
      })}
    </div>
  );
}
