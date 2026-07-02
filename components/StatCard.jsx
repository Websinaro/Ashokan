export default function StatCard({ label, value, tone = "ink", suffix = "" }) {
  const toneClasses = {
    ink: "text-ink",
    present: "text-present",
    absent: "text-absent",
    indigo: "text-indigo",
  }[tone];

  return (
    <div className="card p-5">
      <p className="label !mb-2">{label}</p>
      <p className={`font-mono text-3xl font-semibold ${toneClasses}`}>
        {value}
        <span className="ml-1 text-base font-medium text-ink-soft">{suffix}</span>
      </p>
    </div>
  );
}
