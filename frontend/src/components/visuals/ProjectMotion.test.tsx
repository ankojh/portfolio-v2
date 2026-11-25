// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { MotionScene, ProjectMotionProvider } from "./ProjectMotion";
import { useSceneControl } from "./sceneControl";

type Observer = { callback: IntersectionObserverCallback; target?: Element; disconnect: Mock<() => void> };
let observers: Observer[];
let reduced: boolean;
let preferenceListeners: Set<() => void>;
let removePreferenceListener: Mock<(event: string, callback: () => void) => boolean>;

/** Every visible scene is independent — no shared rotation, no shared state. */
function mountScenes(count = 2) {
  return render(<ProjectMotionProvider>
    <MotionScene kind="dor-globe"><span>Dor art</span></MotionScene>
    {count > 1 && <MotionScene kind="transformer-attention"><span>Transformer art</span></MotionScene>}
  </ProjectMotionProvider>);
}

/** Exposes the raw `takeOver` contract so it is testable without a real illustration. */
function TakeOverProbe({ label }: { label: string }) {
  const { takeOver } = useSceneControl();
  return <button onClick={takeOver}>{`take over ${label}`}</button>;
}

function visibility(ratios: number[]) {
  act(() => {
    observers.forEach((observer, index) => observer.callback([
      { target: observer.target, intersectionRatio: ratios[index] } as IntersectionObserverEntry,
    ], {} as IntersectionObserver));
  });
}

function playing() {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-playing="true"]'));
}

function setReduced(value: boolean) {
  act(() => { reduced = value; preferenceListeners.forEach((callback) => callback()); });
}

function setHidden(value: boolean) {
  vi.spyOn(document, "hidden", "get").mockReturnValue(value);
  fireEvent(document, new Event("visibilitychange"));
}

