/**
 * DuckMind - Utilitários de Data e Fuso Horário Local
 * 
 * Evita bugs clássicos de timezone (ex: estudos feitos à noite no Brasil UTC-3
 * sendo salvos ou exibidos no dia seguinte por causa de toISOString() ou split('T')[0]).
 */

/**
 * Retorna a data local de hoje no formato 'YYYY-MM-DD'
 * baseada estritamente no relógio local do navegador do usuário.
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converte qualquer timestamp ISO, Date ou string YYYY-MM-DD para
 * o formato 'YYYY-MM-DD' de acordo com o dia local do usuário.
 */
export function parseDateToLocalYMD(val: string | Date | null | undefined): string {
  if (!val) return '';
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return '';
    return getLocalDateString(val);
  }

  const str = String(val).trim();
  // Se já for 'YYYY-MM-DD' puro (sem horário / timezone)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // Se tiver indicação de hora ou timezone ISO
  const d = new Date(str);
  if (isNaN(d.getTime())) {
    // Fallback caso seja formato inesperado
    return str.split('T')[0] || '';
  }

  return getLocalDateString(d);
}

/**
 * Formata data para exibição em português do Brasil (DD/MM/AAAA ou DD/MM).
 */
export function formatLocalDateBR(
  val: string | Date | null | undefined,
  options?: { dayMonthOnly?: boolean }
): string {
  const ymd = parseDateToLocalYMD(val);
  if (!ymd) return '';

  const parts = ymd.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    if (options?.dayMonthOnly) {
      return `${day}/${month}`;
    }
    return `${day}/${month}/${year}`;
  }

  return ymd;
}

/**
 * Gera um timestamp seguro ao meio-dia local para salvar no Supabase,
 * garantindo que o fuso horário (ex: UTC-3) nunca empurre a data para o dia anterior ou seguinte.
 */
export function createSafeStudyTimestamp(ymd: string): string {
  const safeYMD = ymd && /^\d{4}-\d{2}-\d{2}$/.test(ymd) ? ymd : getLocalDateString();
  return `${safeYMD}T12:00:00`;
}
