import { useEffect, useMemo, useState } from "react";
import { chapters, flashcards, type Flashcard } from "./data/flashcards";
import { ProgressBar } from "./components/ProgressBar";
import { StudyScreen } from "./components/StudyScreen";

type Theme = "light" | "dark";
type ReviewFilter = "all" | "learning" | "memorised";

interface SavedProgress {
  memorisedIds: string[];
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
  const overallPercentage = Math.round((memorised.size / flashcards.length) * 100);

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

  const startFiltered = (filter: ReviewFilter) => {
    const labels: Record<ReviewFilter, string> = {
      all: "Master All Formulas",
      learning: "Continue Learning",
      memorised: "Review Memorised Formulas",
    };
    const cards =
      filter === "all"
        ? flashcards
        : flashcards.filter((item) => (filter === "memorised" ? memorised.has(item.id) : !memorised.has(item.id)));
    startStudy(`master-${filter}`, labels[filter], cards);
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
        <a href="#main" className="brand" aria-label="O-Level A Math Flashcards home">
          <span className="brand-mark">A²</span>
          <span>A Math Recall</span>
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
        <section className="hero">
          <div className="hero__copy">
            <span className="eyebrow">Singapore GCE O-Level · Syllabus 4049</span>
            <h1>O-Level A Math<br /><em>Flashcards</em></h1>
            <p>Memorise the formulas you need for the GCE O-Level examination.</p>
          </div>
          <div className="overall-card">
            <div className="overall-card__top">
              <span className="overall-label">Overall progress</span>
              <span className="percentage-ring" style={{ "--progress": `${overallPercentage * 3.6}deg` } as React.CSSProperties}>
                <strong>{overallPercentage}%</strong>
              </span>
            </div>
            <div className="overall-number">
              <strong>{memorised.size}</strong>
              <span>of {flashcards.length} formulas memorised</span>
            </div>
            <ProgressBar value={memorised.size} max={flashcards.length} label="Overall memorisation progress" />
            <p>{overallPercentage === 100 ? "Outstanding — every formula is ready for review." : "A little progress every session adds up."}</p>
          </div>
        </section>

        <section className="quick-actions" aria-label="Study options">
          <button className="master-card" onClick={() => startFiltered("all")}>
            <span className="master-icon" aria-hidden="true">∞</span>
            <span className="master-copy">
              <span className="eyebrow">Complete collection</span>
              <strong>Master All Formulas</strong>
              <small>Study all {flashcards.length} cards across {chapters.length} chapters</small>
            </span>
            <span className="master-arrow" aria-hidden="true">→</span>
          </button>
          <div className="action-grid">
            <button className="action-card" onClick={() => startFiltered("learning")}>
              <span className="action-icon action-icon--blue" aria-hidden="true">↻</span>
              <span><strong>Continue Learning</strong><small>{flashcards.length - memorised.size} formulas to go</small></span>
              <span aria-hidden="true">→</span>
            </button>
            <button className="action-card" onClick={() => startFiltered("memorised")}>
              <span className="action-icon action-icon--green" aria-hidden="true">✓</span>
              <span><strong>Review Memorised</strong><small>{memorised.size} formulas ready</small></span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        <section className="chapter-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Study by topic</span>
              <h2>Choose a chapter</h2>
            </div>
            <span>{chapters.length} chapters · {flashcards.length} formulas</span>
          </div>

          <div className="chapter-grid">
            {chapters.map((chapter, chapterIndex) => {
              const chapterCards = flashcards.filter((item) => item.chapterSlug === chapter.slug);
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
                    {complete ? "Review Chapter" : "Study Chapter"} <span aria-hidden="true">→</span>
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
        <span>Built for focused O-Level A Math recall.</span>
        <span>Aligned to the 2026 Singapore syllabus 4049.</span>
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
