import { createContext, useCallback, useContext, useEffect, useState } from "react";

/*
 * The contract between a scene and the controls inside it. Illustrations loop on their
 * own, so a person's choice has to be protected from the next turn of the rotation:
 * taking over removes this scene from it, and the scene's Replay button hands it back.
 */
export type SceneControl = { playing: boolean; driven: boolean; takeOver: () => void };

/** Outside a scene — a visual rendered on its own — interaction is simply local. */
export const SceneContext = createContext<SceneControl>({ playing: false, driven: false, takeOver: () => {} });

export function useSceneControl() {
  return useContext(SceneContext);
}

/**
 * One piece of scene state a visitor can change by hand. Choosing suspends this scene's
 * autoplay; letting go of the scene — by pressing Reset, or by the rotation taking it
 * back — restores the default, so an animation never plays over someone's edit.
 *
 * `initial` must be a stable value — a primitive or a module-level constant.
 */
export function useSceneChoice<T>(initial: T) {
  const { driven, takeOver } = useSceneControl();
  const [value, setValue] = useState(initial);
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (driven) return;
    setValue(initial);
    setTouched(false);
  }, [driven, initial]);
  const choose = useCallback((next: T) => {
    takeOver();
    setTouched(true);
    setValue(next);
  }, [takeOver]);
  return { value, touched, choose };
}
