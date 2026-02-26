
// Simple audio utility for Rubik's Cube sounds using Web Audio API

let audioContext = null;

const getAudioContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
};

export const playMoveSound = () => {
    try {
        const ctx = getAudioContext();
        const t = ctx.currentTime;

        // Create realistic mechanical "crack/click" sound
        // This mimics the plastic-on-plastic friction and snap of a real cube

        // 1. Initial friction/scrape (very brief)
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.03, ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
            noiseData[i] = (Math.random() * 2 - 1) * 0.3;
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(800, t);
        noiseFilter.Q.setValueAtTime(2, t);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.08, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noiseSource.start(t);
        noiseSource.stop(t + 0.03);

        // 2. Main mechanical "click" - the satisfying snap
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        const clickFilter = ctx.createBiquadFilter();

        clickFilter.type = 'lowpass';
        clickFilter.frequency.setValueAtTime(400, t + 0.01);
        clickFilter.Q.setValueAtTime(1.5, t + 0.01);

        clickOsc.type = 'square';
        clickOsc.frequency.setValueAtTime(180, t + 0.01);
        clickOsc.frequency.exponentialRampToValueAtTime(80, t + 0.06);

        clickGain.gain.setValueAtTime(0.12, t + 0.01);
        clickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);

        clickOsc.connect(clickFilter);
        clickFilter.connect(clickGain);
        clickGain.connect(ctx.destination);

        clickOsc.start(t + 0.01);
        clickOsc.stop(t + 0.06);

        // 3. Subtle resonance/settling (plastic vibration)
        const resOsc = ctx.createOscillator();
        const resGain = ctx.createGain();

        resOsc.type = 'sine';
        resOsc.frequency.setValueAtTime(220, t + 0.02);
        resOsc.frequency.exponentialRampToValueAtTime(150, t + 0.08);

        resGain.gain.setValueAtTime(0.04, t + 0.02);
        resGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

        resOsc.connect(resGain);
        resGain.connect(ctx.destination);

        resOsc.start(t + 0.02);
        resOsc.stop(t + 0.08);

    } catch (e) {
        console.error("Audio play failed", e);
    }
};

export const playCelebrationSound = () => {
    try {
        const ctx = getAudioContext();
        const t = ctx.currentTime;

        // Play a major chord arpeggio (C Major: C4, E4, G4, C5)
        const notes = [261.63, 329.63, 392.00, 523.25];

        notes.forEach((freq, i) => {
            const startTime = t + (i * 0.1); // Stagger notes

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine'; // Smooth tone
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.8);
        });

        // Add a "sparkle" effect (high frequency random tones)
        for (let i = 0; i < 5; i++) {
            const startTime = t + 0.4 + (i * 0.1);
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1000 + (Math.random() * 1000), startTime);

            gain.gain.setValueAtTime(0.05, startTime);
            gain.gain.linearRampToValueAtTime(0, startTime + 0.1);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.1);
        }


    } catch (e) {
        console.error("Celebration audio play failed", e);
    }
};
