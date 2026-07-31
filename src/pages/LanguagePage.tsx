import { motion } from 'framer-motion'
import { ArrowRight, Check, Globe2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useApp } from '../context/AppContext'
import { PageIntro } from '../components/PageIntro'
import { languageOptions } from '../data/languages'

export function LanguagePage() {
  const { t } = useTranslation()
  const { session, setLanguage } = useApp()
  return (
    <div className="selection-page">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <div className="selection-content">
        <div className="welcome-mark"><Globe2 size={18} /><span>{t('app.badge')}</span></div>
        <PageIntro eyebrow={t('languages.choose.eyebrow')} title={t('languages.choose.title')} description={t('languages.choose.description')} />
        <div className="language-grid">
          {languageOptions.map((language, index) => {
            const selected = session.language === language.code
            return (
              <motion.button
                key={language.code}
                type="button"
                className={'selection-card language-card ' + (selected ? 'is-selected' : '')}
                onClick={() => setLanguage(language.code)}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * index }}
                whileHover={{ y: -5 }}
              >
                <span className="card-check">{selected ? <Check size={16} /> : <ArrowRight size={16} />}</span>
                <img className="language-flag" src={language.flag} alt="" aria-hidden="true" />
                <strong>{language.native}</strong>
                <span className="language-code">{language.code}</span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
