import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { Plus, FileText, Image as ImageIcon, Trash2, Star, Pencil, X, Award, BookOpen } from 'lucide-react';
import { cn } from '../../lib/theme';
import Modal from '../../components/Modal';
import BancoRepertorios from '../../components/BancoRepertorios';

type Competencies = {
  c1: number;
  c2: number;
  c3: number;
  c4: number;
  c5: number;
};

const DEFAULT_COMPETENCIES: Competencies = {
  c1: 160,
  c2: 160,
  c3: 160,
  c4: 160,
  c5: 160,
};

const SCORE_LEVELS = [0, 40, 80, 120, 160, 200];

const COMPETENCIES_INFO = [
  {
    key: 'c1' as const,
    num: 1,
    title: 'C1: Domínio da norma culta',
    desc: 'Gramática, ortografia, pontuação, regência e concordância',
  },
  {
    key: 'c2' as const,
    num: 2,
    title: 'C2: Compreensão do tema e repertório',
    desc: 'Não tangenciar o tema e utilizar repertório sociocultural produtivo',
  },
  {
    key: 'c3' as const,
    num: 3,
    title: 'C3: Projeto de texto e argumentação',
    desc: 'Tese clara, seleção, relação e organização lógica de argumentos',
  },
  {
    key: 'c4' as const,
    num: 4,
    title: 'C4: Coesão e mecanismos linguísticos',
    desc: 'Conectivos intra e interparágrafos, repertório coesivo diversificado',
  },
  {
    key: 'c5' as const,
    num: 5,
    title: 'C5: Proposta de intervenção',
    desc: '5 elementos: agente, ação, modo/meio, efeito e detalhamento',
  },
];

function parseEssayComments(raw: string): { comments: string; competencies: Competencies | null } {
  if (!raw) return { comments: '', competencies: null };
  const match = raw.match(/^<!--COMPETENCIAS:({.*?})-->\s*([\s\S]*)$/);
  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      if (
        typeof parsed.c1 === 'number' &&
        typeof parsed.c2 === 'number' &&
        typeof parsed.c3 === 'number' &&
        typeof parsed.c4 === 'number' &&
        typeof parsed.c5 === 'number'
      ) {
        return { comments: match[2].trim(), competencies: parsed };
      }
    } catch {
      // ignore
    }
  }
  return { comments: raw, competencies: null };
}

function serializeEssayComments(comments: string, competencies: Competencies | null): string {
  const cleanComments = comments.trim();
  if (!competencies) return cleanComments;
  return `<!--COMPETENCIAS:${JSON.stringify(competencies)}-->\n${cleanComments}`;
}

type EssayForm = {
  title: string;
  prompt: string;
  grade: string;
  comments: string;
  written_at: string;
  file: File | null;
};

const EMPTY_FORM: EssayForm = {
  title: '',
  prompt: '',
  grade: '800',
  comments: '',
  written_at: new Date().toISOString().split('T')[0],
  file: null,
};

