import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { cn } from '../../../lib/theme';
import Modal from '../../../components/Modal';
import {
  Plus,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Edit2,
  Trash2,
  CircleDashed,
  AlertTriangle,
} from 'lucide-react';
import type { UniversityTask, UniversityTaskPriority, UniversityTaskStatus } from '../../../lib/supabase';

const COLUMNS: {
  id: UniversityTaskStatus;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}[] = [
  { id: 'todo', label: 'A Fazer', icon: CircleDashed, color: 'border-slate-300 dark:border-white/10' },
  { id: 'in_progress', label: 'Em Andamento', icon: Clock, color: 'border-amber-500/40' },
  { id: 'done', label: 'Entregue / Concluído', icon: CheckCircle2, color: 'border-emerald-500/40' },
];

export default function PrazosEEntregasTab() {
  const {
    universitySubjects,
    universityTasks,
    addUniversityTask,
    updateUniversityTask,
    deleteUniversityTask,
  } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<UniversityTask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<UniversityTask | null>(null);

  // Form states
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<UniversityTaskPriority>('medium');
  const [status, setStatus] = useState<UniversityTaskStatus>('todo');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  const openNew = (defaultStatus: UniversityTaskStatus = 'todo') => {
    setEditingTask(null);
    setSubjectId(universitySubjects[0]?.id ?? '');
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus(defaultStatus);
    setDueDate(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const openEdit = (task: UniversityTask) => {
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
      await updateUniversityTask(editingTask.id, {
        subject_id: subjectId,
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        due_date: dueDate || null,
      });
    } else {
      await addUniversityTask({
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

  const moveStatus = async (task: UniversityTask, nextStatus: UniversityTaskStatus) => {
    await updateUniversityTask(task.id, { status: nextStatus });
  };

  const filteredTasks = universityTasks.filter(t => {
    if (selectedSubjectId !== 'all' && t.subject_id !== selectedSubjectId) return false;
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
    return true;
  });

  const getDaysDiff = (dateStr: string | null) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr + 'T00:00:00').getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: `${Math.abs(diff)} dias atrasado`, status: 'overdue' };
    if (diff === 0) return { label: 'Entrega hoje!', status: 'urgent' };
    if (diff === 1) return { label: 'Entrega amanhã', status: 'urgent' };
    if (diff <= 3) return { label: `Em ${diff} dias`, status: 'soon' };
    return { label: `Em ${diff} dias`, status: 'normal' };
  };

  const priorityColor = (p: UniversityTaskPriority) => {
    switch (p) {
      case 'high':
        return 'bg-red-500/15 text-red-600 dark:text-red-400';
      case 'medium':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
      case 'low':
        return 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white/60';
    }
  };

  const priorityLabel = (p: UniversityTaskPriority) => {
    switch (p) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
    }
  };

  return (
    <div className="w-full max-w-5xl min-w-0 animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-[#F3F1FF]">
            Prazos e Entregas
          </h1>
          <p className="mt-1 text-sm font-medium text-[#645F78] dark:text-[#9D96B8]">
            Quadro Kanban para gestão de relatórios, listas de exercícios, trabalhos práticos e seminários.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Alternador Kanban / Lista */}
          <div className="flex items-center rounded-full bg-slate-100 p-1 dark:bg-white/5 border border-slate-200/80 dark:border-white/5">
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-bold transition-all',
                viewMode === 'kanban'
                  ? 'bg-white text-tinta shadow-xs dark:bg-[#131024] dark:text-white'
                  : 'text-muted hover:text-tinta dark:hover:text-white'
              )}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-bold transition-all',
                viewMode === 'list'
                  ? 'bg-white text-tinta shadow-xs dark:bg-[#131024] dark:text-white'
                  : 'text-muted hover:text-tinta dark:hover:text-white'
              )}
            >
              Lista
            </button>
          </div>

          <button
            onClick={() => openNew('todo')}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00D64B] px-4 py-2 text-xs font-bold text-[#14102A] shadow-[0_4px_16px_rgba(25,232,95,0.3)] transition-all hover:bg-[#19E85F] active:scale-[0.98] dark:bg-[#19E85F]"
          >
            <Plus size={16} strokeWidth={3} />
            <span>Nova Entrega</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <select
          value={selectedSubjectId}
          onChange={e => setSelectedSubjectId(e.target.value)}
          className="rounded-full border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-bold text-tinta shadow-xs focus:outline-none dark:border-white/10 dark:bg-[#131024] dark:text-texto"
        >
          <option value="all">Todas as Disciplinas</option>
          {universitySubjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select
          value={selectedPriority}
          onChange={e => setSelectedPriority(e.target.value)}
          className="rounded-full border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-bold text-tinta shadow-xs focus:outline-none dark:border-white/10 dark:bg-[#131024] dark:text-texto"
        >
          <option value="all">Todas as Prioridades</option>
          <option value="high">Prioridade Alta</option>
          <option value="medium">Prioridade Média</option>
          <option value="low">Prioridade Baixa</option>
        </select>

        <span className="text-xs text-muted ml-auto">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'item' : 'itens'} encontrados
        </span>
      </div>

      {/* Visualização KANBAN */}
      {viewMode === 'kanban' ? (
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map(col => {
            const ColIcon = col.icon;
            const tasksInCol = filteredTasks.filter(t => t.status === col.id);
            return (
              <div
                key={col.id}
                className={cn(
                  'flex flex-col rounded-[26px] border bg-slate-50/70 p-4 min-h-[450px] dark:bg-[#110D22]/60',
                  col.color
                )}
              >
                {/* Header da coluna */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[#6F00D6] dark:text-[#B379FF]">
                      <ColIcon size={16} />
                    </span>
                    <h3 className="font-display text-sm font-bold text-[#14102A] dark:text-white">
                      {col.label}
                    </h3>
                  </div>
                  <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[11px] font-bold text-muted dark:bg-white/10 dark:text-white">
                    {tasksInCol.length}
                  </span>
                </div>

                {/* Cards na coluna */}
                <div className="mt-3 flex-1 space-y-3">
                  {tasksInCol.length === 0 ? (
                    <div className="flex h-32 flex-col items-center justify-center text-center text-xs text-muted">
                      Nenhum trabalho aqui
                    </div>
                  ) : (
                    tasksInCol.map(task => {
                      const subject = universitySubjects.find(s => s.id === task.subject_id);
                      const due = getDaysDiff(task.due_date);

                      return (
                        <div
                          key={task.id}
                          className="group relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:border-[#6F00D6]/40 hover:shadow-md dark:border-white/5 dark:bg-[#15112B]"
                        >
                          {/* Subject badge & Priority */}
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white shadow-2xs truncate max-w-[150px]"
                              style={{ background: subject?.color || '#6F00D6' }}
                            >
                              {subject?.name || 'Disciplina'}
                            </span>
                            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', priorityColor(task.priority))}>
                              {priorityLabel(task.priority)}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="mt-2 text-xs font-bold text-[#14102A] dark:text-white leading-snug">
                            {task.title}
                          </h4>

                          {/* Description */}
                          {task.description && (
                            <p className="mt-1 text-[11px] text-[#645F78] dark:text-[#9D96B8] line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {/* Due Date Indicator */}
                          {due && (
                            <div className="mt-3 flex items-center gap-1.5 text-[11px]">
                              <Clock size={12} className={cn(
                                due.status === 'urgent' ? 'text-amber-500' :
                                due.status === 'overdue' ? 'text-red-500' : 'text-muted'
                              )} />
                              <span
                                className={cn(
                                  'font-bold',
                                  due.status === 'urgent' ? 'text-amber-600 dark:text-amber-400' :
                                  due.status === 'overdue' ? 'text-red-600 dark:text-red-400' :
                                  'text-muted'
                                )}
                              >
                                {due.label}
                              </span>
                            </div>
                          )}

                          {/* Actions / Move controls */}
                          <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-2.5">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEdit(task)}
                                title="Editar"
                                className="rounded p-1 text-muted hover:bg-slate-100 hover:text-tinta dark:hover:bg-white/10 dark:hover:text-white"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => setTaskToDelete(task)}
                                title="Excluir trabalho"
                                className="rounded p-1 text-muted hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            {/* Move status buttons */}
                            <div className="flex items-center gap-1">
                              {col.id !== 'todo' && (
                                <button
                                  onClick={() => moveStatus(task, col.id === 'done' ? 'in_progress' : 'todo')}
                                  title="Voltar status"
                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-muted"
                                >
                                  <ChevronLeft size={13} strokeWidth={2.4} />
                                </button>
                              )}
                              {col.id !== 'done' && (
                                <button
                                  onClick={() => moveStatus(task, col.id === 'todo' ? 'in_progress' : 'done')}
                                  title="Avançar status"
                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00D64B]/20 hover:bg-[#00D64B]/30 text-[#008E32] dark:text-[#19E85F]"
                                >
                                  <ChevronRight size={13} strokeWidth={2.4} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Botão de adicionar direto na coluna */}
                <button
                  onClick={() => openNew(col.id)}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-2 text-xs font-bold text-muted hover:border-[#00D64B] hover:text-[#008E32] dark:border-white/10 dark:hover:border-[#19E85F] dark:hover:text-[#19E85F] transition-colors"
                >
                  <Plus size={14} /> Adicionar
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* Visualização em LISTA */
        <div className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-[#131024]">
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {filteredTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted">
                Nenhum prazo correspondente aos filtros.
              </div>
            ) : (
              filteredTasks.map(task => {
                const subject = universitySubjects.find(s => s.id === task.subject_id);
                const due = getDaysDiff(task.due_date);
                return (
                  <div key={task.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3.5 gap-2">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => moveStatus(task, task.status === 'done' ? 'todo' : 'done')}
                        className={cn(
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                          task.status === 'done'
                            ? 'bg-[#00D64B] border-[#00D64B] text-[#14102A]'
                            : 'border-slate-300 hover:border-[#00D64B] dark:border-white/20'
                        )}
                      >
                        {task.status === 'done' && <CheckCircle2 size={14} strokeWidth={3} />}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs"
                            style={{ background: subject?.color || '#6F00D6' }}
                          >
                            {subject?.name}
                          </span>
                          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', priorityColor(task.priority))}>
                            {priorityLabel(task.priority)}
                          </span>
                        </div>
                        <h4 className={cn('mt-1 text-xs font-bold text-[#14102A] dark:text-white', task.status === 'done' && 'line-through text-muted dark:text-muted')}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="mt-0.5 text-[11px] text-muted">{task.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                      {due && (
                        <span className={cn('text-xs font-semibold', due.status === 'urgent' ? 'text-amber-600' : due.status === 'overdue' ? 'text-red-500' : 'text-muted')}>
                          {due.label}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(task)} className="rounded p-1 text-muted hover:bg-slate-100 dark:hover:bg-white/10">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setTaskToDelete(task)} title="Excluir" className="rounded p-1 text-muted hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal Nova / Editar Tarefa */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? 'Editar Entrega' : 'Nova Entrega / Trabalho Acadêmico'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              Disciplina *
            </label>
            <select
              required
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-[#131024] dark:text-texto"
            >
              {universitySubjects.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code || 'Graduação'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              Título do Trabalho / Entrega *
            </label>
            <input
              required
              type="text"
              placeholder="Ex: Relatório de Física 3, Lista de Exercícios 4, Implementação AVL"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-texto"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
                Prioridade
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as UniversityTaskPriority)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-[#131024] dark:text-texto"
              >
                <option value="high">Alta (Urgente / Peso maior)</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
                Status Inicial
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as UniversityTaskStatus)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-[#131024] dark:text-texto"
              >
                <option value="todo">A Fazer</option>
                <option value="in_progress">Em Andamento</option>
                <option value="done">Entregue / Concluído</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              Data Limite de Entrega
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-texto"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              Detalhes / Instruções do Professor
            </label>
            <textarea
              rows={3}
              placeholder="Instruções de formatação, formato de envio (PDF, GitHub), links úteis..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-tinta focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-texto"
            />
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
              {saving ? 'Salvando...' : editingTask ? 'Salvar Alterações' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      {taskToDelete && (
        <Modal
          open={Boolean(taskToDelete)}
          onClose={() => setTaskToDelete(null)}
          title="Excluir Trabalho?"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl bg-amber-500/10 p-3.5 text-amber-700 dark:text-amber-400">
              <AlertTriangle size={20} className="shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                Você tem certeza que deseja excluir o trabalho{' '}
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
                onClick={async () => {
                  if (taskToDelete) {
                    await deleteUniversityTask(taskToDelete.id);
                    setTaskToDelete(null);
                  }
                }}
                className="rounded-full bg-red-600 px-5 py-2 text-xs font-bold text-white transition-all hover:bg-red-700 active:scale-95"
              >
                Sim, excluir trabalho
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
