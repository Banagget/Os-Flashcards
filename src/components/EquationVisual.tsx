import { useEffect, useMemo, useState } from "react";
import { BlockMath } from "react-katex";
import type { Flashcard } from "../data/flashcards";

type VisualMode =
  | "difference-squares"
  | "cubic-identity"
  | "quadratic"
  | "exponential"
  | "rational"
  | "binomial"
  | "line"
  | "circle"
  | "trigonometric"
  | "derivative"
  | "integral"
  | "kinematics";

interface ControlDefinition {
  key: "a" | "b" | "c" | "d";
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
}

interface CurveDefinition {
  label: string;
  colour: string;
  dashed?: boolean;
  evaluate: (x: number) => number;
}

const WIDTH = 640;
const HEIGHT = 286;
const X_MIN = -6;
const X_MAX = 6;

function visualModeFor(card: Flashcard): VisualMode {
  if (card.id === "alg-difference-squares") return "difference-squares";
  if (card.id === "alg-sum-difference-cubes") return "cubic-identity";
  if (card.id.startsWith("coord-circle")) return "circle";
  if (card.chapterSlug === "quadratics" || card.chapterSlug === "inequalities" || card.chapterSlug === "polynomials") return "quadratic";
  if (card.chapterSlug === "indices-surds-logarithms" || card.chapterSlug === "exponential-logarithmic-functions") return "exponential";
  if (card.chapterSlug === "partial-fractions") return "rational";
  if (card.chapterSlug === "binomial-expansion") return "binomial";
  if (card.chapterSlug === "coordinate-geometry" || card.chapterSlug === "linear-law") return "line";
  if (card.chapterSlug.startsWith("trigonometric") || card.id.includes("trig")) return "trigonometric";
  if (card.chapterSlug === "integration" || card.chapterSlug === "applications-integration") return "integral";
  if (card.chapterSlug === "kinematics") return "kinematics";
  return "derivative";
}

function controlsFor(mode: VisualMode): ControlDefinition[] {
  switch (mode) {
    case "difference-squares":
      return [
        { key: "a", label: "scale k", min: -2, max: 2, step: 0.25, value: 1 },
        { key: "b", label: "root b", min: 0.5, max: 4, step: 0.25, value: 2 },
      ];
    case "cubic-identity":
      return [
        { key: "a", label: "scale k", min: -1.5, max: 1.5, step: 0.25, value: 0.5 },
        { key: "b", label: "value b", min: 0.5, max: 3, step: 0.25, value: 1.5 },
        { key: "c", label: "sign ±", min: -1, max: 1, step: 2, value: 1 },
      ];
    case "quadratic":
      return [
        { key: "a", label: "x² coefficient a", min: -3, max: 3, step: 0.25, value: 1 },
        { key: "b", label: "x coefficient b", min: -5, max: 5, step: 0.25, value: 0 },
        { key: "c", label: "constant c", min: -5, max: 5, step: 0.25, value: -4 },
      ];
    case "exponential":
      return [
        { key: "a", label: "scale A", min: -3, max: 3, step: 0.25, value: 1 },
        { key: "b", label: "base b", min: 0.25, max: 3, step: 0.25, value: 2 },
        { key: "c", label: "vertical shift c", min: -4, max: 4, step: 0.25, value: 0 },
      ];
    case "rational":
      return [
        { key: "a", label: "numerator A", min: -5, max: 5, step: 0.25, value: 2 },
        { key: "b", label: "horizontal shift h", min: -4, max: 4, step: 0.25, value: 1 },
        { key: "c", label: "vertical shift k", min: -4, max: 4, step: 0.25, value: 0 },
      ];
    case "binomial":
      return [
        { key: "a", label: "x coefficient a", min: -2, max: 2, step: 0.25, value: 1 },
        { key: "b", label: "constant b", min: -3, max: 3, step: 0.25, value: 1 },
        { key: "c", label: "power n", min: 1, max: 4, step: 1, value: 2 },
      ];
    case "line":
      return [
        { key: "a", label: "gradient m", min: -5, max: 5, step: 0.25, value: 1 },
        { key: "b", label: "intercept c", min: -5, max: 5, step: 0.25, value: 0 },
      ];
    case "circle":
      return [
        { key: "a", label: "centre a", min: -4, max: 4, step: 0.25, value: 0 },
        { key: "b", label: "centre b", min: -4, max: 4, step: 0.25, value: 0 },
        { key: "c", label: "radius r", min: 0.5, max: 5, step: 0.25, value: 3 },
      ];
    case "trigonometric":
      return [
        { key: "a", label: "amplitude A", min: -4, max: 4, step: 0.25, value: 2 },
        { key: "b", label: "frequency B", min: 0.5, max: 3, step: 0.25, value: 1 },
        { key: "c", label: "phase C", min: -3.14, max: 3.14, step: 0.25, value: 0 },
        { key: "d", label: "vertical shift D", min: -3, max: 3, step: 0.25, value: 0 },
      ];
    case "integral":
      return [
        { key: "a", label: "x² coefficient a", min: -2, max: 2, step: 0.25, value: 0.5 },
        { key: "b", label: "x coefficient b", min: -3, max: 3, step: 0.25, value: 0 },
        { key: "c", label: "constant c", min: -4, max: 4, step: 0.25, value: 1 },
        { key: "d", label: "right bound", min: -1, max: 5, step: 0.25, value: 3 },
      ];
    case "kinematics":
      return [
        { key: "a", label: "initial s₀", min: -4, max: 4, step: 0.25, value: 0 },
        { key: "b", label: "initial u", min: -4, max: 4, step: 0.25, value: 2 },
        { key: "c", label: "acceleration a", min: -3, max: 3, step: 0.25, value: -0.5 },
      ];
    default:
      return [
        { key: "a", label: "x² coefficient a", min: -2, max: 2, step: 0.25, value: 0.5 },
        { key: "b", label: "x coefficient b", min: -4, max: 4, step: 0.25, value: 0 },
        { key: "c", label: "constant c", min: -4, max: 4, step: 0.25, value: 0 },
      ];
  }
}

