import setIOWindow from './io'
import setPortalWindow from './portal'
import { Session } from './session'
import { SessionResponse } from './utils/fetch'
declare global {
  interface Window {
    // IOWindow
    __RUNTIME__: {
      binding?: {
        id: string
      },
      bindingChanged?: boolean,
      culture: {
        availableLocales: string[]
      }
      rootPath?: string
    },
    __RENDER_7_SESSION__: {
      patchSession: (data?: any) => Promise<void | SessionResponse>, 
      sessionPromise: Promise<void | SessionResponse>,
    },
    __RENDER_8_SESSION__: {
      patchSession: (data?: any) => Promise<void | SessionResponse>, 
      sessionPromise: Promise<void | SessionResponse>,
    }
    // Portal
    vtexjs: {
      session: Session
    }
  }
}

if (window.__RUNTIME__) {
  setIOWindow()
} else {
  setPortalWindow()
}
