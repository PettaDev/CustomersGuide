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

A aplicação usa `HashRouter` e `base: './'`. A interface continua estática, enquanto o assistente usa a função serverless `api/chat.ts` na Vercel.

## Assistente de IA

O chat usa o Vercel AI Gateway com autenticação OIDC, sem expor chaves no navegador ou no repositório. Para ativar as respostas em um projeto novo:

1. Vincule o projeto à Vercel.
2. Habilite o AI Gateway para a equipe e mantenha uma forma de pagamento válida para liberar os créditos.
3. Faça o deploy normalmente; a Vercel fornece `VERCEL_OIDC_TOKEN` automaticamente.

O modelo padrão é `openai/gpt-5.6-luna`. Defina a variável server-side opcional `AI_MODEL` para trocar por outro modelo disponível no Gateway.

## Conteúdo orientado a configuração

- `src/themes/*.ts`: identidade visual das marcas, descoberta automaticamente.
- `src/guides/<marca>/*.json`: guias por método, descobertos automaticamente.
- `src/locales/*/translation.json`: textos de interface e conteúdo traduzido.
- `public/brandmarks`: logos vetoriais locais.
- `public/illustrations`: ilustrações dos passos.

Não há banco de dados nem autenticação de usuário. Progresso, tema, idioma e histórico visível do chat são mantidos apenas no navegador; a função limita o histórico enviado a cada resposta.
