/* instruments */

const instruments = {};
const instrumentNames = [
  "grand-piano",
  "bright-piano",
  "electric-piano",
  "flute",
  "synth",
  "wubs",
  "strings",
  "pluck",
  "xylophone",
];

instrumentNames.forEach(instrument => {
  const baseUrl = instrument === "grand-piano" ? "https://tonejs.github.io/audio/salamander/" : `assets/samples/${instrument}/`;
  instruments[instrument] = new Tone.Sampler({
    urls: {
      C1: "C1.mp3",
      C2: "C2.mp3",
      C3: "C3.mp3",
      C4: "C4.mp3",
      A4: "A4.mp3",
      C5: "C5.mp3",
      A5: "A5.mp3",
      C6: "C6.mp3",
    },
    release: 1,
    baseUrl: baseUrl,
  }).toDestination();
});

const playInstrument = (instrument = "grand-piano", note, duration = "1n", volume = 50, muted = false) => {
  if (muted)
    return;
  if (!(instrument in instruments))
    return;
  instruments[instrument].triggerAttackRelease(note, duration, undefined, (instrument === "grand-piano" ? volume * 4 : volume) / 100.0);
};

const stopSounds = (instrument) => {
  if (instrument) {
    instruments[instrument].releaseAll();
    return;
  }
  Object.keys(instruments).forEach(instrument => {
    instruments[instrument].releaseAll();
  });
};
