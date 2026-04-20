export type Lang = 'en' | 'es';

export function t(lang: Lang, en: string, es: string): string {
  return lang === 'es' ? es : en;
}
