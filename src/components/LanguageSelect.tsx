import { Check, ChevronDown, Languages } from 'lucide-react'
import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useApp } from '../context/AppContext'
import { languageOptions } from '../data/languages'
import type { LanguageCode } from '../types'

export function LanguageSelect({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation()
  const { session, setLanguage } = useApp()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const menuId = useId()
  const selectedCode = session.language ?? 'en'
  const selected = languageOptions.find((language) => language.code === selectedCode) ?? languageOptions[0]

  useEffect(() => {
    if (!open) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    const frame = window.requestAnimationFrame(() => {
      const selectedIndex = languageOptions.findIndex((language) => language.code === selectedCode)
      optionRefs.current[selectedIndex]?.focus()
    })

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open, selectedCode])

  const chooseLanguage = (code: LanguageCode) => {
    setLanguage(code)
    setOpen(false)
    window.requestAnimationFrame(() => triggerRef.current?.focus())
  }

  const moveOptionFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const currentIndex = optionRefs.current.findIndex((option) => option === document.activeElement)
    const lastIndex = languageOptions.length - 1
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? lastIndex
        : event.key === 'ArrowDown'
          ? (currentIndex + 1) % languageOptions.length
          : (currentIndex <= 0 ? lastIndex : currentIndex - 1)
    optionRefs.current[nextIndex]?.focus()
  }

  return (
    <div ref={rootRef} className={'language-picker' + (compact ? ' is-compact' : '')}>
      <button
        ref={triggerRef}
        type="button"
        className="language-picker-trigger"
        aria-label={t('actions.changeLanguage')}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return
          event.preventDefault()
          setOpen(true)
        }}
      >
        <Languages size={17} aria-hidden="true" />
        <span className="language-picker-value">{t('languages.' + selected.code)}</span>
        <ChevronDown className={open ? 'is-open' : ''} size={15} aria-hidden="true" />
      </button>
      {open ? (
        <div id={menuId} className="language-picker-menu" role="listbox" aria-label={t('actions.changeLanguage')} onKeyDown={moveOptionFocus}>
          <div className="language-picker-title">{t('actions.changeLanguage')}</div>
          {languageOptions.map((language, index) => {
            const active = language.code === selected.code
            return (
              <button
                ref={(element) => { optionRefs.current[index] = element }}
                key={language.code}
                type="button"
                role="option"
                aria-selected={active}
                className={active ? 'is-active' : ''}
                onClick={() => chooseLanguage(language.code)}
              >
                <img src={language.flag} alt="" aria-hidden="true" />
                <span><strong>{language.native}</strong><small>{language.shortCode}</small></span>
                <Check size={16} aria-hidden="true" />
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
