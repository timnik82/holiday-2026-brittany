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
    currentParagraphId,
    playParagraph,
    pause,
    resume,
    replay,
    error,
  } = useAudioPlayer();

  // Is THIS paragraph the one currently active in the global player?
  const isActive = currentParagraphId === paragraphId;

  let label: string;
  let action: () => void;

  // If another paragraph is active, this button stays in its resting "Listen"
  // state — only the active paragraph shows generating/playing/paused states.
  if (!isActive) {
    label = "Listen";
    action = () => void playParagraph(paragraphId);
  } else if (state === "error") {
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

  const showStatus = isActive && (state === "generating" || state === "error");

  return (
    <span className={styles.listenButtonWrapper} data-print-hidden>
      <button
        type="button"
        className={styles.listenButton}
        onClick={action}
        disabled={isActive && state === "generating"}
        aria-label={`Listen to this paragraph`}
      >
        <span aria-hidden="true">{isActive && state === "generating" ? "⟳" : "🔊"}</span>{" "}
        {label}
      </button>
      {showStatus && (
        <span className={styles.status} role="status" aria-live="polite">
          {state === "generating" && "Generating audio…"}
          {state === "error" && (error ?? "Generation failed.")}
        </span>
      )}
    </span>
  );
}