describe("project motion", () => {
  beforeEach(() => {
    // Fake timers aren't driving anything here — nothing in this model ever schedules a
    // timeout — but vi.getTimerCount() still needs them installed to be asked at all.
    vi.useFakeTimers();
    observers = [];
    reduced = false;
    preferenceListeners = new Set();
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    removePreferenceListener = vi.fn((_event: string, callback: () => void) => preferenceListeners.delete(callback));
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      get matches() { return reduced; },
      addEventListener: (_event: string, callback: () => void) => preferenceListeners.add(callback),
      removeEventListener: removePreferenceListener,
    })));
    vi.stubGlobal("IntersectionObserver", class {
      entry: Observer;
      constructor(callback: IntersectionObserverCallback) {
        this.entry = { callback, disconnect: vi.fn() };
        observers.push(this.entry);
      }
      observe(target: Element) { this.entry.target = target; }
      disconnect() { this.entry.disconnect(); }
    });
  });
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it("plays every visible scene at once, indefinitely — no turn-taking", () => {
    mountScenes();
    visibility([1, 1]);
    expect(playing()).toHaveLength(2);
    expect(vi.getTimerCount()).toBe(0);

    // Nothing ever stops on its own: both stay playing for as long as they stay visible.
    visibility([1, 1]);
    expect(playing()).toHaveLength(2);
  });

  it("follows the 0.5 visibility threshold, independently per scene", () => {
    mountScenes();
    visibility([0.49, 0.49]);
    expect(playing()).toHaveLength(0);

    visibility([0.5, 0.49]);
    expect(playing()).toHaveLength(1);
    expect(playing()[0].textContent).toContain("Dor art");

    visibility([0.5, 0.5]);
    expect(playing()).toHaveLength(2);

    visibility([0.49, 0.5]);
    expect(playing()).toHaveLength(1);
    expect(playing()[0].textContent).toContain("Transformer art");

    visibility([0.49, 0.49]);
    expect(playing()).toHaveLength(0);
  });

  it.each(["reduced", "hidden"] as const)("stops every visible scene under %s motion and resumes them all once it lifts", (reason) => {
    mountScenes();
    visibility([1, 1]);
    expect(playing()).toHaveLength(2);

    if (reason === "reduced") setReduced(true); else setHidden(true);
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);

    if (reason === "reduced") setReduced(false); else setHidden(false);
    expect(playing()).toHaveLength(2);
  });

  it.each(["reduced", "hidden"] as const)("keeps a held scene stopped through %s motion, and still stopped once it lifts", (reason) => {
    render(<ProjectMotionProvider>
      <MotionScene kind="probe"><TakeOverProbe label="probe" /><span>probe art</span></MotionScene>
    </ProjectMotionProvider>);
    visibility([1]);
    expect(playing()).toHaveLength(1);

    fireEvent.click(screen.getByText("take over probe"));
    expect(playing()).toHaveLength(0);

    if (reason === "reduced") setReduced(true); else setHidden(true);
    expect(playing()).toHaveLength(0);
    if (reason === "reduced") setReduced(false); else setHidden(false);
    // The hold outlives the suppression — lifting it does not hand the scene back.
    expect(playing()).toHaveLength(0);
  });

  it("stops exactly the taken-over scene, leaves its sibling playing, and never plays it again", () => {
    render(<ProjectMotionProvider>
      <MotionScene kind="probe"><TakeOverProbe label="probe" /><span>probe art</span></MotionScene>
      <MotionScene kind="other"><span>other art</span></MotionScene>
    </ProjectMotionProvider>);
    visibility([1, 1]);
    expect(playing()).toHaveLength(2);

    fireEvent.click(screen.getByText("take over probe"));
    expect(playing()).toHaveLength(1);
    expect(playing()[0].textContent).toContain("other art");

    // No amount of visibility churn brings a held scene back — the choice is permanent.
    visibility([0, 0]);
    visibility([1, 1]);
    visibility([0.5, 1]);
    visibility([1, 1]);
    expect(playing()).toHaveLength(1);
    expect(playing()[0].textContent).toContain("other art");
  });

  it("resets a reused slot's hold when its kind changes, so it plays again", () => {
    const scene = (kind: string) => <ProjectMotionProvider>
      <MotionScene kind={kind}><TakeOverProbe label="x" /><span>{kind}</span></MotionScene>
    </ProjectMotionProvider>;
    const view = render(scene("dor-globe"));
    visibility([1]);
    fireEvent.click(screen.getByText("take over x"));
    expect(playing()).toHaveLength(0);

    view.rerender(scene("transformer-attention"));
    expect(playing()).toHaveLength(1);
    expect(playing()[0].textContent).toContain("transformer-attention");
  });

  it("schedules no timers at mount, on visibility changes, under suppression, or on take-over", () => {
    render(<ProjectMotionProvider>
      <MotionScene kind="probe"><TakeOverProbe label="probe" /><span>probe art</span></MotionScene>
      <MotionScene kind="other"><span>other art</span></MotionScene>
    </ProjectMotionProvider>);
    expect(vi.getTimerCount()).toBe(0);
    visibility([1, 1]);
    expect(vi.getTimerCount()).toBe(0);
    fireEvent.click(screen.getByText("take over probe"));
    expect(vi.getTimerCount()).toBe(0);
    setReduced(true);
    expect(vi.getTimerCount()).toBe(0);
    setHidden(true);
    expect(vi.getTimerCount()).toBe(0);
    visibility([0, 0]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([false, true])("disconnects the observer and removes both listeners on unmount (visible: %s)", (visible) => {
    const removeVisibilityListener = vi.spyOn(document, "removeEventListener");
    const view = mountScenes(1);
    if (visible) visibility([1]);
    view.unmount();
    expect(observers).toHaveLength(1);
    observers.forEach((observer) => expect(observer.disconnect).toHaveBeenCalledOnce());
    expect(removePreferenceListener).toHaveBeenCalledWith("change", expect.any(Function));
    expect(removeVisibilityListener).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
  });

  it("renders no pause control and no per-scene replay button", () => {
    mountScenes();
    visibility([1, 1]);
    expect(document.querySelector(".motion-control")).toBeNull();
    expect(document.querySelector(".scene-replay")).toBeNull();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
