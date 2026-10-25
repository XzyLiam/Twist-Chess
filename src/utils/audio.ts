export type SoundType = "move" | "capture" | "click" | "win";

export function playTone(
  soundEnabled: boolean,
  soundLevel: number,
  freq = 440,
  duration = 0.12,
  type: OscillatorType = "sine",
  gainValue = 0.05
) {
  if (!soundEnabled) return;

  const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtor) return;

  const context = new AudioCtor();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.value = freq;

  gain.gain.value = 0.0001;
  gain.gain.exponentialRampToValueAtTime(gainValue * (soundLevel / 100), context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start();
  oscillator.stop(context.currentTime + duration);

  setTimeout(() => context.close(), duration * 1000 + 200);
}

export function playSound(soundEnabled: boolean, soundLevel: number, type: SoundType) {
  if (!soundEnabled) return;

  if (type === "click") playTone(soundEnabled, soundLevel, 520, 0.07, "triangle", 0.02);
  if (type === "move") {
    playTone(soundEnabled, soundLevel, 700, 0.08, "sine", 0.025);
    setTimeout(() => playTone(soundEnabled, soundLevel, 920, 0.09, "triangle", 0.02), 50);
  }
  if (type === "capture") playTone(soundEnabled, soundLevel, 220, 0.15, "square", 0.045);
  if (type === "win") {
    playTone(soundEnabled, soundLevel, 523, 0.18, "triangle", 0.04);
    setTimeout(() => playTone(soundEnabled, soundLevel, 659, 0.18, "triangle", 0.04), 150);
    setTimeout(() => playTone(soundEnabled, soundLevel, 784, 0.22, "triangle", 0.04), 300);
  }
}