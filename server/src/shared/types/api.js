/**
 * @typedef {Object} AuthTokenResponse
 * @property {string} token - JWT access token.
 * @property {string} expiresIn - Expiration window for the token.
 */

/**
 * @typedef {Object} UserDTO
 * @property {string} id
 * @property {string} email
 * @property {string} role
 * @property {string | null} familyRole
 * @property {boolean} emailVerified
 * @property {string} firstName
 * @property {string | null} lastName
 */

/**
 * @typedef {Object} JarEntryDTO
 * @property {string} id
 * @property {string} familyId
 * @property {string} entryType
 * @property {string} content
 * @property {Object} metadata
 * @property {string} createdAt
 */
