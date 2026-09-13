"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { DIVE_MS, diveDuration, prefersReducedMotion } from "@/lib/motion";
import { useAnimatedNumber } from "@/lib/use-animated-number";
import { playDive, playScore, playTick, unlockAudio } from "@/lib/sfx";
import {
  PROMPTS_PER_DIVE,
  SECONDS_PER_PROMPT,
  TIER_COLOR,
  TIER_FLAVOR,
  TIER_LABEL,
  gradeMatch,
  gradeTimeout,
  matchAnswer,
  pickPlayableDive,
} from "@/lib/scoring";
import {
  DEFAULT_STATS,
  loadStats,
  recordDive,
  setMuted,
  subscribeStats,
} from "@/lib/storage";
import type { DiveResult, Grade, Phase, Prompt } from "@/lib/types";
import { DiveReview } from "./DiveReview";
import { DepthRuler, Ocean } from "./Ocean";
import { BubbleIcon, FishIcon, MenuIcon, SpeakerIcon } from "./pixels";

function formatMeters(n: number) {
  return `${n.toLocaleString("fr-FR")}m`;
}

export function KrillionGame({ prompts }: { prompts: Prompt[] }) {
  const [phase, setPhase] = useState<Phase>("home");
  const [howto, setHowto] = useState(false);
  const stats = useSyncExternalStore(
    subscribeStats,
    loadStats,
    () => DEFAULT_STATS,
  );
  const [dive, setDive] = useState<Prompt[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [depth, setDepth] = useState(0);
  const [results, setResults] = useState<DiveResult[]>([]);
  const [seconds, setSeconds] = useState(SECONDS_PER_PROMPT);
  const [draft, setDraft] = useState("");
  const [grade, setGrade] = useState<Grade | null>(null);
  const [listError, setListError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const submitted = useRef(false);
  const timeoutRef = useRef<() => void>(() => {});
  const [animMs, setAnimMs] = useState(DIVE_MS);
  const shownDepth = useAnimatedNumber(depth, animMs);
  const [sinking, setSinking] = useState(false);
  const [shownScore, setShownScore] = useState(0);
  const [handoffN, setHandoffN] = useState(3);
  const sinkTimer = useRef(0);
  const placardRef = useRef<HTMLDivElement>(null);

  function pulseSink(ms = DIVE_MS) {
    setSinking(true);
    window.clearTimeout(sinkTimer.current);
    sinkTimer.current = window.setTimeout(() => setSinking(false), ms + 80);
  }

  useEffect(() => {
    if (phase !== "prompt") return;
    submitted.current = false;
    const id = window.setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          return 0;
        }
        if (prev <= 6 && prev > 1) {
          try {
            playTick(stats.muted);
          } catch {
            /* tick is optional */
          }
        }
        return prev - 1;
      });
    }, 1000);
    const focus = window.setTimeout(() => {
      try {
        inputRef.current?.focus({ preventScroll: true });
      } catch {
        try {
          inputRef.current?.focus();
        } catch {
          /* mobile WebViews may reject focus */
        }
      }
    }, 120);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(focus);
    };
  }, [phase, index, stats.muted]);

  useEffect(() => {
    if (phase === "prompt" && seconds === 0 && !submitted.current) {
      timeoutRef.current();
    }
  }, [phase, seconds]);

  const prompt = dive[index];
  const surface = phase === "home";
  const lastResult = results.length >= PROMPTS_PER_DIVE;

  const dots = useMemo(() => {
    return Array.from({ length: PROMPTS_PER_DIVE }, (_, i) => {
      if (i === index && phase === "prompt") return "current";
      const result = results[i];
      if (!result) return "empty";
      return result.grade.ok ? "done" : "miss";
    });
  }, [index, phase, results]);

  function startDive() {
    unlockAudio();
    try {
      playDive(stats.muted);
    } catch {
      /* sound is optional */
    }
    try {
      const next = pickPlayableDive(prompts);
      setDive(next);
      setIndex(0);
      setScore(0);
      setDepth(0);
      setResults([]);
      setGrade(null);
      setDraft("");
      setListError(false);
      setHowto(false);
      setSeconds(SECONDS_PER_PROMPT);
      setShownScore(0);
      setAnimMs(900);
      setPhase("prompt");
      pulseSink(900);
    } catch {
      setPhase("home");
    }
  }

  function commit(nextGrade: Grade, typed: string) {
    if (!prompt || submitted.current) return;
    submitted.current = true;
    const nextScore = score + nextGrade.points;
    const nextDepth = depth + nextGrade.meters;
    const nextResults = [
      ...results,
      {
        promptId: prompt.id,
        promptText: prompt.text,
        answer: typed.trim(),
        grade: nextGrade,
        catalog: prompt.answers,
      },
    ];
    setGrade(nextGrade);
    setScore(nextScore);
    setDepth(nextDepth);
    setResults(nextResults);
    setListError(false);
    try {
      playDive(stats.muted);
    } catch {
      /* sound is optional */
    }
    const wait =
      prefersReducedMotion() || !nextGrade.ok
        ? 260
        : diveDuration(nextGrade.meters);
    setAnimMs(wait);
    setPhase("sink");
    pulseSink(wait);
    if (nextResults.length >= PROMPTS_PER_DIVE) {
      recordDive(nextScore, nextDepth);
    }
  }

  function trySubmit(raw: string) {
    if (!prompt || submitted.current) return;
    const hit = matchAnswer(prompt, raw);
    if (!hit) {
      setListError(true);
      setDraft("");
      return;
    }
    commit(gradeMatch(hit), raw);
  }

  function onTimeout() {
    if (!prompt || submitted.current) return;
    commit(gradeTimeout(), draft);
  }

  useEffect(() => {
    timeoutRef.current = onTimeout;
  });

  useEffect(() => {
    if (phase !== "sink") return;
    const wait =
      prefersReducedMotion() || !grade?.ok
        ? 260
        : diveDuration(grade.meters);
    const id = window.setTimeout(() => {
      setShownScore(score);
      setPhase("result");
      try {
        playScore(stats.muted, grade?.points ?? 0);
      } catch {
        /* sound is optional */
      }
    }, wait);
    return () => window.clearTimeout(id);
  }, [phase, grade, score, stats.muted]);

  function continueDive() {
    if (results.length >= PROMPTS_PER_DIVE) {
      setPhase("review");
      setGrade(null);
      return;
    }
    setHandoffN(3);
    setPhase("handoff");
  }

  useEffect(() => {
    if (phase !== "handoff") return;
    let n = 3;
    const id = window.setInterval(() => {
      n -= 1;
      if (n <= 0) {
        window.clearInterval(id);
        setDraft("");
        setGrade(null);
        setListError(false);
        setSeconds(SECONDS_PER_PROMPT);
        setIndex((i) => i + 1);
        setPhase("prompt");
        return;
      }
      setHandoffN(n);
    }, 700);
    return () => window.clearInterval(id);
  }, [phase]);

  function backHome() {
    setPhase("home");
    setDraft("");
    setGrade(null);
    setListError(false);
    setSinking(false);
    window.clearTimeout(sinkTimer.current);
  }

  function toggleMute() {
    unlockAudio();
    setMuted(!stats.muted);
  }

  const inDive =
    phase === "prompt" ||
    phase === "sink" ||
    phase === "result" ||
    phase === "handoff";
  const hudTitle =
    phase === "home" ? "" : phase === "review" ? "BILAN" : "PLONGÉE ∞";
  const hudSub =
    phase === "review"
      ? "PLONGÉE TERMINÉE"
      : inDive
        ? `PROMPT ${index + 1} SUR ${PROMPTS_PER_DIVE}`
        : "";

  return (
    <div
      className={`game-root${sinking ? " sinking" : ""}`}
      onPointerDown={unlockAudio}
    >
      <Ocean depth={shownDepth} surface={surface} sinking={sinking} />
      {inDive && <DepthRuler depth={shownDepth} />}

      {phase === "home" ? (
        <button
          className="icon-btn tl"
          type="button"
          aria-label="Comment jouer"
          onClick={() => setHowto((v) => !v)}
        >
          <MenuIcon />
        </button>
      ) : (
        <button
          className="icon-btn tl in-dive"
          type="button"
          aria-label="Abandonner la plongée"
          onClick={backHome}
        >
          <MenuIcon />
        </button>
      )}
      <button
        className={`icon-btn tr${phase === "home" ? "" : " in-dive"}`}
        type="button"
        aria-pressed={stats.muted}
        aria-label={stats.muted ? "Activer le son" : "Couper le son"}
        onClick={toggleMute}
      >
        <SpeakerIcon muted={stats.muted} />
      </button>

      {(inDive || phase === "review") && (
        <header className="hud">
          <div className="hud-pill left">
            <div className="hud-k">PROFONDEUR</div>
            <div className="hud-v">{formatMeters(Math.round(shownDepth))}</div>
          </div>
          <div className="hud-center">
            <div className="hud-title">{hudTitle}</div>
            <div className="progress" aria-hidden>
              {dots.map((kind, i) => (
                <span key={i} className={`dot ${kind}`} />
              ))}
            </div>
            <div className="hud-sub">{hudSub}</div>
          </div>
          <div className="hud-pill right">
            <div className="hud-k">SCORE</div>
            <div className={`hud-v pink${phase === "result" ? " popped" : ""}`}>
              {shownScore}
            </div>
          </div>
        </header>
      )}

      {phase === "home" && (
        <div className="stage home">
          <div className="title-wrap">
            <h1 className="brand">KRILLION</h1>
            <p className="subtitle">LA PLONGÉE ILLIMITÉE</p>
            <p className="tagline">
              7 prompts · 25 secondes · les réponses rares font descendre
            </p>
          </div>
          <div className="home-mid">
            <button
              className="how-toggle"
              type="button"
              onClick={() => setHowto((v) => !v)}
            >
              <span>{howto ? "▼" : "▶"}</span>
              COMMENT JOUER
            </button>
            {howto && (
              <div className="howto">
                <p>7 prompts par plongée. Entraîne-toi autant que tu veux.</p>
                <p>25 secondes pour nommer une seule chose.</p>
                <p>Les réponses rares rapportent plus et font descendre.</p>
                <p>Hors liste : le champ se vide, tu réessayes jusqu’au chrono.</p>
                <p>La réponse trop évidente reste du plancton.</p>
                <p>Chaque point t’enfonce de 10 mètres.</p>
              </div>
            )}
            <button className="cta" type="button" onClick={startDive}>
              ▼ COMMENCER LA DESCENTE ▼
            </button>
          </div>
          <footer className="home-foot">
            <span>PLONGÉE ∞ #{stats.diveCount + 1}</span>
            <span>MEILLEURE {formatMeters(stats.bestDepth)}</span>
          </footer>
        </div>
      )}

      {phase === "prompt" && prompt && (
        <div className="stage">
          <article className="card">
            <div className="card-k">
              PROMPT {index + 1} SUR {PROMPTS_PER_DIVE}
            </div>
            <h2 className="card-q">{prompt.text}</h2>
            <p className="card-hint">▼ les réponses rares font descendre ▼</p>
          </article>
        </div>
      )}

      {phase === "sink" && grade && (
        <div className="stage sink-stage" aria-live="polite">
          {grade.ok ? (
            <div className="answer-placard" ref={placardRef}>
              <p className="placard-k">RÉPONSE</p>
              <p className="placard-q">“{grade.display}”</p>
            </div>
          ) : (
            <p className="sink-k">temps écoulé</p>
          )}
        </div>
      )}

      {phase === "handoff" && (
        <div className="stage sink-stage" aria-live="polite">
          <p className="handoff-banner">
            <strong>descente</strong>
            {" · le chrono démarre dans "}
            {handoffN}
          </p>
        </div>
      )}

      {phase === "result" && grade && (
        <div className="stage">
          <div className="result">
            <div className="result-icon">
              <span className="result-bubbles" aria-hidden>
                <i />
                <i />
                <i />
              </span>
              {grade.ok && grade.tier === "plancton" ? (
                <BubbleIcon />
              ) : grade.ok ? (
                <FishIcon glow />
              ) : (
                <FishIcon />
              )}
            </div>
            <div
              className="tier"
              style={{
                color: grade.ok ? TIER_COLOR[grade.tier] : "#8aa0b4",
              }}
            >
              {grade.ok ? TIER_LABEL[grade.tier] : "TEMPS ÉCOULÉ"}
            </div>
            <p className="quoted">
              {grade.ok ? `“${grade.display}”` : "aucune réponse validée"}
            </p>
            <p className="gain">
              {grade.ok
                ? `+${grade.points} PTS · descend ${formatMeters(grade.meters)}`
                : "+0 PTS"}
            </p>
            <p className="flavor">
              {grade.ok ? TIER_FLAVOR[grade.tier] : "le chrono a tranché."}
            </p>
          </div>
        </div>
      )}

      {phase === "review" && (
        <div className="stage review-stage">
          <DiveReview
            results={results}
            score={score}
            depth={depth}
            onReplay={startDive}
            onSurface={backHome}
          />
        </div>
      )}

      {phase === "prompt" && (
        <form
          className="dock"
          onSubmit={(event) => {
            event.preventDefault();
            trySubmit(draft);
          }}
        >
          <div className={`timer${seconds <= 5 ? " low" : ""}`} aria-live="polite">
            {seconds}
          </div>
          <div className="field-wrap">
            <input
              ref={inputRef}
              className={`field${listError ? " bad" : ""}`}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                if (listError) setListError(false);
              }}
              placeholder="tape une réponse..."
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              aria-label="Ta réponse"
              aria-invalid={listError}
              onFocus={() => {
                try {
                  window.scrollTo(0, 0);
                } catch {
                  /* ignore */
                }
              }}
            />
            {listError && (
              <p className="list-error" role="status">
                pas dans la liste
              </p>
            )}
          </div>
          <button className="dive-btn" type="submit">
            PLONGER
          </button>
        </form>
      )}

      {phase === "result" && (
        <div className="bottom-cta">
          <button className="cta" type="button" onClick={continueDive}>
            {lastResult ? "VOIR LE BILAN ▼" : "DESCENDRE ▼"}
          </button>
        </div>
      )}
    </div>
  );
}
