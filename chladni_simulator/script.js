
const canvas = document.getElementById("chladniCanvas");
const c = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;
const L = width;

const sliderN = document.getElementById("sliderN");
const sliderM = document.getElementById("sliderM");
const valN = document.getElementById("valN");
const valM = document.getElementById("valM");
const mathOutput = document.getElementById("mathOutput");

//sistema de audio
let audioCtx = null;
let oscillator = null;
let gainNode = null;
let isAudioInitialized = false;
// os navegadores bloqueiam som automático , só libera qdo o usuario intera

function iniciarAudio() {
    if (isAudioInitialized) return;
    try {
        //cria um contexto de audio do tipo onda cossenoidal
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        oscillator = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();

        oscillator.type = 'cosine';
        //controla para q não começe num volume muito alto, sem susto, vai progressivamente

        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        oscillator.connect(gainNode);
        //conecta o gerador de som aos auto_falantes da máquina

        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        isAudioInitialized = true;
    } catch (e) {
        console.log("Áudio não suportado ou bloqueado.");
    }
}
//Relaciona os numeros dos modos n e m em uma frequencia real em hertz
function atualizarSomEFisica(n, m) {
    let valorModos = Math.sqrt(n * n + m * m);
    let minModos = Math.sqrt(1 * 1 + 1 * 1);       
    let maxModos = Math.sqrt(10 * 10 + 10 * 10); 
    let proporcao = (valorModos - minModos) / (maxModos - minModos);

    let freqMin = 20;
    let freqMax = 20000;
    
    let novaFreq = freqMin + (valorModos - minModos) / (maxModos - minModos) * (freqMax - freqMin);
// se o valor de m e n mudam nos sliders a frequência do oscilador de audio tambem altera
    if (isAudioInitialized && oscillator && audioCtx) {
        oscillator.frequency.setValueAtTime(novaFreq, audioCtx.currentTime);
    }

    let freqTexto = novaFreq >= 1000 ? `${(novaFreq / 1000).toFixed(2)} kHz` : `${novaFreq.toFixed(1)} Hz`;
//atualiza a caixinha de equações
    if (mathOutput) {
        mathOutput.innerHTML = `Modos: n = ${n}, m = ${m} | Frequência: <strong>${freqTexto}</strong><br>` +
                               `Fórmula Atual: cos(${n}&pi;x/L)·cos(${m}&pi;y/L) - cos(${m}&pi;x/L)·cos(${n}&pi;y/L) = 0`;
    }
}
//Mostra as alterações na nova janela
function desenha_chladni() {
    if (!sliderN || !sliderM) return;

    const n = parseInt(sliderN.value);
    const m = parseInt(sliderM.value);

    if (valN) valN.textContent = n;
    if (valM) valM.textContent = m;

    atualizarSomEFisica(n, m);

    c.fillStyle = "black";
    c.fillRect(0, 0, width, height);

    c.fillStyle = "white";

    const step = 2;
    const tolerance = 0.08;

    for (let x = 0; x < width; x += step) {
        for (let y = 0; y < height; y += step) {
            let t1 = Math.cos(n*Math.PI*x/L)*Math.cos(m*Math.PI*y/L);
            let t2 = Math.cos(m*Math.PI*x/L)*Math.cos(n*Math.PI*y/L);

            let res = t1 - t2;

            if (Math.abs(res) < tolerance) {
                c.fillRect(x, y, 1.5, 1.5);
            }
        }
    }
}

window.addEventListener('click', () => {
    iniciarAudio();
    if (sliderN && sliderM) {
        atualizarSomEFisica(parseInt(sliderN.value), parseInt(sliderM.value));
    }
}, { once: true });

if (sliderN && sliderM) {
    sliderN.addEventListener("input", desenha_chladni);
    sliderM.addEventListener("input", desenha_chladni);c
}

desenha_chladni();
