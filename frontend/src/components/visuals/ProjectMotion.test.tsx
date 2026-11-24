// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { MotionControls, MotionScene, ProjectMotionProvider, SCENE_DURATION } from "./ProjectMotion";

type Observer = { callback: IntersectionObserverCallback; target?: Element; disconnect: Mock<() => void> };
let observers: Observer[];
let reduced: boolean;
let preferenceListeners: Set<() => void>;
let removePreferenceListener: Mock<(event: string, callback: () => void) => boolean>;

function mountScenes() {
  return render(<ProjectMotionProvider>
    <MotionControls />
    <MotionScene kind="dor-globe"><span>Dor art</span></MotionScene>
    <MotionScene kind="transformer-attention"><span>Transformer art</span></MotionScene>
  </ProjectMotionProvider>);
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

describe("project motion scheduler", () => {
  beforeEach(() => {
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

  it("plays the most visible scene, one at a time, then stops instead of looping", async () => {
    mountScenes();
    visibility([0.6, 0.9]);
    expect(playing()).toHaveLength(1);
    expect(playing()[0].textContent).toContain("Transformer art");
    await act(async () => { await vi.advanceTimersByTimeAsync(SCENE_DURATION); });
    expect(playing()).toHaveLength(1);
    expect(playing()[0].textContent).toContain("Dor art");
    await act(async () => { await vi.advanceTimersByTimeAsync(SCENE_DURATION * 3); });
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Replay dor globe illustration" }));
    expect(playing()).toHaveLength(1);
    expect(playing()[0].textContent).toContain("Dor art");
  });

  it("does not animate offscreen scenes and cancels a scene when it leaves view", () => {
    mountScenes();
    visibility([0.49, 0]);
    expect(playing()).toHaveLength(0);
    visibility([0.75, 0]);
    expect(playing()).toHaveLength(1);
    visibility([0, 0]);
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("gives an explicit replay priority over another scene waiting in the queue", () => {
    mountScenes();
    visibility([1, 1]);
    expect(playing()[0].textContent).toContain("Dor art");
    fireEvent.click(screen.getByRole("button", { name: "Pause illustrations" }));
    expect(playing()).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Replay dor globe illustration" }));
    expect(playing()).toHaveLength(1);
    expect(playing()[0].textContent).toContain("Dor art");
  });

  it("pauses all scenes from the shared control", () => {
    mountScenes();
    visibility([1, 1]);
    fireEvent.click(screen.getByRole("button", { name: "Pause illustrations" }));
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
    expect(screen.getByRole("button", { name: "Resume illustrations" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("restarts a paused single scene for a full playback when resumed", async () => {
    render(<ProjectMotionProvider>
      <MotionControls />
      <MotionScene kind="dor-globe"><span>Dor art</span></MotionScene>
    </ProjectMotionProvider>);
    visibility([1]);
    expect(playing()).toHaveLength(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(SCENE_DURATION / 2); });
    fireEvent.click(screen.getByRole("button", { name: "Pause illustrations" }));
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
    expect(screen.getByText("Dor art")).toBeDefined();
    await act(async () => { await vi.advanceTimersByTimeAsync(SCENE_DURATION * 2); });
    expect(playing()).toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: "Resume illustrations" }));
    expect(playing()).toHaveLength(1);
    expect(playing()[0].textContent).toContain("Dor art");
    await act(async () => { await vi.advanceTimersByTimeAsync(SCENE_DURATION - 1); });
    expect(playing()).toHaveLength(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(1); });
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([false, true])("registers a fresh scene when a reused slot changes kind (prior scene completed: %s)", async (completeFirst) => {
    const scene = (kind: string) => <ProjectMotionProvider>
      <MotionControls />
      <MotionScene kind={kind}><span>{kind}</span></MotionScene>
    </ProjectMotionProvider>;
    const view = render(scene("dor-globe"));
    visibility([1]);
    const slot = screen.getByText("dor-globe").closest(".motion-scene");
    expect(playing()).toHaveLength(1);
    if (completeFirst) {
      await act(async () => { await vi.advanceTimersByTimeAsync(SCENE_DURATION); });
      expect(playing()).toHaveLength(0);
    }

    view.rerender(scene("transformer-attention"));
    expect(screen.getByText("transformer-attention").closest(".motion-scene")).toBe(slot);
    expect(observers).toHaveLength(2);
    expect(observers[0].disconnect).toHaveBeenCalledOnce();
    expect(playing()).toHaveLength(0);
    visibility([0, 1]);
    expect(playing()).toHaveLength(1);
    expect(playing()[0].textContent).toContain("transformer-attention");
    expect(vi.getTimerCount()).toBe(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(SCENE_DURATION); });
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("renders still illustrations and disables replay when reduced motion is already enabled", () => {
    reduced = true;
    mountScenes();
    visibility([1, 1]);
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
    expect((screen.getByRole("button", { name: "Reduced motion is on" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getAllByText("Still illustration")).toHaveLength(2);
    for (const button of screen.getAllByRole("button", { name: /Replay/ })) {
      expect((button as HTMLButtonElement).disabled).toBe(true);
    }
  });

  it("responds to a changed reduced-motion preference and a hidden document", () => {
    mountScenes();
    visibility([1, 1]);
    act(() => { reduced = true; preferenceListeners.forEach((callback) => callback()); });
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
    act(() => { reduced = false; preferenceListeners.forEach((callback) => callback()); });
    expect(playing()).toHaveLength(1);
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    fireEvent(document, new Event("visibilitychange"));
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("disconnects observers, listeners and timers on unmount", () => {
    const removeVisibilityListener = vi.spyOn(document, "removeEventListener");
    const view = mountScenes();
    visibility([1, 1]);
    expect(vi.getTimerCount()).toBe(1);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(observers).toHaveLength(2);
    observers.forEach((observer) => expect(observer.disconnect).toHaveBeenCalledOnce());
    expect(removePreferenceListener).toHaveBeenCalledWith("change", expect.any(Function));
    expect(removeVisibilityListener).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
  });
});
