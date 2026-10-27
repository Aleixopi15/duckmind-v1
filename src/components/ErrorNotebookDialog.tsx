import { useState, useRef, useCallback, useEffect } from 'react';
import Modal from './Modal';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/theme';
import { Upload, AlertCircle } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  initialSubjectId?: string;
  initialTopicId?: string;
  onSaved?: (entryId: string) => void;
};

const ANSWER_OPTIONS = ['A', 'B', 'C', 'D', 'E'] as const;

export default function ErrorNotebookDialog({ open, onClose, initialSubjectId, initialTopicId, onSaved }: Props) {
  const { subjects, topics, refreshData, user } = useApp();
  const [imageData, setImageData] = useState<string>('');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [subjectId, setSubjectId] = useState(initialSubjectId ?? '');
  const [topicId, setTopicId] = useState(initialTopicId ?? '');
  const [customSubtopic, setCustomSubtopic] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSubjectId(initialSubjectId ?? '');
      setTopicId(initialTopicId ?? '');
      setCustomSubtopic('');
      setImageData('');
      setStudentAnswer('');
      setCorrectAnswer('');
      setObservacoes('');
      setError('');
      setSaving(false);
      setDragOver(false);
    }
  }, [open, initialSubjectId, initialTopicId]);

  const resetState = useCallback(() => {
    setImageData('');
    setStudentAnswer('');
    setCorrectAnswer('');
    setSubjectId(initialSubjectId ?? '');
    setTopicId(initialTopicId ?? '');
    setCustomSubtopic('');
    setObservacoes('');
    setError('');
    setSaving(false);
    setDragOver(false);
  }, [initialSubjectId, initialTopicId]);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFile = (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setError('Formato não suportado. Use JPG, PNG ou WEBP.');
      return;
    }
    if (file.size > 6_000_000) {
      setError('A imagem deve ter no máximo 6 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageData(reader.result as string);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const availableTopics = topics.filter(t => t.subject_id === subjectId);
  const canSave = imageData && studentAnswer && correctAnswer && subjectId;

  const handleSave = async () => {
    if (!canSave) {
      setError('Preencha imagem, respostas e matéria antes de salvar.');
      return;
    }
    setSaving(true);
    setError('');

    try {
      const { data, error: insertError } = await supabase.from('error_notebook_entries').insert({
        ...(user?.id ? { user_id: user.id } : {}),
        image_data: imageData,
        student_answer: studentAnswer,
        correct_answer: correctAnswer,
        subject_id: subjectId,
        topic_id: topicId || null,
        custom_subtopic: customSubtopic.trim(),
        observacoes: observacoes.trim(),
        status: 'pendente',
        materia_sugerida: '',
        topico_sugerido: '',
        enunciado_latex: '',
        diagnostico_erro: '',
        resolucao_passos: '',
        dica_flashcard: '',
      }).select().single();

      if (insertError) throw insertError;
      await refreshData();
      onSaved?.(data.id);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar o registro.');
    } finally {
      setSaving(false);
    }
  };

  const answerButton = (opt: string, selected: boolean, tone: 'erro' | 'acerto', onClick: () => void) => (
    <button
      key={opt}
      type="button"
      onClick={onClick}
      className={cn(
        'h-11 w-11 rounded-xl font-display text-sm font-bold transition-all flex items-center justify-center',
        selected
          ? tone === 'erro'
            ? 'border-2 border-amber-500 bg-amber-500/15 text-[#D68200] dark:text-[#FFB84D] shadow-xs scale-105'
            : 'border-2 border-[#00D64B] bg-[#00D64B]/15 text-[#008E32] dark:text-[#19E85F] shadow-xs scale-105'
          : 'border border-slate-200/90 bg-slate-50/70 text-[#14102A] hover:bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10'
      )}
    >
      {opt}
    </button>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Nova questão"
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full px-5 py-2.5 text-xs font-bold text-[#645F78] hover:text-[#14102A] dark:text-[#9D96B8] dark:hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave || saving}
            className="inline-flex items-center justify-center rounded-full bg-[#00D64B] px-6 py-2.5 text-xs font-bold text-[#14102A] shadow-xs hover:bg-[#19E85F] hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Foto da questão */}
        <div>
          <label htmlFor="erro-foto" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
            Foto da questão
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              'relative cursor-pointer rounded-2xl border-2 border-dashed p-5 transition-all text-center',
              dragOver
                ? 'border-[#00D64B] bg-[#00D64B]/10'
                : 'border-slate-200/90 hover:border-slate-300 bg-slate-50/60 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20'
            )}
          >
            {imageData ? (
              <div className="flex items-start gap-3 text-left">
                <img
                  src={imageData}
                  alt="Questão fotografada"
                  className="h-28 w-28 rounded-xl border border-slate-200/90 object-cover dark:border-white/10"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#14102A] dark:text-white">Imagem carregada</p>
                  <p className="mt-1 text-xs font-semibold text-[#645F78] dark:text-[#9D96B8]">Clique para trocar a imagem</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-5">
                <div className="mb-2.5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">
                  <Upload size={22} strokeWidth={2.2} />
                </div>
                <p className="text-sm font-bold text-[#14102A] dark:text-white">Arraste a foto ou clique para enviar</p>
                <p className="mt-1 text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">JPG, PNG ou WEBP até 6 MB</p>
              </div>
            )}
            <input
              id="erro-foto"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        </div>

        {/* Respostas */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Sua resposta
            </span>
            <div className="flex flex-wrap gap-2">
              {ANSWER_OPTIONS.map(opt => answerButton(opt, studentAnswer === opt, 'erro', () => setStudentAnswer(opt)))}
            </div>
          </div>
          <div>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Gabarito
            </span>
            <div className="flex flex-wrap gap-2">
              {ANSWER_OPTIONS.map(opt => answerButton(opt, correctAnswer === opt, 'acerto', () => setCorrectAnswer(opt)))}
            </div>
          </div>
        </div>

        {/* Matéria / tópico */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="erro-materia" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Matéria
            </label>
            <select id="erro-materia" value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setTopicId(''); }} className="input">
              <option value="">Selecione…</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="erro-topico" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Tópico do edital
            </label>
            <select id="erro-topico" value={topicId} onChange={(e) => setTopicId(e.target.value)} className="input" disabled={!subjectId}>
              <option value="">Sem tópico do edital</option>
              {availableTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        {/* Subtópico */}
        <div>
          <label htmlFor="erro-subtopico" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
            Subtópico / observação <span className="font-normal lowercase text-slate-400">(opcional)</span>
          </label>
          <input
            id="erro-subtopico"
            value={customSubtopic}
            onChange={(e) => setCustomSubtopic(e.target.value)}
            className="input"
            placeholder="Ex: Teorema de Tales, Lei dos gases, pegadinha de cálculo…"
          />
          <p className="mt-1 text-xs font-normal text-[#645F78] dark:text-[#9D96B8]">
            Aparece em destaque no card do erro e não altera o edital oficial.
          </p>
        </div>

        {/* Observações */}
        <div>
          <label htmlFor="erro-obs" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
            Observações <span className="font-normal lowercase text-slate-400">(opcional)</span>
          </label>
          <textarea
            id="erro-obs"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="input min-h-[80px] resize-y"
            placeholder="Anote o que você achou dessa questão, onde errou ou qualquer lembrete pessoal…"
            rows={3}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertCircle size={16} strokeWidth={2.4} /> {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
