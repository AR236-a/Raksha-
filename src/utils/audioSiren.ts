// Web Audio API emergency police siren synthesizer
let audioCtx: AudioContext | null = null;
let sirenOscillator: OscillatorNode | null = null;
let sirenGain: GainNode | null = null;
let sirenInterval: any = null;

export function startSiren() {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (sirenOscillator) {
      stopSiren();
    }

    sirenOscillator = audioCtx.createOscillator();
    sirenGain = audioCtx.createGain();

    sirenOscillator.type = 'sawtooth';
    sirenGain.gain.setValueAtTime(0.15, audioCtx.currentTime);

    sirenOscillator.connect(sirenGain);
    sirenGain.connect(audioCtx.destination);

    let high = false;
    sirenOscillator.frequency.setValueAtTime(700, audioCtx.currentTime);
    sirenOscillator.start();

    sirenInterval = setInterval(() => {
      if (!audioCtx || !sirenOscillator) return;
      const now = audioCtx.currentTime;
      high = !high;
      const targetFreq = high ? 1200 : 650;
      sirenOscillator.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.4);
    }, 450);

    return true;
  } catch (e) {
    console.error('Audio synthesizer error:', e);
    return false;
  }
}

export function stopSiren() {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  if (sirenOscillator) {
    try {
      sirenOscillator.stop();
      sirenOscillator.disconnect();
    } catch {}
    sirenOscillator = null;
  }
  if (sirenGain) {
    try {
      sirenGain.disconnect();
    } catch {}
    sirenGain = null;
  }
}
