/**
 * Standard "What happens if this passes" block for proposals: numbered steps, each a short bold
 * lead ("Holders are paid automatically.") followed by the detail. Every proposal type that changes
 * the vault should explain itself with this block, so all proposals read the same way.
 *
 * @param {{ steps: Array<{ title: string, detail?: import('react').ReactNode }> }} props
 */
export function ProposalOutcome({ steps }) {
  return (
    <div className="bg-steel-800 rounded-lg p-4 space-y-3 text-sm">
      <h4 className="text-white font-medium">What happens if this passes</h4>
      <ol className="list-decimal list-inside space-y-2 text-white/70">
        {steps.map(step => (
          <li key={step.title}>
            <span className="text-white">{step.title}</span>
            {step.detail ? <> {step.detail}</> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
