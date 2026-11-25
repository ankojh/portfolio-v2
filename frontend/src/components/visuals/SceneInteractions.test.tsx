// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { MotionScene, ProjectMotionProvider } from "./ProjectMotion";
import { useSceneChoice } from "./sceneControl";
import { HeadsDownDemo } from "./HeadsDownDemo";
import { DorGlobe, TransformerAttention } from "./NewProjectVisuals";
import { WorkIllustration } from "./WorkIllustrations";
import { TffApproval, TffReview } from "./ProductVisuals";

type Observer = { callback: IntersectionObserverCallback; target?: Element; disconnect: Mock<() => void> };
let observers: Observer[];
let reduced: boolean;
let preferenceListeners: Set<() => void>;

/** Exposes `useSceneChoice`'s value/touched state so a choice suspending autoplay is observable. */
function ChoiceProbe({ label, initial }: { label: string; initial: string }) {
  const { value, touched, choose } = useSceneChoice(initial);
  return <div>
    <span>{label}</span>
    <span data-testid={`${label}-value`}>{value}</span>
    <span data-testid={`${label}-touched`}>{String(touched)}</span>
    <button onClick={() => choose(`${initial}-chosen`)}>{`choose in ${label}`}</button>
  </div>;
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

function expectPlaying(label: string) {
  expect(playing()).toHaveLength(1);
  expect(playing()[0].textContent).toContain(label);
}

beforeEach(() => {
  vi.useFakeTimers();
  observers = [];
  reduced = false;
  preferenceListeners = new Set();
  vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  vi.stubGlobal("matchMedia", vi.fn(() => ({
    get matches() { return reduced; },
    addEventListener: (_event: string, callback: () => void) => preferenceListeners.add(callback),
    removeEventListener: (_event: string, callback: () => void) => preferenceListeners.delete(callback),
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

describe("useSceneChoice", () => {
  it("marks a choice as touched and suspends autoplay for that scene, permanently", () => {
    render(<ProjectMotionProvider>
      <MotionScene kind="probe"><ChoiceProbe label="probe" initial="start" /></MotionScene>
    </ProjectMotionProvider>);
    visibility([1]);
    expectPlaying("probe");
    expect(screen.getByTestId("probe-value").textContent).toBe("start");
    expect(screen.getByTestId("probe-touched").textContent).toBe("false");

    fireEvent.click(screen.getByText("choose in probe"));
    expect(screen.getByTestId("probe-value").textContent).toBe("start-chosen");
    expect(screen.getByTestId("probe-touched").textContent).toBe("true");
    expect(playing()).toHaveLength(0);

    // There is no reset: the choice and the suspension both stay, however visibility churns.
    visibility([0]);
    visibility([1]);
    expect(playing()).toHaveLength(0);
    expect(screen.getByTestId("probe-value").textContent).toBe("start-chosen");
  });
});

describe("HeadsDownDemo", () => {
  it("defaults to Balanced, untouched, and switches level, aria-pressed and the live note on choice", () => {
    render(<HeadsDownDemo />);
    const root = document.querySelector(".heads-demo")!;
    expect(root.getAttribute("data-level")).toBe("balanced");
    expect(screen.getByRole("button", { name: "Off" }).getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByRole("button", { name: "Balanced" }).getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "Strict" }));
    expect(root.getAttribute("data-level")).toBe("strict");
    expect(screen.getByRole("button", { name: "Strict" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Balanced" }).getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByText(/The borderline link is blurred too/)).toBeTruthy();
  });

  // The control row takes its height out of the browser pane below it, so a note that
  // wraps further than the narration it replaces clips the illustration on a card.
  it("keeps every level's note about as short as the narration it replaces", () => {
    render(<HeadsDownDemo />);
    const note = document.querySelector(".heads-explainer")!;
    const narration = note.textContent!.length;
    for (const level of ["Off", "Balanced", "Strict"]) {
      fireEvent.click(screen.getByRole("button", { name: level }));
      expect(note.textContent!.length).toBeLessThanOrEqual(narration + 8);
    }
  });

  it("keeps the artwork aria-hidden while its controls stay reachable", () => {
    render(<HeadsDownDemo />);
    const root = document.querySelector(".heads-demo")!;
    expect(root.getAttribute("role")).toBeNull();
    expect(root.querySelector("p.sr-only")).toBeTruthy();

    const artwork = root.querySelector(".heads-browser")!;
    expect(artwork.getAttribute("aria-hidden")).toBe("true");

    const controls = root.querySelector(".heads-controls")!;
    expect(controls.closest('[aria-hidden="true"]')).toBeNull();
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("suspends autoplay for the scene it lives in once an option is chosen, permanently", () => {
    render(<ProjectMotionProvider>
      <MotionScene kind="heads-down"><HeadsDownDemo /></MotionScene>
    </ProjectMotionProvider>);
    visibility([1]);
    expect(document.querySelector(".motion-scene--heads-down")!.getAttribute("data-playing")).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "Strict" }));
    expect(document.querySelector(".motion-scene--heads-down")!.getAttribute("data-playing")).toBe("false");

    visibility([0]);
    visibility([1]);
    expect(document.querySelector(".motion-scene--heads-down")!.getAttribute("data-playing")).toBe("false");
  });
});

describe("LicenseRecord (WorkIllustration kind=\"license-states\")", () => {
  it("defaults to active, untouched, and flips status, label and the live note on toggle", () => {
    render(<WorkIllustration kind="license-states" />);
    const record = document.querySelector(".license-record")!;
    expect(record.getAttribute("data-status")).toBe("active");
    expect(screen.getByText(/Correct the record without an engineering ticket/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Set to expired/ }));
    expect(record.getAttribute("data-status")).toBe("expired");
    expect(screen.getByText(/The status is wrong now/)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Restore status/ })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Restore status/ }));
    expect(record.getAttribute("data-status")).toBe("active");
    expect(screen.getByText(/Restored, with the correction kept/)).toBeTruthy();
  });

  it("exposes a description instead of role=\"img\" and keeps its action button out of any aria-hidden subtree", () => {
    render(<WorkIllustration kind="license-states" />);
    const root = document.querySelector(".work-illustration--license-states")!;
    expect(root.getAttribute("role")).toBeNull();
    expect(root.getAttribute("aria-label")).toBeNull();
    expect(root.querySelector("p.sr-only")?.textContent).toMatch(/restore to active/);

    const button = screen.getByRole("button", { name: /Set to expired/ });
    expect(button.closest('[aria-hidden="true"]')).toBeNull();
  });

  it("still gives a still WorkIllustration a role=\"img\" label with its whole scene aria-hidden", () => {
    render(<WorkIllustration kind="offer-flow" />);
    const root = document.querySelector(".work-illustration--offer-flow")!;
    expect(root.getAttribute("role")).toBe("img");
    expect(root.getAttribute("aria-label")).toMatch(/Conceptual illustration/);
    expect(root.querySelector(".work-stage")!.getAttribute("aria-hidden")).toBe("true");
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});

describe("DorGlobe", () => {
  it("starts with no story selected and reaches each story via its choice button, pressed state and data-story", () => {
    render(<DorGlobe />);
    const svg = document.querySelector(".dor-globe")!;
    expect(svg.hasAttribute("data-story")).toBe(false);
    expect(screen.getByText("The source is always one step away.")).toBeTruthy();

    const second = screen.getByRole("button", { name: /Coverage finds its place/ });
    expect(second.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(second);
    expect(second.getAttribute("aria-pressed")).toBe("true");
    expect(svg.getAttribute("data-story")).toBe("1");
    expect(screen.getByText("One event, grouped. Placement is approximate.")).toBeTruthy();
  });

  it("keeps a wire row's visible text identical before and after it is selected, so choosing a story cannot change the scene's height", () => {
    render(<DorGlobe />);
    const rowNames = [/A report arrives/, /Coverage finds its place/, /A possible connection/];
    const rowText = () => rowNames.map((name) => screen.getByRole("button", { name }).textContent);
    const before = rowText();

    fireEvent.click(screen.getByRole("button", { name: /Coverage finds its place/ }));
    expect(rowText()).toEqual(before);

    fireEvent.click(screen.getByRole("button", { name: /A possible connection/ }));
    expect(rowText()).toEqual(before);
  });

  it("hides the globe artwork from assistive tech while the story controls stay reachable", () => {
    render(<DorGlobe />);
    const root = document.querySelector(".dor-scene")!;
    expect(root.getAttribute("role")).toBeNull();
    expect(root.querySelector("p.sr-only")).toBeTruthy();
    expect(document.querySelector(".dor-globe")!.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getAllByRole("button", { name: /A report arrives|Coverage finds its place|A possible connection/ })).toHaveLength(3);
    for (const button of screen.getAllByRole("button")) {
      expect(button.closest('[aria-hidden="true"]')).toBeNull();
    }
  });
});

describe("TransformerAttention", () => {
  it("starts with no token selected and switches token, pressed state and data-token on choice", () => {
    render(<TransformerAttention />);
    const board = document.querySelector(".transformer-board")!;
    expect(board.hasAttribute("data-token")).toBe(false);
    expect(screen.getByText("Change a part.")).toBeTruthy();

    const catButton = screen.getByRole("button", { name: "cat" });
    fireEvent.click(catButton);
    expect(catButton.getAttribute("aria-pressed")).toBe("true");
    expect(board.getAttribute("data-token")).toBe("1");
    expect(screen.getByText("From “cat”")).toBeTruthy();
  });

  it("exposes a description instead of role=\"img\" and keeps the token buttons reachable", () => {
    render(<TransformerAttention />);
    const root = document.querySelector(".transformer-scene")!;
    expect(root.getAttribute("role")).toBeNull();
    expect(root.querySelector("p.sr-only")).toBeTruthy();
    for (const button of screen.getAllByRole("button")) {
      expect(button.closest('[aria-hidden="true"]')).toBeNull();
    }
  });
});

describe("TffApproval", () => {
  it("starts pending and records approve/deny decisions with aria-pressed and the live note switching", () => {
    render(<TffApproval />);
    const approve = screen.getByRole("button", { name: "Approve" });
    const deny = screen.getByRole("button", { name: "Deny" });
    expect(approve.getAttribute("aria-pressed")).toBe("false");
    expect(deny.getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByText("Sandboxed · no network · 30 s limit")).toBeTruthy();

    fireEvent.click(approve);
    expect(approve.getAttribute("aria-pressed")).toBe("true");
    expect(deny.getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByText("Allowed, this command only.")).toBeTruthy();

    fireEvent.click(deny);
    expect(approve.getAttribute("aria-pressed")).toBe("false");
    expect(deny.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Nothing ran. It must retry.")).toBeTruthy();
  });

  it("keeps the note about the same length across pending/approved/denied so a decision cannot grow the card", () => {
    render(<TffApproval />);
    const noteLength = () => document.querySelector(".ui-card p")!.textContent!.length;
    const pendingLength = noteLength();

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(Math.abs(noteLength() - pendingLength)).toBeLessThanOrEqual(10);

    fireEvent.click(screen.getByRole("button", { name: "Deny" }));
    expect(Math.abs(noteLength() - pendingLength)).toBeLessThanOrEqual(10);
  });

  it("exposes a description instead of role=\"img\" and keeps the approve/deny group out of the aria-hidden run plan", () => {
    render(<TffApproval />);
    const root = screen.getByText(/run plan waiting on verification/).parentElement!;
    expect(root.getAttribute("role")).toBeNull();
    const group = screen.getByRole("group", { name: "Approve or deny this sandboxed command" });
    expect(group.closest('[aria-hidden="true"]')).toBeNull();
  });

  it("still gives the still TffReview scene a role=\"img\" label with no interactive controls", () => {
    render(<TffReview />);
    expect(screen.getByRole("img", { name: /reviewing an agent worker's code changes/ })).toBeTruthy();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
