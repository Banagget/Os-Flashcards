import { useCallback, useEffect, useMemo, useState } from "react";
import { BlockMath } from "react-katex";
import { chapters, type Flashcard } from "../data/flashcards";
import { EquationVisual } from "./EquationVisual";

interface StudyScreenProps {
  title: string;
  modeKey: string;
  cards: Flashcard[];
  memorised: Set<string>;
  shuffleEnabled: boolean;
  onShuffleChange: (enabled: boolean) => void;
  onPositionChange: (modeKey: string, position: number) => void;
  onMark: (cardId: string, memorised: boolean) => void;
  onOpenExamples: (card: Flashcard) => void;
  exitLabel: string;
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

function RichText({ children }: { children: string }) {
  return children.split(/(\*\*[^*]+\*\*)/g).map((part, partIndex) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${part}-${partIndex}`}>{part.slice(2, -2)}</strong>
    ) : (
      part
    ),
  );
}

export function StudyScreen({
  title,
  modeKey,
  cards,
  memorised,
  shuffleEnabled,
  onShuffleChange,
  onPositionChange,
  onMark,
  onOpenExamples,
  exitLabel,
  onExit,
}: StudyScreenProps) {
  const normalOrder = useMemo(() => [...cards], [cards]);
  const [order, setOrder] = useState(() => [...cards]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [focusEnabled, setFocusEnabled] = useState(false);
  const [showHow, setShowHow] = useState(false);

  const current = order[index];
  const unmasteredCards = normalOrder.filter((card) => !memorised.has(card.id));
  const unmasteredCount = unmasteredCards.length;

  useEffect(() => {
    setShowHow(false);
  }, [current?.id, revealed]);

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
    const activeCards = focusEnabled ? order : normalOrder;
    setOrder(randomise(activeCards));
    setIndex(0);
    setRevealed(false);
    onPositionChange(modeKey, 0);
  }, [focusEnabled, modeKey, normalOrder, onPositionChange, onShuffleChange, order]);

  const toggleShuffle = useCallback(() => {
    const nextEnabled = !shuffleEnabled;
    const focusCardIds = new Set(order.map((card) => card.id));
    const activeCards = focusEnabled
      ? nextEnabled
        ? order
        : normalOrder.filter((card) => focusCardIds.has(card.id))
      : normalOrder;
    onShuffleChange(nextEnabled);

    if (nextEnabled) {
      setOrder(randomise(activeCards));
      setIndex(0);
      setRevealed(false);
      onPositionChange(modeKey, 0);
    } else {
      setOrder(activeCards);
      const restoredIndex = Math.max(0, activeCards.findIndex((card) => card.id === current?.id));
      setIndex(restoredIndex);
      onPositionChange(modeKey, restoredIndex);
    }
  }, [current?.id, focusEnabled, modeKey, normalOrder, onPositionChange, onShuffleChange, order, shuffleEnabled]);

  const toggleFocus = useCallback(() => {
    const nextEnabled = !focusEnabled;
    const activeCards = nextEnabled ? unmasteredCards : normalOrder;
    setFocusEnabled(nextEnabled);
    setOrder(shuffleEnabled ? randomise(activeCards, current?.id) : activeCards);
    setIndex(0);
    setRevealed(false);
    onPositionChange(modeKey, 0);
  }, [current?.id, focusEnabled, modeKey, normalOrder, onPositionChange, shuffleEnabled, unmasteredCards]);

  const resetSession = useCallback(() => {
    setFocusEnabled(false);
    onShuffleChange(false);
    setOrder(normalOrder);
    setIndex(0);
    setRevealed(false);
    onPositionChange(modeKey, 0);
  }, [modeKey, normalOrder, onPositionChange, onShuffleChange]);

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
      } else if (event.key === "ArrowUp" && current) {
        event.preventDefault();
        if (!event.repeat) onMark(current.id, !memorised.has(current.id));
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        if (!event.repeat) toggleFocus();
      } else if (event.key.toLowerCase() === "m" && current) {
        onMark(current.id, !memorised.has(current.id));
      } else if (event.key.toLowerCase() === "s") {
        reshuffle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [current, goTo, index, memorised, onMark, reshuffle, toggleFocus]);

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
        <button className="icon-button" onClick={onExit} aria-label={exitLabel}>
          <span aria-hidden="true">←</span>
        </button>

        <div className="study-heading">
          <span className="eyebrow">
            {current.subject === "amath" ? "PAGE" : current.subject === "emath" || current.subject === "physicsKeywords" ? "CH" : "TOPIC"} {twoDigits(Math.max(chapterNumber, 1))}
          </span>
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

      <article
        className={`flashcard ${revealed ? "is-revealed" : ""} ${showHow ? "is-showing-how" : ""}`}
        onClick={() => setRevealed((value) => !value)}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget || (event.key !== "Enter" && event.key !== " ")) return;
          event.preventDefault();
          setRevealed((value) => !value);
        }}
        role="button"
        tabIndex={0}
        aria-label={revealed ? "Show question" : "Reveal answer"}
        aria-pressed={revealed}
      >
        <span className="flashcard__inner">
          <span className={`flashcard__face flashcard__front ${current.questionImage && !current.question ? "flashcard__front--image" : ""} ${current.showImageChrome ? "flashcard__front--with-chrome" : ""}`}>
            {(!current.questionImage || current.question || current.showImageChrome) && (
              <span className="card-meta">
                <span>{current.title}</span>
                <span className={`card-status ${isMemorised ? "is-mastered" : ""}`}>
                  <i aria-hidden="true" />
                  {isMemorised ? "Mastered" : "Learning"}
                </span>
              </span>
            )}

            <span className={`prompt ${current.questionImage ? "prompt--image" : current.questionMath ? "prompt--math" : ""} ${current.questionImage && current.question ? "prompt--with-image" : ""} ${current.questionTone ? `prompt--${current.questionTone}` : ""}`}>
              {current.questionImage ? (
                <>
                  {current.question && <span className="prompt-copy">{current.question}</span>}
                  <img src={new URL(current.questionImage, document.baseURI).toString()} alt={current.questionImageAlt ?? ""} />
                </>
              ) : current.questionMath ? (
                <BlockMath math={current.questionMath} />
              ) : (
                current.question
              )}
            </span>

            {(!current.questionImage || current.question || current.showImageChrome) && (
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

            {showHow ? (
              <EquationVisual card={current} />
            ) : current.answerImage ? (
              <span className="answer-content answer-content--image">
                <img
                  src={new URL(current.answerImage, document.baseURI).toString()}
                  alt={current.answerImageAlt ?? ""}
                />
              </span>
            ) : (
              <span className="answer-content">
                {current.formula && (
                  <span className="formula-display"><BlockMath math={current.formula} /></span>
                )}
                <span className="answer-copy"><RichText>{current.explanation}</RichText></span>

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
            )}

            <span className="back-actions">
              <span className="reveal-hint">
                <span aria-hidden="true">↻</span>
                Tap to flip back
              </span>
              {current.subject === "amath" && !current.memoryOnly && (
                <button
                  type="button"
                  className="show-how-button"
                  aria-pressed={showHow}
                  onClick={(event) => {
                    event.stopPropagation();
                    setShowHow((value) => !value);
                  }}
                >
                  <span aria-hidden="true">{showHow ? "←" : "↗"}</span>
                  {showHow ? "Back to answer" : "Show how"}
                </button>
              )}
              {current.examples?.length && (
                <button
                  type="button"
                  className="examples-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenExamples(current);
                  }}
                >
                  Examples <span aria-hidden="true">→</span>
                </button>
              )}
            </span>
          </span>
        </span>
      </article>

      <div className="study-action-stack">
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
            {isMemorised ? "Mastered" : "Got it"}
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

        <div className="study-tools" aria-label="Study options">
          <button
            className={`study-tool ${shuffleEnabled ? "is-active" : ""}`}
            onClick={toggleShuffle}
            aria-pressed={shuffleEnabled}
          >
            <span aria-hidden="true">⇄</span>
            {shuffleEnabled ? "Shuffled" : "Shuffle"}
          </button>
          <button
            className={`study-tool study-tool--focus ${focusEnabled ? "is-active" : ""}`}
            onClick={toggleFocus}
            aria-pressed={focusEnabled}
            disabled={!focusEnabled && unmasteredCount === 0}
          >
            <span aria-hidden="true">◎</span>
            Focus · {unmasteredCount} left
          </button>
          <button className="study-tool" onClick={resetSession}>
            <span aria-hidden="true">↶</span>
            Reset
          </button>
        </div>
      </div>
    </main>
  );
}
