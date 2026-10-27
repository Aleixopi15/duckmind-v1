import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Star,
  Copy,
  Check,
  Trash2,
  Pencil,
  BookOpen,
  Sparkles,
  Bookmark,
  Quote,
  Lightbulb,
  Users,
  Cpu,
  Globe,
  HeartPulse,
  GraduationCap,
  Shield,
  Scale,
  X,
  Filter,
} from 'lucide-react';
import {
  type EixoTematico,
  type TipoRepertorio,
  type RepertorioItem,
  EIXOS_CONFIG,
  TIPOS_CONFIG,
  INITIAL_REPERTORIOS,
} from '../lib/repertoriosData';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/theme';
import Modal from './Modal';

const CUSTOM_REPERTORIOS_KEY = 'duckmind_repertorios_custom_v1';
const FAVORITES_KEY = 'duckmind_repertorios_favs_v1';

// Mapping lucide icons to axis keys
const AXIS_ICONS: Record<EixoTematico, React.FC<{ size?: number; className?: string; strokeWidth?: number }>> = {
  cidadania: Users,
  tecnologia: Cpu,
  meio_ambiente: Globe,
  saude: HeartPulse,
  educacao: GraduationCap,
  seguranca: Shield,
  trabalho: Scale,
};

type RepertorioForm = {
  autorOuObra: string;
  tituloConceito: string;
  eixo: EixoTematico;
  tipo: TipoRepertorio;
  anoOuOrigem: string;
  conceito: string;
  citacao: string;
  comoUsar: string;
  palavrasChave: string;
};

const EMPTY_FORM: RepertorioForm = {
  autorOuObra: '',
  tituloConceito: '',
  eixo: 'cidadania',
  tipo: 'filosofia_sociologia',
  anoOuOrigem: '',
  conceito: '',
  citacao: '',
  comoUsar: '',
  palavrasChave: '',
};

