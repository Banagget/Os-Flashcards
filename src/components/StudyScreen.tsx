import { useCallback, useEffect, useMemo, useState } from "react";
import { BlockMath } from "react-katex";
import type { Flashcard } from "../data/flashcards";
import { ProgressBar } from "./ProgressBar";

interface StudyScreenProps {
  title: string;
  modeKey: string;
  cards: Flashcard[];
  memorised: Set<string>;
  initialPosition: number;
  shuffleEnabled: boolean;
  onShuffleChange: (enabled: boolean) => void;
  onPositionChange: (modeKey: string, position: number) => void;
  onMark: (cardId: string, memorised: boolean) => void;
  onExit: () => void;
}

function randomise(cards: Flashcard[], avoidFirstId?: string) {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  if (shuffled.length > 1 && shuffled[0]?.id === avoidFirstId) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}

export function StudyScreen({
  title,
  modeKey,
  cards,
  memorised,
  initialPosition,
  shuffleEnabled,
  onShuffleChange,
  onPositionChange,
  onMark,
  onExit,
}: StudyScreenProps) {
  const normalOrder = useMemo(() => [...cards], [cards]);
  const [order, setOrder] = useState(() => (shuffleEnabled ? randomise(cards) : [...cards]));
  const [index, setIndex] = useState(() => Math.min(initialPosition, Math.max(cards.length - 1, 0)));
  const [revealed, setRevealed] = useState(false);

  const current = order[index];
  const sessionMemorised = order.filter((item) => memorised.has(item.id)).length;

  const goTo = useCallback(
    (nextIndex: number) => {
      if (order.length === 0) return;
      const wrapped = (nextIndex + order.length) % order.length;
      setIndex(wrapped);
      setRevealed(false);
      onPositionChange(modeKey, wrapped);
    },
    [modeKey, onPositionChange, order.length],
  );

  const toggleShuffle = useCallback(() => {
    const nextEnabled = !shuffleEnabled;
    onShuffleChange(nextEnabled);
    if (nextEnabled) {
      setOrder(randomise(normalOrder, current?.id));
      setIndex(0);
      onPositionChange(modeKey, 0);
    } else {
      setOrder(normalOrder);
      const normalIndex = Math.max(0, normalOrder.findIndex((item) => item.id === current?.id));
      setIndex(normalIndex);
      onPositionChange(modeKey, normalIndex);
    }
    setRevealed(false);
  }, [current?.id, modeKey, normalOrder, onPositionChange, onShuffleChange, shuffleEnabled]);

  const reshuffle = useCallback(() => {
    onShuffleChange(true);
    setOrder(randomise(normalOrder, current?.id));
    setIndex(0);
    setRevealed(false);
    onPositionChange(modeKey, 0);
  }, [current?.id, modeKey, normalOrder, onPositionChange, onShuffleChange]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;

      if (event.key === " " || event.key === "Enter") {
        if (target?.tagName === "BUTTON") return;
        event.preventDefault();
        setRevealed((value) => !value);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(index - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(index + 1);
      } else if (event.key.toLowerCase() === "m" && current) {
        onMark(current.id, true);
      } else if (event.key.toLowerCase() === "l" && current) {
        onMark(current.id, false);
      } else if (event.key.toLowerCase() === "s") {
        reshuffle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [current, goTo, index, onMark, reshuffle]);

  if (!current) {
    return (
      <main className="study-shell empty-state">
        <span className="completion-badge">All caught up</span>
        <h1>No cards in this review</h1>
        <p>You have memorised every formula in this set. You can review them again from the dashboard.</p>
        <button className="button button--primary" onClick={onExit}>Return home</button>
      </main>
    );
  }

  const isMemorised = memorised.has(current.id);
  const completion = order.length === 0 ? 0 : Math.round((sessionMemorised / order.length) * 100);

  return (
    <main className="study-shell">
      <header className="study-header">
        <button className="icon-button" onClick={onExit} aria-label="Return to dashboard">
          <span aria-hidden="true">←</span>
        </button>
        <div className="study-heading">
          <span className="eyebrow">Study mode</span>
          <h1>{title}</h1>
        </div>
        <button
          className={`shuffle-button ${shuffleEnabled ? "is-active" : ""}`}
          onClick={toggleShuffle}
          aria-pressed={shuffleEnabled}
        >
          <span aria-hidden="true">↝</span>
          {shuffleEnabled ? "Shuffled" : "Shuffle"}
        </button>
      </header>

      <section className="session-progress" aria-label="Current study session">
        <div>
          <span>Card {index + 1} of {order.length}</span>
          <span>{sessionMemorised} memorised · {completion}%</span>
        </div>
        <ProgressBar value={sessionMemorised} max={order.length} label="Session memorisation progress" compact />
      </section>

      <button
        className={`flashcard ${revealed ? "is-revealed" : ""}`}
        onClick={() => setRevealed((value) => !value)}
        aria-label={revealed ? "Hide answer" : "Reveal answer"}
      >
        <span className="flashcard__inner">
          <span className="flashcard__face flashcard__front">
            <span className="card-position">{current.chapter}</span>
            <span className="formula-title">{current.title}</span>
            <span className="prompt">{current.question}</span>
            <span className="reveal-hint"><kbd>Space</kbd> or tap to reveal</span>
          </span>
          <span className="flashcard__face flashcard__back">
            <span className="answer-label">Answer</span>
            <span className="formula-display"><BlockMath math={current.formula} /></span>
            <span className="answer-copy">{current.explanation}</span>
            <span className="detail-grid">
              {current.conditions && (
                <span className="detail-box">
                  <strong>Conditions</strong>
                  <span>{current.conditions}</span>
                </span>
              )}
              {current.commonMistake && (
                <span className="detail-box detail-box--warning">
                  <strong>Watch out</strong>
                  <span>{current.commonMistake}</span>
                </span>
              )}
              {current.example && (
                <span className="detail-box detail-box--example">
                  <strong>Example</strong>
                  <span className="detail-math"><BlockMath math={current.example} /></span>
                </span>
              )}
            </span>
            <span className="reveal-hint">Tap to see the question</span>
          </span>
        </span>
      </button>

      <div className="rating-row" aria-label="Mark your confidence">
        <button
          className={`rating-button rating-button--learning ${!isMemorised ? "is-selected" : ""}`}
          onClick={() => onMark(current.id, false)}
          aria-pressed={!isMemorised}
        >
          <span className="rating-icon" aria-hidden="true">↻</span>
          <span><strong>Still Learning</strong><small>Press L</small></span>
        </button>
        <button
          className={`rating-button rating-button--memorised ${isMemorised ? "is-selected" : ""}`}
          onClick={() => onMark(current.id, true)}
          aria-pressed={isMemorised}
        >
          <span className="rating-icon" aria-hidden="true">✓</span>
          <span><strong>Memorised</strong><small>Press M</small></span>
        </button>
      </div>

      <nav className="card-navigation" aria-label="Flashcard navigation">
        <button className="button button--secondary" onClick={() => goTo(index - 1)}>
          <span aria-hidden="true">←</span> Previous
        </button>
        <button className="button button--secondary" onClick={() => goTo(index + 1)}>
          Next <span aria-hidden="true">→</span>
        </button>
      </nav>

      <p className="shortcut-hint">Keyboard: ← previous · → next · Space reveal · M memorised · L learning · S shuffle</p>
    </main>
  );
}
