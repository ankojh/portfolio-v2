import { Play, EyeOff } from "lucide-react";

import { SceneChoice, SceneChoices, SceneNote } from "@/components/visuals/SceneControls";
import { useSceneChoice } from "@/components/visuals/sceneControl";

/*
 * The product decision is how much to hide, so that is the control: the same page at
 * three cutoffs. "Off" is the page as it is, which is also the comparison. The browser
 * chrome and the on-task lecture stay readable at every level, as they do in the app.
 */
/*
 * Each note stays about as long as the narration it replaces. A longer one would wrap,
 * and the control row would take its extra lines out of the browser pane below it.
 */
type Level = "off" | "balanced" | "strict";
const levels: { id: Level; label: string; note: string }[] = [
  { id: "off", label: "Off", note: "Nothing hidden — the page as it is." },
  { id: "balanced", label: "Balanced", note: "Only the off-task feed is blurred." },
  { id: "strict", label: "Strict", note: "The borderline link is blurred too." },
];

export function HeadsDownDemo({ spacious = false }: { spacious?: boolean }) {
  const { value: level, touched, choose } = useSceneChoice<Level>("balanced");
  const current = levels.find((option) => option.id === level)!;
  return <div className={`heads-demo${spacious ? " heads-demo--spacious" : ""}`} data-level={level}>
    <p className="sr-only">
      Heads Down illustration. The task is to study the Kano model. One page holds a lecture, a recommendation
      feed beside it, and a borderline “related video” link. Heads Down blurs only what is off task for that
      task; you choose how much it hides, and the browser’s tabs, address bar and controls stay visible at
      every level.
    </p>
    <div className="heads-demo-inner">
      <div className="heads-task" aria-hidden="true"><span>My task</span><strong>Study the Kano model</strong><span className="heads-task-mark">Heads Down</span></div>
      <div className="heads-browser" aria-hidden="true">
        <div className="heads-browser-bar"><i /><i /><i /><span>One page. Different intentions.</span></div>
        <div className="heads-page">
          <div className="heads-lesson"><div className="heads-video"><Play size={18} fill="currentColor" /><span>Kano model / lecture</span></div><strong>Must-be vs. delighter features</strong><div className="heads-notes"><i /><i /><i /></div><span className="heads-kept">✓ On task · stays clear</span></div>
          <div className="heads-distractions">
            <div className="heads-recommendation-content"><div className="heads-recommendation"><i /><span>Trending videos<small>A whole new rabbit hole</small></span></div><div className="heads-recommendation"><i /><span>Watch next<small>More to pull you away</small></span></div></div>
            <div className="heads-borderline"><span>Related · “Kano in 2 hours”</span><small>{level === "strict" ? "Borderline · hidden too" : "Borderline · kept"}</small></div>
            <span className="heads-blocked">{level === "off" ? "Nothing hidden right now" : <><EyeOff size={11} /> Off task · blurred</>}</span>
          </div>
        </div>
      </div>
      <div className="heads-controls">
        <SceneChoices label="How much Heads Down hides" legend="Hiding" className="scene-pills">
          {levels.map((option) => (
            <SceneChoice key={option.id} className="scene-pill" pressed={level === option.id} onClick={() => choose(option.id)}>{option.label}</SceneChoice>
          ))}
        </SceneChoices>
        <SceneNote className="heads-explainer">
          {touched ? current.note : (
            <span aria-hidden="true">
              <span className="heads-before">First: spot what pulls you away.</span>
              <span className="heads-after">Then: blur it. Keep the lecture.</span>
            </span>
          )}
        </SceneNote>
      </div>
    </div>
  </div>;
}
