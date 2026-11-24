import { useId } from "react";

/** Conceptual map geometry and sample reports, not live news or measured output. */
export function DorGlobe() {
  const clipId = useId();
  return <div className="dor-scene" role="img" aria-label="Illustration: incoming reports become located stories on a globe, with possible relationships and original sources kept visible.">
    <div aria-hidden="true" className="dor-layout">
      <div className="scene-heading"><span>Dor / The world, connected</span><span className="scene-stamp">Illustration</span></div>
      <svg className="dor-globe" viewBox="40 10 260 250" fill="none">
        <defs><clipPath id={clipId}><circle cx="170" cy="127" r="105" /></clipPath></defs>
        <g stroke="#A4452D" strokeWidth=".7" opacity=".4"><circle cx="170" cy="127" r="105" /><ellipse cx="170" cy="127" rx="64" ry="105" /><ellipse cx="170" cy="127" rx="25" ry="105" /><ellipse cx="170" cy="127" rx="105" ry="38" /><ellipse cx="170" cy="127" rx="105" ry="77" /><path d="M65 127h210" /></g>
        <g clipPath={`url(#${clipId})`} fill="#B79077" opacity=".35"><path d="m78 70 25-16 27 6 10 19-17 16 8 20-16 15-4 30-15-9-8-29-20-12Z"/><path d="m123 140 20 9 5 25-12 33-12-8-4-27-10-19Z"/><path d="m164 68 20-12 27 7 6 13 26-5 24 15 14 28-22 8-16-15-18 2-12-9-9 23-20 4-18-25Z"/><path d="m177 118 29 4 14 28-13 35-18-2-12-33Z"/><path d="m237 173 23-5 13 17-11 10-22-4Z"/></g>
        <g stroke="#A4452D" strokeWidth="1.6"><path className="dor-route route-one" pathLength="1" d="M111 99Q160 35 209 93"/><path className="dor-route route-two" pathLength="1" d="M209 93Q265 125 247 183"/></g>
        {[[111,99],[209,93],[247,183]].map(([cx,cy],i)=><g key={cx} className={`dor-pin pin-${i}`}><circle cx={cx} cy={cy} r="9" fill="#FAF7F2" stroke="#A4452D" strokeWidth="1"/><circle cx={cx} cy={cy} r="3" fill="#A4452D"/></g>)}
        <text x="170" y="254" textAnchor="middle" fill="#62545B" fontSize="10" letterSpacing="1.8">REPORTS → PLACES → CONNECTIONS</text>
      </svg>
      <div className="dor-wire"><span className="scene-label">Follow the thread</span><div className="wire-row wire-one"><i />A report arrives<small>Original source attached ↗</small></div><div className="wire-row wire-two"><i />Coverage finds its place<small>Location stays inspectable</small></div><div className="wire-row wire-three"><i />A possible connection<small>Related ≠ proven cause</small></div><div className="source-boundary">The source is always one step away.</div></div>
    </div>
  </div>;
}

export function TransformerAttention() {
  return <div className="transformer-scene" role="img" aria-label="Conceptual illustration: tokens connect through attention to a next-token prediction. Change a component in the real Lab to compare its effects; this illustration does not run a model.">
    <div aria-hidden="true"><div className="scene-heading"><span>Transformer Lab / Follow one thought</span><span className="scene-stamp">Illustration</span></div>
      <div className="transformer-board"><div className="token-row"><span>The</span><span>cat</span><span>sat</span><span className="token-next">next?</span></div>
      <svg viewBox="0 0 400 84" className="attention-paths" fill="none" preserveAspectRatio="none"><g stroke="#A4452D" strokeWidth="1.4"><path className="attention-arc arc-one" pathLength="1" d="M50 4Q180 135 350 4"/><path className="attention-arc arc-two" pathLength="1" d="M150 4Q240 95 350 4"/><path className="attention-arc arc-three" pathLength="1" d="M250 4Q300 55 350 4"/></g></svg>
      <div className="model-stages"><span>Embed</span><i>→</i><span className="attention-stage">Attend</span><i>→</i><span>Predict</span></div>
      <div className="model-output"><div><span className="scene-label">Change a part.</span><strong>See what follows.</strong></div><div className="tensor-grid">{Array.from({length:18},(_,i)=><i key={i} className={`tensor-cell tensor-${i%3}`} />)}</div></div></div>
      <div className="model-footer"><span>Tiny model → real computations in the Lab</span><span>Edit · compare · understand</span></div>
    </div>
  </div>;
}
