import { google } from '@ai-sdk/google'
import { APICallError, generateText, type ModelMessage } from 'ai'

const SUPPORT_URL = 'https://wa.me/5511986543471'
const MODEL = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash-lite'
const ALLOWED_LANGUAGES = new Set(['en', 'pt-BR', 'es-419', 'zh-CN', 'fr', 'ar', 'ru'])
const ALLOWED_BRANDS = new Set(['infinix', 'tecno', 'itel'])
const ALLOWED_METHODS = new Set(['pc', 'mobile'])

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatContext {
  language?: string
  country?: string | null
  brand?: string | null
  method?: string | null
  stepTitle?: string | null
  stepDescription?: string | null
}

interface ChatBody {
  messages?: ChatMessage[]
  context?: ChatContext
}

const KNOWLEDGE = `
You are the official log-capture assistant for Transsion devices: Infinix (XOS), TECNO (HiOS), and itel. Help only with the evidence and DebugLoggerUI collection process described here. Diagnose the user's current obstacle, give one or a few safe steps at a time, and ask for the exact screen or error message when needed. Never invent menus, commands, results, or device-specific behavior. If the guide cannot safely solve it, clearly say so and direct the user to technical support at ${SUPPORT_URL}.

Canonical procedure:
1. Before every collection, regardless of the issue type, enable all four DebugLoggerUI categories: Mobile log, Modem log, Network log, and ConnsysLog. Then tap the trash icon, choose Clear all, keep Clear modem boot logs selected, confirm with OK, and wait for cleanup to finish.
2. Open EngineerMode by entering *#9646633# in the Phone app, then open Log and Debugging > DebugLoggerUI.
3. Start DebugLoggerUI with Play, wait until all four categories show recording, and start a screen recording before reproducing the problem. Reproduce the exact issue, optionally show a known workaround, stop the screen recording, then stop DebugLoggerUI and wait for it to finish.
4. For carrier, network, or SIM issues: leave the SIM out before capture. Start DebugLoggerUI and screen recording first, confirm all categories are recording, and only then insert the SIM so the insertion and network registration are captured.
5. PC method: download Google's official Android platform-tools ZIP, extract it, open CMD inside the platform-tools folder, enable Developer options and USB debugging, connect with a data-capable USB cable, accept the device authorization, and run adb devices. Export with adb pull /data/debuglogger "C:\\Users\\YOUR_USER\\Downloads\\debuglogger". Copy the screen recording manually from Internal storage > Movies > ScreenRecord.
6. No-computer method (Android 11+): use Termux and Wireless debugging, not USB debugging. Install android-tools with pkg install android-tools. Keep Settings and Termux visible in split screen. In Wireless debugging, choose Pair device with pairing code and immediately run adb pair IP:PAIRING_PORT PAIRING_CODE. The pairing port and code are temporary. After pairing, return to the main Wireless debugging screen and run adb connect IP:ADB_PORT with its connection port, which is usually different. Export with adb pull /data/debuglogger /storage/emulated/0/Download.
7. Verify Download > debuglogger contains connsyslog, mdlog1, mdlog1_config, mobilelog, netlog, and file_tree.txt. If anything is missing, recheck all four DebugLoggerUI categories and repeat the collection.
8. The final package must include the fresh debuglogger folder, playable screen recording, approximate time of the issue, exact reproduction steps, expected result, and any workaround shown. Review sensitive content and disable USB or Wireless debugging after support is complete.

Troubleshooting:
- "adb is not recognized": confirm the terminal is opened inside platform-tools; in PowerShell, use .\\adb.exe or open CMD from the folder address bar.
- adb devices shows unauthorized: unlock the phone, accept the RSA authorization, optionally revoke USB debugging authorizations and reconnect.
- No device appears: try a data-capable cable/USB port, select File transfer, keep the phone unlocked, and rerun adb devices.
- Termux pairing fails or expires: keep both apps visible, generate a new code, use the pairing port with adb pair, and enter it immediately.
- Paired but not connected: use the separate IP:port from the main Wireless debugging screen with adb connect, and keep the same trusted Wi-Fi network.
- Pull is denied or incomplete: confirm ADB is connected, DebugLoggerUI has fully stopped, use the exact source /data/debuglogger, keep enough free storage, and retry.
- Missing log folders: enable all four log categories, clear all including modem boot logs, and repeat the capture from the beginning.

Behavior rules:
- Reply in the requested language: English, Brazilian Portuguese, Latin American Spanish, Simplified Chinese, French, Modern Standard Arabic, or Russian.
- Use the current brand, method, and guide step when supplied. Do not repeat the entire guide when a focused next action is enough.
- Commands must be exact and placed on their own line. Never ask for passwords, pairing codes, personal files, IMEI, phone numbers, or API keys.
- Do not claim to inspect the user's device or files. Do not advise root access, bootloader changes, destructive resets, or unrelated repairs.
- When uncertain, blocked after two focused attempts, or the case needs device-specific intervention, direct the user to ${SUPPORT_URL}.
`

