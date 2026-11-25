import { createContext, useCallback, useContext, useState } from "react";

/*
 * The contract between a scene and the controls inside it. Scenes animate on a loop, so
 * a person's choice has to be protected from the animation: taking a scene over stops it
 * moving, and it stays as they left it.
 */
export type SceneControl = { playing: boolean; takeOver: () => void };

/** Outside a scene — a visual rendered on its own — interaction is simply local. */
export const SceneContext = createContext<SceneControl>({ playing: false, takeOver: () => {} });

export function useSceneControl() {
  return useContext(SceneContext);
}

/**
 * One piece of scene state a visitor can change by hand. The first choice stops this
 * scene's animation, so nothing afterwards moves the illustration out from under them.
 */
export function useSceneChoice<T>(initial: T) {
  const { takeOver } = useSceneControl();
  const [value, setValue] = useState(initial);
  const [touched, setTouched] = useState(false);
  const choose = useCallback((next: T) => {
    takeOver();
    setTouched(true);
    setValue(next);
  }, [takeOver]);
  return { value, touched, choose };
}
