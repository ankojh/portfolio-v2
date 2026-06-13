import { useEffect, useRef } from "react";

const DOT_SPACING = 26;
const DOT_RADIUS = 1.5;
// Matches the theme's cool gray hue (hsl 240 4% 55%).
const DOT_RGB = "134, 134, 143";

type Dot = {
  x: number;
  y: number;
  phase: number;
  speed: number;
  maxAlpha: number;
  baseRadius: number;
};

/**
 * Full-viewport canvas that draws a grid of light gray dots, each fading in
 * and out on its own random phase and speed. Canvas keeps this cheap; the
 * equivalent DOM grid would be thousands of animated nodes.
 */
export function DottedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let dots: Dot[] = [];
    let frameId = 0;

    function rebuildDots() {
      if (!canvas || !context) {
        return;
      }

      const width = window.innerWidth;
      const height = window.innerHeight;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      dots = [];
      for (let x = DOT_SPACING / 2; x < width; x += DOT_SPACING) {
        for (let y = DOT_SPACING / 2; y < height; y += DOT_SPACING) {
          dots.push({
            x,
            y,
            phase: Math.random() * Math.PI * 2,
            speed: 1.2 + Math.random() * 2.3,
            maxAlpha: 0.12 + Math.random() * 0.23,
            baseRadius: DOT_RADIUS * (0.8 + Math.random() * 0.5),
          });
        }
      }
    }

    function draw(timeMs: number) {
      if (!canvas || !context) {
        return;
      }

      const time = timeMs / 1000;
      context.clearRect(0, 0, canvas.width, canvas.height);

      for (const dot of dots) {
        const wave = reducedMotion
          ? 0.5
          : 0.5 + 0.5 * Math.sin(dot.phase + time * dot.speed);
        context.fillStyle = `rgba(${DOT_RGB}, ${dot.maxAlpha * wave})`;
        context.beginPath();
        // Dots swell slightly as they brighten and shrink as they fade.
        context.arc(dot.x, dot.y, dot.baseRadius * (0.7 + 0.5 * wave), 0, Math.PI * 2);
        context.fill();
      }

      if (!reducedMotion) {
        frameId = requestAnimationFrame(draw);
      }
    }

    rebuildDots();
    frameId = requestAnimationFrame(draw);
    window.addEventListener("resize", rebuildDots);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", rebuildDots);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0"
      aria-hidden="true"
    />
  );
}
