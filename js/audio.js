// ============================================================
//  COSMIC AUDIO SYNTH (Web Audio API)
// ============================================================

let audioCtx = null;
let isAudioPlaying = false;
let masterGain = null;
let osc1, osc2, subOsc;

export function initCosmicAudio() {
  if (audioCtx) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();

  masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(280, audioCtx.currentTime);
  filter.Q.setValueAtTime(4, audioCtx.currentTime);

  osc1 = audioCtx.createOscillator();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(55, audioCtx.currentTime);

  osc2 = audioCtx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(82.4, audioCtx.currentTime);

  subOsc = audioCtx.createOscillator();
  subOsc.type = 'triangle';
  subOsc.frequency.setValueAtTime(27.5, audioCtx.currentTime);

  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(0.08, audioCtx.currentTime);
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.setValueAtTime(140, audioCtx.currentTime);
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);

  osc1.connect(filter);
  osc2.connect(filter);
  subOsc.connect(filter);
  filter.connect(masterGain);
  masterGain.connect(audioCtx.destination);

  osc1.start();
  osc2.start();
  subOsc.start();
  lfo.start();
}

export function toggleAudio() {
  if (!audioCtx) initCosmicAudio();
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const btn = document.getElementById('toggle-audio');
  isAudioPlaying = !isAudioPlaying;

  if (isAudioPlaying) {
    masterGain.gain.setTargetAtTime(0.12, audioCtx.currentTime, 1.2);
    btn.innerHTML = '\uD83D\uDD0A V\u0169 tr\u1EE5 <span class="audio-indicator"></span>';
    btn.classList.add('active');
  } else {
    masterGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.8);
    btn.innerHTML = '\uD83D\uDD07 \u00C2m thanh';
    btn.classList.remove('active');
  }
}
