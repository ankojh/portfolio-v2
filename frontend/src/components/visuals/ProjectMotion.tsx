import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { SceneContext } from "@/components/visuals/sceneControl";

/*
 * Every visible scene animates, continuously and at the same time. There is no
 * scheduler and no playback control: a scene decides for itself, from what it can
 * observe, whether it should be moving at all.
 *
 * Motion yields in four cases — the system asks for reduced motion, the tab is hidden,
 * the scene has scrolled out of view, or someone has taken the scene over by hand. The
 * fifth, pausing under a pointer or keyboard focus, is pure CSS in project-stories.css,
 * because it has to respond faster than a render.
 */
type Motion = { reduced: boolean; hidden: boolean };
const MotionContext = createContext<Motion | null>(null);

/** One pass of a scene's animation; the CSS keyframes share this duration. */
export const SCENE_DURATION = 4800;

/** Half a scene has to be in view before it is worth animating. */
const VISIBLE_RATIO = 0.5;

export function ProjectMotionProvider({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [hidden, setHidden] = useState(document.hidden);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => setReduced(query.matches);
    const visibilityChange = () => setHidden(document.hidden);
    query.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibilityChange);
    return () => { query.removeEventListener("change", preference); document.removeEventListener("visibilitychange", visibilityChange); };
  }, []);
  const value = useMemo(() => ({ reduced, hidden }), [reduced, hidden]);
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function MotionScene({ kind, children, className = "" }: { kind: string; children: ReactNode; className?: string }) {
  const motion = useContext(MotionContext);
  const element = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (!element.current) return;
    if (!("IntersectionObserver" in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.intersectionRatio >= VISIBLE_RATIO),
      { threshold: [0, VISIBLE_RATIO, 1] },
    );
    observer.observe(element.current);
    return () => observer.disconnect();
  }, []);
  // A scene reused for a different visual is a different scene, and starts untouched.
  useEffect(() => { setHeld(false); }, [kind]);
  const playing = visible && !held && !motion?.reduced && !motion?.hidden;
  // Taking a scene over by hand stops it for good: there is no control to hand it back,
  // so a choice someone made is never animated over.
  const control = useMemo(() => ({ playing, takeOver: () => setHeld(true) }), [playing]);
  return <div ref={element} className={`motion-scene motion-scene--${kind} ${className}`} data-playing={playing ? "true" : "false"}>
    <SceneContext.Provider value={control}><div className="scene-art">{children}</div></SceneContext.Provider>
  </div>;
}