function formulaFor(mode: VisualMode, values: Record<string, number>, card: Flashcard) {
  const { a, b, c, d } = values;
  switch (mode) {
    case "difference-squares": return `y=${a}(x^2-${b}^2)=${a}(x-${b})(x+${b})`;
    case "cubic-identity": {
      const sign = c >= 0 ? "+" : "-";
      const opposite = c >= 0 ? "-" : "+";
      return `y=${a}(x^3${sign}${b}^3)=${a}(x${sign}${b})(x^2${opposite}${b}x+${b}^2)`;
    }
    case "quadratic": return `y=${a}x^2+${b}x+${c}`;
    case "exponential": return `y=${a}(${b})^x+${c}`;
    case "rational": return `y=\\frac{${a}}{x-${b}}+${c}`;
    case "binomial": return `y=(${a}x+${b})^{${Math.round(c)}}`;
    case "line": return `y=${a}x+${b}`;
    case "circle": return `(x-${a})^2+(y-${b})^2=${c}^2`;
    case "trigonometric": return `y=${a}\\sin(${b}x+${c})+${d}`;
    case "integral": return `A=\\int_{-2}^{${d}}(${a}x^2+${b}x+${c})\\,dx`;
    case "kinematics": return `s=${a}+${b}t+\\frac12(${c})t^2`;
    default: return `f(x)=${a}x^2+${b}x+${c},\\quad f'(x)=${2 * a}x+${b}`;
  }
}

function headingFor(mode: VisualMode) {
  switch (mode) {
    case "difference-squares": return "Two forms, one curve";
    case "cubic-identity": return "Watch the cubic factorise";
    case "quadratic": return "Shape the quadratic";
    case "exponential": return "Growth, decay and shifts";
    case "rational": return "Move the asymptotes";
    case "binomial": return "Build a binomial curve";
    case "line": return "See gradient and intercept";
    case "circle": return "Move the centre and radius";
    case "trigonometric": return "Transform the wave";
    case "integral": return "See the signed area";
    case "kinematics": return "Connect displacement and velocity";
    default: return "Compare a function and its gradient";
  }
}

