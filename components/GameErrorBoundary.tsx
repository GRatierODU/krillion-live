"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
<type State = { crashed: boolean };

export class GameErrorBoundary extends Component<Props, State> {
  state: State = { crashed: false };

  static getDerivedStateFromError(): State {
    return { crashed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    try {
      console.warn("Krillion crash", error.message, info.componentStack);
    } catch {
      /* ignore */
    }
  }

  render() {
    if (!this.state.crashed) return this.props.children;

    return (
      <div className="crash-fallback">
        <p className="crash-k">KRILLION</p>
        <h1>La plongée n’a pas pu s’afficher.</h1>
        <p>
          Le navigateur a interrompu le jeu. Réessaie — rien n’est perdu, tes
          stats restent sur l’appareil.
        </p>
        <button
          className="cta"
          type="button"
          onClick={() => {
            this.setState({ crashed: false });
            try {
              window.location.reload();
            } catch {
              /* stay on fallback */
            }
          }}
        >
          RÉESSAYER
        </button>
      </div>
    );
  }
}
