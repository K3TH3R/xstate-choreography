import { createMachine, assign, send } from 'xstate'
import { choreoMachine } from '../Choreographer.machine'

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

export const browserStatusId = 'browserStatus'

export const browserStatusCogDef = createMachine(
  {
    id: browserStatusId,
    initial: 'listening',
    context: {
      online: true,
      visible: true,
      focused: true,
    },
    states: {
      listening: {
        invoke: {
          id: 'windowListeners',
          src: (ctx, event) => (sendParent, onReceive) => {
            function sendRefresh() {
              sendParent({
                type: 'UPDATE_BROWSER_STATUS',
                data: {
                  online: isOnline(),
                  visible: isDocumentVisible(),
                  focused: isDocumentFocused(),
                },
              })
            }

            window.addEventListener('visibilitychange', sendRefresh)
            window.addEventListener('focus', sendRefresh)
            window.addEventListener('blur', sendRefresh)
            window.addEventListener('online', sendRefresh)
            window.addEventListener('offline', sendRefresh)
          },
        },
        on: {
          UPDATE_BROWSER_STATUS: {
            actions: ['storeUpdatedStatus', 'notifySubscribers'],
          },
        },
      },
    },
  },
  {
    actions: {
      storeUpdatedStatus: assign((_ctx, { data }) => ({ ...data })),
      notifySubscribers: send(
        (_ctx, event) => ({
          type: 'NOTIFY_SUBSCRIBERS',
          publisherId: browserStatusId,
          payload: { ...event },
        }),
        { to: choreoMachine },
      ),
    },
  },
)
