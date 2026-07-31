# Transsion Log Guide

Plataforma estática e interativa para orientar a coleta de logs Android em dispositivos Infinix, TECNO e itel.

## Desenvolvimento

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

A aplicação usa `HashRouter` e `base: './'`, portanto o mesmo artefato estático funciona na Vercel e no GitHub Pages.

## Conteúdo orientado a configuração

- `src/themes/*.ts`: identidade visual das marcas, descoberta automaticamente.
- `src/guides/<marca>/*.json`: guias por método, descobertos automaticamente.
- `src/locales/*/translation.json`: textos de interface e conteúdo traduzido.
- `public/brandmarks`: logos vetoriais locais.
- `public/illustrations`: ilustrações dos passos.

Não há backend, autenticação ou banco de dados. Progresso, tema e idioma são salvos apenas no navegador.
