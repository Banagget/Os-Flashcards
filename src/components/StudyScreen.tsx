import { useCallback, useEffect, useMemo, useState } from "react";
import { BlockMath } from "react-katex";
import { chapters, type Flashcard } from "../data/flashcards";

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

function twoDigits(value: number) {
  return String(value).padStart(2, "0");
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

  const goTo = useCallback(
    (nextIndex: number) => {
      if (order.length === 0) return;
      const bounded = Math.min(Math.max(nextIndex, 0), order.length - 1);
      if (bounded === index) return;
      setIndex(bounded);
      setRevealed(false);
      onPositionChange(modeKey, bounded);
    },
    [index, modeKey, onPositionChange, order.length],
  );

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
        onMark(current.id, !memorised.has(current.id));
      } else if (event.key.toLowerCase() === "s") {
        reshuffle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [current, goTo, index, memorised, onMark, reshuffle]);

  if (!current) {
    return (
      <main className="study-shell empty-state">
        <span className="completion-badge">All caught up</span>
        <h1>No cards in this review</h1>
        <p>You have memorised every card in this set. You can review them again from the dashboard.</p>
        <button className="button button--primary" onClick={onExit}>Return home</button>
      </main>
    );
  }

  const isMemorised = memorised.has(current.id);
  const chapterNumber =
    chapters
      .filter((chapter) => chapter.subject === current.subject)
      .findIndex((chapter) => chapter.slug === current.chapterSlug) + 1;
  const position = index + 1;
  const progress = order.length <= 1 ? 0 : (index / (order.length - 1)) * 100;

  return (
    <main className="study-shell" aria-label={`${title} study session`}>
      <header className="study-header">
        <button className="icon-button" onClick={onExit} aria-label="Return to dashboard">
          <span aria-hidden="true">←</span>
        </button>

        <div className="study-heading">
          <span className="eyebrow">CH {twoDigits(Math.max(chapterNumber, 1))}</span>
          <h1>{current.chapter}</h1>
        </div>

        <div className="study-count" aria-label={`Card ${position} of ${order.length}`}>
          <strong>{twoDigits(position)}</strong>
          <span>/</span>
          <span>{twoDigits(order.length)}</span>
        </div>
      </header>

      <div className="study-progress" aria-hidden="true">
        <span className="study-progress__track">
          <span className="study-progress__fill" style={{ width: `${progress}%` }} />
        </span>
        {order.map((card, cardIndex) =>
          memorised.has(card.id) ? (
            <span
              className="study-progress__mastered"
              style={{
                left: `${order.length <= 1 ? 0 : (cardIndex / (order.length - 1)) * 100}%`,
              }}
              key={card.id}
            />
          ) : null,
        )}
        <span className="study-progress__current" style={{ left: `${progress}%` }} />
      </div>

      <button
        className={`flashcard ${revealed ? "is-revealed" : ""}`}
        onClick={() => setRevealed((value) => !value)}
        aria-label={revealed ? "Show question" : "Reveal answer"}
        aria-pressed={revealed}
      >
        <span className="flashcard__inner">
          <span className={`flashcard__face flashcard__front ${current.questionImage ? "flashcard__front--image" : ""}`}>
            {!current.questionImage && (
              <span className="card-meta">
                <span>{current.title}</span>
                <span className={`card-status ${isMemorised ? "is-mastered" : ""}`}>
                  <i aria-hidden="true" />
                  {isMemorised ? "Mastered" : "Learning"}
                </span>
              </span>
            )}

            <span className={`prompt ${current.questionImage ? "prompt--image" : current.questionMath ? "prompt--math" : ""}`}>
              {current.questionImage ? (
                <img src={new URL(current.questionImage, document.baseURI).toString()} alt={current.questionImageAlt ?? ""} />
              ) : current.questionMath ? (
                <BlockMath math={current.questionMath} />
              ) : (
                current.question
              )}
            </span>

            {!current.questionImage && (
              <span className="reveal-hint">
                <span aria-hidden="true">↻</span>
                Tap to reveal answer
              </span>
            )}
          </span>

          <span className="flashcard__face flashcard__back">
            <span className="card-meta">
              <span>Answer</span>
              <span>{current.title}</span>
            </span>

            <span className="answer-content">
              <span className="formula-display"><BlockMath math={current.formula} /></span>
              <span className="answer-copy">{current.explanation}</span>

              {(current.conditions || current.commonMistake || current.example) && (
                <span className="answer-notes">
                  {current.conditions && (
                    <span><strong>Conditions</strong>{current.conditions}</span>
                  )}
                  {current.commonMistake && (
                    <span><strong>Watch out</strong>{current.commonMistake}</span>
                  )}
                  {current.example && (
                    <span className="answer-example">
                      <strong>Example</strong>
                      <span><BlockMath math={current.example} /></span>
                    </span>
                  )}
                </span>
              )}
            </span>

            <span className="reveal-hint">
              <span aria-hidden="true">↻</span>
              Tap to flip back
            </span>
          </span>
        </span>
      </button>

      <nav className="study-controls" aria-label="Flashcard controls">
        <button
          className="study-control study-control--nav"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
        >
          <span aria-hidden="true">←</span>
          Prev
        </button>
        <button
          className={`study-control study-control--mastered ${isMemorised ? "is-active" : ""}`}
          onClick={() => onMark(current.id, !isMemorised)}
          aria-pressed={isMemorised}
        >
          <span aria-hidden="true">✓</span>
          {isMemorised ? "Mastered" : "Mark mastered"}
        </button>
        <button
          className="study-control study-control--nav"
          onClick={() => goTo(index + 1)}
          disabled={index === order.length - 1}
        >
          Next
          <span aria-hidden="true">→</span>
        </button>
      </nav>
    </main>
  );
}
