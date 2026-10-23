import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/theme';
import Modal from '../../components/Modal';
import SubjectIcon from '../../components/SubjectIcon';
import {
  Plus,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Edit2,
  Trash2,
  CircleDashed,
  Kanban as KanbanIcon,
  List as ListIcon,
  AlertTriangle,
} from 'lucide-react';
import type { VestibularTask, VestibularTaskPriority, VestibularTaskStatus } from '../../lib/supabase';

const COLUMNS: {
  id: VestibularTaskStatus;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  badgeColor: string;
}[] = [
  {
    id: 'todo',
    label: 'A Fazer',
    icon: CircleDashed,
    color: 'border-slate-300 dark:border-white/10',
    badgeColor: 'text-[#645F78] dark:text-[#9D96B8]',
  },
  {
    id: 'in_progress',
    label: 'Em Andamento',
    icon: Clock,
    color: 'border-amber-500/40',
    badgeColor: 'text-amber-500',
  },
  {
    id: 'done',
    label: 'Concluído',
    icon: CheckCircle2,
    color: 'border-emerald-500/40',
    badgeColor: 'text-[#008E32] dark:text-[#19E85F]',
  },
];

export default function VestibularTarefasTab() {
  const {
    subjects,
    vestibularTasks,
    addVestibularTask,
    updateVestibularTask,
    deleteVestibularTask,
  } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<VestibularTask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<VestibularTask | null>(null);

  // Form states
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<VestibularTaskPriority>('medium');
  const [status, setStatus] = useState<VestibularTaskStatus>('todo');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openNew = (defaultStatus: VestibularTaskStatus = 'todo') => {
    setEditingTask(null);
    setSubjectId(subjects[0]?.id ?? '');
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus(defaultStatus);
    setDueDate(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const openEdit = (task: VestibularTask) => {
    setEditingTask(task);
    setSubjectId(task.subject_id);
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !title.trim()) return;

    setSaving(true);
    if (editingTask) {
      await updateVestibularTask(editingTask.id, {
        subject_id: subjectId,
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        due_date: dueDate || null,
      });
    } else {
      await addVestibularTask({
        subject_id: subjectId,
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        due_date: dueDate || null,
      });
    }
    setSaving(false);
    setModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setDeleting(true);
    await deleteVestibularTask(taskToDelete.id);
    setDeleting(false);
    setTaskToDelete(null);
  };

  const moveStatus = async (task: VestibularTask, nextStatus: VestibularTaskStatus) => {
    await updateVestibularTask(task.id, { status: nextStatus });
  };

  const filteredTasks = vestibularTasks.filter(t => {
    if (selectedSubjectId !== 'all' && t.subject_id !== selectedSubjectId) return false;
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
    return true;
  });

  const getDaysDiff = (dateStr: string | null) => {
    if (!dateStr) return null;
    const diff = Math.ceil(
      (new Date(dateStr + 'T00:00:00').getTime() - new Date().setHours(0, 0, 0, 0)) /
        (1000 * 60 * 60 * 24)
    );
    if (diff < 0) return { label: `${Math.abs(diff)}d atrasado`, status: 'overdue' };
    if (diff === 0) return { label: 'Prazo hoje!', status: 'urgent' };
    if (diff === 1) return { label: 'Prazo amanhã', status: 'urgent' };
    if (diff <= 3) return { label: `Em ${diff} dias`, status: 'soon' };
    return { label: `Em ${diff} dias`, status: 'normal' };
  };

  const priorityColor = (p: VestibularTaskPriority) => {
    switch (p) {
      case 'high':
        return 'bg-red-500/15 text-red-600 dark:text-red-400';
      case 'medium':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
      case 'low':
        return 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white/60';
    }
  };

  const priorityLabel = (p: VestibularTaskPriority) => {
    switch (p) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
    }
  };

  const totalCount = vestibularTasks.length;
  const doneCount = vestibularTasks.filter(t => t.status === 'done').length;
  const pendingCount = totalCount - doneCount;
  const highPriorityCount = vestibularTasks.filter(
    t => t.priority === 'high' && t.status !== 'done'
  ).length;

  return (
    <div className="w-full max-w-5xl min-w-0 animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-[#F3F1FF]">
            Tarefas de Estudo
          </h1>
          <p className="mt-1 text-sm font-medium text-[#645F78] dark:text-[#9D96B8]">
            Gerencie listas de exercícios, leituras obrigatórias e metas do vestibular em formato Kanban.
          </p>
        </div>

        <button
          onClick={() => openNew('todo')}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#00D64B] px-4 py-2.5 text-xs font-bold text-[#14102A] shadow-xs transition-all hover:bg-[#19E85F] active:scale-[0.98] dark:text-[#0B0819]"
        >
          <Plus size={16} strokeWidth={2.6} /> Nova Tarefa
        </button>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <span className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">Total de Tarefas</span>
          <div className="mt-1 font-display text-2xl font-bold text-[#14102A] dark:text-white">{totalCount}</div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <span className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">Pendentes</span>
          <div className="mt-1 font-display text-2xl font-bold text-amber-500">{pendingCount}</div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <span className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">Concluídas</span>
          <div className="mt-1 font-display text-2xl font-bold text-[#008E32] dark:text-[#19E85F]">{doneCount}</div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <span className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">Alta Prioridade</span>
          <div className="mt-1 font-display text-2xl font-bold text-red-500">{highPriorityCount}</div>
        </div>
      </div>

      {/* Barra de Filtros e Modo de Visualização */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-white/5 dark:bg-[#131024]">
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro por Matéria */}
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="all">Todas as matérias</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Filtro por Prioridade */}
          <select
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="all">Todas prioridades</option>
            <option value="high">Alta prioridade</option>
            <option value="medium">Média prioridade</option>
            <option value="low">Baixa prioridade</option>
          </select>
        </div>

        {/* Alternância Kanban vs Lista */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-white/5">
          <button
            onClick={() => setViewMode('kanban')}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all',
              viewMode === 'kanban'
                ? 'bg-white text-[#14102A] shadow-xs dark:bg-white/15 dark:text-white'
                : 'text-muted hover:text-tinta dark:text-gray-400 dark:hover:text-white'
            )}
          >
            <KanbanIcon size={14} /> Kanban
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all',
              viewMode === 'list'
                ? 'bg-white text-[#14102A] shadow-xs dark:bg-white/15 dark:text-white'
                : 'text-muted hover:text-tinta dark:text-gray-400 dark:hover:text-white'
            )}
          >
            <ListIcon size={14} /> Lista
          </button>
        </div>
      </div>

      {/* Visualização KANBAN */}
      {viewMode === 'kanban' ? (
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map(col => {
            const ColIcon = col.icon;
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            return (
              <div
                key={col.id}
                className="flex flex-col rounded-[22px] border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/5 dark:bg-[#131024]/60"
              >
                {/* Col Header */}
                <div className="mb-3 flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <span className={cn('flex items-center', col.badgeColor)}>
                      <ColIcon size={16} />
                    </span>
                    <h3 className="font-display text-sm font-bold text-[#14102A] dark:text-white">
                      {col.label}
                    </h3>
                  </div>
                  <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[11px] font-bold text-[#645F78] dark:bg-white/10 dark:text-[#9D96B8]">
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards */}
                <div className="flex-1 space-y-3">
                  {colTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-6 text-center dark:border-white/10">
                      <p className="text-xs text-muted">Nenhuma tarefa aqui</p>
                      <button
                        onClick={() => openNew(col.id)}
                        className="mt-2 text-xs font-bold text-[#008E32] hover:underline dark:text-[#19E85F]"
                      >
                        + Adicionar
                      </button>
                    </div>
                  ) : (
                    colTasks.map(task => {
                      const subject = subjects.find(s => s.id === task.subject_id);
                      const dueInfo = getDaysDiff(task.due_date);

                      return (
                        <div
                          key={task.id}
                          className="group relative flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:border-[#00D64B]/40 hover:shadow-md dark:border-white/10 dark:bg-[#17142A]"
                        >
                          {/* Matéria + Prioridade */}
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                              style={{
                                backgroundColor: subject ? `${subject.color}15` : '#6F00D615',
                                color: subject ? subject.color : '#6F00D6',
                              }}
                            >
                              <SubjectIcon name={subject?.name} size={13} className="shrink-0" />
                              <span className="truncate max-w-[130px]">{subject?.name || 'Matéria'}</span>
                            </span>

                            <span
                              className={cn(
                                'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                                priorityColor(task.priority)
                              )}
                            >
                              {priorityLabel(task.priority)}
                            </span>
                          </div>

                          {/* Título & Descrição */}
                          <h4 className="font-display text-sm font-bold text-[#14102A] dark:text-white leading-snug">
                            {task.title}
                          </h4>

                          {task.description && (
                            <p className="mt-1 text-xs text-[#645F78] dark:text-[#9D96B8] line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Data de Prazo */}
                          {task.due_date && (
                            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#645F78] dark:text-[#9D96B8]">
                              <Clock size={12} />
                              <span>{new Date(task.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                              {dueInfo && task.status !== 'done' && (
                                <span
                                  className={cn(
                                    'ml-auto rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                                    dueInfo.status === 'overdue' && 'bg-red-500/15 text-red-600 dark:text-red-400',
                                    dueInfo.status === 'urgent' && 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
                                    dueInfo.status === 'soon' && 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
                                    dueInfo.status === 'normal' && 'bg-slate-100 text-muted dark:bg-white/5'
                                  )}
                                >
                                  {dueInfo.label}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Ações na base */}
                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-1">
                              {col.id !== 'todo' && (
                                <button
                                  onClick={() =>
                                    moveStatus(task, col.id === 'done' ? 'in_progress' : 'todo')
                                  }
                                  title="Voltar etapa"
                                  className="rounded-lg p-1 text-muted hover:bg-slate-100 hover:text-tinta dark:hover:bg-white/5"
                                >
                                  <ChevronLeft size={16} />
                                </button>
                              )}

                              {col.id !== 'done' && (
                                <button
                                  onClick={() =>
                                    moveStatus(task, col.id === 'todo' ? 'in_progress' : 'done')
                                  }
                                  title="Avançar etapa"
                                  className="rounded-lg p-1 text-[#008E32] hover:bg-emerald-50 dark:text-[#19E85F] dark:hover:bg-emerald-950/30"
                                >
                                  <ChevronRight size={16} />
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEdit(task)}
                                className="rounded-lg p-1 text-muted hover:bg-slate-100 hover:text-tinta dark:hover:bg-white/5"
                                title="Editar"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => setTaskToDelete(task)}
                                className="rounded-lg p-1 text-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                                title="Excluir tarefa"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <button
                  onClick={() => openNew(col.id)}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-2 text-xs font-bold text-muted transition-all hover:border-[#00D64B] hover:text-[#008E32] dark:border-white/10 dark:hover:border-[#19E85F] dark:hover:text-[#19E85F]"
                >
                  <Plus size={14} /> Nova tarefa nesta coluna
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* Visualização LISTA */
        <div className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-xs dark:border-white/5 dark:bg-[#131024]">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted">Nenhuma tarefa encontrada com os filtros selecionados.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredTasks.map(task => {
                const subject = subjects.find(s => s.id === task.subject_id);
                const dueInfo = getDaysDiff(task.due_date);

                return (
                  <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/5">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() =>
                          moveStatus(task, task.status === 'done' ? 'todo' : 'done')
                        }
                        className={cn(
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all',
                          task.status === 'done'
                            ? 'border-[#00D64B] bg-[#00D64B] text-[#14102A]'
                            : 'border-slate-300 hover:border-[#00D64B] dark:border-white/20'
                        )}
                      >
                        {task.status === 'done' && <CheckCircle2 size={14} strokeWidth={3} />}
                      </button>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4
                            className={cn(
                              'font-display text-sm font-bold text-[#14102A] dark:text-white',
                              task.status === 'done' && 'line-through opacity-60'
                            )}
                          >
                            {task.title}
                          </h4>
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                            style={{
                              backgroundColor: subject ? `${subject.color}15` : '#6F00D615',
                              color: subject ? subject.color : '#6F00D6',
                            }}
                          >
                            <SubjectIcon name={subject?.name} size={11} className="shrink-0" />
                            {subject?.name || 'Matéria'}
                          </span>
                          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', priorityColor(task.priority))}>
                            {priorityLabel(task.priority)}
                          </span>
                        </div>
                        {task.description && (
                          <p className="mt-1 text-xs text-[#645F78] dark:text-[#9D96B8]">{task.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto">
                      {task.due_date && (
                        <div className="flex items-center gap-1.5 text-xs text-[#645F78] dark:text-[#9D96B8]">
                          <Clock size={13} />
                          <span>{new Date(task.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                          {dueInfo && task.status !== 'done' && (
                            <span
                              className={cn(
                                'rounded px-1.5 py-0.5 text-[10px] font-bold',
                                dueInfo.status === 'overdue' && 'bg-red-500/15 text-red-600',
                                dueInfo.status === 'urgent' && 'bg-amber-500/15 text-amber-600'
                              )}
                            >
                              {dueInfo.label}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(task)}
                          className="rounded-lg p-1.5 text-muted hover:bg-slate-200 dark:hover:bg-white/10"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setTaskToDelete(task)}
                          className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão (Evita Exclusão Acidental) */}
      {taskToDelete && (
        <Modal
          open={Boolean(taskToDelete)}
          onClose={() => setTaskToDelete(null)}
          title="Excluir Tarefa?"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl bg-amber-500/10 p-3.5 text-amber-700 dark:text-amber-400">
              <AlertTriangle size={20} className="shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                Você tem certeza que deseja excluir a tarefa{' '}
                <strong className="font-bold underline text-[#14102A] dark:text-white">
                  "{taskToDelete.title}"
                </strong>
                ? Esta ação é definitiva e removerá a tarefa do seu quadro.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="rounded-full px-4 py-2 text-xs font-bold text-muted hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="rounded-full bg-red-600 px-5 py-2 text-xs font-bold text-white transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
              >
                {deleting ? 'Excluindo…' : 'Sim, excluir tarefa'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Criação / Edição */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? 'Editar Tarefa' : 'Nova Tarefa de Estudo'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Matéria *
            </label>
            <select
              required
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Título da Tarefa *
            </label>
            <input
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Resolver 30 questões de Geometria Espacial"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Descrição / Metas específicas
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Ex: Focar em volume de cilindros e prismas, anotar dúvidas no caderno de erros."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs font-semibold text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                Prioridade
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as VestibularTaskPriority)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                Status Inicial
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as VestibularTaskStatus)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <option value="todo">A Fazer</option>
                <option value="in_progress">Em Andamento</option>
                <option value="done">Concluído</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                Data Limite
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-full px-4 py-2 text-xs font-bold text-muted hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#00D64B] px-6 py-2 text-xs font-bold text-[#14102A] transition-all hover:bg-[#19E85F] active:scale-[0.98]"
            >
              {saving ? 'Salvando…' : editingTask ? 'Salvar Alterações' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
