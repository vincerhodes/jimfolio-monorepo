"use client";

import { useState } from "react";
import BeanForm from "./BeanForm";

interface BeanEditButtonProps {
  bean: {
    id: string;
    name: string;
    roaster: string | null;
    origin: string | null;
    variety: string | null;
    roastDate: string; // ISO string, serialized from the server component
    notes: string | null;
  };
}

export default function BeanEditButton({ bean }: BeanEditButtonProps) {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Edit bean</h2>
        <BeanForm bean={bean} onDone={() => setOpen(false)} />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="btn-secondary btn-sm"
    >
      Edit bean
    </button>
  );
}
