import { amathMemorisation, amathPages } from "./amathMemorisation";
import { nonAmathFlashcards } from "./nonAmathFlashcards";
import { physicsKeywordChapters, physicsKeywordFlashcards } from "./physicsKeywordFlashcards";

export type Subject = "amath" | "emath" | "chem" | "phys" | "physicsKeywords";

export interface Flashcard {
  id: string;
  subject: Subject;
  chapter: string;
  chapterSlug: string;
  title: string;
  question: string;
  questionMath?: string;
  questionImage?: string;
  questionImageAlt?: string;
  answerImage?: string;
  answerImageAlt?: string;
  showImageChrome?: boolean;
  questionTone?: "red" | "green";
  formula: string;
  explanation: string;
  examples?: Flashcard[];
  tags?: string[];
  memoryOnly?: boolean;
  conditions?: string;
  commonMistake?: string;
  example?: string;
}

export interface Chapter {
  name: string;
  slug: string;
  subject: Subject;
}

export const chapters: Chapter[] = [
  ...amathPages.map((page) => ({ ...page, subject: "amath" as const })),
  { name: "Angle Properties of Circles", slug: "angle-properties-circles", subject: "emath" },
  { name: "Qualitative Analysis", slug: "qa", subject: "chem" },
  { name: "Crude oil", slug: "crude-oil", subject: "chem" },
  { name: "Polymer", slug: "polymer", subject: "chem" },
  { name: "EM spectrum applications", slug: "em-spectrum-applications", subject: "phys" },
  ...physicsKeywordChapters,
];

const amathFlashcards = amathMemorisation.map((spec): Flashcard => {
  const page = amathPages[spec.page - 1];
  const pageTag = `Page ${String(spec.page).padStart(2, "0")}`;

  return {
    id: `amath-p${String(spec.page).padStart(2, "0")}-${spec.id}`,
    subject: "amath",
    chapter: page.name,
    chapterSlug: page.slug,
    title: spec.title,
    question: spec.question,
    formula: spec.formula ?? "",
    explanation: spec.answer ?? "",
    conditions: spec.conditions,
    tags: ["A-Math", pageTag, page.name],
    memoryOnly: true,
  };
});

export const flashcards: Flashcard[] = [...amathFlashcards, ...nonAmathFlashcards, ...physicsKeywordFlashcards];
