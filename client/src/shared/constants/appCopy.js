const rawChildName = import.meta.env.VITE_CHILD_NAME?.trim()

/**
 * Formats the provided name into a possessive phrase using a curly apostrophe.
 * @param {string} name - The base name to convert.
 * @returns {string} A possessive version of the supplied name.
 */
const toPossessive = (name) => {
  const trimmed = name.trim()
  if (!trimmed) return ''
  return /s$/i.test(trimmed) ? `${trimmed}\u2019` : `${trimmed}\u2019s`
}

/**
 * Create a URL-safe slug from the provided value.
 * @param {string} value - The string to convert into a slug.
 * @returns {string} A lowercase, hyphen-delimited slug.
 */
const toSlug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const childName = rawChildName && rawChildName.length > 0 ? rawChildName : 'Child'
const childPossessiveName = toPossessive(childName)

export const appCopy = {
  childName,
  childPossessiveName,
  jarName: childPossessiveName ? `${childPossessiveName} Jar` : 'Growth Jar',
  jarSlug: toSlug(`${childName} jar`),
}
