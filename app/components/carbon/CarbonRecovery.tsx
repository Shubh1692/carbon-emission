export default function CarbonRecovery({ strategies }: any) {
  if (!strategies) return null;

  return (
    <div className="p-4 border rounded-xl shadow bg-white mt-4">
      <h3 className="font-semibold mb-3">Recovery Strategies</h3>
      <ul className="space-y-2">
        {strategies.map((s: string, i: number) => (
          <li
            key={i}
            className="bg-green-50 border border-green-200 p-2 rounded-md"
          >
            🌱 {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
