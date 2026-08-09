import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../src/data/amathMemorisation.ts", import.meta.url), "utf8");
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const module = { exports: {} };
new Function("exports", "module", output)(module.exports, module);

const { amathPages, amathMemorisation } = module.exports;
const failures = [];
const ids = new Set();
const pageFronts = new Set();
const pageCounts = new Map();

if (amathPages.length !== 31) failures.push(`Expected 31 pages; found ${amathPages.length}.`);

for (const card of amathMemorisation) {
  const fullId = `amath-p${String(card.page).padStart(2, "0")}-${card.id}`;
  const pageFront = `${card.page}:${card.question}`;
  const wordCount = card.question.trim().split(/\s+/).length;
  if (!Number.isInteger(card.page) || card.page < 1 || card.page > amathPages.length) {
    failures.push(`${fullId}: invalid page.`);
  }
  if (ids.has(fullId)) failures.push(`${fullId}: duplicate ID.`);
  if (pageFronts.has(pageFront)) failures.push(`${fullId}: duplicate front on page: ${card.question}`);
  if (!card.question.trim()) failures.push(`${fullId}: empty front.`);
  if (card.question.includes("?")) failures.push(`${fullId}: front is a question: ${card.question}`);
  if (wordCount > 4) failures.push(`${fullId}: front exceeds four words: ${card.question}`);
  if (!(card.formula?.trim() || card.answer?.trim())) failures.push(`${fullId}: empty back.`);
  if (/example|derive|step-by-step|worked solution/i.test(`${card.question} ${card.answer ?? ""}`)) {
    failures.push(`${fullId}: prohibited non-memorisation wording.`);
  }

  ids.add(fullId);
  pageFronts.add(pageFront);
  pageCounts.set(card.page, (pageCounts.get(card.page) ?? 0) + 1);
}

for (let page = 1; page <= amathPages.length; page += 1) {
  if (!pageCounts.has(page)) failures.push(`Page ${page}: no cards.`);
}

if (failures.length) {
  console.error(`A-Math validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${amathMemorisation.length} A-Math cards across ${amathPages.length} pages.`);
}
