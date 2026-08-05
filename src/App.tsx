import { useEffect, useMemo, useState } from "react";
import { chapters, flashcards, type Flashcard, type Subject } from "./data/flashcards";
import { ProgressBar } from "./components/ProgressBar";
import { StudyScreen } from "./components/StudyScreen";

type Theme = "light" | "dark";

interface SavedProgress {
  memorisedIds: string[];
  lastSelectedSubject: Subject;
  lastSelectedChapter: string | null;
  shuffleEnabled: boolean;
  positions: Record<string, number>;
  latestStudyDate: string | null;
  theme: Theme;
}

interface StudyMode {
  key: string;
  title: string;
  cards: Flashcard[];
}

const STORAGE_KEY = "amath-flashcards-progress-v1";

const defaultProgress: SavedProgress = {
  memorisedIds: [],
  lastSelectedSubject: "amath",
  lastSelectedChapter: null,
  shuffleEnabled: false,
  positions: {},
  latestStudyDate: null,
  theme: "light",
};

function loadProgress(): SavedProgress {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return {
        ...defaultProgress,
        theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
      };
    }
    const parsed = JSON.parse(saved) as Partial<SavedProgress>;
    return { ...defaultProgress, ...parsed, positions: parsed.positions ?? {} };
  } catch {
    return defaultProgress;
  }
}

