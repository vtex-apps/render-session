import { deleteCookie, setCookie } from './utils/cookie'
import { fetchWithRetry } from './utils/fetch'

export const IMPERSONATED_KEY = 'vtex-impersonated-customer-email'

export class Session {
  private path: string
  constructor(path: string) {
    this.path = path
  }
  
  public clearSession = () => fetchWithRetry(`${this.path}/api/sessions/invalidToken?items=*`, {
    credentials: 'same-origin',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    method: 'GET',
  }, 1)


  public setSession = (querystring: string = '', data?: any) => {
    if (data && data[IMPERSONATED_KEY]) {
      const param = data[IMPERSONATED_KEY]
    if (param && param.value) {
      setCookie(IMPERSONATED_KEY, param.value, 1)
    } else {
      deleteCookie(IMPERSONATED_KEY)
    }
  }
  return fetchWithRetry(`${this.path}/api/sessions${querystring}`, {
    body: data ? JSON.stringify({ public: data}) : '{}',
    credentials: 'same-origin',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    method: 'POST',
  }).catch(err => console.log('Error while loading session with error: ', err))
}

 public patchSession = (querystring: string = '', data?: any) => fetchWithRetry(`${this.path}/api/sessions${querystring}`, {
  body: data ? JSON.stringify(data) : '{}',
  credentials: 'same-origin',
  headers: new Headers({ 'Content-Type': 'application/json' }),
  method: 'PATCH',
}).catch(err => console.log('Error while patching session with error: ', err))

  public getSession = (options: any  = {}) => {
  const items =  options.items ? options.items : '*'
  return fetchWithRetry(`${this.path}/api/sessions?items=${items}`, {
    credentials: 'same-origin',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    method: 'GET',
  }).catch(err => console.log('Error while getting session with error: ', err))
}

  public getSegment = () => {
    return fetchWithRetry(`${this.path}/api/segments`, {
      credentials: 'same-origin',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      method: 'GET',
    }).catch(err => console.log('Error while getting segment with error: ', err))
  }
}