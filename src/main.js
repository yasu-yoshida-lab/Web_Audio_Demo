window.addEventListener("load", async ()=>{
    const audioctx = new AudioContext();
    let mode = 0;
    let type = 0;
    let freq = 440;
    let level = 0.5;
    let fftsizeindex = 6;
    let oscillator = null;
    const types = ["sine", "square", "sawtooth", "triangle"];
    const fftsizes = [32, 64, 128, 256, 512, 1024, 2048];
    const gain = new GainNode(audioctx);
    const analyser = new AnalyserNode(audioctx, {smoothingTimeConstant:0.9});

    document.getElementById("play").addEventListener("click",()=>{
        if(audioctx.state=="suspended") {
            audioctx.resume();
        }
        if(oscillator == null) {
            oscillator = audioctx.createOscillator();
            oscillator.type = types[type];
            oscillator.frequency.setValueAtTime(freq, audioctx.currentTime);
            gain.gain.value = level;
            analyser.fftSize = fftsizes[fftsizeindex];
            oscillator.connect(gain).connect(analyser).connect(audioctx.destination);
            oscillator.start();
            isPlaying = true;
            console.log(fftsizes[fftsizeindex]);

        }
    });
    document.getElementById("stop").addEventListener("click",()=>{
        if(oscillator) {
            oscillator.stop();
        }
        oscillator = null;
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
    document.getElementById("fftsize").addEventListener("input",(ev)=>{
        fftsizeindex = ev.target.selectedIndex;
    });
    document.getElementById("mode").addEventListener("change",(ev)=>{
        mode = ev.target.selectedIndex;
    });
    document.getElementById("smoothing").addEventListener("input",(ev)=>{
        analyser.smoothingTimeConstant = document.getElementById("smoothingval").innerHTML = ev.target.value;
    });

    const canvas = document.getElementById("graph");
    const canvasctx = canvas.getContext("2d");
    function DrawGraph() {
        const times = analyser.fftSize;
        const data = new Uint8Array(times);
        const width = canvas.width;
        const height = canvas.height;

        var paddingTop = 20;
        var paddingBottom = 20;
        var paddingLeft = 30;
        var paddingRight = 30;

        var innerWidth = width - paddingLeft - paddingRight;
        var innerHeight = height - paddingTop - paddingBottom;

        // Clear previous data
        canvasctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw sound wave
        canvasctx.beginPath();

        if(mode == 0) {
            analyser.getByteFrequencyData(data); //Spectrum Data
        } else {
            analyser.getByteTimeDomainData(data); //Waveform Data
        }

        for(var i = 0; i < times; ++i) {
            var x = Math.floor((i / times) * innerWidth) + paddingLeft;
            var y = Math.floor((1 - (data[i] / 255)) * (innerHeight)) + paddingRight;
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
