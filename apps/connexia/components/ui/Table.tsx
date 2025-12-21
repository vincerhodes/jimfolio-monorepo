export default function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="cx-panel cx-table rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
