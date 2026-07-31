import type { CaptureMethod, Guide } from '../types'

const modules = import.meta.glob<Guide>('./*/*.json', { eager: true, import: 'default' })
const guides = Object.values(modules)

export const guideMap = Object.fromEntries(
  guides.map((guide) => [guide.brand + ':' + guide.method, guide]),
) as Record<string, Guide>

export const getGuide = (brandId: string, method: CaptureMethod) => guideMap[brandId + ':' + method]
