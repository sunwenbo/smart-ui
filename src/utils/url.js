const normalizePath = (path = '') => {
  if (!path) return ''
  return path.startsWith('/') ? path : `/${path}`
}

const getHostBaseUrl = () => process.env.VUE_APP_BASE_API || ''

export const getApiBaseUrl = () => `${getHostBaseUrl()}${process.env.VUE_APP_API_PATH || ''}`

export const buildApiUrl = (path = '') => `${getApiBaseUrl()}${normalizePath(path)}`

export const buildHostUrl = (path = '') => `${getHostBaseUrl()}${normalizePath(path)}`
