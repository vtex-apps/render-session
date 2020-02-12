import { ITEMS } from './constants'

interface SessionNamespaceItem {
  value: string
  keepAlive?: boolean
}

type AccountFields = 'id' | 'accountName' | 'bindingId'

type SessionNamespace<T extends string> = Record<T, SessionNamespaceItem>

interface SessionResponseItems {
  id: string
  namespaces: {
    account: SessionNamespace<AccountFields>
  }
}

interface SessionResponse {
  response: SessionResponseItems | null,
  error: any,
}

const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

declare global {
  interface Window {
    __RUNTIME__: {
      binding?: {
        id: string
      },
      bindingChanged?: boolean,
      culture: {
        availableLocales: string[]
      }
      rootPath?: string
    }
  }
}

const bindingChanged = window.__RUNTIME__ && window.__RUNTIME__.bindingChanged
const bindingId = window.__RUNTIME__ && window.__RUNTIME__.binding && window.__RUNTIME__.binding.id
const supportedLocales = window.__RUNTIME__ && window.__RUNTIME__.culture && window.__RUNTIME__.culture.availableLocales || []
const rootPath = window.__RUNTIME__ && window.__RUNTIME__.rootPath || ''

const RETRY_STATUSES = [ 408, 425, 429, 500,  501,  502,  503,  504,  505,  506,  507,  508,  510,  511 ]
const FETCH_TIMEOUT = 7000

const canRetry = (status: number) => RETRY_STATUSES.includes(status)

const fetchWithRetry = (url: string, init: RequestInit, maxRetries: number = 3) => {
  let status = 500
  let didTimeout = false
  const callFetch = (attempt: number = 0): Promise<SessionResponse> =>
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        didTimeout = true
        reject(new Error('Fetch timed out'))
      }, FETCH_TIMEOUT)
      fetch(url, init).then(response => {
        clearTimeout(timeout)
        if (!didTimeout) {
          resolve(response)
        }
      }).catch(err =>  {
        clearTimeout(timeout)
        if (didTimeout) {
          return
        }
        reject(err)
      })
    }).then((response: any) => {
      status = response.status
      return response.json()
        .then((data: any) => ({response: data, error: null}))
    }).catch((error) => {
      console.error(error)

      if (attempt >= maxRetries || !canRetry(status) || didTimeout) {
        return {response: null, error: {message: 'Maximum number of attempts achieved or request timed out'}} as SessionResponse
      }

      const ms = (2 ** attempt) * 500
      return delay(ms)
        .then(() => callFetch(++attempt))
    })

  return callFetch()
}

const patchSession = (data?: any) => fetchWithRetry(`${rootPath}/api/sessions${window.location.search}`, {
  body: data ? JSON.stringify(data) : '{}',
  credentials: 'same-origin',
  headers: new Headers({ 'Content-Type': 'application/json' }),
  method: 'PATCH',
}).catch(err => console.log('Error while patching session with error: ', err))

const items = `${window.location.search ? '&' : '?'}items=${ITEMS.join(',')}`

const supportedLocalesSearch = supportedLocales.length > 0
  ? `&supportedLocales=${supportedLocales.join(',')}`
  : ''

const bindingIdSearch = bindingId
  ? `&__bindingId=${bindingId}`
  : ''

const createInitialSessionRequest = () => {
  return fetchWithRetry(`${rootPath}/api/sessions${window.location.search}${items}${supportedLocalesSearch}${bindingIdSearch}`, {
    body: '{}',
    credentials: 'same-origin',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    method: 'POST',
  })
}

const clearSession = () => {
  return fetchWithRetry(`${rootPath}/api/sessions/invalidToken?items=*`, {
    credentials: 'same-origin',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    method: 'GET',
  }, 1)
}

const onError = (err: any) => console.log('Error while loading session with error: ', err)

let sessionPromise: Promise<void | SessionResponse>
if (bindingChanged) {
  sessionPromise = clearSession()
    .then(createInitialSessionRequest)
    .catch(onError)
} else {
  sessionPromise = createInitialSessionRequest()
    .then(result => {
      if (!result.response ||
        !result.response.namespaces.account.bindingId ||
        result.response.namespaces.account.bindingId.value === bindingId
      ) {
        return result
      }

      return clearSession().then(createInitialSessionRequest)
    })
    .catch(onError)
}

(window as any).__RENDER_7_SESSION__ = (window as any).__RENDER_8_SESSION__ = {
  patchSession,
  sessionPromise,
}

export {}
