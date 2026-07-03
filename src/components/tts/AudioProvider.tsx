"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type PlayerState =
  | "idle"
  | "generating"
  | "playing"
  | "paused"
  | "ended"
  | "error";

export type PlaybackSpeed = 0.8 | 1 | 1.2 | 1.5;

const SPEEDS: readonly PlaybackSpeed[] = [0.8, 1, 1.2, 1.5];

interface AudioContextValue {
  /** Current player state. */
  state: PlayerState;
  /** The cache key currently loaded, or null if idle. */
  currentCacheKey: string | null;
  /** Current playback speed. */
  speed: PlaybackSpeed;
  /** Available speed options. */
  speeds: readonly PlaybackSpeed[];
  /** Current generation error message, if any. */
  error: string | null;
  /**
   * Request and play audio for a paragraph. If another paragraph is
   * currently active, it is stopped first.
   */
  playParagraph: (paragraphId: string) => Promise<void>;
  /** Pause playback. */
  pause: () => void;
  /** Resume playback after pause. */
  resume: () => void;
  /** Replay the current paragraph from the start. */
  replay: () => void;
  /** Stop playback and reset to idle. */
  stop: () => void;
  /** Set the playback speed (affects playbackRate only, no new audio). */
  setSpeed: (speed: PlaybackSpeed) => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

/**
 * Single global audio player. Owns exactly one `HTMLAudioElement` for the
 * entire app. Starting a new paragraph stops the previous one. Speeds are
 * applied via `playbackRate` — no duplicate audio files are created.
 *
 * Exposes a context consumed by `ListenButton`.
 */
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>("idle");
  const [currentCacheKey, setCurrentCacheKey] = useState<string | null>(null);
  const [speed, setSpeedState] = useState<PlaybackSpeed>(1);
  const [error, setError] = useState<string | null>(null);

  // Lazily create the single audio element.
  function getAudio(): HTMLAudioElement {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    return audioRef.current;
  }

  // Wire audio element events to state.
  useEffect(() => {
    const audio = getAudio();
    const onPlaying = () => setState("playing");
    const onPause = () => setState((s) => (s === "ended" ? s : "paused"));
    const onEnded = () => setState("ended");
    const onError = () => {
      setState("error");
      setError("Playback failed. Try again.");
    };
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, []);

  const playCacheKey = useCallback(
    (cacheKey: string) => {
      const audio = getAudio();
      // Stop current playback if switching to a different paragraph.
      if (currentCacheKey !== cacheKey) {
        audio.pause();
        audio.currentTime = 0;
        setCurrentCacheKey(cacheKey);
      }
      audio.src = `/api/audio/${cacheKey}`;
      audio.playbackRate = speed;
      void audio.play().catch(() => {
        setState("error");
        setError("Playback failed. Try again.");
      });
    },
    [currentCacheKey, speed],
  );

  const playParagraph = useCallback(
    async (paragraphId: string) => {
      setState("generating");
      setError(null);
      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paragraphId }),
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? `Generation failed (${response.status})`);
        }
        const { cacheKey } = (await response.json()) as { cacheKey: string };
        playCacheKey(cacheKey);
      } catch (err) {
        setState("error");
        setError((err as Error).message);
      }
    },
    [playCacheKey],
  );

  const pause = useCallback(() => {
    getAudio().pause();
  }, []);

  const resume = useCallback(() => {
    void getAudio().play().catch(() => {
      setState("error");
      setError("Playback failed. Try again.");
    });
  }, []);

  const replay = useCallback(() => {
    const audio = getAudio();
    audio.currentTime = 0;
    void audio.play().catch(() => {
      setState("error");
      setError("Playback failed. Try again.");
    });
  }, []);

  const stop = useCallback(() => {
    const audio = getAudio();
    audio.pause();
    audio.currentTime = 0;
    audio.src = "";
    setState("idle");
    setCurrentCacheKey(null);
    setError(null);
  }, []);

  const setSpeed = useCallback((newSpeed: PlaybackSpeed) => {
    setSpeedState(newSpeed);
    const audio = getAudio();
    audio.playbackRate = newSpeed;
  }, []);

  const value = useMemo<AudioContextValue>(
    () => ({
      state,
      currentCacheKey,
      speed,
      speeds: SPEEDS,
      error,
      playParagraph,
      pause,
      resume,
      replay,
      stop,
      setSpeed,
    }),
    [state, currentCacheKey, speed, error, playParagraph, pause, resume, replay, stop, setSpeed],
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

/** Hook to access the global audio player. */
export function useAudioPlayer(): AudioContextValue {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error("useAudioPlayer must be used within <AudioProvider>");
  }
  return ctx;
}
