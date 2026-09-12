"use client";

import { useState } from "react";
import {
  TIER_COLOR,
  TIER_LABEL,
  TIER_POINTS,
  groupCatalog,
} from "@/lib/scoring";
import type { DiveResult } from "@/lib/types";

function formatMeters(n: number) {
  return `${n.toLocaleString("fr-FR")}m`;
}

type Props = {
  results: DiveResult[];
  score: number;
  depth: number;
  onReplay: () => void;
  onSurface: () => void;
};

export function DiveReview({ results, score, depth, onReplay, onSurface }: Props) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="review">
      <header className="review-head">
        <p className="review-k">BILAN DE PLONGÉE</p>
        <p className="review-tot">
          {score} PTS · {formatMeters(depth)}
        </p>
      </header>
      <ol className="review-list">
        {results.map((row, i) => {
          const expanded = open === i;
          const groups = groupCatalog(row.catalog);
          return (
            <li key={`${row.promptId}-${i}`} className="review-item">
              <button
                className="review-row"
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : i)}
              >
                <span className="review-n">{i + 1}</span>
                <span className="review-main">
                  <span className="review-q">{row.promptText}</span>
                  <span className="review-a">
                    {row.grade.ok
                      ? `“${row.grade.display}”`
                      : row.answer
                        ? `“${row.answer}” · temps écoulé`
                        : "temps écoulé"}
                  </span>
                </span>
                <span
                  className="review-pts"
                  style={{
                    color: row.grade.ok ? TIER_COLOR[row.grade.tier] : "#8aa0b4",
                  }}
                >
                  {row.grade.ok
                    ? `+${row.grade.points} · ${TIER_LABEL[row.grade.tier]}`
                    : "+0"}
                </span>
              </button>
              {expanded && (
                <div className="review-cat">
                  <p className="review-cat-k">CLASSEMENT DES MOTS POSSIBLES</p>
                  {groups.map((group) => (
                    <div key={group.tier} className="review-tier">
                      <p
                        className="review-tier-k"
                        style={{ color: TIER_COLOR[group.tier] }}
                      >
                        {TIER_LABEL[group.tier]} · {TIER_POINTS[group.tier]} PTS
                      </p>
                      <p className="review-tier-w">{group.words.join(" · ")}</p>
                    </div>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <div className="review-actions">
        <button className="cta" type="button" onClick={onReplay}>
          NOUVELLE PLONGÉE
        </button>
        <button className="cta pink" type="button" onClick={onSurface}>
          SURFACE ▲
        </button>
      </div>
    </div>
  );
}
