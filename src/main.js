window.addEventListener("load", async ()=>{
    const audioctx = new AudioContext();
    let mode = 0;
    let type = 0;
    let freq = 440;
    let level = 1.0;
    let oscillator = null;
    let gain = null;
    const filter = new BiquadFilterNode(audioctx,{frequency:5000, q:5});
    const analyser = new AnalyserNode(audioctx, {smoothingTimeConstant:0.9});

    document.getElementById("play").addEventListener("click",()=>{
        if(audioctx.state=="suspended") {
            audioctx.resume();
        }
        if(oscillator == null) {
            oscillator = audioctx.createOscillator();
            gain = new GainNode(audioctx);
            if (type == 0) {
                oscillator.type = "sine";
            } else if (type == 1) {
                oscillator.type = "square";
            } else if (type == 2) {
                oscillator.type = "sawtooth";
            } else if (type == 3) {
                oscillator.type = "triangle";
            }
            oscillator.frequency.setValueAtTime(freq, audioctx.currentTime);
            gain.gain.value = level;
            analyser.fftSize = 512;
            oscillator.connect(gain).connect(filter).connect(analyser).connect(audioctx.destination);
            oscillator.start();
            isPlaying = true;

        }
    });
    document.getElementById("stop").addEventListener("click",()=>{
        if(oscillator) {
            oscillator.stop();
        }
        oscillator = null;
        gain = null;
    });
    document.getElementById("type").addEventListener("change",(ev)=>{
        type = ev.target.selectedIndex;
    });
    document.getElementById("freq").addEventListener("input",(ev)=>{
        freq = document.getElementById("freqvalue").innerHTML = ev.target.value;
    });
    document.getElementById("level").addEventListener("input",(ev)=>{
        level = document.getElementById("levelvalue").innerHTML = ev.target.value;
    });
    document.getElementById("mode").addEventListener("change",(ev)=>{
        mode = ev.target.selectedIndex;
    });
    document.getElementById("smoothing").addEventListener("input",(ev)=>{
        analyser.smoothingTimeConstant = document.getElementById("smoothingval").innerHTML = ev.target.value;
    });
    document.getElementById("biquad_freq").addEventListener("input",(ev)=>{
        filter.frequency.value = document.getElementById("biquad_freqval").innerHTML = ev.target.value;
    });
    document.getElementById("biquad_q").addEventListener("input",(ev)=>{
        filter.Q.value = document.getElementById("biquad_qval").innerHTML = ev.target.value;
    });


    const canvas = document.getElementById("graph");
    const canvasctx = canvas.getContext("2d");
    function DrawGraph() {
        const times = analyser.fftSize;
        const data = new Uint8Array(times);
        const width = canvas.width;
        const height = canvas.height;
        // Clear previous data
        canvasctx.clearRect(0, 0, width, height);
        // Draw sound wave
        canvasctx.beginPath();

        if(mode == 0) {
            analyser.getByteFrequencyData(data); //Spectrum Data
        } else {
            analyser.getByteTimeDomainData(data); //Waveform Data
        }

        for(var i = 0; i < times; ++i) {
            var x = Math.floor((i / times) * width);
            var y = Math.floor((1 - (data[i] / 255)) * (height));
            if (i === 0) {
                canvasctx.moveTo(x, y);
            } else {
                canvasctx.lineTo(x, y);
            }
        }

        canvasctx.strokeStyle = 'rgba(0, 255, 0, 1.0)';
        canvasctx.lineWidth   = 5;
        canvasctx.lineCap     = 'round';
        canvasctx.lineJoin    = 'miter';
        canvasctx.stroke();
    }
    setInterval(DrawGraph, 100);
});
