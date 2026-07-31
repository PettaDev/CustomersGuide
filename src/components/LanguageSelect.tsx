import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useApp } from '../context/AppContext'
import type { LanguageCode } from '../types'

const languageCodes: LanguageCode[] = ['en', 'pt-BR', 'zh-CN']

export function LanguageSelect({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation()
  const { session, setLanguage } = useApp()
  return (
    <label className="language-select">
      <Languages size={17} aria-hidden="true" />
      <span className={compact ? 'sr-only' : 'hidden xl:inline'}>{t('actions.changeLanguage')}</span>
      <select
        aria-label={t('actions.changeLanguage')}
        value={session.language ?? 'en'}
        onChange={(event) => setLanguage(event.target.value as LanguageCode)}
      >
        {languageCodes.map((code) => <option key={code} value={code}>{t('languages.' + code)}</option>)}
      </select>
    </label>
  )
}
