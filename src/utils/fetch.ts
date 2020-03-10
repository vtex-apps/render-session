export interface SessionResponse {
  response: Response | null,
  error: any,
}

const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const RETRY_STATUSES = [ 408, 425, 429, 500,  501,  502,  503,  504,  505,  506,  507,  508,  510,  511 ]
const FETCH_TIMEOUT = 7000

const canRetry = (status: number) => RETRY_STATUSES.includes(status)

export const fetchWithRetry = (url: string, init: RequestInit, maxRetries: number = 3) => {
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