function makePath(evaluate: (x: number) => number, yExtent: number) {
  let path = "";
  let drawing = false;
  for (let index = 0; index <= 220; index += 1) {
    const x = X_MIN + (index / 220) * (X_MAX - X_MIN);
    const y = evaluate(x);
    const px = ((x - X_MIN) / (X_MAX - X_MIN)) * WIDTH;
    const py = HEIGHT / 2 - (y / yExtent) * (HEIGHT / 2);
    const usable = Number.isFinite(y) && Math.abs(y) <= yExtent * 1.25;
    if (!usable) {
      drawing = false;
      continue;
    }
    path += `${drawing ? "L" : "M"}${px.toFixed(2)},${py.toFixed(2)} `;
    drawing = true;
  }
  return path;
}

export function EquationVisual({ card }: { card: Flashcard }) {
  const mode = visualModeFor(card);
  const definitions = useMemo(() => controlsFor(mode), [mode]);
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(definitions.map((control) => [control.key, control.value])),
  );

  useEffect(() => {
    setValues(Object.fromEntries(definitions.map((control) => [control.key, control.value])));
  }, [card.id, definitions]);

  const a = values.a ?? 0;
  const b = values.b ?? 0;
  const c = values.c ?? 0;
  const d = values.d ?? 0;
  const curves = useMemo<CurveDefinition[]>(() => {
    switch (mode) {
      case "difference-squares": {
        const expanded = (x: number) => a * (x * x - b * b);
        return [
          { label: "expanded", colour: "#7ea3ff", evaluate: expanded },
          { label: "factorised", colour: "#f5b94c", dashed: true, evaluate: (x) => a * (x - b) * (x + b) },
        ];
      }
      case "cubic-identity": {
        const sign = c >= 0 ? 1 : -1;
        return [
          { label: "expanded", colour: "#7ea3ff", evaluate: (x) => a * (x ** 3 + sign * b ** 3) },
          { label: "factorised", colour: "#f5b94c", dashed: true, evaluate: (x) => a * (x + sign * b) * (x * x - sign * b * x + b * b) },
        ];
      }
      case "quadratic": return [{ label: "quadratic", colour: "#7ea3ff", evaluate: (x) => a * x * x + b * x + c }];
      case "exponential": return [{ label: "exponential", colour: "#7ea3ff", evaluate: (x) => a * b ** x + c }];
      case "rational": return [{ label: "rational", colour: "#7ea3ff", evaluate: (x) => a / (x - b) + c }];
      case "binomial": return [{ label: "binomial", colour: "#7ea3ff", evaluate: (x) => (a * x + b) ** Math.round(c) }];
      case "line": return [{ label: "line", colour: "#7ea3ff", evaluate: (x) => a * x + b }];
      case "trigonometric": return [{ label: "wave", colour: "#7ea3ff", evaluate: (x) => a * Math.sin(b * x + c) + d }];
      case "integral": return [{ label: "function", colour: "#7ea3ff", evaluate: (x) => a * x * x + b * x + c }];
      case "kinematics": return [
        { label: "displacement s", colour: "#7ea3ff", evaluate: (x) => a + b * x + 0.5 * c * x * x },
        { label: "velocity v", colour: "#f5b94c", dashed: true, evaluate: (x) => b + c * x },
      ];
      case "circle": return [];
      default: return [
        { label: "function f", colour: "#7ea3ff", evaluate: (x) => a * x * x + b * x + c },
        { label: "gradient f′", colour: "#f5b94c", dashed: true, evaluate: (x) => 2 * a * x + b },
      ];
    }
  }, [a, b, c, d, card.id, mode]);

  const yExtent = useMemo(() => {
    if (mode === "circle") return 6;
    const samples = curves.flatMap((curve) =>
      Array.from({ length: 81 }, (_, index) => curve.evaluate(X_MIN + (index / 80) * (X_MAX - X_MIN)))
        .filter((value) => Number.isFinite(value) && Math.abs(value) < 60),
    );
    return Math.max(5, Math.min(30, Math.ceil(Math.max(0, ...samples.map(Math.abs)) * 1.08)));
  }, [curves, mode]);

  const integralFill = useMemo(() => {
    if (mode !== "integral") return "";
    const left = -2;
    const right = Math.max(left, d);
    const points = Array.from({ length: 61 }, (_, index) => {
      const x = left + (index / 60) * (right - left);
      const y = a * x * x + b * x + c;
      return `${((x - X_MIN) / (X_MAX - X_MIN)) * WIDTH},${HEIGHT / 2 - (y / yExtent) * (HEIGHT / 2)}`;
    });
    const startX = ((left - X_MIN) / (X_MAX - X_MIN)) * WIDTH;
    const endX = ((right - X_MIN) / (X_MAX - X_MIN)) * WIDTH;
    return `${startX},${HEIGHT / 2} ${points.join(" ")} ${endX},${HEIGHT / 2}`;
  }, [a, b, c, d, mode, yExtent]);

  const equation = formulaFor(mode, values, card);
  const circleX = ((a - X_MIN) / (X_MAX - X_MIN)) * WIDTH;
  const circleY = HEIGHT / 2 - (b / yExtent) * (HEIGHT / 2);
  const radiusX = (c / (X_MAX - X_MIN)) * WIDTH;
  const radiusY = (c / (yExtent * 2)) * HEIGHT;

  return (
    <span className="equation-lab" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
      <span className="equation-lab__intro">
        <span>
          <small>Interactive model</small>
          <strong>{headingFor(mode)}</strong>
        </span>
        <span className="equation-lab__formula"><BlockMath math={equation} /></span>
      </span>

      <span className="equation-lab__workspace">
        <span className="equation-graph">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`Interactive graph for ${card.title}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id={`area-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7ea3ff" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#7ea3ff" stopOpacity="0.08" />
              </linearGradient>
            </defs>
            {[-4, -2, 0, 2, 4].map((x) => (
              <line className={x === 0 ? "graph-axis" : "graph-grid"} x1={((x - X_MIN) / (X_MAX - X_MIN)) * WIDTH} x2={((x - X_MIN) / (X_MAX - X_MIN)) * WIDTH} y1="0" y2={HEIGHT} key={`x-${x}`} />
            ))}
            {[-1, -0.5, 0, 0.5, 1].map((fraction) => (
              <line className={fraction === 0 ? "graph-axis" : "graph-grid"} x1="0" x2={WIDTH} y1={HEIGHT / 2 - fraction * (HEIGHT / 2)} y2={HEIGHT / 2 - fraction * (HEIGHT / 2)} key={`y-${fraction}`} />
            ))}
            {integralFill && <polygon points={integralFill} fill={`url(#area-${card.id})`} />}
            {mode === "circle" && (
              <>
                <ellipse className="graph-curve" cx={circleX} cy={circleY} rx={radiusX} ry={radiusY} />
                <circle className="graph-point" cx={circleX} cy={circleY} r="5" />
              </>
            )}
            {curves.map((curve) => (
              <path
                className="graph-curve"
                d={makePath(curve.evaluate, yExtent)}
                style={{ stroke: curve.colour }}
                strokeDasharray={curve.dashed ? "10 8" : undefined}
                key={curve.label}
              />
            ))}
            {mode === "difference-squares" && [-b, b].map((root) => (
              <circle className="graph-point" cx={((root - X_MIN) / (X_MAX - X_MIN)) * WIDTH} cy={HEIGHT / 2} r="5" key={root} />
            ))}
          </svg>
          <span className="equation-graph__legend">
            {curves.map((curve) => <span key={curve.label}><i style={{ background: curve.colour }} />{curve.label}</span>)}
          </span>
        </span>

        <span className="equation-controls" aria-label="Equation controls">
          {definitions.map((control) => (
            <label className="equation-control" key={control.key}>
                  <span>
                    <span>{control.label}</span>
                    <strong>{mode === "cubic-identity" && control.key === "c" ? (values.c >= 0 ? "+" : "−") : values[control.key]}</strong>
                  </span>
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={values[control.key]}
                aria-label={control.label}
                onChange={(event) => setValues((current) => ({ ...current, [control.key]: Number(event.target.value) }))}
              />
            </label>
          ))}
          <button
            type="button"
            className="equation-reset"
            onClick={(event) => {
              event.stopPropagation();
              setValues(Object.fromEntries(definitions.map((control) => [control.key, control.value])));
            }}
          >
            Reset values
          </button>
        </span>
      </span>
    </span>
  );
}
