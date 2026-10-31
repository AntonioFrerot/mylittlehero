let audioContext: AudioContext | null = null;
let audioUnlocked = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) {
    audioContext = new AudioContextClass();
  }
  return audioContext;
}

/** À appeler après un geste utilisateur (clic/touche) pour autoriser le son. */
export function unlockSupportAlertAudio() {
  const context = getAudioContext();
  if (!context) return;
  void context.resume().then(() => {
    audioUnlocked = true;
  });
}

/** Petit signal sonore pour alerter les admins. */
export function playSupportAlertSound() {
  const context = getAudioContext();
  if (!context) return;

  const play = () => {
    try {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, context.currentTime);
      oscillator.frequency.setValueAtTime(660, context.currentTime + 0.12);
      oscillator.frequency.setValueAtTime(880, context.currentTime + 0.24);

      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.22, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.45);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.46);
    } catch {
      // ignore
    }
  };

  if (context.state === "suspended") {
    void context.resume().then(() => {
      audioUnlocked = true;
      play();
    });
    return;
  }

  audioUnlocked = true;
  play();
}

export function isSupportAlertAudioUnlocked(): boolean {
  return audioUnlocked;
}
