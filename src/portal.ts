import { IMPERSONATED_KEY, Session } from './session'
import { deleteCookie, setCookie } from './utils/cookie'

class PortalSession extends Session {
  constructor(path: string) {
    super(path)
  }
  public setSessionParams = (data?: any) => this.setSession('', data)

  public setParameter = (key: string, value: string, options: any = {}) => {
    console.warn('`vtexjs.session.setParameter` is deprecated. Please use `vtexjs.session.setSessionParams` instead.')

    const autoRefresh = options.autoRefresh === undefined ? true : options.autoRefresh
    if (key === IMPERSONATED_KEY) {
      if (value) {
        setCookie(key, value, 1)
      } else {
        deleteCookie(key)
      }
    }
    const params = key ? { key: { value } } : {}
    const request = this.setSessionParams(params).then(() => {
      if (autoRefresh) {
        window.location.reload()
      }
    })

    return request
  }
}

const removeTrailingSlash = (path: string) => path[path.length - 1] === '/' ? path.slice(0, path.length - 1) : path

export default () => {
  const HOST_URL = window.location.origin
  window.vtexjs = window.vtexjs || {}
  window.vtexjs.session = new PortalSession(removeTrailingSlash(HOST_URL))

  window.vtexjs.session.setSession().then(() => window.dispatchEvent(new Event('session.done')))
  document.addEventListener('authenticatedUser.vtexid', () => {
    window.vtexjs.session.setSession().then(() => window.dispatchEvent(new Event('session.done')))
  })
}