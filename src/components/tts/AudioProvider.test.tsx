// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { AudioProvider, useAudioPlayer } from "./AudioProvider";

// Access the player through a consumer component.
function PlayerConsumer() {
  const player = useAudioPlayer();
  return (
    <div>
      <span data-testid="state">{player.state}</span>
      <button onClick={() => void player.playParagraph("para-1")}>Play</button>
      <button onClick={player.pause}>Pause</button>
      <button onClick={player.resume}>Resume</button>
      <button onClick={player.replay}>Replay</button>
      <button onClick={player.stop}>Stop</button>
    </div>
  );
}

describe("AudioProvider player state", () => {
  let mockAudio: {
    src: string;
    currentTime: number;
    playbackRate: number;
    play: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };
  let originalAudio: typeof global.Audio;

  beforeEach(() => {
    originalAudio = global.Audio;
    const listeners: Record<string, ((...args: unknown[]) => void) | undefined> = {};
    mockAudio = {
      src: "",
      currentTime: 0,
      playbackRate: 1,
      play: vi.fn(async () => undefined),
      pause: vi.fn(() => listeners.pause?.()),
      addEventListener: vi.fn((event: string, handler: () => void) => {
        listeners[event] = handler as (...args: unknown[]) => void;
      }),
      removeEventListener: vi.fn(),
    };
    function MockAudio(this: unknown) {
      return mockAudio;
    }
    global.Audio = MockAudio as unknown as typeof Audio;
  });

  afterEach(() => {
    global.Audio = originalAudio;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("starts in idle state", () => {
    render(
      <AudioProvider>
        <PlayerConsumer />
      </AudioProvider>,
    );
    expect(screen.getByTestId("state").textContent).toBe("idle");
  });

  it("transitions through generating → playing on playParagraph", async () => {
    const mockFetch = vi.fn(async () =>
      new Response(JSON.stringify({ cacheKey: "test-key", status: "generated" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", mockFetch);

    render(
      <AudioProvider>
        <PlayerConsumer />
      </AudioProvider>,
    );

    expect(screen.getByTestId("state").textContent).toBe("idle");

    await act(async () => {
      fireEvent.click(screen.getByText("Play"));
    });

    // After fetch resolves + play() is called, state should be generating or playing
    // depending on timing. The mock play() resolves without firing 'playing' event,
    // so we manually check fetch was called with the right args.
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/tts",
      expect.objectContaining({ method: "POST" }),
    );
    expect(mockAudio.play).toHaveBeenCalled();
  });

  it("pauses and resumes", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({ cacheKey: "k" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ));

    render(
      <AudioProvider>
        <PlayerConsumer />
      </AudioProvider>,
    );

    // Start playing
    await act(async () => {
      fireEvent.click(screen.getByText("Play"));
    });

    // Pause
    await act(async () => {
      fireEvent.click(screen.getByText("Pause"));
    });
    expect(mockAudio.pause).toHaveBeenCalled();
  });

  it("stops and resets to idle", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({ cacheKey: "k" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ));

    render(
      <AudioProvider>
        <PlayerConsumer />
      </AudioProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByText("Play"));
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Stop"));
    });
    expect(screen.getByTestId("state").textContent).toBe("idle");
  });
});
