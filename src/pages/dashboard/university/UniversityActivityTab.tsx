import { useState, useMemo } from 'react';
import type { ElementType } from 'react';
import { useApp } from '../../../context/AppContext';
import { cn } from '../../../lib/theme';
import { formatLocalDateBR } from '../../../lib/dateUtils';
import Modal from '../../../components/Modal';
import DuckMascot from '../../../components/DuckMascot';
import SubjectIcon from '../../../components/SubjectIcon';
import {
  History,
  Search,
  Clock,
  Calendar,
  Trash2,
  BookOpen,
  School,
  RotateCcw,
  Laptop,
  PenLine,
} from 'lucide-react';
import type { UniversitySessionType } from '../../../lib/supabase';

const PERIODS = [
  { id: '7d', label: '7d' },
  { id: '30d', label: '30d' },
  { id: '90d', label: '90d' },
  { id: 'all', label: 'Tudo' },
];

const SESSION_TYPE_CONFIG: Record<
  UniversitySessionType,
  { label: string; icon: ElementType; color: string }
> = {
  estudo: { label: 'Estudo Teórico', icon: BookOpen, color: 'bg-emerald-500/15 text-[#008E32] dark:text-[#19E85F]' },
  aula: { label: 'Presencial / Aula', icon: School, color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  revisao: { label: 'Revisão', icon: RotateCcw, color: 'bg-[#6F00D6]/15 text-[#6F00D6] dark:text-[#B379FF]' },
  projeto: { label: 'Projeto & Lab', icon: Laptop, color: 'bg-amber-500/15 text-[#D68200] dark:text-[#FFB84D]' },
  exercicios: { label: 'Exercícios / Lista', icon: PenLine, color: 'bg-pink-500/15 text-pink-600 dark:text-pink-400' },
};

export default function UniversityActivityTab() {
  const {
    universitySessions,
    universitySubjects,
    universityTasks,
    universityGrades,
    deleteUniversitySession,
  } = useApp();

  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered study sessions
  const filteredSessions = useMemo(() => {
    let list = [...universitySessions];

    if (filterSubjectId !== 'all') {
      list = list.filter(s => s.subject_id === filterSubjectId);
    }

    if (filterType !== 'all') {
      list = list.filter(s => s.session_type === filterType);
    }

    if (filterPeriod !== 'all') {
      const ranges: Record<string, number> = {
        '7d': 7 * 86400000,
        '30d': 30 * 86400000,
        '90d': 90 * 86400000,
      };
      const cutoff = new Date(Date.now() - (ranges[filterPeriod] ?? 0)).toISOString();
      list = list.filter(s => s.studied_at >= cutoff);
    }

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(s => {
        const sub = universitySubjects.find(sb => sb.id === s.subject_id);
        return (
          (sub && sub.name.toLowerCase().includes(q)) ||
          (s.notes && s.notes.toLowerCase().includes(q))
        );
      });
    }

    return list.sort((a, b) => b.studied_at.localeCompare(a.studied_at));
  }, [universitySessions, universitySubjects, filterSubjectId, filterType, filterPeriod, searchText]);

  // Aggregate stats
  const totalMinutes = filteredSessions.reduce((a, s) => a + s.duration_minutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;

  const deliveredTasksCount = useMemo(() => {
    return universityTasks.filter(t => {
      if (t.status !== 'done') return false;
      if (filterSubjectId !== 'all' && t.subject_id !== filterSubjectId) return false;
      return true;
    }).length;
  }, [universityTasks, filterSubjectId]);

  const registeredGradesCount = useMemo(() => {
    return universityGrades.filter(g => {
      if (g.score === null) return false;
      if (filterSubjectId !== 'all' && g.subject_id !== filterSubjectId) return false;
      return true;
    }).length;
  }, [universityGrades, filterSubjectId]);

  const handleDelete = async (id: string) => {
    await deleteUniversitySession(id);
    setDeleteConfirmId(null);
  };

  const formatSessionDate = (isoStr: string) => {
    return formatLocalDateBR(isoStr);
  };

  return (
    <div className="w-full max-w-5xl min-w-0 animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-[#F3F1FF]">
          Atividade Universitária
        </h1>
        <p className="mt-1 text-sm font-medium text-[#645F78] dark:text-[#9D96B8]">
          Histórico e registro das suas sessões de estudo, aulas, laboratórios e trabalhos do semestre.
        </p>
      </div>

      {/* Cards de Métricas Acadêmicas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <span className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">Horas Dedicadas</span>
          <div className="mt-1 font-display text-2xl font-bold text-[#14102A] dark:text-white">
            {totalHours}h {remainingMins > 0 ? `${remainingMins}m` : ''}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <span className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">Sessões Registradas</span>
          <div className="mt-1 font-display text-2xl font-bold text-[#008E32] dark:text-[#19E85F]">
            {filteredSessions.length}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <span className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">Trabalhos Entregues</span>
          <div className="mt-1 font-display text-2xl font-bold text-[#6F00D6] dark:text-[#B379FF]">
            {deliveredTasksCount}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <span className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">Notas Publicadas</span>
          <div className="mt-1 font-display text-2xl font-bold text-amber-500">
            {registeredGradesCount}
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#131024]">
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro por Disciplina */}
          <select
            value={filterSubjectId}
            onChange={e => setFilterSubjectId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#6F00D6] dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="all">Todas as matérias</option>
            {universitySubjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Filtro por Tipo de Sessão */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#6F00D6] dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="all">Todos os tipos</option>
            <option value="estudo">Estudo Teórico</option>
            <option value="aula">Aula / Presencial</option>
            <option value="projeto">Projeto / Lab</option>
            <option value="exercicios">Exercícios / Listas</option>
            <option value="revisao">Revisão</option>
          </select>

          {/* Período */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-white/5">
            {PERIODS.map(p => (
              <button
                key={p.id}
                onClick={() => setFilterPeriod(p.id)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-xs font-bold transition-all',
                  filterPeriod === p.id
                    ? 'bg-white text-[#14102A] shadow-xs dark:bg-white/15 dark:text-white'
                    : 'text-muted hover:text-tinta dark:text-gray-400 dark:hover:text-white'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Busca textual */}
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Buscar por notas ou matéria…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs font-semibold text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#6F00D6] dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
      </div>

      {/* Linha do Tempo / Feed de Sessões */}
      <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-white/5 dark:bg-[#131024]">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6F00D6]/15 text-[#6F00D6] dark:text-[#B379FF]">
              <History size={15} strokeWidth={2.4} />
            </span>
            <h2 className="font-display text-base font-bold text-[#14102A] dark:text-white">
              Sessões Registradas ({filteredSessions.length})
            </h2>
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <DuckMascot size={70} mood="studying" />
            <h3 className="mt-3 font-display text-base font-bold text-[#14102A] dark:text-white">
              Nenhuma atividade encontrada
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted">
              Use o botão de registrar estudo para adicionar aulas, revisões e sessões de projeto da faculdade.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map(session => {
              const subject = universitySubjects.find(s => s.id === session.subject_id);
              const typeCfg =
                SESSION_TYPE_CONFIG[session.session_type] ||
                SESSION_TYPE_CONFIG.estudo;
              const TypeIcon = typeCfg.icon;

              const hours = Math.floor(session.duration_minutes / 60);
              const mins = session.duration_minutes % 60;

              return (
                <div
                  key={session.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 transition-all hover:border-[#6F00D6]/40 hover:bg-slate-50 dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg shadow-inner text-[#6F00D6] dark:text-[#9B3DFF]"
                      style={{
                        backgroundColor: subject ? `${subject.color}18` : '#6F00D618',
                      }}
                    >
                      <SubjectIcon name={subject?.name} size={18} />
                    </span>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-sm font-bold text-[#14102A] dark:text-white">
                          {subject?.name || 'Disciplina'}
                        </span>

                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                            typeCfg.color
                          )}
                        >
                          <TypeIcon size={12} strokeWidth={2.2} />
                          <span>{typeCfg.label}</span>
                        </span>

                        {subject?.code && (
                          <span className="rounded-md bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-mono font-bold text-[#645F78] dark:bg-white/10 dark:text-[#9D96B8]">
                            {subject.code}
                          </span>
                        )}
                      </div>

                      {session.notes && (
                        <p className="mt-1 text-xs text-[#645F78] dark:text-[#9D96B8] line-clamp-2">
                          {session.notes}
                        </p>
                      )}

                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted">
                        <Calendar size={12} />
                        <span>{formatSessionDate(session.studied_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-white/5 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5 font-display text-sm font-bold text-[#14102A] dark:text-white">
                      <Clock size={14} className="text-[#6F00D6] dark:text-[#B379FF]" />
                      <span>
                        {hours > 0 ? `${hours}h ` : ''}
                        {mins > 0 || hours === 0 ? `${mins}m` : ''}
                      </span>
                    </div>

                    <button
                      onClick={() => setDeleteConfirmId(session.id)}
                      className="rounded-lg p-1.5 text-muted opacity-80 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                      title="Excluir sessão"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      {deleteConfirmId && (
        <Modal
          open={Boolean(deleteConfirmId)}
          onClose={() => setDeleteConfirmId(null)}
          title="Excluir Sessão"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-[#645F78] dark:text-[#9D96B8]">
              Tem certeza que deseja excluir esta sessão de estudo universitário? O tempo acumulado será removido das estatísticas.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-full px-4 py-2 text-xs font-bold text-muted hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="rounded-full bg-red-600 px-5 py-2 text-xs font-bold text-white transition-all hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
