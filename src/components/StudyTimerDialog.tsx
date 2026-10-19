import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Square, RefreshCw } from 'lucide-react';
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
      title="Cronômetro"
      size="sm"
      footer={
        <>
          <button onClick={onClose} disabled={running} className="btn bg-white px-4 py-2 text-sm dark:border-papel dark:bg-transparent dark:text-papel">
            Fechar
          </button>
          <button onClick={finish} disabled={!canFinish} className="btn bg-pato px-4 py-2 text-sm text-tinta dark:border-papel">
            <Square size={15} strokeWidth={2.8} /> Finalizar
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          {(['stopwatch', 'pomodoro'] as const).map(m => (
            <button
              key={m}
              onClick={() => { if (!running) { reset(); setMode(m); } }}
              disabled={running}
              className={cn(
                'rounded-[14px] border-[3px] border-tinta px-4 py-1.5 font-display text-sm font-bold transition-transform dark:border-papel',
                mode === m
                  ? 'bg-pato text-tinta shadow-brutal-sm'
                  : 'bg-white text-tinta hover:-translate-y-px dark:bg-transparent dark:text-papel',
              )}
            >
              {m === 'stopwatch' ? 'Cronômetro' : 'Pomodoro'}
            </button>
          ))}
        </div>

        {mode === 'pomodoro' && (
          <span className={cn('chip', pomoPhase === 'work' ? 'bg-mente text-papel' : 'bg-bico text-tinta')}>
            {pomoPhase === 'work' ? '🎯 Foco' : '☕ Pausa'}
          </span>
        )}

        <div className="relative mt-1">
          <div
            className="flex h-48 w-48 items-center justify-center rounded-full border-[3px] border-tinta dark:border-papel"
            style={{
              background: mode === 'pomodoro'
                ? `conic-gradient(#6F00D6 ${progress * 3.6}deg, #FFF9EC 0deg)`
                : '#FFF9EC',
              transition: 'background 0.3s linear',
            }}
          >
            <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full border-[3px] border-tinta bg-white dark:border-papel dark:bg-surface-dark-card">
              <div className="font-display text-[1.85rem] font-bold leading-none text-tinta dark:text-papel">{displayTime}</div>
              <div className="mt-1 text-xs font-bold text-muted dark:text-papel/60">
                {mode === 'stopwatch' ? 'Cronômetro' : pomoPhase === 'work' ? '25 min foco' : '5 min pausa'}
              </div>
            </div>
          </div>
        </div>

        <DuckMascot size={52} mood={running ? 'studying' : 'happy'} animate={running} />

        <div className="flex flex-wrap justify-center gap-2">
          {!running ? (
            <button onClick={start} className="btn bg-pato px-4 py-2 text-sm text-tinta dark:border-papel">
              <Play size={16} strokeWidth={2.8} /> {elapsed > 0 || (mode === 'pomodoro' && pomoRemaining < POMODORO_WORK) ? 'Continuar' : 'Iniciar'}
            </button>
          ) : (
            <button onClick={pause} className="btn bg-mente px-4 py-2 text-sm text-papel dark:border-papel">
              <Pause size={16} strokeWidth={2.8} /> Pausar
            </button>
          )}
          <button onClick={reset} disabled={running} className="btn bg-white px-4 py-2 text-sm dark:border-papel dark:bg-transparent dark:text-papel">
            <RefreshCw size={16} strokeWidth={2.8} /> Resetar
          </button>
        </div>
      </div>
    </Modal>
  );
}