const json = (data: unknown, status = 200, headers?: HeadersInit) => Response.json(data, {
  status,
  headers: { 'Cache-Control': 'no-store', ...headers },
})

const normalizeMessages = (messages: ChatMessage[] | undefined): ModelMessage[] => {
  if (!Array.isArray(messages)) return []
  return messages
    .slice(-10)
    .filter((message): message is ChatMessage =>
      (message?.role === 'user' || message?.role === 'assistant')
      && typeof message.content === 'string'
      && message.content.trim().length > 0)
    .map((message) => ({ role: message.role, content: message.content.trim().slice(0, 1_200) }))
}

const normalizeContext = (context: ChatContext | undefined) => ({
  language: ALLOWED_LANGUAGES.has(context?.language ?? '') ? context?.language : 'en',
  country: typeof context?.country === 'string' && /^[A-Z]{2}$/.test(context.country) ? context.country : null,
  brand: ALLOWED_BRANDS.has(context?.brand ?? '') ? context?.brand : null,
  method: ALLOWED_METHODS.has(context?.method ?? '') ? context?.method : null,
  stepTitle: typeof context?.stepTitle === 'string' ? context.stepTitle.slice(0, 180) : null,
  stepDescription: typeof context?.stepDescription === 'string' ? context.stepDescription.slice(0, 500) : null,
})

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, { Allow: 'POST' })

    const fetchSite = request.headers.get('sec-fetch-site')
    if (fetchSite && !['same-origin', 'same-site', 'none'].includes(fetchSite)) {
      return json({ error: 'forbidden' }, 403)
    }

    const contentLength = Number(request.headers.get('content-length') ?? 0)
    if (contentLength > 20_000) return json({ error: 'request_too_large' }, 413)

    let body: ChatBody
    try {
      body = await request.json() as ChatBody
    } catch {
      return json({ error: 'invalid_json' }, 400)
    }

    const messages = normalizeMessages(body.messages)
    if (!messages.length || messages[messages.length - 1]?.role !== 'user') {
      return json({ error: 'invalid_messages' }, 400)
    }

    const totalCharacters = messages.reduce((total, message) =>
      total + (typeof message.content === 'string' ? message.content.length : 0), 0)
    if (totalCharacters > 8_000) return json({ error: 'conversation_too_large' }, 413)

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return json({ error: 'assistant_unavailable' }, 503)
    }

    const context = normalizeContext(body.context)
    const contextNote = `Current UI context: language=${context.language}; country=${context.country ?? 'not selected'}; brand=${context.brand ?? 'not selected'}; method=${context.method ?? 'not selected'}; step=${context.stepTitle ?? 'not in guide'}; step description=${context.stepDescription ?? 'none'}.`

    try {
      const { text } = await generateText({
        model: google(MODEL),
        system: `${KNOWLEDGE}\n${contextNote}`,
        messages,
        maxOutputTokens: 700,
      })

      return json({ reply: text.trim() })
    } catch (error) {
      if (APICallError.isInstance(error)) {
        if (error.statusCode === 429) return json({ error: 'rate_limited' }, 429, { 'Retry-After': '30' })
      }
      console.error('Log guide assistant failed', error)
      return json({ error: 'assistant_unavailable' }, 503)
    }
  },
}
