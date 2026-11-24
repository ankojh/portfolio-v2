import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

type Scene = { visible: boolean; played: boolean; ratio: number };
type Motion = {
  active: string | null; paused: boolean; reduced: boolean;
  register: (id: string) => () => void;
  visibility: (id: string, ratio: number) => void;
  replay: (id: string) => void;
  toggle: () => void;
};
const MotionContext = createContext<Motion | null>(null);
export const SCENE_DURATION = 4800;

/** One scheduler for the entire page: finite scenes, never competing loops. */
export function ProjectMotionProvider({ children }: { children: ReactNode }) {
  const [scenes, setScenes] = useState<Map<string, Scene>>(new Map());
  const [active, setActive] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const replayTarget = useRef<string | null>(null);
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [hidden, setHidden] = useState(document.hidden);
  const register = useCallback((id: string) => {
    setScenes((current) => new Map(current).set(id, { visible: false, played: false, ratio: 0 }));
    return () => setScenes((current) => { const next = new Map(current); next.delete(id); return next; });
  }, []);
  const visibility = useCallback((id: string, ratio: number) => {
    setScenes((current) => {
      const scene = current.get(id);
      if (!scene || scene.ratio === ratio) return current;
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
      if (!scenes.get(active)?.visible) setActive(null);
      return;
    }
    const requested = replayTarget.current;
    const next = [...scenes].filter(([, scene]) => scene.visible && !scene.played).sort((a, b) => Number(b[0] === requested) - Number(a[0] === requested) || b[1].ratio - a[1].ratio)[0];
    if (next) {
      replayTarget.current = null;
      setScenes((current) => new Map(current).set(next[0], { ...next[1], played: true }));
      setActive(next[0]);
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
      return scene ? new Map(current).set(id, { ...scene, played: false, ratio: 1 }) : current;
    });
  }, [reduced, hidden]);
  const toggle = useCallback(() => setPaused((value) => !value), []);
  const value = useMemo(() => ({ active, paused, reduced, register, visibility, replay, toggle }), [active, paused, reduced, register, visibility, replay, toggle]);
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

export function MotionScene({ kind, children }: { kind: string; children: ReactNode }) {
  const motion = useContext(MotionContext);
  const instanceId = useId();
  const id = `${instanceId}-${kind}`;
  const element = useRef<HTMLDivElement>(null);
  const register = motion?.register;
  const visibility = motion?.visibility;
  useEffect(() => register?.(id), [register, id]);
  useEffect(() => {
    if (!element.current || !visibility) return;
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => visibility(id, entry.intersectionRatio), { threshold: [0, 0.5, 0.75, 1] });
    observer.observe(element.current);
    return () => observer.disconnect();
  }, [id, visibility]);
  const playing = motion?.active === id && !motion.paused && !motion.reduced;
  return <div ref={element} className={`motion-scene motion-scene--${kind}`} data-playing={playing ? "true" : "false"}>
    <div className="scene-art">{children}</div>
    {motion && <button type="button" className="scene-replay" disabled={motion.reduced} onClick={() => playing ? motion.toggle() : motion.replay(id)} aria-label={playing ? "Pause all project illustrations" : `Replay ${kind.replace(/-/g, " ")} illustration`}>
      {playing ? <Pause size={12} aria-hidden="true" /> : <RotateCcw size={12} aria-hidden="true" />}
      <span>{motion.reduced ? "Still illustration" : playing ? "Pause" : "Replay"}</span>
    </button>}
  </div>;
}
