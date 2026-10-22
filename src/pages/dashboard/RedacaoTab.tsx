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
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-[#F3F1FF]">
            Redação ENEM
          </h1>
          <p className="mt-1 text-sm font-medium text-[#645F78] dark:text-[#9D96B8]">
            Acompanhe suas notas por competência do ENEM e consulte o banco de repertórios
          </p>
        </div>
        {activeSubTab === 'redacoes' && (
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00D64B] hover:bg-[#19E85F] text-[#14102A] text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Plus size={16} strokeWidth={3} />
            <span>Nova redação</span>
          </button>
        )}
      </div>

      {/* Sub-abas */}
      <div className="mb-6 flex flex-wrap gap-2">
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
                'flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all',
                active
                  ? 'bg-[#00D64B] text-[#14102A] shadow-xs'
                  : 'bg-white text-[#645F78] hover:bg-slate-50 dark:bg-[#151826] dark:text-[#9D96B8] dark:hover:bg-white/5 border border-slate-200/80 dark:border-white/5'
              )}
            >
              <Icon size={14} strokeWidth={2.4} />
              <span>{tab.label}</span>
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
            <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
              <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
                <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-white">
                  {essays.length}
                </div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                  Redações
                </div>
              </div>
              <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
                <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#D68200] dark:text-[#FFB84D]">
                  {bestGrade}
                </div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                  Melhor nota
                </div>
              </div>
              <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
                <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#008E32] dark:text-[#19E85F]">
                  {avgGrade}
                </div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                  Média
                </div>
              </div>
            </div>
          )}

          {essays.length === 0 ? (
            <div className="rounded-[24px] border border-slate-200/80 bg-white p-12 text-center shadow-xs dark:border-white/5 dark:bg-[#151826]">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00D64B]/15 text-[#008E32] dark:text-[#19E85F]">
                <FileText size={26} strokeWidth={2.4} />
              </span>
              <h2 className="mb-1 font-display text-lg font-bold text-[#14102A] dark:text-white">Nenhuma redação ainda</h2>
              <p className="mb-4 text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
                Adicione sua redação preenchendo as notas de cada uma das 5 competências do ENEM.
              </p>
              <button
                onClick={openNew}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00D64B] hover:bg-[#19E85F] text-[#14102A] text-xs font-bold shadow-xs transition-all"
              >
                <Plus size={15} strokeWidth={3} /> Adicionar redação
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {essays.map(essay => {
                const { comments: cleanComments, competencies: essayComps } = parseEssayComments(essay.comments);
                return (
                  <article
                    key={essay.id}
                    className="group flex flex-col justify-between rounded-[22px] border border-slate-200/70 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/5 dark:bg-[#151826]"
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => essay.file_path && viewFile(essay.file_path, essay.file_type ?? 'image')}
                          className={cn(
                            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all',
                            essay.file_path
                              ? 'cursor-pointer bg-emerald-500/15 text-[#008E32] dark:text-[#19E85F] hover:scale-105'
                              : 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-white/30',
                          )}
                          disabled={!essay.file_path}
                          title={essay.file_path ? 'Ver arquivo' : 'Sem arquivo'}
                        >
                          {essay.file_type === 'pdf' ? <FileText size={18} strokeWidth={2.4} /> : <ImageIcon size={18} strokeWidth={2.4} />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-display text-base font-bold text-[#14102A] dark:text-white">
                            {essay.title}
                          </h3>
                          <p className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
                            {essay.written_at ? new Date(essay.written_at).toLocaleDateString('pt-BR') : 'Sem data'}
                          </p>
                        </div>

                        {essay.grade !== null && (
                          <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#00D64B]/15 px-3 py-0.5 font-display text-xs font-bold text-[#008E32] dark:text-[#19E85F]">
                            <Star size={11} strokeWidth={2.6} /> {essay.grade}
                          </span>
                        )}
                      </div>

                      {essay.prompt && (
                        <p className="mt-3 line-clamp-2 text-xs font-medium italic text-[#645F78] dark:text-white/60">
                          “{essay.prompt}”
                        </p>
                      )}

                      {essayComps && (
                        <div className="mt-3.5">
                          <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                            <Award size={11} strokeWidth={2.4} /> Competências ENEM
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
                                    'rounded-xl border py-1 text-center',
                                    isHigh
                                      ? 'border-emerald-500/20 bg-emerald-500/10 text-[#008E32] dark:text-[#19E85F]'
                                      : isMed
                                      ? 'border-amber-500/20 bg-amber-500/10 text-[#D68200] dark:text-[#FFB84D]'
                                      : 'border-slate-200/60 bg-slate-50 text-slate-600 dark:border-white/5 dark:bg-white/5 dark:text-white/60'
                                  )}
                                >
                                  <div className="text-[9px] font-bold">C{idx + 1}</div>
                                  <div className="font-display text-xs font-bold leading-none mt-0.5">{val}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {cleanComments && (
                        <p className="mt-3 line-clamp-2 rounded-xl bg-slate-50 p-2 text-xs font-medium text-[#645F78] dark:bg-white/5 dark:text-white/60">
                          {cleanComments}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/5 text-xs font-semibold">
                      <button
                        onClick={() => openEdit(essay.id)}
                        className="inline-flex items-center gap-1.5 text-[#008E32] hover:text-[#006e26] dark:text-[#19E85F] transition-colors"
                      >
                        <Pencil size={12} strokeWidth={2.4} /> Editar
                      </button>
                      <button
                        onClick={() => handleDelete(essay.id, essay.file_path)}
                        className="inline-flex items-center gap-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={12} strokeWidth={2.4} /> Excluir
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
            <button
              onClick={() => setDialogOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#645F78] hover:text-[#14102A] dark:text-[#9D96B8] dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.title.trim()}
              className="px-5 py-2 rounded-full bg-[#00D64B] hover:bg-[#19E85F] text-[#14102A] text-xs font-bold shadow-xs transition-all disabled:opacity-50"
            >
              {saving ? 'Salvando…' : 'Salvar redação'}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {formError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="red-titulo" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                Título da redação *
              </label>
              <input
                id="red-titulo"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-[#14102A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D64B]"
                placeholder="Ex: Redação Simulado 4 — Maio"
              />
            </div>
            <div>
              <label htmlFor="red-data" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                Data
              </label>
              <input
                id="red-data"
                type="date"
                value={form.written_at}
                onChange={e => setForm(f => ({ ...f, written_at: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-[#14102A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D64B]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="red-tema" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Tema / proposta <span className="font-normal opacity-70">(opcional)</span>
            </label>
            <textarea
              id="red-tema"
              value={form.prompt}
              onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3 text-xs font-medium text-[#14102A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D64B] min-h-[70px]"
              placeholder="Ex: Desafios para a valorização do trabalho de cuidado realizado por mulheres no Brasil"
            />
          </div>

          {/* Competências */}
          <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/70 p-4.5 dark:border-white/5 dark:bg-white/5">
            <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="flex items-center gap-1.5 font-display text-base font-bold text-[#14102A] dark:text-white">
                  <Award size={16} strokeWidth={2.4} /> Notas por competência
                </h4>
                <p className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
                  De 0 a 200 em cada uma — o total é calculado automaticamente.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-[#14102A] dark:text-white">
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
                  className="h-4 w-4 rounded text-[#00D64B] focus:ring-[#00D64B]"
                />
                Calcular pelas 5 competências
              </label>
            </div>

            {useCompetencies ? (
              <div className="flex flex-col gap-3">
                {COMPETENCIES_INFO.map(comp => {
                  const currentScore = competencies[comp.key];
                  return (
                    <div key={comp.key} className="rounded-2xl border border-slate-200/70 bg-white p-3.5 dark:border-white/5 dark:bg-[#151826]">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="block text-xs font-bold text-[#14102A] dark:text-white">{comp.title}</p>
                          <p className="line-clamp-1 text-[11px] font-medium text-[#645F78] dark:text-[#9D96B8]">{comp.desc}</p>
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
                            className="w-16 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-center font-display text-xs font-bold text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-white"
                          />
                          <span className="font-display text-xs font-bold text-[#645F78] dark:text-white/50">/200</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {SCORE_LEVELS.map(score => (
                          <button
                            type="button"
                            key={score}
                            onClick={() => updateCompetencyScore(comp.key, score)}
                            className={cn(
                              'rounded-lg px-2.5 py-1 font-display text-xs font-bold transition-all',
                              currentScore === score
                                ? 'bg-[#00D64B] text-[#14102A] shadow-xs'
                                : 'bg-slate-100 text-[#645F78] hover:bg-slate-200/70 dark:bg-white/5 dark:text-[#9D96B8] dark:hover:bg-white/10'
                            )}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#00D64B]/15 p-4 text-[#14102A] dark:text-white">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#008E32] dark:text-[#19E85F]">Nota total da redação</p>
                    <p className="text-xs font-medium opacity-70">Soma automática de C1 + C2 + C3 + C4 + C5</p>
                  </div>
                  <div className="font-display text-3xl font-bold leading-none text-[#008E32] dark:text-[#19E85F]">
                    {calculateTotal(competencies)}
                    <span className="ml-1 text-xs font-bold opacity-60">/1000</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="red-nota" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                  Nota total direta (0 a 1000)
                </label>
                <input
                  id="red-nota"
                  type="number"
                  min={0}
                  max={1000}
                  value={form.grade}
                  onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151826] px-3.5 py-2.5 font-display text-base font-bold text-[#14102A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D64B]"
                  placeholder="Ex: 840"
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="red-comentarios" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Comentários e feedbacks <span className="font-normal opacity-70">(opcional)</span>
            </label>
            <textarea
              id="red-comentarios"
              value={form.comments}
              onChange={e => setForm(f => ({ ...f, comments: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3 text-xs font-medium text-[#14102A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D64B] min-h-[70px]"
              placeholder="Feedback do corretor, pontos de melhoria, observações de repertório…"
            />
          </div>

          <div>
            <label htmlFor="red-arquivo" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Arquivo da redação <span className="font-normal opacity-70">(foto ou PDF)</span>
            </label>
            <input
              id="red-arquivo"
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-2 text-xs font-medium text-[#14102A] dark:text-white"
            />
            {previewUrl && (
              <div className="relative mt-2 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
                <img src={previewUrl} alt="Pré-visualização" className="max-h-48 w-full bg-slate-50 dark:bg-white/5 object-contain" />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(null);
                    setForm(f => ({ ...f, file: null }));
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  aria-label="Remover arquivo"
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs hover:bg-black/80"
                >
                  <X size={14} strokeWidth={2.4} />
                </button>
              </div>
            )}
            {editingId && !form.file && essays.find(e => e.id === editingId)?.file_path && (
              <p className="mt-1.5 text-[11px] font-medium text-[#645F78] dark:text-[#9D96B8]">
                Arquivo atual mantido. Selecione um novo se desejar substituir.
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/* Visualizador */}
      {viewingFile && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
          onClick={() => setViewingFile(null)}
        >
          <button
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={() => setViewingFile(null)}
            aria-label="Fechar visualizador"
          >
            <X size={18} strokeWidth={2.4} />
          </button>
          {viewingFile.type === 'pdf' ? (
            <iframe
              src={viewingFile.url}
              className="h-full max-h-[90vh] w-full max-w-4xl rounded-2xl border border-white/10 bg-white"
              title="PDF viewer"
            />
          ) : (
            <img
              src={viewingFile.url}
              alt="Redação"
              className="max-h-[90vh] max-w-full rounded-2xl border border-white/10 object-contain"
              onClick={e => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  );
}
