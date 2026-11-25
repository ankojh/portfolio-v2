import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

import { SceneContext } from "@/components/visuals/sceneControl";

type Scene = { visible: boolean; played: boolean; ratio: number; held: boolean };
type Motion = {
  active: string | null; paused: boolean; reduced: boolean;
  register: (id: string) => () => void;
  visibility: (id: string, ratio: number) => void;
  replay: (id: string) => void;
  hold: (id: string) => void;
  release: (id: string) => void;
  toggle: () => void;
};
const MotionContext = createContext<Motion | null>(null);
export const SCENE_DURATION = 4800;
export const SCENE_REST = 1200;

/** Visible scenes take turns, then repeat after a short still interval. */
export function ProjectMotionProvider({ children }: { children: ReactNode }) {
  const [scenes, setScenes] = useState<Map<string, Scene>>(new Map());
  const [active, setActive] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const replayTarget = useRef<string | null>(null);
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [hidden, setHidden] = useState(document.hidden);
  const register = useCallback((id: string) => {
    setScenes((current) => new Map(current).set(id, { visible: false, played: false, ratio: 0, held: false }));
    return () => setScenes((current) => { const next = new Map(current); next.delete(id); return next; });
  }, []);
  const visibility = useCallback((id: string, ratio: number) => {
    setScenes((current) => {
      const scene = current.get(id);
      // Visibility is derived from the ratio, so both have to agree before an observation
      // can be dropped as a repeat — otherwise a scene can be left permanently unseen.
      if (!scene || (scene.ratio === ratio && scene.visible === (ratio >= 0.5))) return current;
      return new Map(current).set(id, { ...scene, visible: ratio >= 0.5, ratio });
    });
  }, []);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => setReduced(query.matches);
    const visibilityChange = () => setHidden(document.hidden);
    query.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibilityChange);
    return () => { query.removeEventListener("change", preference); document.removeEventListener("visibilitychange", visibilityChange); };
  }, []);
  useEffect(() => {
    if (paused || reduced || hidden) {
      if (active) {
        replayTarget.current = active;
        setScenes((current) => {
          const scene = current.get(active);
          return scene ? new Map(current).set(active, { ...scene, played: false }) : current;
        });
        setActive(null);
      }
      return;
    }
    if (active) {
      const scene = scenes.get(active);
      // A scene someone is driving by hand leaves the rotation at once.
      if (!scene?.visible || scene.held) setActive(null);
      return;
    }
    const requested = replayTarget.current;
    const next = [...scenes].filter(([, scene]) => scene.visible && !scene.played && !scene.held).sort((a, b) => Number(b[0] === requested) - Number(a[0] === requested) || b[1].ratio - a[1].ratio)[0];
    if (next) {
      replayTarget.current = null;
      setScenes((current) => new Map(current).set(next[0], { ...next[1], played: true }));
      setActive(next[0]);
    } else if ([...scenes.values()].some((scene) => scene.visible && !scene.held)) {
      // A complete visible round gets a quiet beat before starting again.
      const timer = setTimeout(() => setScenes((current) => new Map(
        [...current].map(([id, scene]) => [id, scene.visible ? { ...scene, played: false } : scene]),
      )), SCENE_REST);
      return () => clearTimeout(timer);
    }
  }, [scenes, active, paused, reduced, hidden]);
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setActive(null), SCENE_DURATION);
    return () => clearTimeout(timer);
  }, [active]);
  const replay = useCallback((id: string) => {
    if (reduced || hidden) return;
    replayTarget.current = id;
    setPaused(false);
    // Stop the current scene before requesting a fresh, unique playback.
    setActive(null);
    setScenes((current) => {
      const scene = current.get(id);
      // Priority comes from replayTarget, so the observed ratio is left as the observer
      // last reported it. Claiming full visibility here would make the next real
      // observation look like a repeat, and the scene would never be seen again.
      return scene ? new Map(current).set(id, { ...scene, played: false, held: false }) : current;
    });
  }, [reduced, hidden]);
  const hold = useCallback((id: string) => {
    setScenes((current) => {
      const scene = current.get(id);
      return scene && !scene.held ? new Map(current).set(id, { ...scene, held: true }) : current;
    });
  }, []);
  /*
   * Giving a scene back is not the same as asking it to play. Reduced motion, a hidden
   * tab or a pause only decide whether playback may start; the hold has to clear either
   * way, or a scene reset while motion is off would stay out of the rotation for good.
   */
  const release = useCallback((id: string) => {
    setScenes((current) => {
      const scene = current.get(id);
      return scene?.held ? new Map(current).set(id, { ...scene, held: false, played: false }) : current;
    });
  }, []);
  const toggle = useCallback(() => setPaused((value) => !value), []);
  const value = useMemo(() => ({ active, paused, reduced, register, visibility, replay, hold, release, toggle }), [active, paused, reduced, register, visibility, replay, hold, release, toggle]);
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function MotionControls() {
  const motion = useContext(MotionContext);
  if (!motion) return null;
  return <button type="button" className="motion-control" onClick={motion.toggle} disabled={motion.reduced} aria-pressed={motion.paused}>
    {motion.paused || motion.reduced ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
    {motion.reduced ? "Reduced motion is on" : motion.paused ? "Resume illustrations" : "Pause illustrations"}
  </button>;
}

export function MotionScene({ kind, children, className = "" }: { kind: string; children: ReactNode; className?: string }) {
  const motion = useContext(MotionContext);
  const instanceId = useId();
  const id = `${instanceId}-${kind}`;
  const element = useRef<HTMLDivElement>(null);
  const [driven, setDriven] = useState(false);
  const register = motion?.register;
  const visibility = motion?.visibility;
  const hold = motion?.hold;
  useEffect(() => register?.(id), [register, id]);
  useEffect(() => {
    if (!element.current || !visibility) return;
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => visibility(id, entry.intersectionRatio), { threshold: [0, 0.5, 0.75, 1] });
    observer.observe(element.current);
    return () => observer.disconnect();
  }, [id, visibility]);
  const playing = motion?.active === id && !motion.paused && !motion.reduced;
  const control = useMemo(() => ({
    playing, driven,
    takeOver: () => { setDriven(true); hold?.(id); },
  }), [playing, driven, hold, id]);
  // Autoplay taking the scene back also returns its controls to their defaults.
  useEffect(() => { if (playing) setDriven(false); }, [playing]);
  // A reused slot that changes kind is a different scene, so it starts untouched rather
  // than inheriting the label and the suppressed defaults of the one it replaced.
  useEffect(() => { setDriven(false); }, [id]);
  const scene = kind.replace(/-/g, " ");
  // One control, three jobs: pause what is playing, undo a hand-made change, replay a
  // still. Releasing the hold is unconditional; replay decides for itself whether it may run.
  const handBack = () => { setDriven(false); motion?.release(id); motion?.replay(id); };
  return <div ref={element} className={`motion-scene motion-scene--${kind} ${className}`} data-playing={playing ? "true" : "false"} data-driven={driven ? "true" : "false"}>
    <SceneContext.Provider value={control}><div className="scene-art">{children}</div></SceneContext.Provider>
    {motion && <button type="button" className="scene-replay" disabled={motion.reduced && !driven} onClick={() => playing ? motion.toggle() : handBack()} aria-label={playing ? "Pause all project illustrations" : driven ? `Reset the ${scene} illustration` : `Replay ${scene} illustration`}>
      {playing ? <Pause size={12} aria-hidden="true" /> : <RotateCcw size={12} aria-hidden="true" />}
      <span>{driven ? "Reset" : motion.reduced ? "Still illustration" : playing ? "Pause" : "Replay"}</span>
    </button>}
  </div>;
}
