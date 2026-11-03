import type { Idioma } from '../data/conteudo';

const locale = (idioma: Idioma) => (idioma === 'pt' ? 'pt-BR' : 'en-US');

// 45 → "+45 mil" (PT) / "45K+" (EN). Com `exato`, o TikTok sai sem o "+".
export function milhares(n: number, idioma: Idioma, mais = true): string {
  const v = Math.round(n).toLocaleString(locale(idioma));
  if (idioma === 'pt') return `${mais ? '+' : ''}${v} mil`;
  return `${v}K${mais ? '+' : ''}`;
}

// 80.8 → "80,8%" (PT) / "80.8%" (EN)
export function percentual(n: number, idioma: Idioma): string {
  return `${n.toLocaleString(locale(idioma), { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

export type Formato = 'milhares' | 'milhares-exato' | 'percentual';

export function formatar(n: number, tipo: Formato, idioma: Idioma): string {
  if (tipo === 'percentual') return percentual(n, idioma);
  return milhares(n, idioma, tipo === 'milhares');
}