export default function RedacaoTab() {
  const { essays, refreshData, user } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EssayForm>(EMPTY_FORM);
  const [useCompetencies, setUseCompetencies] = useState(true);
  const [competencies, setCompetencies] = useState<Competencies>(DEFAULT_COMPETENCIES);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<{ url: string; type: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'redacoes' | 'repertorios'>('redacoes');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateTotal = (comps: Competencies) => {
    return comps.c1 + comps.c2 + comps.c3 + comps.c4 + comps.c5;
  };

  const openNew = () => {
    const initialComps = { c1: 160, c2: 160, c3: 160, c4: 160, c5: 160 };
    setCompetencies(initialComps);
    setUseCompetencies(true);
    setForm({
      ...EMPTY_FORM,
      grade: calculateTotal(initialComps).toString(),
      written_at: new Date().toISOString().split('T')[0],
    });
    setEditingId(null);
    setPreviewUrl(null);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (id: string) => {
    const essay = essays.find(e => e.id === id);
    if (!essay) return;
    const { comments: parsedComments, competencies: parsedComps } = parseEssayComments(essay.comments);

    if (parsedComps) {
      setUseCompetencies(true);
      setCompetencies(parsedComps);
    } else {
      setUseCompetencies(false);
      setCompetencies(DEFAULT_COMPETENCIES);
    }

    setForm({
      title: essay.title,
      prompt: essay.prompt,
      grade: essay.grade?.toString() ?? '',
      comments: parsedComments,
      written_at: essay.written_at ?? new Date().toISOString().split('T')[0],
      file: null,
    });
    setEditingId(id);
    setPreviewUrl(null);
    setFormError(null);
    setDialogOpen(true);
  };

  const updateCompetencyScore = (key: keyof Competencies, score: number) => {
    const clamped = Math.max(0, Math.min(200, score));
    const next = { ...competencies, [key]: clamped };
    setCompetencies(next);
    const total = calculateTotal(next);
    setForm(f => ({ ...f, grade: total.toString() }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm(f => ({ ...f, file }));
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSave = async () => {
    if (!user || !form.title.trim()) return;
    setSaving(true);
    setFormError(null);
    try {
      let filePath = null;
      let fileType = null;

      if (form.file) {
        const ext = form.file.name.split('.').pop()?.toLowerCase() ?? '';
        fileType = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? 'image' : 'pdf';
        filePath = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('essays').upload(filePath, form.file);
        if (uploadError) {
          setFormError('Erro ao enviar arquivo: ' + uploadError.message);
          setSaving(false);
          return;
        }
      }

      const totalGrade = form.grade ? parseFloat(form.grade) : null;
      const finalComments = useCompetencies
        ? serializeEssayComments(form.comments, competencies)
        : form.comments.trim();

      const payload = {
        title: form.title.trim(),
        prompt: form.prompt.trim(),
        grade: totalGrade,
        comments: finalComments,
        written_at: form.written_at || null,
      };

      if (editingId) {
        const updatePayload: Record<string, unknown> = { ...payload };
        if (filePath) {
          updatePayload.file_path = filePath;
          updatePayload.file_type = fileType;
        }
        await supabase.from('essays').update(updatePayload).eq('id', editingId);
      } else {
        await supabase.from('essays').insert({ user_id: user.id, ...payload, file_path: filePath, file_type: fileType });
      }

      setDialogOpen(false);
      await refreshData();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, filePath: string | null) => {
    if (filePath) await supabase.storage.from('essays').remove([filePath]);
    await supabase.from('essays').delete().eq('id', id);
    await refreshData();
  };

  const viewFile = async (filePath: string, fileType: string) => {
    const { data } = await supabase.storage.from('essays').createSignedUrl(filePath, 3600);
    if (data) setViewingFile({ url: data.signedUrl, type: fileType });
  };

  const avgGrade = essays.length > 0
    ? Math.round(essays.reduce((a, e) => a + (e.grade ?? 0), 0) / essays.length)
    : 0;
  const bestGrade = essays.length > 0
    ? Math.max(...essays.map(e => e.grade ?? 0))
    : 0;

  return (
    <div className="w-full min-w-0 max-w-full animate-fade-in">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-[2rem] font-bold leading-tight tracking-tight text-tinta dark:text-papel sm:text-[2.6rem]">
            Redação
          </h1>
          <p className="mt-1 text-[17px] font-semibold text-muted dark:text-papel/70">
            Acompanhe suas notas por competência do ENEM e consulte o banco de repertórios
          </p>
        </div>
        {activeSubTab === 'redacoes' && (
          <button onClick={openNew} className="btn shrink-0 bg-pato px-5 py-2.5 text-tinta dark:border-papel">
            <Plus size={18} strokeWidth={3} /> Nova redação
          </button>
        )}
      </div>

      {/* Sub-abas */}
      <div className="mb-5 flex flex-wrap gap-2">
        {([
          { id: 'redacoes' as const, label: `Minhas redações (${essays.length})`, icon: FileText },
          { id: 'repertorios' as const, label: 'Banco de repertórios', icon: BookOpen },
        ]).map(tab => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={cn(
                'flex items-center gap-2 rounded-[16px] border-[3px] border-tinta px-3.5 py-1.5 font-display text-sm font-bold transition-transform dark:border-papel',
                active ? 'bg-pato text-tinta shadow-brutal-sm' : 'bg-white text-tinta hover:-translate-y-px dark:bg-transparent dark:text-papel',
              )}
            >
              <Icon size={15} strokeWidth={2.8} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeSubTab === 'repertorios' ? (
        <BancoRepertorios />
      ) : (
        <>
          {/* Métricas */}
          {essays.length > 0 && (
            <div className="mb-5 grid grid-cols-3 gap-3 sm:gap-4">
              <div className="stat min-w-0">
                <div className="stat-value truncate">{essays.length}</div>
                <div className="stat-label mt-0.5">Redações</div>
              </div>
              <div className="stat min-w-0 bg-bico">
                <div className="stat-value truncate">{bestGrade}</div>
                <div className="stat-label mt-0.5">Melhor nota</div>
              </div>
              <div className="stat min-w-0">
                <div className="stat-value truncate">{avgGrade}</div>
                <div className="stat-label mt-0.5">Média</div>
              </div>
            </div>
          )}

          {essays.length === 0 ? (
            <div className="card p-10 text-center">
              <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] border-[3px] border-tinta bg-pato text-tinta dark:border-papel">
                <FileText size={28} strokeWidth={2.6} />
              </span>
              <h2 className="mb-1 font-display text-xl font-bold text-tinta dark:text-papel">Nenhuma redação ainda</h2>
              <p className="mb-4 text-sm font-semibold text-muted dark:text-papel/60">
                Adicione sua redação preenchendo as notas de cada uma das 5 competências do ENEM.
              </p>
              <button onClick={openNew} className="btn inline-flex bg-pato px-4 py-2 text-sm text-tinta dark:border-papel">
                <Plus size={16} strokeWidth={3} /> Adicionar redação
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {essays.map(essay => {
                const { comments: cleanComments, competencies: essayComps } = parseEssayComments(essay.comments);
                return (
                  <article key={essay.id} className="card flex flex-col gap-2.5 p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => essay.file_path && viewFile(essay.file_path, essay.file_type ?? 'image')}
                        className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border-[3px] border-tinta transition-transform dark:border-papel',
                          essay.file_path
                            ? 'cursor-pointer bg-pato text-tinta hover:-translate-y-px'
                            : 'bg-papel text-muted dark:bg-transparent dark:text-papel/40',
                        )}
                        disabled={!essay.file_path}
                        title={essay.file_path ? 'Ver arquivo' : 'Sem arquivo'}
                      >
                        {essay.file_type === 'pdf' ? <FileText size={20} strokeWidth={2.6} /> : <ImageIcon size={20} strokeWidth={2.6} />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-display text-xl font-bold leading-tight text-tinta dark:text-papel">
                          {essay.title}
                        </h3>
                        <p className="text-sm font-semibold text-muted dark:text-papel/60">
                          {essay.written_at ? new Date(essay.written_at).toLocaleDateString('pt-BR') : 'Sem data'}
                        </p>
                      </div>

                      {essay.grade !== null && (
                        <span className="chip shrink-0 gap-1 bg-bico text-tinta dark:border-papel">
                          <Star size={12} strokeWidth={3} /> {essay.grade}
                        </span>
                      )}
                    </div>

                    {essay.prompt && (
                      <p className="line-clamp-2 text-sm font-semibold italic text-muted dark:text-papel/55">
                        “{essay.prompt}”
                      </p>
                    )}

                    {essayComps && (
                      <div>
                        <p className="mb-1.5 flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted dark:text-papel/50">
                          <Award size={11} strokeWidth={3} /> Competências ENEM
                        </p>
                        <div className="grid grid-cols-5 gap-1.5">
                          {(['c1', 'c2', 'c3', 'c4', 'c5'] as const).map((cKey, idx) => {
                            const val = essayComps[cKey] ?? 0;
                            const isHigh = val >= 160;
                            const isMed = val >= 120;
                            return (
                              <div
                                key={cKey}
                                className={cn(
                                  'rounded-[12px] border-[3px] border-tinta py-1 text-center dark:border-papel',
                                  isHigh ? 'bg-pato text-tinta' : isMed ? 'bg-bico text-tinta' : 'bg-papel text-tinta dark:bg-transparent dark:text-papel',
                                )}
                              >
                                <div className="text-[10px] font-bold">C{idx + 1}</div>
                                <div className="font-display text-base font-bold leading-none">{val}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {cleanComments && (
                      <p className="line-clamp-3 rounded-[14px] border-[3px] border-tinta/20 bg-papel px-2.5 py-2 text-sm font-semibold text-muted dark:border-papel/20 dark:bg-transparent dark:text-papel/60">
                        {cleanComments}
                      </p>
                    )}

                    <div className="mt-auto flex gap-3 pt-1 text-sm font-bold">
                      <button onClick={() => openEdit(essay.id)} className="flex items-center gap-1.5 text-tinta hover:underline dark:text-papel">
                        <Pencil size={13} strokeWidth={3} /> Editar
                      </button>
                      <button
                        onClick={() => handleDelete(essay.id, essay.file_path)}
                        className="flex items-center gap-1.5 text-tinta/70 hover:text-tinta hover:underline dark:text-papel/60 dark:hover:text-papel"
                      >
                        <Trash2 size={13} strokeWidth={3} /> Excluir
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Diálogo */}
      <Modal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingId ? 'Editar redação' : 'Nova redação'}
        size="lg"
        footer={
          <>
            <button onClick={() => setDialogOpen(false)} className="btn bg-white px-4 py-2 text-sm dark:border-papel dark:bg-transparent dark:text-papel">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.title.trim()}
              className="btn bg-pato px-4 py-2 text-sm text-tinta dark:border-papel"
            >
              {saving ? 'Salvando…' : 'Salvar redação'}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {formError && (
            <div className="rounded-[14px] border-[3px] border-tinta bg-bico px-3.5 py-2.5 text-sm font-bold text-tinta dark:border-papel">
              {formError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="red-titulo" className="mb-1.5 block text-sm font-bold">Título da redação *</label>
              <input
                id="red-titulo"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="input"
                placeholder="Ex: Redação Simulado 4 — Maio"
              />
            </div>
            <div>
              <label htmlFor="red-data" className="mb-1.5 block text-sm font-bold">Data</label>
              <input
                id="red-data"
                type="date"
                value={form.written_at}
                onChange={e => setForm(f => ({ ...f, written_at: e.target.value }))}
                className="input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="red-tema" className="mb-1.5 block text-sm font-bold">
              Tema / proposta <span className="font-semibold text-muted dark:text-papel/50">(opcional)</span>
            </label>
            <textarea
              id="red-tema"
              value={form.prompt}
              onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
              className="input min-h-[70px]"
              placeholder="Ex: Desafios para a valorização do trabalho de cuidado realizado por mulheres no Brasil"
            />
          </div>

          {/* Competências */}
          <div className="rounded-[22px] border-[3px] border-tinta p-4 dark:border-papel/50">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="flex items-center gap-1.5 font-display text-lg font-bold text-tinta dark:text-papel">
                  <Award size={16} strokeWidth={3} /> Notas por competência
                </h4>
                <p className="text-sm font-semibold text-muted dark:text-papel/55">
                  De 0 a 200 em cada uma — o total é calculado automaticamente.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-tinta dark:text-papel">
                <input
                  type="checkbox"
                  checked={useCompetencies}
                  onChange={e => {
                    const checked = e.target.checked;
                    setUseCompetencies(checked);
                    if (checked) {
                      setForm(f => ({ ...f, grade: calculateTotal(competencies).toString() }));
                    }
                  }}
                  className="h-5 w-5 rounded border-[3px] border-tinta"
                />
                Calcular pelas 5 competências
              </label>
            </div>

            {useCompetencies ? (
              <div className="flex flex-col gap-3">
                {COMPETENCIES_INFO.map(comp => {
                  const currentScore = competencies[comp.key];
                  return (
                    <div key={comp.key} className="rounded-[16px] border-[3px] border-tinta bg-white p-3 dark:border-papel/40 dark:bg-transparent">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="block text-sm font-bold text-tinta dark:text-papel">{comp.title}</p>
                          <p className="line-clamp-1 text-xs font-semibold text-muted dark:text-papel/55">{comp.desc}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            max={200}
                            step={20}
                            value={currentScore}
                            aria-label={`Nota ${comp.title}`}
                            onChange={e => updateCompetencyScore(comp.key, Number(e.target.value))}
                            className="input w-20 px-2 py-1 text-center font-display text-sm font-bold"
                          />
                          <span className="font-display text-xs font-bold text-muted dark:text-papel/50">/200</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {SCORE_LEVELS.map(score => (
                          <button
                            type="button"
                            key={score}
                            onClick={() => updateCompetencyScore(comp.key, score)}
                            className={cn(
                              'rounded-[10px] border-2 border-tinta px-2.5 py-1 font-display text-xs font-bold transition-transform dark:border-papel',
                              currentScore === score
                                ? 'bg-mente text-papel'
                                : 'bg-papel text-tinta hover:-translate-y-px dark:bg-transparent dark:text-papel',
                            )}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="flex items-center justify-between gap-3 rounded-[16px] border-[3px] border-tinta bg-pato p-3.5 text-tinta dark:border-papel">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide">Nota total da redação</p>
                    <p className="text-xs font-semibold text-tinta/70">Soma automática de C1 + C2 + C3 + C4 + C5</p>
                  </div>
                  <div className="font-display text-3xl font-bold leading-none">
                    {calculateTotal(competencies)}
                    <span className="ml-1 text-sm font-bold text-tinta/60">/1000</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="red-nota" className="mb-1.5 block text-sm font-bold">Nota total direta (0 a 1000)</label>
                <input
                  id="red-nota"
                  type="number"
                  min={0}
                  max={1000}
                  value={form.grade}
                  onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                  className="input font-display text-base font-bold"
                  placeholder="Ex: 840"
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="red-comentarios" className="mb-1.5 block text-sm font-bold">
              Comentários e feedbacks <span className="font-semibold text-muted dark:text-papel/50">(opcional)</span>
            </label>
            <textarea
              id="red-comentarios"
              value={form.comments}
              onChange={e => setForm(f => ({ ...f, comments: e.target.value }))}
              className="input min-h-[70px]"
              placeholder="Feedback do corretor, pontos de melhoria, observações de repertório…"
            />
          </div>

          <div>
            <label htmlFor="red-arquivo" className="mb-1.5 block text-sm font-bold">
              Arquivo da redação <span className="font-semibold text-muted dark:text-papel/50">(foto ou PDF)</span>
            </label>
            <input
              id="red-arquivo"
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="input"
            />
            {previewUrl && (
              <div className="relative mt-2 overflow-hidden rounded-[16px] border-[3px] border-tinta dark:border-papel/50">
                <img src={previewUrl} alt="Pré-visualização" className="max-h-48 w-full bg-papel object-contain" />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(null);
                    setForm(f => ({ ...f, file: null }));
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  aria-label="Remover arquivo"
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-tinta bg-white text-tinta"
                >
                  <X size={16} strokeWidth={2.8} />
                </button>
              </div>
            )}
            {editingId && !form.file && essays.find(e => e.id === editingId)?.file_path && (
              <p className="mt-1.5 text-xs font-semibold text-muted dark:text-papel/55">
                Arquivo atual mantido. Selecione um novo se desejar substituir.
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/* Visualizador */}
      {viewingFile && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-tinta/85 p-4"
          onClick={() => setViewingFile(null)}
        >
          <button
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-papel bg-tinta text-papel"
            onClick={() => setViewingFile(null)}
            aria-label="Fechar visualizador"
          >
            <X size={20} strokeWidth={2.8} />
          </button>
          {viewingFile.type === 'pdf' ? (
            <iframe
              src={viewingFile.url}
              className="h-full max-h-[90vh] w-full max-w-4xl rounded-[16px] border-[3px] border-papel bg-white"
              title="PDF viewer"
            />
          ) : (
            <img
              src={viewingFile.url}
              alt="Redação"
              className="max-h-[90vh] max-w-full rounded-[16px] border-[3px] border-papel"
              onClick={e => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  );
}
