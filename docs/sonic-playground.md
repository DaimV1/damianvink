# Sonic Playground

Demo 09 at `/ai-lab#sonic`, integrated after Chladni Plate (08).

Visitors compose a 16-step loop with three shape instruments: circle/bass, triangle/melody, square/drums. Horizontal position selects a sixteenth-note step; vertical position chooses a C-pentatonic pitch or drum voice (kick/snare/hi-hat). Shape size sets note strength. The loop can be edited while playing. Variations preserve the bass and drum pattern and change melodic pitches without overlapping shapes.

The starter has 18 shapes. Playback is an explicit user gesture; mounting a demo creates no AudioContext. A 25 ms look-ahead scheduler queues voices against the audio clock, while the playhead and note illumination follow scheduled timestamps. The level meter measures actual analyser output. Tempo is 60–160 BPM, maximum 48 notes. Gain envelopes, moderate initial volume and compression keep transients controlled. Pausing cancels scheduled voices, hiding the tab pauses playback, and leaving the demo closes its audio context.

Pointer capture supports dragging; keyboard arrows, Delete, an Add shape button and selected-shape sliders offer alternate controls. The music board deliberately scrolls horizontally on small screens to retain 40 px note targets. Reduced-motion mode uses discrete playhead steps. Dutch/English and theme controls follow the existing site.

No new dependencies, external samples, microphone access, accounts or API calls. Audio is synthesized with the browser's Web Audio API. Variation is a local musical rule, not a remote AI service.

References: [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext), [scheduled audio sources](https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/start).
