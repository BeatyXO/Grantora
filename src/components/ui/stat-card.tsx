export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glow-hover rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur-sm">
      <p className="text-sm text-white/55">{label}</p>
      <p className="mt-3 font-display text-4xl text-white">{value}</p>
    </div>
  );
}
