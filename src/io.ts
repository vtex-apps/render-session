import { ITEMS } from './constants'
import { Session } from './session'

export default () => {
  const bindingChanged = window.__RUNTIME__ && window.__RUNTIME__.bindingChanged
  const bindingId = window.__RUNTIME__ && window.__RUNTIME__.binding && window.__RUNTIME__.binding.id
 
  const supportedLocales = window.__RUNTIME__.culture && window.__RUNTIME__.culture.availableLocales || []
  const rootPath = window.__RUNTIME__.rootPath || ''
  const session = new Session(rootPath)
    
  const patchSession = (data?: any) => session.patchSession(window.location.search, data)

  const items = `${window.location.search ? '&' : '?'}items=${ITEMS.join(',')}`
  const bindingIdSearch = bindingId
    ? `&__bindingId=${bindingId}`
    : ''
  const supportedLocalesSearch = supportedLocales.length > 0
    ? `&supportedLocales=${supportedLocales.join(',')}`
    : ''

  const queryString = `${window.location.search}${items}${supportedLocalesSearch}${bindingIdSearch}`

  let sessionPromise
  if (bindingChanged) {
    sessionPromise = session.clearSession()
      .then(() => session.setSession(queryString))
  } else {
    sessionPromise = session.setSession(queryString)
  } 
    
  window.__RENDER_7_SESSION__ = window.__RENDER_8_SESSION__ = {
    patchSession,
    sessionPromise,
  }
}


