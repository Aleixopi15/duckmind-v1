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
  const { subjects, topics, refreshData } = useApp();
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
      onClick={onClick}
      className={cn(
        'h-11 w-11 rounded-[14px] border-[3px] border-tinta font-display text-base font-bold transition-transform dark:border-papel',
        selected
          ? tone === 'erro'
            ? 'bg-bico text-tinta shadow-brutal-sm'
            : 'bg-pato text-tinta shadow-brutal-sm'
          : 'bg-white text-tinta hover:-translate-y-px dark:bg-transparent dark:text-papel',
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
          <button onClick={handleClose} className="btn bg-white px-4 py-2 text-sm dark:border-papel dark:bg-transparent dark:text-papel">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!canSave || saving} className="btn bg-pato px-4 py-2 text-sm text-tinta dark:border-papel">
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Foto da questão */}
        <div>
          <label htmlFor="erro-foto" className="mb-1.5 block text-sm font-bold">Foto da questão</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              'relative cursor-pointer rounded-[22px] border-[3px] border-dashed border-tinta p-4 transition-colors dark:border-papel/60',
              dragOver ? 'bg-pato/25' : 'bg-white hover:bg-papel dark:bg-transparent',
            )}
          >
            {imageData ? (
              <div className="flex items-start gap-3">
                <img
                  src={imageData}
                  alt="Questão fotografada"
                  className="h-32 w-32 rounded-[14px] border-[3px] border-tinta object-cover dark:border-papel"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-tinta dark:text-papel">Imagem carregada</p>
                  <p className="mt-1 text-sm font-semibold text-muted dark:text-papel/60">Clique para trocar a imagem</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Upload size={28} strokeWidth={2.6} className="mb-2 text-muted dark:text-papel/60" />
                <p className="text-sm font-bold text-tinta dark:text-papel">Arraste a foto ou clique para enviar</p>
                <p className="mt-1 text-xs font-semibold text-muted dark:text-papel/50">JPG, PNG ou WEBP até 6 MB</p>
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
            <span className="mb-1.5 block text-sm font-bold">Sua resposta</span>
            <div className="flex flex-wrap gap-1.5">
              {ANSWER_OPTIONS.map(opt => answerButton(opt, studentAnswer === opt, 'erro', () => setStudentAnswer(opt)))}
            </div>
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-bold">Gabarito</span>
            <div className="flex flex-wrap gap-1.5">
              {ANSWER_OPTIONS.map(opt => answerButton(opt, correctAnswer === opt, 'acerto', () => setCorrectAnswer(opt)))}
            </div>
          </div>
        </div>

        {/* Matéria / tópico */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="erro-materia" className="mb-1.5 block text-sm font-bold">Matéria</label>
            <select id="erro-materia" value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setTopicId(''); }} className="input">
              <option value="">Selecione…</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="erro-topico" className="mb-1.5 block text-sm font-bold">Tópico do edital</label>
            <select id="erro-topico" value={topicId} onChange={(e) => setTopicId(e.target.value)} className="input" disabled={!subjectId}>
              <option value="">Sem tópico do edital</option>
              {availableTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        {/* Subtópico */}
        <div>
          <label htmlFor="erro-subtopico" className="mb-1.5 block text-sm font-bold">
            Subtópico / observação <span className="font-semibold text-muted dark:text-papel/50">(opcional)</span>
          </label>
          <input
            id="erro-subtopico"
            value={customSubtopic}
            onChange={(e) => setCustomSubtopic(e.target.value)}
            className="input"
            placeholder="Ex: Teorema de Tales, Lei dos gases, pegadinha de cálculo…"
          />
          <p className="mt-1 text-xs font-semibold text-muted dark:text-papel/55">
            Aparece em destaque no card do erro e não altera o edital oficial.
          </p>
        </div>

        {/* Observações */}
        <div>
          <label htmlFor="erro-obs" className="mb-1.5 block text-sm font-bold">
            Observações <span className="font-semibold text-muted dark:text-papel/50">(opcional)</span>
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
          <div className="flex items-center gap-2 text-sm font-bold text-tinta dark:text-papel">
            <AlertCircle size={16} strokeWidth={2.8} /> {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