export default function App() {
  const [progress, setProgress] = useState<SavedProgress>(loadProgress);
  const [studyMode, setStudyMode] = useState<StudyMode | null>(null);
  const [showReset, setShowReset] = useState(false);

  const memorised = useMemo(() => new Set(progress.memorisedIds), [progress.memorisedIds]);
  const selectedSubject = progress.lastSelectedSubject;
  const subjectNames: Record<Subject, string> = {
    amath: "A Math",
    emath: "E Math",
    chem: "Chem",
  };
  const subjectName = subjectNames[selectedSubject];
  const unitName = selectedSubject === "chem" ? "topic" : "chapter";
  const subjectChapters = chapters.filter((chapter) => chapter.subject === selectedSubject);
  const subjectCards = flashcards.filter((item) => item.subject === selectedSubject);
  const subjectMemorised = subjectCards.filter((item) => memorised.has(item.id)).length;
  const overallPercentage = Math.round((subjectMemorised / subjectCards.length) * 100);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    document.documentElement.dataset.theme = progress.theme;
    document.documentElement.style.colorScheme = progress.theme;
  }, [progress]);

  const startStudy = (key: string, title: string, cards: Flashcard[], chapterSlug: string | null = null) => {
    setProgress((current) => ({
      ...current,
      lastSelectedChapter: chapterSlug,
      latestStudyDate: new Date().toISOString(),
    }));
    setStudyMode({ key, title, cards: [...cards] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startAllCards = () => {
    startStudy(`master-${selectedSubject}-all`, "Master All Cards", subjectCards);
  };

  const updateMark = (cardId: string, shouldMemorise: boolean) => {
    setProgress((current) => {
      const next = new Set(current.memorisedIds);
      if (shouldMemorise) next.add(cardId);
      else next.delete(cardId);
      return {
        ...current,
        memorisedIds: [...next],
        latestStudyDate: new Date().toISOString(),
      };
    });
  };

  const updatePosition = (modeKey: string, position: number) => {
    setProgress((current) => ({
      ...current,
      positions: { ...current.positions, [modeKey]: position },
    }));
  };

  const resetProgress = () => {
    setProgress((current) => ({
      ...defaultProgress,
      theme: current.theme,
      lastSelectedSubject: current.lastSelectedSubject,
    }));
    setShowReset(false);
  };

  if (studyMode) {
    return (
      <div className="app app--study">
        <StudyScreen
          title={studyMode.title}
          modeKey={studyMode.key}
          cards={studyMode.cards}
          memorised={memorised}
          initialPosition={progress.positions[studyMode.key] ?? 0}
          shuffleEnabled={progress.shuffleEnabled}
          onShuffleChange={(shuffleEnabled) => setProgress((current) => ({ ...current, shuffleEnabled }))}
          onPositionChange={updatePosition}
          onMark={updateMark}
          onExit={() => setStudyMode(null)}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <a href="#main" className="brand" aria-label="O-Level Flashcards home">
          <span className="brand-mark">R³</span>
          <span>O-Level <span className="brand-accent">Flashcards</span></span>
        </a>
        <button
          className="theme-toggle"
          onClick={() =>
            setProgress((current) => ({ ...current, theme: current.theme === "light" ? "dark" : "light" }))
          }
          aria-label={`Switch to ${progress.theme === "light" ? "dark" : "light"} mode`}
        >
          <span aria-hidden="true">{progress.theme === "light" ? "☾" : "☀"}</span>
          {progress.theme === "light" ? "Dark" : "Light"}
        </button>
      </header>

      <main id="main" className="dashboard">
        <nav className="subject-switcher" aria-label="Choose a subject">
          <button
            className={selectedSubject === "amath" ? "is-active" : ""}
            onClick={() => setProgress((current) => ({ ...current, lastSelectedSubject: "amath" }))}
            aria-pressed={selectedSubject === "amath"}
          >
            <strong>A Math</strong>
            <span>Additional Mathematics</span>
          </button>
          <button
            className={selectedSubject === "emath" ? "is-active" : ""}
            onClick={() => setProgress((current) => ({ ...current, lastSelectedSubject: "emath" }))}
            aria-pressed={selectedSubject === "emath"}
          >
            <strong>E Math</strong>
            <span>Elementary Mathematics</span>
          </button>
          <button
            className={selectedSubject === "chem" ? "is-active" : ""}
            onClick={() => setProgress((current) => ({ ...current, lastSelectedSubject: "chem" }))}
            aria-pressed={selectedSubject === "chem"}
          >
            <strong>Chem</strong>
            <span>Chemistry</span>
          </button>
        </nav>

        <section className="quick-actions" aria-label="Study options">
          <button className="master-card" onClick={startAllCards}>
            <span className="master-copy">
              <span className="eyebrow">Complete collection</span>
              <strong>Master All {subjectName} Cards</strong>
              <small>Study all {subjectCards.length} cards across {subjectChapters.length} {subjectChapters.length === 1 ? unitName : `${unitName}s`}</small>
            </span>
            <span className="master-progress">
              <span className="master-progress__heading">
                <span>Overall progress</span>
                <strong>{overallPercentage}%</strong>
              </span>
              <span className="master-progress__track" aria-hidden="true">
                <span style={{ width: `${overallPercentage}%` }} />
              </span>
              <small>{subjectMemorised} of {subjectCards.length} cards memorised</small>
            </span>
            <span className="master-arrow" aria-hidden="true">→</span>
          </button>
        </section>

        <section className="chapter-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Study by topic</span>
              <h2>Choose a {unitName}</h2>
            </div>
            <span>{subjectChapters.length} {subjectChapters.length === 1 ? unitName : `${unitName}s`} · {subjectCards.length} cards</span>
          </div>

          <div className="chapter-grid">
            {subjectChapters.map((chapter, chapterIndex) => {
              const chapterCards = subjectCards.filter((item) => item.chapterSlug === chapter.slug);
              const chapterMemorised = chapterCards.filter((item) => memorised.has(item.id)).length;
              const complete = chapterMemorised === chapterCards.length;
              return (
                <article className={`chapter-card ${complete ? "is-complete" : ""}`} key={chapter.slug}>
                  <div className="chapter-card__top">
                    <span className="chapter-number">{String(chapterIndex + 1).padStart(2, "0")}</span>
                    {complete && <span className="completion-badge">Complete ✓</span>}
                  </div>
                  <h3>{chapter.name}</h3>
                  <div className="chapter-stats">
                    <span>{chapterMemorised} / {chapterCards.length} memorised</span>
                    <span>{Math.round((chapterMemorised / chapterCards.length) * 100)}%</span>
                  </div>
                  <ProgressBar
                    value={chapterMemorised}
                    max={chapterCards.length}
                    label={`${chapter.name} progress`}
                    compact
                  />
                  <button
                    className="chapter-button"
                    onClick={() =>
                      startStudy(`chapter-${chapter.slug}`, chapter.name, chapterCards, chapter.slug)
                    }
                  >
                    {complete ? `Review ${unitName}` : `Study ${unitName}`} <span aria-hidden="true">→</span>
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="progress-tools">
          <div>
            <span className="eyebrow">Your data</span>
            <h2>Progress stays on this device</h2>
            <p>Your card status, place, shuffle choice and theme are saved automatically in this browser.</p>
          </div>
          <button className="button button--danger" onClick={() => setShowReset(true)}>Reset all progress</button>
        </section>
      </main>

      <footer>
        <span>Built with React • TypeScript • CSS.</span>
        <span>© 2026 ZHIYUAN • All rights reserved</span>
      </footer>

      {showReset && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowReset(false)}>
          <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" onMouseDown={(event) => event.stopPropagation()}>
            <span className="modal-icon" aria-hidden="true">!</span>
            <h2 id="reset-title">Reset all progress?</h2>
            <p>This clears every memorised mark and saved study position on this device. It cannot be undone.</p>
            <div className="modal-actions">
              <button className="button button--secondary" onClick={() => setShowReset(false)}>Keep progress</button>
              <button className="button button--danger-solid" onClick={resetProgress}>Yes, reset everything</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
