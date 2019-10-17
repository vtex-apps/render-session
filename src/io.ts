import { ITEMS } from './constants'
import { Session } from './session'

export default () => {
  const supportedLocales = window.__RUNTIME__.culture && window.__RUNTIME__.culture.availableLocales || []
  const rootPath = window.__RUNTIME__.rootPath || ''
  const session = new Session(rootPath)
    
  const patchSession = (data?: any) => session.patchSession(window.location.search, data)

  const items = `${window.location.search ? '&' : '?'}items=${ITEMS.join(',')}`
  const supportedLocalesSearch = supportedLocales.length > 0
    ? `&supportedLocales=${supportedLocales.join(',')}`
    : ''

  const queryString = `${window.location.search}${items}${supportedLocalesSearch}`
  const sessionPromise = session.setSession(queryString)
    
  window.__RENDER_7_SESSION__ = window.__RENDER_8_SESSION__ = {
    patchSession,
    sessionPromise,
  }
}

