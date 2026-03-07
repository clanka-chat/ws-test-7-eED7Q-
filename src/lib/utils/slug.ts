import slugify from 'slugify'
import { nanoid } from 'nanoid'

export function generateSlug(name: string): string {
  const base = slugify(name, { lower: true, strict: true })
  const suffix = nanoid(6)
  return `${base}-${suffix}`
}
