const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

declare global {
  interface Window {
    __RUNTIME__: {
      culture: {
        availableLocales: string[]
      }
      rootPath?: string
    }
  }
}

const RETRY_STATUSES = [ 408, 425, 429, 500,  501,  502,  503,  504,  505,  506,  507,  508,  510,  511 ]
const FETCH_TIMEOUT = 3000

const canRetry = (status: number) => RETRY_STATUSES.includes(status)

const ok = (status: number) => 200 <= status && status < 300

const fetchWithRetry = (url: string, init: RequestInit, maxRetries: number = 1): Promise<void> => {
  let status = 500
  let didTimeOut = false
  const callFetch = (attempt: number = 0): Promise<void> => {
    const timeout = setTimeout(() => {
        didTimeOut = true
        throw new Error('Fetch timed out')
      }, FETCH_TIMEOUT)
    return fetch(url, init).then((response) => {
      clearTimeout(timeout)
      status = response.status
      return ok(status)
        ? { response, error: null }
        : response.json()
          .then((error) => ({ response, error }))
          .catch(() => ({ response, error: { message: 'Unable to parse JSON' } }))
    }).then(({ error }: any) => {
      if (error) {
        throw new Error(error.message || 'Unknown error')
      }
    }).catch((error) => {
      console.error(error)

      if (attempt >= maxRetries || !canRetry(status) || didTimeOut) {
        return // no session is fine for now
      }
      console.log('Retrying....... ;)')

      const ms = (2 ** attempt) * 500
      return delay(ms)
        .then(() => callFetch(++attempt))
    })
  }

  return callFetch()
}

const patchSession = (data?: any) => fetchWithRetry(`http://localhost:3000`, {
  body: data ? JSON.stringify(data) : '{}',
  credentials: 'same-origin',
  headers: new Headers({ 'Content-Type': 'application/json' }),
  method: 'PATCH',
}).catch(err => console.log('Error while patching session with error: ', err))

const sessionPromise = fetchWithRetry(`http://localhost:3000`, {
  body: '{}',
  credentials: 'same-origin',
  headers: new Headers({ 'Content-Type': 'application/json' }),
  method: 'POST',
}).catch(err => console.log('Error while loading session with error: ', err));

(window as any).__RENDER_7_SESSION__ = (window as any).__RENDER_8_SESSION__ = {
  patchSession,
  sessionPromise,
}

export {}
