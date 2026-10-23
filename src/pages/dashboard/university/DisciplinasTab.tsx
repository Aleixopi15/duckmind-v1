import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { cn } from '../../../lib/theme';
import Modal from '../../../components/Modal';
import {
  BookOpen,
  Plus,
  Clock,
  GraduationCap,
  Calendar,
  MapPin,
  User,
  Edit2,
  Trash2,
  Sparkles,
  Layers,
  Award,
} from 'lucide-react';
import type { UniversitySubject } from '../../../lib/supabase';

const COLOR_PRESETS = [
  '#6F00D6', // Purple DuckMind
  '#00D64B', // Green DuckMind
  '#0284c7', // Sky blue
  '#d97706', // Amber
  '#e11d48', // Rose
  '#7c3aed', // Violet
  '#0d9488', // Teal
  '#475569', // Slate
];

export default function DisciplinasTab() {
  const {
    universitySubjects,
    universityGrades,
    universityTasks,
    universitySessions,
    addUniversitySubject,
    updateUniversitySubject,
    deleteUniversitySubject,
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<UniversitySubject | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [professor, setProfessor] = useState('');
  const [room, setRoom] = useState('');
  const [schedule, setSchedule] = useState('');
  const [credits, setCredits] = useState('4');
  const [targetHours, setTargetHours] = useState('4');
  const [color, setColor] = useState('#6F00D6');
  const [semester, setSemester] = useState('2026.1');
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditingSubject(null);
    setName('');
    setCode('');
    setProfessor('');
    setRoom('');
    setSchedule('');
    setCredits('4');
    setTargetHours('4');
    setColor('#6F00D6');
    setSemester('2026.1');
    setModalOpen(true);
  };

  const openEdit = (sub: UniversitySubject) => {
    setEditingSubject(sub);
    setName(sub.name);
    setCode(sub.code || '');
    setProfessor(sub.professor || '');
    setRoom(sub.room || '');
    setSchedule(sub.schedule || '');
    setCredits(String(sub.credits || 4));
    setTargetHours(String(sub.target_hours_weekly || 4));
    setColor(sub.color || '#6F00D6');
    setSemester(sub.semester || '2026.1');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    if (editingSubject) {
      await updateUniversitySubject(editingSubject.id, {
        name: name.trim(),
        code: code.trim() || null,
        professor: professor.trim() || null,
        room: room.trim() || null,
        schedule: schedule.trim() || null,
        credits: parseInt(credits) || 4,
        target_hours_weekly: parseFloat(targetHours) || 4,
        color,
        semester: semester.trim() || '2026.1',
      });
    } else {
      await addUniversitySubject({
        name: name.trim(),
        code: code.trim() || null,
        professor: professor.trim() || null,
        room: room.trim() || null,
        schedule: schedule.trim() || null,
        credits: parseInt(credits) || 4,
        target_hours_weekly: parseFloat(targetHours) || 4,
        color,
        icon: 'BookOpen',
        semester: semester.trim() || '2026.1',
      });
    }
    setSaving(false);
    setModalOpen(false);
  };

  const totalCredits = universitySubjects.reduce((acc, s) => acc + (s.credits || 0), 0);
  const totalTargetHours = universitySubjects.reduce((acc, s) => acc + (s.target_hours_weekly || 0), 0);

  // Calculate current week studied minutes per subject
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const getSubjectStudiedHours = (subjectId: string) => {
    const mins = universitySessions
      .filter(s => s.subject_id === subjectId && new Date(s.studied_at) >= startOfWeek)
      .reduce((acc, s) => acc + s.duration_minutes, 0);
    return Math.round((mins / 60) * 10) / 10;
  };

  const getSubjectAverage = (subjectId: string) => {
    const grades = universityGrades.filter(g => g.subject_id === subjectId && g.score !== null);
    if (grades.length === 0) return null;
    const sumWeighted = grades.reduce((acc, g) => acc + (g.score || 0) * (g.weight || 1), 0);
    const sumWeights = grades.reduce((acc, g) => acc + (g.weight || 1), 0);
    return sumWeights > 0 ? (sumWeighted / sumWeights).toFixed(1) : null;
  };

  return (
    <div className="w-full max-w-5xl min-w-0 animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00D64B]/15 px-3 py-0.5 text-xs font-bold text-[#008E32] dark:text-[#19E85F]">
              <Sparkles size={12} strokeWidth={2.6} /> Semestre 2026.1
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-[#F3F1FF]">
            Disciplinas da Graduação
          </h1>
          <p className="mt-1 text-sm font-medium text-[#645F78] dark:text-[#9D96B8]">
            Acompanhe suas matérias, carga horária, locais de aula e metas de estudo semanais.
          </p>
        </div>

        <button
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00D64B] px-5 py-2.5 text-xs font-bold text-[#14102A] shadow-[0_4px_16px_rgba(25,232,95,0.3)] transition-all hover:bg-[#19E85F] active:scale-[0.98] dark:bg-[#19E85F] dark:hover:bg-[#25f46c]"
        >
          <Plus size={16} strokeWidth={3} />
          <span>Nova Disciplina</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Matriculadas</span>
            <BookOpen size={16} className="text-[#6F00D6] dark:text-[#9B3DFF]" />
          </div>
          <div className="mt-2 text-2xl font-display font-bold text-[#14102A] dark:text-white">
            {universitySubjects.length}
          </div>
          <div className="mt-0.5 text-[11px] text-[#645F78] dark:text-[#9D96B8]">Disciplinas ativas</div>
        </div>

        <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Créditos</span>
            <Award size={16} className="text-[#00D64B] dark:text-[#19E85F]" />
          </div>
          <div className="mt-2 text-2xl font-display font-bold text-[#14102A] dark:text-white">
            {totalCredits} <span className="text-sm font-normal text-muted">créd</span>
          </div>
          <div className="mt-0.5 text-[11px] text-[#645F78] dark:text-[#9D96B8]">Carga no semestre</div>
        </div>

        <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Meta Semanal</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-display font-bold text-[#14102A] dark:text-white">
            {totalTargetHours}h
          </div>
          <div className="mt-0.5 text-[11px] text-[#645F78] dark:text-[#9D96B8]">Estudo fora de aula</div>
        </div>

        <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Tarefas Ativas</span>
            <Layers size={16} className="text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-display font-bold text-[#14102A] dark:text-white">
            {universityTasks.filter(t => t.status !== 'done').length}
          </div>
          <div className="mt-0.5 text-[11px] text-[#645F78] dark:text-[#9D96B8]">Entregas pendentes</div>
        </div>
      </div>

      {/* Grid de Disciplinas */}
      {universitySubjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 p-12 text-center dark:border-white/10 dark:bg-[#131024]/50">
          <GraduationCap size={48} className="text-[#6F00D6]/60 dark:text-[#9B3DFF]/60" />
          <h3 className="mt-4 font-display text-lg font-bold text-[#14102A] dark:text-white">
            Nenhuma disciplina cadastrada
          </h3>
          <p className="mt-1 max-w-sm text-xs text-[#645F78] dark:text-[#9D96B8]">
            Cadastre as matérias do seu semestre para calcular médias, acompanhar tarefas e bater metas semanais.
          </p>
          <button
            onClick={openNew}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#00D64B] px-5 py-2 text-xs font-bold text-[#14102A] hover:bg-[#19E85F]"
          >
            <Plus size={15} strokeWidth={3} /> Cadastrar primeira matéria
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {universitySubjects.map(sub => {
            const studiedHours = getSubjectStudiedHours(sub.id);
            const target = sub.target_hours_weekly || 4;
            const pct = Math.min(100, Math.round((studiedHours / target) * 100));
            const avg = getSubjectAverage(sub.id);
            const pendingTasksCount = universityTasks.filter(t => t.subject_id === sub.id && t.status !== 'done').length;

            return (
              <div
                key={sub.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-[#6F00D6]/30 hover:shadow-md dark:border-white/5 dark:bg-[#131024]"
              >
                {/* Top bar accent */}
                <div
                  className="absolute left-0 top-0 h-1.5 w-full"
                  style={{ background: sub.color || '#6F00D6' }}
                />

                <div>
                  {/* Header card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold text-white shadow-xs"
                        style={{ background: sub.color || '#6F00D6' }}
                      >
                        {sub.code ? sub.code.slice(0, 3).toUpperCase() : sub.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        {sub.code && (
                          <span className="text-[10px] font-bold tracking-wider uppercase text-muted">
                            {sub.code} · {sub.credits} créditos
                          </span>
                        )}
                        <h3 className="font-display text-base font-bold text-[#14102A] dark:text-white line-clamp-1">
                          {sub.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(sub)}
                        title="Editar disciplina"
                        className="rounded-lg p-1.5 text-muted hover:bg-slate-100 hover:text-tinta dark:hover:bg-white/10 dark:hover:text-white transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir ${sub.name}? Isso removerá notas e tarefas vinculadas.`)) {
                            deleteUniversitySubject(sub.id);
                          }
                        }}
                        title="Excluir disciplina"
                        className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Informações detalhadas */}
                  <div className="mt-3.5 space-y-1.5 text-xs text-[#645F78] dark:text-[#9D96B8]">
                    {sub.professor && (
                      <div className="flex items-center gap-2">
                        <User size={13} className="shrink-0 text-muted" />
                        <span className="truncate">{sub.professor}</span>
                      </div>
                    )}
                    {sub.schedule && (
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="shrink-0 text-muted" />
                        <span className="truncate">{sub.schedule}</span>
                      </div>
                    )}
                    {sub.room && (
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="shrink-0 text-muted" />
                        <span className="truncate">{sub.room}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer card com progresso semanal e métricas */}
                <div className="mt-5 border-t border-slate-100 dark:border-white/5 pt-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-muted">Horas nesta semana</span>
                    <span className="font-bold text-[#14102A] dark:text-white">
                      {studiedHours}h / {target}h ({pct}%)
                    </span>
                  </div>

                  {/* Barra de progresso */}
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: sub.color || '#6F00D6',
                      }}
                    />
                  </div>

                  {/* Badges de rodapé */}
                  <div className="mt-3 flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      {avg !== null ? (
                        <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-[#008E32] dark:text-[#19E85F]">
                          Média: {avg}
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-muted dark:bg-white/5">
                          Sem provas
                        </span>
                      )}

                      {pendingTasksCount > 0 && (
                        <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-[#D68200] dark:text-[#FFB84D]">
                          {pendingTasksCount} {pendingTasksCount === 1 ? 'tarefa' : 'tarefas'}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-semibold text-muted">
                      {sub.semester || '2026.1'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSubject ? 'Editar Disciplina' : 'Nova Disciplina da Faculdade'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
                Nome da Disciplina *
              </label>
              <input
                required
                type="text"
                placeholder="Ex: Cálculo Diferencial e Integral I"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-texto"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
                Código
              </label>
              <input
                type="text"
                placeholder="Ex: MAT101"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-texto"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
                Professor(a)
              </label>
              <input
                type="text"
                placeholder="Ex: Prof. Dr. Roberto Dias"
                value={professor}
                onChange={e => setProfessor(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-texto"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
                Sala / Laboratório
              </label>
              <input
                type="text"
                placeholder="Ex: Prédio 4 · Sala 202"
                value={room}
                onChange={e => setRoom(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-texto"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
                Horário da Aula
              </label>
              <input
                type="text"
                placeholder="Ex: Seg e Qua 08:00"
                value={schedule}
                onChange={e => setSchedule(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-texto"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
                Créditos
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={credits}
                onChange={e => setCredits(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-texto"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
                Meta Semanal (Horas)
              </label>
              <input
                type="number"
                min={1}
                max={40}
                value={targetHours}
                onChange={e => setTargetHours(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-texto"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              Cor de Destaque
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {COLOR_PRESETS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'h-7 w-7 rounded-full transition-transform',
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-[#00D64B] dark:ring-offset-[#131024]' : 'hover:scale-110'
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-full px-4 py-2 text-xs font-bold text-muted hover:bg-slate-100 dark:hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#00D64B] px-5 py-2 text-xs font-bold text-[#14102A] hover:bg-[#19E85F] disabled:opacity-50"
            >
              {saving ? 'Salvando...' : editingSubject ? 'Atualizar' : 'Cadastrar Matéria'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
