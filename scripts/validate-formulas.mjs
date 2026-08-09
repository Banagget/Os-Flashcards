import { readFileSync } from "node:fs";
import katex from "katex";

const sources = [
  readFileSync(new URL("../src/data/flashcards.ts", import.meta.url), "utf8"),
  readFileSync(new URL("../src/data/amathMemorisation.ts", import.meta.url), "utf8"),
  readFileSync(new URL("../src/data/nonAmathFlashcards.ts", import.meta.url), "utf8"),
];
const expressions = sources.flatMap((source) =>
  [...source.matchAll(/t`([^`]*)`/g)].map((match) => match[1]),
);
const failures = [];

for (const expression of expressions) {
  try {
    katex.renderToString(expression, { throwOnError: true, displayMode: true });
  } catch (error) {
    failures.push({ expression, message: error instanceof Error ? error.message : String(error) });
  }
}

if (failures.length > 0) {
  console.error(`Invalid KaTeX expressions: ${failures.length}`);
  for (const failure of failures) console.error(`- ${failure.expression}\n  ${failure.message}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${expressions.length} KaTeX expressions.`);
}
