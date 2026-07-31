import type { LanguageCode } from '../types'

export interface LanguageOption {
  code: LanguageCode
  flag: string
  native: string
  shortCode: string
}

export const languageOptions: LanguageOption[] = [
  { code: 'en', flag: './flags/us.svg', native: 'English', shortCode: 'EN' },
  { code: 'pt-BR', flag: './flags/br.svg', native: 'Português (Brasil)', shortCode: 'PT · BR' },
  { code: 'es-419', flag: './flags/latam.svg', native: 'Español (Latinoamérica)', shortCode: 'ES · LATAM' },
  { code: 'zh-CN', flag: './flags/cn.svg', native: '简体中文', shortCode: 'ZH · CN' },
]
