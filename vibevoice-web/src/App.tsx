import { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { VoiceSelector } from './components/VoiceSelector';
import { TTSInput } from './components/TTSInput';
import { Controls } from './components/Controls';
import { AudioVisualizer } from './components/AudioVisualizer';
import { fetchConfig, TTSWebSocket } from './services/api';
import { Play, Square, Loader2, AlertCircle } from 'lucide-react';

function App() {
  const [voices, setVoices] = useState<string[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [text, setText] = useState<string>('Enter your text here and click "Start" to instantly hear the VibeVoice-Realtime TTS output audio.');
  const [cfg, setCfg] = useState<number>(1.5);
  const [steps, setSteps] = useState<number>(5);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const wsRef = useRef<TTSWebSocket | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);

  // Initialize Audio Context
  const initAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext({ sampleRate: 24000 });
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  // Fetch Config
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await fetchConfig();
        setVoices(config.voices);
        if (config.default_voice) {
          setSelectedVoice(config.default_voice);
        } else if (config.voices.length > 0) {
          setSelectedVoice(config.voices[0]);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load config:', err);
        setError('Failed to connect to backend. Is it running?');
        setIsLoading(false);
      }
    };
    loadConfig();
  }, []);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${time}] ${msg}`, ...prev].slice(0, 50));
  };

  const handlePlay = async () => {
    if (isPlaying) {
      // Stop
      wsRef.current?.close();
      setIsPlaying(false);
      isPlayingRef.current = false;
      addLog('Stopped by user');
      return;
    }

    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    setError(null);
    initAudioContext();
    setIsPlaying(true);
    isPlayingRef.current = true;
    nextStartTimeRef.current = audioCtxRef.current!.currentTime + 0.1; // Small buffer

    addLog('Connecting to WebSocket...');

    wsRef.current = new TTSWebSocket('/stream', {
      onOpen: () => {
        addLog('Connected. Streaming audio...');
      },
      onMessage: async (data) => {
        if (data instanceof ArrayBuffer) {
          // Audio Data
          await playAudioChunk(data);
        } else {
          // JSON Log
          try {
            const msg = JSON.parse(data);
            if (msg.type === 'log') {
              // Optional: handle backend logs
            }
          } catch (e) {
            // ignore
          }
        }
      },
      onClose: () => {
        addLog('Stream finished');
        setIsPlaying(false);
        isPlayingRef.current = false;
      },
      onError: (e) => {
        console.error('WebSocket error', e);
        setError('WebSocket connection error');
        setIsPlaying(false);
        isPlayingRef.current = false;
      },
    });

    wsRef.current.connect({
      text,
      cfg,
      steps,
      voice: selectedVoice,
    });
  };

  const playAudioChunk = async (arrayBuffer: ArrayBuffer) => {
    if (!audioCtxRef.current || !isPlayingRef.current) return;

    // Convert Int16 PCM to Float32
    const int16Data = new Int16Array(arrayBuffer);
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
      float32Data[i] = int16Data[i] / 32768.0;
    }

    const buffer = audioCtxRef.current.createBuffer(1, float32Data.length, 24000);
    buffer.getChannelData(0).set(float32Data);

    const source = audioCtxRef.current.createBufferSource();
    source.buffer = buffer;

    if (analyserRef.current) {
      source.connect(analyserRef.current);
    } else {
      source.connect(audioCtxRef.current.destination);
    }

    const startTime = Math.max(audioCtxRef.current.currentTime, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + buffer.duration;
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 flex justify-center">
      <div className="w-full max-w-5xl bg-surface rounded-3xl shadow-soft p-8 md:p-10 flex flex-col gap-8">
        <Header />

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Controls */}
          <div className="flex flex-col gap-6">
            <VoiceSelector
              voices={voices}
              selectedVoice={selectedVoice}
              onChange={setSelectedVoice}
              disabled={isPlaying || isLoading}
            />
            <Controls
              cfg={cfg}
              setCfg={setCfg}
              steps={steps}
              setSteps={setSteps}
              disabled={isPlaying || isLoading}
            />
          </div>

          {/* Right Column: Input & Visualizer */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <TTSInput
              value={text}
              onChange={setText}
              disabled={isPlaying}
            />

            <AudioVisualizer
              analyser={analyserRef.current}
              isPlaying={isPlaying}
            />

            <div className="flex items-center justify-between mt-2">
              <div className="text-sm text-text-muted">
                {isPlaying ? 'Streaming audio...' : 'Ready to generate'}
              </div>
              <button
                onClick={handlePlay}
                disabled={isLoading}
                className={`
                  flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-white shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0
                  ${isPlaying
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/25'
                    : 'bg-primary hover:bg-primary-hover shadow-primary/25'}
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : isPlaying ? (
                  <>
                    <Square size={18} fill="currentColor" /> Stop
                  </>
                ) : (
                  <>
                    <Play size={18} fill="currentColor" /> Start Generation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="mt-4 p-4 bg-background/50 rounded-xl border border-border/50 h-32 overflow-y-auto custom-scrollbar font-mono text-xs text-text-muted">
          {logs.length === 0 ? (
            <span className="opacity-50">System logs will appear here...</span>
          ) : (
            logs.map((log, i) => <div key={i}>{log}</div>)
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
