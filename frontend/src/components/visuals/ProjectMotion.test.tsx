// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { MotionControls, MotionScene, ProjectMotionProvider, SCENE_DURATION, SCENE_REST } from "./ProjectMotion";

type Observer = { callback: IntersectionObserverCallback; target?: Element; disconnect: Mock<() => void> };
let observers: Observer[];
let reduced: boolean;
let preferenceListeners: Set<() => void>;
let removePreferenceListener: Mock<(event: string, callback: () => void) => boolean>;

function mountScenes(count = 2) {
  return render(<ProjectMotionProvider>
    <MotionControls />
    <MotionScene kind="dor-globe"><span>Dor art</span></MotionScene>
    {count > 1 && <MotionScene kind="transformer-attention"><span>Transformer art</span></MotionScene>}
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

function expectPlaying(art: string) {
  expect(playing()).toHaveLength(1);
  expect(playing()[0].textContent).toContain(art);
  expect(vi.getTimerCount()).toBe(1);
}

async function advance(time: number) {
  await act(async () => { await vi.advanceTimersByTimeAsync(time); });
}

function setReduced(value: boolean) {
  act(() => { reduced = value; preferenceListeners.forEach((callback) => callback()); });
}

function setHidden(value: boolean) {
  vi.spyOn(document, "hidden", "get").mockReturnValue(value);
  fireEvent(document, new Event("visibilitychange"));
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

  it("keeps each scene finite and rests between at least three single-scene cycles", async () => {
    expect(SCENE_DURATION).toBe(4800);
    expect(SCENE_REST).toBe(1200);
    mountScenes(1);
    visibility([1]);

    for (let cycle = 0; cycle < 3; cycle += 1) {
      expectPlaying("Dor art");
      await advance(SCENE_DURATION - 1);
      expectPlaying("Dor art");
      await advance(1);
      expect(playing()).toHaveLength(0);
      expect(vi.getTimerCount()).toBe(1);
      await advance(SCENE_REST - 1);
      expect(playing()).toHaveLength(0);
      await advance(1);
    }
    expectPlaying("Dor art");
  });

  it("plays every visible scene once, most visible first, before resting across three cycles", async () => {
    mountScenes();
    visibility([0.6, 0.9]);

    for (let cycle = 0; cycle < 3; cycle += 1) {
      expectPlaying("Transformer art");
      await advance(SCENE_DURATION - 1);
      expectPlaying("Transformer art");
      await advance(1);
      expectPlaying("Dor art");
      await advance(SCENE_DURATION - 1);
      expectPlaying("Dor art");
      await advance(1);
      expect(playing()).toHaveLength(0);
      expect(vi.getTimerCount()).toBe(1);
      await advance(SCENE_REST - 1);
      expect(playing()).toHaveLength(0);
      await advance(1);
    }
    expectPlaying("Transformer art");
  });

  it("uses current visibility order for each new round without replaying a scene within a round", async () => {
    mountScenes();
    visibility([0.6, 0.9]);
    expectPlaying("Transformer art");
    visibility([1, 0.5]);
    expectPlaying("Transformer art");
    await advance(SCENE_DURATION);
    expectPlaying("Dor art");
    await advance(SCENE_DURATION);
    expect(playing()).toHaveLength(0);
    await advance(SCENE_REST);
    expectPlaying("Dor art");
    await advance(SCENE_DURATION);
    expectPlaying("Transformer art");
  });

  it("starts at exactly 50% visibility and leaves no active or rest timer when all scenes leave view", async () => {
    mountScenes();
    expect(vi.getTimerCount()).toBe(0);
    visibility([0.49, 0]);
    await advance((SCENE_DURATION + SCENE_REST) * 4);
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
    visibility([0.5, 0]);
    expectPlaying("Dor art");
    visibility([0.49, 0]);
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
    await advance((SCENE_DURATION + SCENE_REST) * 4);
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("loops only the eligible scene while its sibling remains offscreen", async () => {
    mountScenes();
    visibility([0.8, 0.49]);
    for (let cycle = 0; cycle < 3; cycle += 1) {
      expectPlaying("Dor art");
      await advance(SCENE_DURATION);
      expect(playing()).toHaveLength(0);
      await advance(SCENE_REST);
    }
    expectPlaying("Dor art");
  });

  it("resets played flags only for visible scenes when starting a new round", async () => {
    mountScenes();
    visibility([1, 0.6]);
    await advance(SCENE_DURATION);
    expectPlaying("Transformer art");
    visibility([0, 1]);
    await advance(SCENE_DURATION);
    await advance(SCENE_REST);
    expectPlaying("Transformer art");

    // Dor already played before leaving view; offscreen rounds must preserve that flag.
    visibility([1, 0.6]);
    expectPlaying("Transformer art");
    await advance(SCENE_DURATION);
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(1);
    await advance(SCENE_REST - 1);
    expect(playing()).toHaveLength(0);
    await advance(1);
    expectPlaying("Dor art");
  });

  it("cancels rest when no scenes remain visible and starts fresh work when a scene enters view", async () => {
    mountScenes();
    visibility([1, 0]);
    await advance(SCENE_DURATION);
    await advance(SCENE_REST / 2);
    expect(vi.getTimerCount()).toBe(1);
    visibility([0, 0]);
    expect(vi.getTimerCount()).toBe(0);
    await advance((SCENE_DURATION + SCENE_REST) * 3);
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
    visibility([0, 0.5]);
    expectPlaying("Transformer art");
  });

  it("interrupts rest immediately for a newly visible, unplayed scene", async () => {
    mountScenes();
    visibility([1, 0]);
    await advance(SCENE_DURATION);
    await advance(SCENE_REST / 2);
    visibility([1, 0.5]);
    expectPlaying("Transformer art");
    await advance(SCENE_REST / 2);
    expectPlaying("Transformer art");
    await advance(SCENE_DURATION - SCENE_REST / 2);
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(1);
  });

  it("gives explicit replay priority over another scene waiting in the queue", async () => {
    mountScenes();
    visibility([1, 0.6]);
    expectPlaying("Dor art");
    fireEvent.click(screen.getByRole("button", { name: "Pause illustrations" }));
    expect(playing()).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Replay transformer attention illustration" }));
    expectPlaying("Transformer art");
    await advance(SCENE_DURATION);
    expectPlaying("Dor art");
  });

  it("interrupts an active scene for an explicit replay without concurrent playback or stale completion", async () => {
    mountScenes();
    visibility([1, 0.6]);
    await advance(SCENE_DURATION / 2);
    fireEvent.click(screen.getByRole("button", { name: "Replay transformer attention illustration" }));
    expectPlaying("Transformer art");
    await advance(SCENE_DURATION - 1);
    expectPlaying("Transformer art");
    await advance(1);
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(1);
  });

  it("interrupts rest for an explicit replay and cancels the old rest deadline", async () => {
    mountScenes();
    visibility([1, 0.6]);
    await advance(SCENE_DURATION);
    await advance(SCENE_DURATION);
    expect(playing()).toHaveLength(0);
    await advance(SCENE_REST / 2);
    fireEvent.click(screen.getByRole("button", { name: "Replay transformer attention illustration" }));
    expectPlaying("Transformer art");
    await advance(SCENE_REST / 2);
    expectPlaying("Transformer art");
    await advance(SCENE_DURATION - SCENE_REST / 2 - 1);
    expectPlaying("Transformer art");
    await advance(1);
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(1);
    await advance(SCENE_REST);
    expectPlaying("Dor art");
  });

  it("keeps explicit replay of an offscreen scene idle without scheduling timers", async () => {
    mountScenes();
    visibility([0, 0]);
    fireEvent.click(screen.getByRole("button", { name: "Replay dor globe illustration" }));
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
    await advance((SCENE_DURATION + SCENE_REST) * 3);
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(["pause", "reduced", "hidden"] as const)("cancels active playback on %s and resumes the interrupted scene for its full duration", async (reason) => {
    mountScenes();
    visibility([0.6, 1]);
    await advance(SCENE_DURATION / 2);
    if (reason === "pause") fireEvent.click(screen.getByRole("button", { name: "Pause illustrations" }));
    if (reason === "reduced") setReduced(true);
    if (reason === "hidden") setHidden(true);
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
    if (reason === "pause") expect(screen.getByRole("button", { name: "Resume illustrations" }).getAttribute("aria-pressed")).toBe("true");
    await advance((SCENE_DURATION + SCENE_REST) * 3);
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);

    // The interrupted scene keeps priority even when its sibling becomes more visible.
    visibility([1, 0.5]);
    if (reason === "pause") fireEvent.click(screen.getByRole("button", { name: "Resume illustrations" }));
    if (reason === "reduced") setReduced(false);
    if (reason === "hidden") setHidden(false);
    expectPlaying("Transformer art");
    await advance(SCENE_DURATION - 1);
    expectPlaying("Transformer art");
    await advance(1);
    expectPlaying("Dor art");
  });

  it.each(["pause", "reduced", "hidden"] as const)("cancels rest on %s and starts a full new rest interval when motion resumes", async (reason) => {
    mountScenes(1);
    visibility([1]);
    await advance(SCENE_DURATION);
    await advance(SCENE_REST / 2);
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(1);
    if (reason === "pause") fireEvent.click(screen.getByRole("button", { name: "Pause illustrations" }));
    if (reason === "reduced") setReduced(true);
    if (reason === "hidden") setHidden(true);
    expect(vi.getTimerCount()).toBe(0);
    await advance((SCENE_DURATION + SCENE_REST) * 3);
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
    if (reason === "pause") fireEvent.click(screen.getByRole("button", { name: "Resume illustrations" }));
    if (reason === "reduced") setReduced(false);
    if (reason === "hidden") setHidden(false);
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(1);
    await advance(SCENE_REST - 1);
    expect(playing()).toHaveLength(0);
    await advance(1);
    expectPlaying("Dor art");
  });

  it.each([false, true])("registers a fresh scene when a reused slot changes kind (prior scene completed: %s)", async (completeFirst) => {
    const scene = (kind: string) => <ProjectMotionProvider>
      <MotionControls />
      <MotionScene kind={kind}><span>{kind}</span></MotionScene>
    </ProjectMotionProvider>;
    const view = render(scene("dor-globe"));
    visibility([1]);
    const slot = screen.getByText("dor-globe").closest(".motion-scene");
    expectPlaying("dor-globe");
    if (completeFirst) {
      await advance(SCENE_DURATION);
      expect(playing()).toHaveLength(0);
      expect(vi.getTimerCount()).toBe(1);
      await advance(SCENE_REST / 2);
    }

    view.rerender(scene("transformer-attention"));
    expect(screen.getByText("transformer-attention").closest(".motion-scene")).toBe(slot);
    expect(observers).toHaveLength(2);
    expect(observers[0].disconnect).toHaveBeenCalledOnce();
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
    visibility([0, 1]);
    expectPlaying("transformer-attention");
    await advance(SCENE_DURATION - 1);
    expectPlaying("transformer-attention");
    await advance(1);
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(1);
    await advance(SCENE_REST);
    expectPlaying("transformer-attention");
  });

  it("renders still illustrations and disables replay when reduced motion is already enabled", async () => {
    reduced = true;
    mountScenes();
    visibility([1, 1]);
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
    expect((screen.getByRole("button", { name: "Reduced motion is on" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getAllByText("Still illustration")).toHaveLength(2);
    for (const button of screen.getAllByRole("button", { name: /Replay/ })) {
      expect((button as HTMLButtonElement).disabled).toBe(true);
      fireEvent.click(button);
    }
    await advance((SCENE_DURATION + SCENE_REST) * 3);
    expect(playing()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([false, true])("disconnects observers, listeners and timers on unmount (during rest: %s)", async (duringRest) => {
    const removeVisibilityListener = vi.spyOn(document, "removeEventListener");
    const view = mountScenes(1);
    visibility([1]);
    if (duringRest) await advance(SCENE_DURATION);
    expect(vi.getTimerCount()).toBe(1);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(observers).toHaveLength(1);
    observers.forEach((observer) => expect(observer.disconnect).toHaveBeenCalledOnce());
    expect(removePreferenceListener).toHaveBeenCalledWith("change", expect.any(Function));
    expect(removeVisibilityListener).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
    await advance((SCENE_DURATION + SCENE_REST) * 3);
    expect(vi.getTimerCount()).toBe(0);
  });
});
