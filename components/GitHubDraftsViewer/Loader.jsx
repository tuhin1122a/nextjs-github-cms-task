"use client";

export function Loader() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 bg-slate-200 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}
