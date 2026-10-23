import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Square, RefreshCw, Target, Coffee } from 'lucide-react';
import Modal from './Modal';
import DuckMascot from './DuckMascot';
import { cn } from '../lib/theme';

const POMODORO_WORK = 25 * 60;
const POMODORO_BREAK = 5 * 60;

function formatHMS(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

type Props = { open: boolean; onClose: () => void; onComplete: (minutes: number) => void };

export default function StudyTimerDialog({ open, onClose, onComplete }: Props) {
  const [mode, setMode] = useState<'stopwatch' | 'pomodoro'>('stopwatch');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [pomoRemaining, setPomoRemaining] = useState(POMODORO_WORK);
  const [pomoPhase, setPomoPhase] = useState<'work' | 'break'>('work');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (open) {
      setRunning(false); setElapsed(0); setPomoRemaining(POMODORO_WORK);
      setPomoPhase('work'); setMode('stopwatch');
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [open]);

  const tick = useCallback(() => {
    if (mode === 'stopwatch') {
      setElapsed(e => e + 1);
    } else {
      setPomoRemaining(r => {
        if (r <= 1) {
          setRunning(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (pomoPhase === 'work') {
            onComplete(Math.round(POMODORO_WORK / 60));
            setPomoPhase('break');
            return POMODORO_BREAK;
          }
          setPomoPhase('work');
          return POMODORO_WORK;
        }
        return r - 1;
      });
    }
  }, [mode, pomoPhase, onComplete]);

  const start = () => { setRunning(true); intervalRef.current = setInterval(tick, 1000); };
  const pause = () => { setRunning(false); if (intervalRef.current) clearInterval(intervalRef.current); };
  const reset = () => {
    setRunning(false); if (intervalRef.current) clearInterval(intervalRef.current);
    setElapsed(0); setPomoRemaining(POMODORO_WORK); setPomoPhase('work');
  };
  const finish = () => {
    setRunning(false); if (intervalRef.current) clearInterval(intervalRef.current);
    let minutes = 0;
    if (mode === 'stopwatch') minutes = Math.round(elapsed / 60);
    else {
      const workedSecs = pomoPhase === 'work' ? POMODORO_WORK - pomoRemaining : POMODORO_WORK;
      minutes = Math.round(workedSecs / 60);
    }
    if (minutes > 0) onComplete(minutes);
    reset();
  };

  const displayTime = mode === 'stopwatch' ? formatHMS(elapsed) : formatHMS(pomoRemaining);
  const progress = mode === 'pomodoro'
    ? pomoPhase === 'work'
      ? ((POMODORO_WORK - pomoRemaining) / POMODORO_WORK) * 100
      : ((POMODORO_BREAK - pomoRemaining) / POMODORO_BREAK) * 100
    : 0;
  const canFinish = mode === 'stopwatch' ? elapsed > 0 : (pomoPhase === 'work' ? POMODORO_WORK - pomoRemaining > 0 : false);

  return (
    <Modal
      open={open}
      onClose={running ? () => {} : onClose}
      title="Cronômetro de Estudo"
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={running}
            className="btn btn-secondary px-4 py-2 text-xs"
          >
            Fechar
          </button>
          <button
            onClick={finish}
            disabled={!canFinish}
            className="btn btn-primary px-4 py-2 text-xs"
          >
            <Square size={14} strokeWidth={2.6} /> Finalizar
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-5 py-2">
        {/* Segmented Mode Selector */}
        <div className="flex p-1 bg-gray-100 dark:bg-white/10 rounded-full">
          {(['stopwatch', 'pomodoro'] as const).map(m => (
            <button
              key={m}
              onClick={() => { if (!running) { reset(); setMode(m); } }}
              disabled={running}
              className={cn(
                'px-4 py-1.5 rounded-full font-display text-xs font-bold transition-all',
                mode === m
                  ? 'bg-white text-tinta dark:bg-[#14102A] dark:text-texto shadow-xs'
                  : 'text-muted hover:text-tinta dark:text-gray-400 dark:hover:text-white'
              )}
            >
              {m === 'stopwatch' ? 'Livre' : 'Pomodoro (25/5)'}
            </button>
          ))}
        </div>

        {mode === 'pomodoro' && (
          <span
            className={cn(
              'px-3 py-1 rounded-full font-display text-xs font-bold inline-flex items-center gap-1.5',
              pomoPhase === 'work'
                ? 'bg-[#6F00D6]/15 text-[#6F00D6] dark:text-[#9B3DFF]'
                : 'bg-amber-500/15 text-[#D68200] dark:text-[#FFB84D]'
            )}
          >
            {pomoPhase === 'work' ? (
              <>
                <Target size={13} strokeWidth={2.4} /> Foco
              </>
            ) : (
              <>
                <Coffee size={13} strokeWidth={2.4} /> Pausa
              </>
            )}
          </span>
        )}

        {/* Circular Dial */}
        <div className="relative">
          <div
            className="flex h-48 w-48 items-center justify-center rounded-full transition-all"
            style={{
              background: mode === 'pomodoro'
                ? `conic-gradient(#6F00D6 ${progress * 3.6}deg, rgba(20, 16, 42, 0.06) 0deg)`
                : 'transparent',
            }}
          >
            <div className="flex h-44 w-44 flex-col items-center justify-center rounded-full bg-white dark:bg-[#14102A] shadow-soft border border-gray-100 dark:border-white/10">
              <div className="font-display text-[2rem] font-bold leading-none tracking-tight text-tinta dark:text-texto">
                {displayTime}
              </div>
              <div className="mt-1.5 text-xs font-semibold text-muted dark:text-gray-400">
                {mode === 'stopwatch' ? 'Tempo corrido' : pomoPhase === 'work' ? '25m foco' : '5m pausa'}
              </div>
            </div>
          </div>
        </div>

        <DuckMascot size={48} mood={running ? 'studying' : 'happy'} animate={running} />

        {/* Control Buttons */}
        <div className="flex flex-wrap justify-center gap-2.5">
          {!running ? (
            <button
              onClick={start}
              className="btn btn-primary px-5 py-2.5 text-xs font-bold"
            >
              <Play size={15} strokeWidth={2.8} /> {elapsed > 0 || (mode === 'pomodoro' && pomoRemaining < POMODORO_WORK) ? 'Continuar' : 'Iniciar'}
            </button>
          ) : (
            <button
              onClick={pause}
              className="btn bg-[#6F00D6] hover:bg-[#7D12EC] text-white px-5 py-2.5 text-xs font-bold"
            >
              <Pause size={15} strokeWidth={2.8} /> Pausar
            </button>
          )}
          <button
            onClick={reset}
            disabled={running || (elapsed === 0 && pomoRemaining === POMODORO_WORK)}
            className="btn btn-secondary px-4 py-2.5 text-xs font-bold"
          >
            <RefreshCw size={14} strokeWidth={2.4} /> Resetar
          </button>
        </div>
      </div>
    </Modal>
  );
}
