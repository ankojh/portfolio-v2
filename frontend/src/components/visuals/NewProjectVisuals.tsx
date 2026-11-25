import { useId } from "react";

import { SceneChoice, SceneChoices, SceneNote } from "@/components/visuals/SceneControls";
import { useSceneChoice } from "@/components/visuals/sceneControl";

/*
 * Conceptual map geometry and sample reports, not live news or measured output. Every
 * line here stays about as long as the one it replaces, so choosing a story moves the
 * marks on the globe without changing the height of the scene around them.
 */
const stories = [
  { key: "report", title: "A report arrives", hint: "Original source attached ↗", note: "The source stays attached to the report." },
  { key: "place", title: "Coverage finds its place", hint: "Location stays inspectable", note: "One event, grouped. Placement is approximate." },
  { key: "link", title: "A possible connection", hint: "Related ≠ proven cause", note: "A predicted link — not a proven cause." },
];

export function DorGlobe() {
  const clipId = useId();
  const { value: story, touched, choose } = useSceneChoice(0);
  const selected = touched ? story : null;
  return <div className="dor-scene">
    <p className="sr-only">
      Illustration of Dor: incoming reports become located stories on a globe, with possible relationships and
      original sources kept in view. Choose one of the three sample stories to see where it sits on the globe
      and what the product claims about it.
    </p>
    <div className="dor-layout">
      <div className="scene-heading" aria-hidden="true"><span>Dor / The world, connected</span><span className="scene-stamp">Illustration</span></div>
      <svg className="dor-globe" viewBox="40 10 260 250" fill="none" aria-hidden="true" data-story={selected ?? undefined}>
        <defs><clipPath id={clipId}><circle cx="170" cy="127" r="105" /></clipPath></defs>
        <g stroke="#A4452D" strokeWidth=".7" opacity=".4"><circle cx="170" cy="127" r="105" /><ellipse cx="170" cy="127" rx="64" ry="105" /><ellipse cx="170" cy="127" rx="25" ry="105" /><ellipse cx="170" cy="127" rx="105" ry="38" /><ellipse cx="170" cy="127" rx="105" ry="77" /><path d="M65 127h210" /></g>
        <g clipPath={`url(#${clipId})`} fill="#B79077" opacity=".35"><path d="m78 70 25-16 27 6 10 19-17 16 8 20-16 15-4 30-15-9-8-29-20-12Z"/><path d="m123 140 20 9 5 25-12 33-12-8-4-27-10-19Z"/><path d="m164 68 20-12 27 7 6 13 26-5 24 15 14 28-22 8-16-15-18 2-12-9-9 23-20 4-18-25Z"/><path d="m177 118 29 4 14 28-13 35-18-2-12-33Z"/><path d="m237 173 23-5 13 17-11 10-22-4Z"/></g>
        <g stroke="#A4452D" strokeWidth="1.6"><path className="dor-route route-one" pathLength="1" d="M111 99Q160 35 209 93"/><path className="dor-route route-two" pathLength="1" d="M209 93Q265 125 247 183"/></g>
        {[[111,99],[209,93],[247,183]].map(([cx,cy],i)=><g key={cx} className={`dor-pin pin-${i}`}><circle cx={cx} cy={cy} r="9" fill="#FAF7F2" stroke="#A4452D" strokeWidth="1"/><circle cx={cx} cy={cy} r="3" fill="#A4452D"/></g>)}
        <text x="170" y="254" textAnchor="middle" fill="#62545B" fontSize="10" letterSpacing="1.8">REPORTS → PLACES → CONNECTIONS</text>
      </svg>
      <div className="dor-wire">
        <span className="scene-label" aria-hidden="true">Follow the thread</span>
        <SceneChoices label="Follow one sample story">
          {stories.map((item, index) => (
            <SceneChoice key={item.key} className={`wire-row wire-${["one","two","three"][index]}`} pressed={selected === index} onClick={() => choose(index)}>
              <i aria-hidden="true" />{item.title}<small>{item.hint}</small>
            </SceneChoice>
          ))}
        </SceneChoices>
        <SceneNote className="source-boundary">{selected === null ? "The source is always one step away." : stories[selected].note}</SceneNote>
      </div>
    </div>
  </div>;
}

const tokens = ["The", "cat", "sat"];

export function TransformerAttention() {
  const { value: token, touched, choose } = useSceneChoice(2);
  const selected = touched ? token : null;
  return <div className="transformer-scene">
    <p className="sr-only">
      Conceptual illustration of Transformer Lab: tokens connect through attention to a next-token prediction.
      Choose a token to follow its attention path to the prediction. This illustration does not run a model —
      the Lab itself runs the real computations.
    </p>
    <div><div className="scene-heading" aria-hidden="true"><span>Transformer Lab / Follow one thought</span><span className="scene-stamp">Illustration</span></div>
      <div className="transformer-board" data-token={selected ?? undefined}>
        <SceneChoices label="Follow the attention from one token" className="token-row">
          {tokens.map((word, index) => (
            <SceneChoice key={word} pressed={selected === index} onClick={() => choose(index)}>{word}</SceneChoice>
          ))}
          <span className="token-next" aria-hidden="true">next?</span>
        </SceneChoices>
      <svg viewBox="0 0 400 84" className="attention-paths" fill="none" preserveAspectRatio="none" aria-hidden="true"><g stroke="#A4452D" strokeWidth="1.4"><path className="attention-arc arc-one" pathLength="1" d="M50 4Q180 135 350 4"/><path className="attention-arc arc-two" pathLength="1" d="M150 4Q240 95 350 4"/><path className="attention-arc arc-three" pathLength="1" d="M250 4Q300 55 350 4"/></g></svg>
      <div className="model-stages" aria-hidden="true"><span>Embed</span><i>→</i><span className="attention-stage">Attend</span><i>→</i><span>Predict</span></div>
      <div className="model-output"><div><SceneNote className="scene-label">{selected === null ? "Change a part." : `From “${tokens[selected]}”`}</SceneNote><strong aria-hidden="true">See what follows.</strong></div><div className="tensor-grid" aria-hidden="true">{Array.from({length:18},(_,i)=><i key={i} className={`tensor-cell tensor-${i%3}`} />)}</div></div></div>
      <div className="model-footer" aria-hidden="true"><span>Tiny model → real computations in the Lab</span><span>Edit · compare · understand</span></div>
    </div>
  </div>;
}
