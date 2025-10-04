import { env } from '../../config/env.js'

/**
 * Convert a provided name into its possessive form using a typographic apostrophe.
 * Names ending with the letter "s" receive only the apostrophe, while all others
 * append apostrophe + s.
 *
 * @param {string} name - The base name to convert.
 * @returns {string} The possessive version of the name, or an empty string when the input is blank.
 */
const createPossessive = (name) => {
  const trimmed = name.trim()
  if (!trimmed) return ''
  return /s$/i.test(trimmed) ? `${trimmed}\u2019` : `${trimmed}\u2019s`
}

const childName = env.childName?.trim() ? env.childName.trim() : 'Child'
const childPossessiveName = createPossessive(childName)

export const childProfile = {
  name: childName,
  possessiveName: childPossessiveName,
  jarName: childPossessiveName ? `${childPossessiveName} Jar` : 'Growth Jar',
}
