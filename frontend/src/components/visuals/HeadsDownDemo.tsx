import { Play, EyeOff } from "lucide-react";

export function HeadsDownDemo({ spacious = false }: { spacious?: boolean }) {
  return <div className={`heads-demo${spacious ? " heads-demo--spacious" : ""}`} role="img" aria-label="Heads Down illustration: task is to study the Kano model. Before, a lecture and unrelated recommendations share a page. Then only the recommendations blur; the lecture, notes and controls stay readable.">
    <div aria-hidden="true" className="heads-demo-inner">
      <div className="heads-task"><span>My task</span><strong>Study the Kano model</strong><span className="heads-task-mark">Heads Down</span></div>
      <div className="heads-browser">
        <div className="heads-browser-bar"><i /><i /><i /><span>One page. Different intentions.</span></div>
        <div className="heads-page">
          <div className="heads-lesson"><div className="heads-video"><Play size={18} fill="currentColor" /><span>Kano model / lecture</span></div><strong>Must-be vs. delighter features</strong><div className="heads-notes"><i /><i /><i /></div><span className="heads-kept">✓ On task · stays clear</span></div>
          <div className="heads-distractions"><div className="heads-recommendation-content"><div className="heads-recommendation"><i /><span>Trending videos<small>A whole new rabbit hole</small></span></div><div className="heads-recommendation"><i /><span>Watch next<small>More to pull you away</small></span></div></div><span className="heads-blocked"><EyeOff size={11} /> Off task · blurred</span></div>
        </div>
      </div>
      <div className="heads-explainer"><span className="heads-before">First: spot what pulls you away.</span><span className="heads-after">Then: blur the distraction. Keep the lecture.</span></div>
    </div>
  </div>;
}
