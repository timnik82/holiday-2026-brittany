"use client";

import { useAudioPlayer } from "./AudioProvider";
import styles from "./tts.module.css";

/**
 * A compact button that narrates a single paragraph. Uses the global
 * AudioProvider so starting this paragraph stops any other currently playing.
 *
 * States surface through the button label and an `aria-live` status region
 * so screen-reader users hear generation and error announcements.
 */
export function ListenButton({
  paragraphId,
}: {
  paragraphId: string;
}) {
  const {
    state,
    playParagraph,
    pause,
    resume,
    replay,
    error,
  } = useAudioPlayer();

  let label: string;
  let action: () => void;

  if (state === "error") {
    label = "Retry";
    action = () => void playParagraph(paragraphId);
  } else if (state === "generating") {
    label = "Generating…";
    action = () => {};
  } else if (state === "playing") {
    label = "Pause";
    action = pause;
  } else if (state === "paused") {
    label = "Resume";
    action = resume;
  } else if (state === "ended") {
    label = "Replay";
    action = replay;
  } else {
    label = "Listen";
    action = () => void playParagraph(paragraphId);
  }

  return (
    <span className={styles.listenButtonWrapper}>
      <button
        type="button"
        className={styles.listenButton}
        onClick={action}
        disabled={state === "generating"}
        aria-label={`Listen to this paragraph`}
      >
        <span aria-hidden="true">{state === "generating" ? "⟳" : "🔊"}</span>{" "}
        {label}
      </button>
      {(state === "generating" || state === "error") && (
        <span className={styles.status} role="status" aria-live="polite">
          {state === "generating" && "Generating audio…"}
          {state === "error" && (error ?? "Generation failed.")}
        </span>
      )}
    </span>
  );
}
