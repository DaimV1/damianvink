import { frequency, type SonicNote } from "./sonic";

/** Constructed only by the Play gesture. Audio time, not UI frames, drives rhythm. */
export class SonicAudio {
  readonly context = new AudioContext();
  private readonly master = this.context.createGain();
  private readonly analyser = this.context.createAnalyser();
  private readonly compressor = this.context.createDynamicsCompressor();
  private readonly voices = new Set<AudioScheduledSourceNode>();
  private readonly samples = new Uint8Array(256);
  private readonly noise: AudioBuffer;
  constructor() {
    this.master.gain.value = 0.35;
    this.compressor.threshold.value = -16;
    this.compressor.ratio.value = 8;
    this.analyser.fftSize = 256;
    this.master.connect(this.compressor);
    this.compressor.connect(this.analyser);
    this.analyser.connect(this.context.destination);
    this.noise = this.context.createBuffer(
      1,
      this.context.sampleRate * 0.25,
      this.context.sampleRate,
    );
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  volume(value: number) {
    this.master.gain.setTargetAtTime(value * 0.7, this.context.currentTime, 0.025);
  }
  level() {
    this.analyser.getByteTimeDomainData(this.samples);
    return Math.min(
      100,
      Math.round(
        Math.sqrt(
          this.samples.reduce((sum, v) => sum + ((v - 128) / 128) ** 2, 0) / this.samples.length,
        ) * 400,
      ),
    );
  }
  private voice(
    source: AudioScheduledSourceNode,
    output: AudioNode,
    time: number,
    duration: number,
    peak: number,
  ) {
    const envelope = this.context.createGain();
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(peak, time + 0.006);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    output.connect(envelope);
    envelope.connect(this.master);
    source.start(time);
    source.stop(time + duration + 0.02);
    this.voices.add(source);
    source.onended = () => {
      source.disconnect();
      output.disconnect();
      envelope.disconnect();
      this.voices.delete(source);
    };
  }
  note(note: SonicNote, time: number) {
    const strength = note.size / 100;
    if (note.instrument === "drum" && note.row < 6) {
      const source = this.context.createBufferSource();
      source.buffer = this.noise;
      const filter = this.context.createBiquadFilter();
      filter.type = note.row < 3 ? "highpass" : "bandpass";
      filter.frequency.value = note.row < 3 ? 6500 : 1800;
      source.connect(filter);
      this.voice(source, filter, time, note.row < 3 ? 0.06 : 0.16, strength * 0.32);
      return;
    }
    const oscillator = this.context.createOscillator();
    oscillator.type = note.instrument === "bass" ? "triangle" : "sine";
    if (note.instrument === "drum") {
      oscillator.frequency.setValueAtTime(145, time);
      oscillator.frequency.exponentialRampToValueAtTime(45, time + 0.14);
      this.voice(oscillator, oscillator, time, 0.22, strength * 0.5);
    } else {
      oscillator.frequency.value = frequency(note);
      this.voice(
        oscillator,
        oscillator,
        time,
        note.instrument === "bass" ? 0.38 : 0.65,
        strength * 0.25,
      );
      if (note.instrument === "melody") {
        const overtone = this.context.createOscillator();
        overtone.frequency.value = frequency(note) * 2;
        this.voice(overtone, overtone, time, 0.22, strength * 0.045);
      }
    }
  }
  silence() {
    for (const voice of this.voices) {
      try {
        voice.stop();
      } catch {
        /* already ended */
      }
    }
    this.voices.clear();
  }
  async close() {
    this.silence();
    await this.context.close();
  }
}
