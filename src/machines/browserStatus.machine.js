import { createMachine, assign, send } from 'xstate'
import { choreographerMachine } from './choreographer.machine'
import { fetchServiceWorkerId } from './ServiceWorkerIds'

/**
 * Browser Status
 *
 * This module helps to keep track of the browser's status for 3 different things:
 * 		1. Whether or not the browser is online
 * 		2. Whether or not the document is visible
 * 		3. Whether or not the document is focused
 *
 * This is important for helping to optimize our API requests and ensure we're not
 * making unnecessary calls. It's also a cornerstone of the `stale-while-revalidate`
 * data fetching pattern to help balance immediacy vs. freshness of data.
 * @see https://web.dev/stale-while-revalidate/
 *
 * The browser status functions here are mostly adapted from the related functions in
 * the XState SWR and React-based SWR libraries:
 * @see https://github.com/dimfeld/swr-xstate/blob/master/src/browser_state.ts
 * @see https://github.com/vercel/swr/tree/master/src/libs
 */
export function isDocumentVisible() {
  if (
    typeof document !== 'undefined' &&
    typeof document.visibilityState !== 'undefined'
  ) {
    return document.visibilityState !== 'hidden'
  }
  // Otherwise, assume it's visible
  return true
}

export function isOnline() {
  if (typeof navigator.onLine !== 'undefined') {
    return navigator.onLine
  }

  // Assume it's online if onLine doesn't exist for some reason
  return true
}

export function isDocumentFocused() {
  return document.hasFocus()
}

export const browserStatusMachineId = 'browserStatus'

export const browserStatusMachine = createMachine(
  {
    id: browserStatusMachineId,
    initial: 'listening',
    context: {
      online: isOnline(),
      visible: isDocumentVisible(),
      focused: isDocumentFocused(),
    },
    states: {
      listening: {
        invoke: {
          src: () => (sendParent) => {
            function sendUpdatedBrowserStatus() {
              sendParent({
                type: 'UPDATED_BROWSER_STATUS',
                data: {
                  online: isOnline(),
                  visible: isDocumentVisible(),
                  focused: isDocumentFocused(),
                },
              })
            }

            window.addEventListener(
              'visibilitychange',
              sendUpdatedBrowserStatus,
            )
            window.addEventListener('focus', sendUpdatedBrowserStatus)
            window.addEventListener('blur', sendUpdatedBrowserStatus)
            window.addEventListener('online', sendUpdatedBrowserStatus)
            window.addEventListener('offline', sendUpdatedBrowserStatus)

            return () => {
              window.removeEventListener(
                'visibilitychange',
                sendUpdatedBrowserStatus,
              )
              window.removeEventListener('focus', sendUpdatedBrowserStatus)
              window.removeEventListener('blur', sendUpdatedBrowserStatus)
              window.removeEventListener('online', sendUpdatedBrowserStatus)
              window.removeEventListener('offline', sendUpdatedBrowserStatus)
            }
          },
        },
        on: {
          UPDATED_BROWSER_STATUS: {
            actions: [
              'storeUpdatedStatus',
              'sendSubscribers',
              'sendServiceWorker',
            ],
          },
        },
      },
    },
  },
  {
    actions: {
      storeUpdatedStatus: assign((_ctx, { data }) => ({ ...data })),
      sendSubscribers: send(
        (ctx) => ({
          type: 'NOTIFY_SUBSCRIBERS',
          publisherId: browserStatusMachineId,
          payload: {
            type: 'UPDATED_BROWSER_STATUS',
            data: { ...ctx },
          },
        }),
        { to: choreographerMachine },
      ),
      sendServiceWorker: send(
        (ctx) => ({
          type: 'SEND_SERVICE_WORKER',
          workerId: fetchServiceWorkerId,
          payload: {
            type: 'UPDATED_BROWSER_STATUS',
            data: { ...ctx },
          },
        }),
        { to: choreographerMachine },
      ),
    },
  },
)