export default function BancoRepertorios() {
  const { user } = useApp();
  const [customList, setCustomList] = useState<RepertorioItem[]>(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_REPERTORIOS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [];
  });

  const [selectedAxis, setSelectedAxis] = useState<EixoTematico | 'todos'>('todos');
  const [selectedTipo, setSelectedTipo] = useState<TipoRepertorio | 'todos'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyCustom, setOnlyCustom] = useState(false);

  // Modal create/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RepertorioForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  // Copied toast state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active detail modal
  const [detailItem, setDetailItem] = useState<RepertorioItem | null>(null);

  // Sync custom items with Supabase if table exists, otherwise persist locally
  useEffect(() => {
    if (!user) return;
    let isCancelled = false;

    const loadFromSupabase = async () => {
      try {
        const [customRes, favRes] = await Promise.all([
          supabase.from('repertorios_custom').select('*').eq('user_id', user.id),
          supabase.from('repertorio_favorites').select('repertorio_id').eq('user_id', user.id),
        ]);

        if (isCancelled) return;

        if (customRes.data && Array.isArray(customRes.data) && customRes.data.length > 0) {
          const mapped: RepertorioItem[] = customRes.data.map((c: any) => ({
            id: c.id,
            autorOuObra: c.autor_ou_obra || c.autorOuObra,
            tituloConceito: c.titulo_conceito || c.tituloConceito,
            eixo: (c.eixo || 'cidadania') as EixoTematico,
            tipo: (c.tipo || 'filosofia_sociologia') as TipoRepertorio,
            anoOuOrigem: c.ano_ou_origem || c.anoOuOrigem || undefined,
            conceito: c.conceito,
            citacao: c.citacao || undefined,
            comoUsar: c.como_usar || c.comoUsar,
            palavrasChave: Array.isArray(c.palavras_chave) ? c.palavras_chave : (c.palavrasChave || []),
            isCustom: true,
          }));
          setCustomList(mapped);
        }

        if (favRes.data && Array.isArray(favRes.data) && favRes.data.length > 0) {
          setFavorites(favRes.data.map((f: any) => f.repertorio_id));
        }
      } catch {
        // Fallback to local storage
      }
    };

    void loadFromSupabase();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  // Save custom items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_REPERTORIOS_KEY, JSON.stringify(customList));
    } catch {
      // ignore
    }
  }, [customList]);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites(prev => {
      const isFav = prev.includes(id);
      const next = isFav ? prev.filter(x => x !== id) : [...prev, id];
      showToast(isFav ? 'Removido dos favoritos' : 'Adicionado aos favoritos ⭐');

      if (user) {
        if (isFav) {
          void supabase
            .from('repertorio_favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('repertorio_id', id)
            .then(({ error }) => {
              if (error) console.error('[Supabase] Erro ao desfavoritar:', error.message);
            });
        } else {
          void supabase
            .from('repertorio_favorites')
            .insert({ user_id: user.id, repertorio_id: id })
            .then(({ error }) => {
              if (error) {
                console.error('[Supabase] Erro ao favoritar:', error.message);
                showToast(`Salvo localmente (erro nuvem: ${error.message})`);
              }
            });
        }
      }

      return next;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  };

  const copyToClipboard = (item: RepertorioItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const textToCopy = item.citacao
      ? `"${item.citacao}" → ${item.autorOuObra} (${item.tituloConceito}).\n\nAplicação ENEM: ${item.comoUsar}`
      : `${item.tituloConceito} (${item.autorOuObra}): ${item.conceito}\n\nAplicação ENEM: ${item.comoUsar}`;

    navigator.clipboard?.writeText(textToCopy);
    setCopiedId(item.id);
    showToast('Repertório copiado para a área de transferência!');
    setTimeout(() => {
      setCopiedId(prev => (prev === item.id ? null : prev));
    }, 2200);
  };

  // Combine initial presets + custom items
  const allRepertorios = useMemo(() => {
    return [...customList, ...INITIAL_REPERTORIOS];
  }, [customList]);

  // Filtered list
  const filteredRepertorios = useMemo(() => {
    return allRepertorios.filter(item => {
      // Axis filter
      if (selectedAxis !== 'todos' && item.eixo !== selectedAxis) {
        return false;
      }
      // Type filter
      if (selectedTipo !== 'todos' && item.tipo !== selectedTipo) {
        return false;
      }
      // Favorites filter
      if (onlyFavorites && !favorites.includes(item.id)) {
        return false;
      }
      // Custom filter
      if (onlyCustom && !item.isCustom) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.tituloConceito.toLowerCase().includes(q);
        const matchAuthor = item.autorOuObra.toLowerCase().includes(q);
        const matchConcept = item.conceito.toLowerCase().includes(q);
        const matchHow = item.comoUsar.toLowerCase().includes(q);
        const matchQuote = item.citacao?.toLowerCase().includes(q) ?? false;
        const matchTags = item.palavrasChave.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchAuthor && !matchConcept && !matchHow && !matchQuote && !matchTags) {
          return false;
        }
      }
      return true;
    });
  }, [allRepertorios, selectedAxis, selectedTipo, onlyFavorites, onlyCustom, searchQuery, favorites]);

  // Counts by axis
  const countByAxis = useMemo(() => {
    const counts: Record<string, number> = { todos: allRepertorios.length };
    (Object.keys(EIXOS_CONFIG) as EixoTematico[]).forEach(axis => {
      counts[axis] = allRepertorios.filter(r => r.eixo === axis).length;
    });
    return counts;
  }, [allRepertorios]);

  const openNewModal = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      eixo: selectedAxis === 'todos' ? 'cidadania' : selectedAxis,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (item: RepertorioItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(item.id);
    setForm({
      autorOuObra: item.autorOuObra,
      tituloConceito: item.tituloConceito,
      eixo: item.eixo,
      tipo: item.tipo,
      anoOuOrigem: item.anoOuOrigem || '',
      conceito: item.conceito,
      citacao: item.citacao || '',
      comoUsar: item.comoUsar,
      palavrasChave: item.palavrasChave.join(', '),
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCustomList(prev => prev.filter(x => x.id !== id));
    setFavorites(prev => prev.filter(x => x !== id));
    if (detailItem?.id === id) setDetailItem(null);
    showToast('Repertório removido com sucesso!');

    if (user) {
      void supabase.from('repertorios_custom').delete().eq('user_id', user.id).eq('id', id);
      void supabase.from('repertorio_favorites').delete().eq('user_id', user.id).eq('repertorio_id', id);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.autorOuObra.trim() || !form.tituloConceito.trim() || !form.conceito.trim() || !form.comoUsar.trim()) {
      setFormError('Preencha os campos obrigatórios (Autor/Obra, Título/Conceito, Conceito e Como Usar).');
      return;
    }

    const tags = form.palavrasChave
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    if (editingId) {
      const updatedItem: Partial<RepertorioItem> = {
        autorOuObra: form.autorOuObra.trim(),
        tituloConceito: form.tituloConceito.trim(),
        eixo: form.eixo,
        tipo: form.tipo,
        anoOuOrigem: form.anoOuOrigem.trim() || undefined,
        conceito: form.conceito.trim(),
        citacao: form.citacao.trim() || undefined,
        comoUsar: form.comoUsar.trim(),
        palavrasChave: tags,
      };

      setCustomList(prev =>
        prev.map(item =>
          item.id === editingId
            ? { ...item, ...updatedItem }
            : item
        )
      );
      showToast('Repertório atualizado com sucesso!');

      if (user) {
        const { error } = await supabase.from('repertorios_custom').update({
          autor_ou_obra: updatedItem.autorOuObra,
          titulo_conceito: updatedItem.tituloConceito,
          eixo: updatedItem.eixo,
          tipo: updatedItem.tipo,
          ano_ou_origem: updatedItem.anoOuOrigem || null,
          conceito: updatedItem.conceito,
          citacao: updatedItem.citacao || null,
          como_usar: updatedItem.comoUsar,
          palavras_chave: updatedItem.palavrasChave,
        }).eq('user_id', user.id).eq('id', editingId);

        if (error) {
          console.error('[Supabase] Erro ao atualizar repertório:', error.message);
          showToast(`Atenção: Salvo no navegador, mas erro no banco: ${error.message}`);
        }
      }
    } else {
      const newItemId = `custom-rep-${Date.now()}`;
      const newItem: RepertorioItem = {
        id: newItemId,
        autorOuObra: form.autorOuObra.trim(),
        tituloConceito: form.tituloConceito.trim(),
        eixo: form.eixo,
        tipo: form.tipo,
        anoOuOrigem: form.anoOuOrigem.trim() || undefined,
        conceito: form.conceito.trim(),
        citacao: form.citacao.trim() || undefined,
        comoUsar: form.comoUsar.trim(),
        palavrasChave: tags.length > 0 ? tags : ['repertório pessoal', 'redação enem'],
        isCustom: true,
      };
      setCustomList(prev => [newItem, ...prev]);
      showToast('Novo repertório adicionado ao seu banco!');

      if (user) {
        const { error } = await supabase.from('repertorios_custom').insert({
          id: newItemId,
          user_id: user.id,
          autor_ou_obra: newItem.autorOuObra,
          titulo_conceito: newItem.tituloConceito,
          eixo: newItem.eixo,
          tipo: newItem.tipo,
          ano_ou_origem: newItem.anoOuOrigem || null,
          conceito: newItem.conceito,
          citacao: newItem.citacao || null,
          como_usar: newItem.comoUsar,
          palavras_chave: newItem.palavrasChave,
        });

        if (error) {
          console.error('[Supabase] Erro ao inserir repertório:', error.message);
          showToast(`Atenção: Salvo no navegador, mas erro no banco: ${error.message}`);
        }
      }
    }

    setModalOpen(false);
  };

  const activeAxisConfig = selectedAxis !== 'todos' ? EIXOS_CONFIG[selectedAxis] : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[1100] flex animate-bounce-subtle items-center gap-2 rounded-full border border-emerald-500/20 bg-[#00D64B] px-5 py-3 text-xs font-bold text-[#14102A] shadow-xl">
          <Sparkles size={15} strokeWidth={2.6} />
          {toastMessage}
        </div>
      )}

      {/* Top Banner / Info Card */}
      <div className="relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white p-6 shadow-xs dark:border-white/5 dark:bg-[#151826] md:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#00D64B]/15 px-3 py-1 text-xs font-bold text-[#008E32] dark:text-[#19E85F]">
            <Sparkles size={13} strokeWidth={2.4} /> Banco sociocultural ENEM
          </div>
          <h2 className="mb-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-white">
            Repertórios por eixo temático
          </h2>
          <p className="mb-6 text-xs sm:text-sm font-medium leading-relaxed text-[#645F78] dark:text-[#9D96B8]">
            Amplie sua nota na <strong>Competência 2</strong> e <strong>Competência 3</strong>.
            Filtre citações, conceitos filosóficos, leis e obras validadas para aplicar diretamente na sua redação.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={openNewModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00D64B] hover:bg-[#19E85F] text-[#14102A] text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
            >
              <Plus size={15} strokeWidth={3} /> Adicionar repertório
            </button>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-[#14102A] dark:border-white/10 dark:bg-white/5 dark:text-white">
              <BookOpen size={13} strokeWidth={2.4} />
              <span>{allRepertorios.length} no banco</span>
              <span className="opacity-40">·</span>
              <Star size={13} strokeWidth={2.4} className="text-amber-500 fill-amber-500" />
              <span>{favorites.length} salvos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Filters: Eixos Temáticos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8] flex items-center gap-1.5">
            <Filter size={13} strokeWidth={2.4} />
            Eixos Temáticos do ENEM
          </label>
          <span className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
            {filteredRepertorios.length} de {allRepertorios.length} exibidos
          </span>
        </div>

        {/* Eixos Pill Nav */}
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedAxis('todos')}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all',
              selectedAxis === 'todos'
                ? 'bg-[#00D64B] text-[#14102A] shadow-xs'
                : 'border border-slate-200/80 bg-white text-[#645F78] hover:bg-slate-50 dark:border-white/5 dark:bg-[#151826] dark:text-[#9D96B8] dark:hover:bg-white/5',
            )}
          >
            <BookOpen size={13} strokeWidth={2.4} />
            Todos os eixos
            <span className="rounded-full bg-black/10 px-1.5 text-[10px] font-bold dark:bg-white/10">
              {countByAxis.todos}
            </span>
          </button>

          {(Object.keys(EIXOS_CONFIG) as EixoTematico[]).map(axisKey => {
            const config = EIXOS_CONFIG[axisKey];
            const Icon = AXIS_ICONS[axisKey];
            const isSelected = selectedAxis === axisKey;
            const count = countByAxis[axisKey] || 0;

            return (
              <button
                key={axisKey}
                onClick={() => setSelectedAxis(axisKey)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all',
                  isSelected
                    ? 'bg-[#00D64B] text-[#14102A] shadow-xs'
                    : 'border border-slate-200/80 bg-white text-[#645F78] hover:bg-slate-50 dark:border-white/5 dark:bg-[#151826] dark:text-[#9D96B8] dark:hover:bg-white/5',
                )}
              >
                <span
                  className="flex h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: config.cor }}
                />
                <Icon size={13} strokeWidth={2.4} />
                {config.label}
                <span className="rounded-full bg-black/10 px-1.5 text-[10px] font-bold dark:bg-white/10">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Axis Description Box */}
        {activeAxisConfig && (
          <div
            className="p-3.5 rounded-2xl border text-xs flex items-start gap-3 animate-fade-in"
            style={{
              backgroundColor: `${activeAxisConfig.cor}12`,
              borderColor: `${activeAxisConfig.cor}35`,
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold"
              style={{ backgroundColor: activeAxisConfig.cor }}
            >
              {React.createElement(AXIS_ICONS[selectedAxis as EixoTematico], { size: 16 })}
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-slate-100">
                Eixo: {activeAxisConfig.label}
              </div>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                {activeAxisConfig.desc}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Secondary Search and Filters Bar */}
      <div className="card flex flex-col items-stretch justify-between gap-3 p-3.5 md:flex-row md:items-center">
        {/* Busca */}
        <div className="relative flex-1">
          <Search
            size={16}
            strokeWidth={3}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted dark:text-papel/50"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por pensador, obra, citação ou palavra-chave (ex: Bauman, CF/88, IA)…"
            className="input w-full py-1.5 pl-9 pr-8 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Limpar busca"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-tinta dark:text-papel/50 dark:hover:text-papel"
            >
              <X size={14} strokeWidth={3} />
            </button>
          )}
        </div>

        {/* Tipo e alternadores */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedTipo}
            onChange={e => setSelectedTipo(e.target.value as any)}
            aria-label="Filtrar por tipo de repertório"
            className="input w-auto py-1.5 text-sm font-bold"
            style={{ borderRadius: 9999 }}
          >
            <option value="todos">Todos os tipos</option>
            <option value="filosofia_sociologia">Filosofia & Sociologia</option>
            <option value="legislacao">Legislação & Leis</option>
            <option value="literatura">Literatura & Obras</option>
            <option value="cinema_midia">Cinema & Mídia</option>
            <option value="historia_fatos">História & Fatos</option>
          </select>

          <button
            onClick={() => setOnlyFavorites(prev => !prev)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-bold transition-all',
              onlyFavorites
                ? 'border-amber-300 bg-amber-500/15 text-[#D68200] dark:border-amber-500/30 dark:text-[#FFB84D]'
                : 'border-slate-200/80 bg-white text-[#645F78] hover:text-[#14102A] hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-[#9D96B8] dark:hover:text-white',
            )}
          >
            <Star size={13} strokeWidth={2.4} className={onlyFavorites ? 'fill-amber-500' : ''} />
            Favoritos ({favorites.length})
          </button>

          {customList.length > 0 && (
            <button
              onClick={() => setOnlyCustom(prev => !prev)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-bold transition-all',
                onlyCustom
                  ? 'border-[#00D64B]/40 bg-[#00D64B]/15 text-[#008E32] dark:border-[#00D64B]/30 dark:text-[#19E85F]'
                  : 'border-slate-200/80 bg-white text-[#645F78] hover:text-[#14102A] hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-[#9D96B8] dark:hover:text-white',
              )}
            >
              <Bookmark size={13} strokeWidth={2.4} />
              Meus ({customList.length})
            </button>
          )}
        </div>
      </div>

      {/* List of Repertórios */}
      {filteredRepertorios.length === 0 ? (
        <div className="card p-10 text-center">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00D64B]/15 text-[#008E32] dark:text-[#19E85F]">
            <BookOpen size={28} strokeWidth={2.4} />
          </span>
          <h3 className="mb-1 font-display text-xl font-bold text-[#14102A] dark:text-white">
            Nenhum repertório encontrado
          </h3>
          <p className="mx-auto mb-5 max-w-md text-sm font-medium text-[#645F78] dark:text-[#9D96B8]">
            Tente mudar os filtros de eixo temático, limpar a busca ou cadastrar seu próprio repertório.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {(selectedAxis !== 'todos' || selectedTipo !== 'todos' || searchQuery || onlyFavorites || onlyCustom) && (
              <button
                onClick={() => {
                  setSelectedAxis('todos');
                  setSelectedTipo('todos');
                  setSearchQuery('');
                  setOnlyFavorites(false);
                  setOnlyCustom(false);
                }}
                className="rounded-full border border-slate-200/80 bg-white px-4 py-2 text-xs font-bold text-[#645F78] hover:text-[#14102A] dark:border-white/10 dark:bg-white/5 dark:text-[#9D96B8] dark:hover:text-white"
              >
                Limpar filtros
              </button>
            )}
            <button
              onClick={openNewModal}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#00D64B] px-5 py-2 text-xs font-bold text-[#14102A] shadow-xs hover:bg-[#19E85F] transition-all"
            >
              <Plus size={15} strokeWidth={2.6} /> Cadastrar repertório
            </button>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredRepertorios.map(item => {
            const isFav = favorites.includes(item.id);
            const isCopied = copiedId === item.id;
            const axisConfig = EIXOS_CONFIG[item.eixo];
            const tipoConfig = TIPOS_CONFIG[item.tipo];
            const AxisIcon = AXIS_ICONS[item.eixo];

            return (
              <div
                key={item.id}
                onClick={() => setDetailItem(item)}
                className="card card-hover group flex cursor-pointer flex-col justify-between p-4 md:p-5"
              >
                <div>
                  {/* Cabeçalho do card */}
                  <div className="mb-2.5 flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className="chip shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold text-white shadow-xs border-none"
                        style={{ backgroundColor: axisConfig.cor }}
                      >
                        <AxisIcon size={11} strokeWidth={2.4} />
                        {axisConfig.label}
                      </span>

                      <span className={cn('chip shrink-0 rounded-full border border-slate-200/80 dark:border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300', tipoConfig.corBadge)}>
                        {tipoConfig.label}
                      </span>

                      {item.isCustom && (
                        <span className="chip shrink-0 rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6F00D6] dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300">
                          Criado por você
                        </span>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        onClick={e => toggleFavorite(item.id, e)}
                        aria-label={isFav ? 'Remover dos favoritos' : 'Favoritar'}
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full border transition-all',
                          isFav
                            ? 'border-amber-300 bg-amber-500/15 text-[#D68200] dark:text-[#FFB84D]'
                            : 'border-slate-200/80 bg-white text-slate-400 hover:text-amber-500 hover:border-amber-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-500 dark:hover:text-amber-400',
                        )}
                        title={isFav ? 'Remover dos favoritos' : 'Favoritar'}
                      >
                        <Star size={15} strokeWidth={2.4} className={isFav ? 'fill-amber-500 text-amber-500' : ''} />
                      </button>

                      {item.isCustom && (
                        <>
                          <button
                            onClick={e => openEditModal(item, e)}
                            aria-label="Editar repertório"
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-500 hover:bg-slate-50 hover:text-[#14102A] dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:text-white transition-all"
                            title="Editar"
                          >
                            <Pencil size={13} strokeWidth={2.4} />
                          </button>
                          <button
                            onClick={e => handleDelete(item.id, e)}
                            aria-label="Excluir repertório"
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:text-rose-400 transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={13} strokeWidth={2.4} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Título e autor */}
                  <h4 className="mb-0.5 line-clamp-1 font-display text-xl font-bold leading-tight text-[#14102A] dark:text-white">
                    {item.tituloConceito}
                  </h4>
                  <div className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-[#645F78] dark:text-[#9D96B8]">
                    <span>{item.autorOuObra}</span>
                    {item.anoOuOrigem && (
                      <>
                        <span className="opacity-40">·</span>
                        <span className="font-semibold opacity-80">{item.anoOuOrigem}</span>
                      </>
                    )}
                  </div>

                  <p className="mb-3 line-clamp-3 text-sm font-medium leading-relaxed text-[#645F78] dark:text-[#9D96B8]">
                    {item.conceito}
                  </p>

                  {item.citacao && (
                    <div className="mb-3 flex items-start gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 text-sm font-medium italic text-slate-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
                      <Quote size={13} strokeWidth={2.4} className="mt-0.5 shrink-0 opacity-50" />
                      <span className="line-clamp-2">“{item.citacao}”</span>
                    </div>
                  )}

                  <div className="mb-3 rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-2.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                    <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                      <Lightbulb size={12} strokeWidth={2.4} />
                      Aplicação no ENEM (C2 / C3)
                    </div>
                    <p className="line-clamp-2 text-xs sm:text-sm font-medium leading-relaxed text-emerald-950 dark:text-emerald-200">
                      {item.comoUsar}
                    </p>
                  </div>
                </div>

                {/* Rodapé */}
                <div>
                  {item.palavrasChave.length > 0 && (
                    <div className="mb-3 flex flex-wrap items-center gap-1.5">
                      {item.palavrasChave.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="rounded-lg border border-slate-200/60 bg-slate-100/60 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                        >
                          #{tag}
                        </span>
                      ))}
                      {item.palavrasChave.length > 3 && (
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                          +{item.palavrasChave.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-white/5">
                    <button
                      onClick={e => copyToClipboard(item, e)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all',
                        isCopied
                          ? 'border-[#00D64B] bg-[#00D64B] text-[#14102A]'
                          : 'border-slate-200/90 bg-white text-[#14102A] hover:bg-slate-50 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10',
                      )}
                      title="Copiar citação formatada para redação"
                    >
                      {isCopied ? <Check size={13} strokeWidth={2.4} /> : <Copy size={13} strokeWidth={2.4} />}
                      {isCopied ? 'Copiado!' : 'Copiar p/ redação'}
                    </button>

                    <span className="text-xs font-bold text-[#6F00D6] group-hover:underline dark:text-[#B26BFF]">
                      Ver detalhes
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {detailItem && (
        <Modal
          open={Boolean(detailItem)}
          onClose={() => setDetailItem(null)}
          title={detailItem.tituloConceito}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFavorite(detailItem.id)}
                  className={cn(
                    'btn-secondary text-xs px-3 py-2 gap-1.5',
                    favorites.includes(detailItem.id) ? 'text-amber-500 border-amber-300' : ''
                  )}
                >
                  <Star
                    size={14}
                    className={favorites.includes(detailItem.id) ? 'fill-amber-500' : ''}
                  />
                  {favorites.includes(detailItem.id) ? 'Favoritado' : 'Favoritar'}
                </button>
                {detailItem.isCustom && (
                  <button
                    onClick={() => {
                      const it = detailItem;
                      setDetailItem(null);
                      openEditModal(it);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-bold text-[#14102A] hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 transition-colors"
                  >
                    <Pencil size={13} strokeWidth={2.4} /> Editar
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(detailItem)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#00D64B] px-5 py-2 text-xs font-bold text-[#14102A] shadow-xs hover:bg-[#19E85F] transition-all"
                >
                  {copiedId === detailItem.id ? <Check size={14} strokeWidth={2.4} /> : <Copy size={14} strokeWidth={2.4} />}
                  {copiedId === detailItem.id ? 'Copiado!' : 'Copiar p/ Redação'}
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Cabeçalho */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="chip rounded-full px-2.5 py-0.5 text-xs font-bold text-white shadow-xs border-none"
                style={{ backgroundColor: EIXOS_CONFIG[detailItem.eixo].cor }}
              >
                {React.createElement(AXIS_ICONS[detailItem.eixo], { size: 12 })}
                {EIXOS_CONFIG[detailItem.eixo].label}
              </span>

              <span className={cn('chip rounded-full border border-slate-200/80 dark:border-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300', TIPOS_CONFIG[detailItem.tipo].corBadge)}>
                {TIPOS_CONFIG[detailItem.tipo].label}
              </span>

              {detailItem.anoOuOrigem && (
                <span className="text-sm font-semibold text-[#645F78] dark:text-[#9D96B8]">
                  {detailItem.anoOuOrigem}
                </span>
              )}
            </div>

            {/* Autor */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                Autor ou obra
              </div>
              <div className="font-display text-xl font-bold text-[#14102A] dark:text-white">
                {detailItem.autorOuObra}
              </div>
            </div>

            {/* Conceito */}
            <div>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                Explicação do conceito
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-sm font-medium leading-relaxed text-[#14102A] dark:border-white/10 dark:bg-white/[0.03] dark:text-white">
                {detailItem.conceito}
              </div>
            </div>

            {/* Citação */}
            {detailItem.citacao && (
              <div>
                <div className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                  <Quote size={13} strokeWidth={2.4} /> Citação marcante
                </div>
                <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-3.5 text-sm font-medium italic leading-relaxed text-amber-950 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                  “{detailItem.citacao}”
                </div>
              </div>
            )}

            {/* Aplicação */}
            <div>
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                <Lightbulb size={14} strokeWidth={2.4} />
                Como aplicar na redação (C2 & C3)
              </div>
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4 text-sm font-medium leading-relaxed text-emerald-950 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                {detailItem.comoUsar}
              </div>
            </div>

            {/* Palavras-chave */}
            {detailItem.palavrasChave.length > 0 && (
              <div>
                <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                  Palavras-chave e temas relacionados
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {detailItem.palavrasChave.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-lg border border-slate-200/60 bg-slate-100/60 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Create / Edit Custom Repertório Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Repertório' : 'Adicionar Novo Repertório'}
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-full px-5 py-2.5 text-xs font-bold text-[#645F78] hover:text-[#14102A] dark:text-[#9D96B8] dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="repertorio-form"
              className="inline-flex items-center justify-center rounded-full bg-[#00D64B] px-6 py-2.5 text-xs font-bold text-[#14102A] shadow-xs hover:bg-[#19E85F] hover:shadow-md transition-all active:scale-[0.98]"
            >
              {editingId ? 'Salvar Alterações' : 'Adicionar ao Banco'}
            </button>
          </div>
        }
      >
        <form id="repertorio-form" onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
              {formError}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3.5">
            <div>
              <label className="mb-1 block text-sm font-bold">
                Autor ou obra <span className="text-bico">*</span>
              </label>
              <input
                type="text"
                required
                value={form.autorOuObra}
                onChange={e => setForm({ ...form, autorOuObra: e.target.value })}
                placeholder="Ex: Hannah Arendt, Filme O Poço, CF/88"
                className="input text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold">
                Título / Conceito Chave <span className="text-bico">*</span>
              </label>
              <input
                type="text"
                required
                value={form.tituloConceito}
                onChange={e => setForm({ ...form, tituloConceito: e.target.value })}
                placeholder="Ex: Banalidade do Mal, Art. 6º"
                className="input text-xs"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3.5">
            <div>
              <label className="mb-1 block text-sm font-bold">Eixo Temático</label>
              <select
                value={form.eixo}
                onChange={e => setForm({ ...form, eixo: e.target.value as EixoTematico })}
                className="input text-xs"
              >
                {(Object.keys(EIXOS_CONFIG) as EixoTematico[]).map(key => (
                  <option key={key} value={key}>
                    {EIXOS_CONFIG[key].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold">Tipo de Repertório</label>
              <select
                value={form.tipo}
                onChange={e => setForm({ ...form, tipo: e.target.value as TipoRepertorio })}
                className="input text-xs"
              >
                {(Object.keys(TIPOS_CONFIG) as TipoRepertorio[]).map(key => (
                  <option key={key} value={key}>
                    {TIPOS_CONFIG[key].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold">Ano ou Origem (opcional)</label>
              <input
                type="text"
                value={form.anoOuOrigem}
                onChange={e => setForm({ ...form, anoOuOrigem: e.target.value })}
                placeholder="Ex: 1963, Brasil, 2019"
                className="input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">
              Explicação do Conceito <span className="text-bico">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={form.conceito}
              onChange={e => setForm({ ...form, conceito: e.target.value })}
              placeholder="Explique o conceito ou resumo da obra de maneira simples e clara..."
              className="input text-xs resize-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">Citação Marcante (opcional)</label>
            <input
              type="text"
              value={form.citacao}
              onChange={e => setForm({ ...form, citacao: e.target.value })}
              placeholder='Ex: "A educação é a arma mais poderosa que você pode usar para mudar o mundo."'
              className="input text-xs"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">
              Como Aplicar na Redação do ENEM (C2/C3) <span className="text-bico">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={form.comoUsar}
              onChange={e => setForm({ ...form, comoUsar: e.target.value })}
              placeholder="Diga em que parágrafo usar, com que temas combina e que tese/problematização defender..."
              className="input text-xs resize-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">Palavras-chave (separadas por vírgula)</label>
            <input
              type="text"
              value={form.palavrasChave}
              onChange={e => setForm({ ...form, palavrasChave: e.target.value })}
              placeholder="Ex: alienação, tecnologia, negligência estatal, saúde mental"
              className="input text-xs"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
