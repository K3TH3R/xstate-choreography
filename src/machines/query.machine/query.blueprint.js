import { merge } from 'lodash'
import { assign, createMachine, sendParent } from 'xstate'

import { browserStatusService } from '../cogs/utils'

/**
 * Default context object for any machines that need to use the `stale-while-revalidate`
 * pattern for getting or posting to an API whilst handling automatic retries, backoff, etc.
 */
const swrDefaultContext = {
  // Records when the previous attempt occurred so we can calculate the next attempt.
  lastAttempt: 0,
  // Count how many times we've failed to fetch and tried again
  retries: 0,
  // Indicates if we've failed and reported a fetch error
  // (so we don't report the same error multiple times)
  reportedError: false,
  // the maximum length of time to try backing off for, default 1 minute
  maxBackoff: 60 * 1000,
  // the interval frequency in ms to automatically attempt communication with the
  // server at, default 1 hour
  autoAttemptPeriod: 60 * 60 * 1000,
  // flag for tracking if the browser is currently online
  browserEnabled: true,
  // flag for tracking if fetching is enabled
  enabled: true,
  // flag for tracking if fetching is permitted
  permitted: true,
}

const swrDefaultStateMachine = {
  id: 'swrCogBlueprint',
  initial: 'maybeStart',
  context: { ...swrDefaultContext },
  invoke: { ...browserStatusService },
  states: {
    /**
     * The initial state which is also returned to whenever another post is scheduled.
     * Allows other states to transition here to figure out what to do next, instead
     * of reimplementing the logic everywhere.
     */
    maybeStart: {
      always: [
        { cond: 'notPermittedToAttempt', target: 'notPermitted' },
        { cond: 'canEnable', target: 'waitingForAttempt' },
        { target: 'disabled' },
      ],
    },

    /**
     * Not permitted to attempt, so ignore everything except global events that
     * may permit us to attempt
     */
    notPermitted: {
      entry: ['clearLastAttempt'],
    },

    /**
     * Fetcher is disabled, but still permitted to attempt so we honor the
     * FORCE_ATTEMPT global event
     */
    disabled: {
      on: {
        FORCE_ATTEMPT: {
          target: 'attempting',
          cond: 'permittedToAttempt',
        },
      },
    },

    /**
     * Wait until the next attempt is ready to happen
     */
    waitingForAttempt: {
      on: {
        FORCE_ATTEMPT: 'attempting',
      },
      after: {
        nextAttemptDelay: 'attempting',
      },
    },

    /**
     * State node for making the server request. Not implemented because it is the developer's
     * responsibility to provide implementation details by the cog using this blueprint
     */
    attempting: null,

    /**
     * Exponential backoff for when errors are encountered
     */
    errorBackoff: {
      entry: ['incrementRetry', 'sendErrorToParent'],
      after: {
        errorBackoffDelay: 'attempting',
      },
    },
  },
  on: {
    SET_ENABLED: {
      target: 'maybeStart',
      actions: 'updateEnabled',
    },
    SET_PERMITTED: {
      target: 'maybeStart',
      actions: 'updatePermitted',
    },
    BROWSER_ENABLED: {
      target: 'maybeStart',
      actions: 'updateBrowserEnabled',
    },
    UPDATE_ATTEMPT_URL: {
      actions: 'updateAttemptUrl',
    },
  },
}

/**
 * Default options that handles the core `stale-while-revalidate` functionality
 * (ie. actions, services, delays, guards, etc.)
 */
export const options = {
  delays: {
    /**
     * Calculates how long to wait before allowing another retry using
     * an exponential backoff algorithm.
     *
     * @returns {Number} the number of milliseconds to wait
     */
    errorBackoffDelay: (ctx) => {
      const baseDelay = 200
      const delay = baseDelay * 2 ** Math.min(ctx.retries, 20)
      return Math.min(delay, ctx.maxBackoff)
    },

    /**
     * Calculates how long ago the previous attempt happened, and how long
     * it should wait until the next attempt is due.
     *
     * @returns {Number} the number of milliseconds to wait before next attempt
     */
    nextAttemptDelay: (ctx) => {
      const timeSinceAttempt = Date.now() - ctx.lastAttempt
      const remaining = ctx.autoAttemptPeriod - timeSinceAttempt
      return Math.max(remaining, 0)
    },
  },
  guards: {
    notPermittedToAttempt: (ctx) => !ctx.permitted,
    permittedToAttempt: (ctx) => ctx.permitted,
    canEnable: (ctx) => {
      if (!ctx.enabled || !ctx.permitted) {
        return false
      }

      // Attempt if we haven't loaded any data yet
      if (!ctx.lastAttempt) {
        return true
      }

      // Finally, we can enable if the browser tab is active
      return ctx.browserEnabled
    },
  },
  services: {
    // Implementation must be provided by developer
    attempt: null,
  },
  actions: {
    updateEnabled: assign({
      enabled: /* istanbul ignore next */ (_ctx, { data }) => data,
    }),
    updatePermitted: assign({
      permitted: /* istanbul ignore next */ (_ctx, { data }) => data,
    }),
    updateBrowserEnabled: assign({
      browserEnabled: /* istanbul ignore next */ (_ctx, { data }) => data,
    }),
    clearLastAttempt: assign({
      lastAttempt: 0,
    }),
    updateAttemptUrl: assign({
      lastAttempt: Date.now(),
      url: /* istanbul ignore next */ (_ctx, { data }) => data.url,
    }),
    incrementRetry: assign({
      retries: /* istanbul ignore next */ (ctx) => ctx.retries + 1,
    }),
    reportError: assign({
      lastAttempt: Date.now(),
      reportedError: true,
    }),
    sendErrorToParent: sendParent(
      /* istanbul ignore next */ (ctx, { data }) => {
        const eventObj = {
          type: 'SWR_ERROR',
          error: data,
          timestamp: ctx.lastAttempt,
          data: null,
        }
        // Ignore errors from the browser going offline while attempting, otherwise report it.
        return !ctx.reportedError && ctx.browserEnabled ? eventObj : null
      },
    ),
  },
}

/**
 * Merges the `swrDefaultStateMachine` with any provided overrides/additions
 *
 * @param {Object} cogStateMachine overrides/additions to the swrDefaultStateMachine
 */
export const createSWRCogDef = (swrCogStateMachine) => {
  if (swrCogStateMachine.id === '' || !swrCogStateMachine?.id) {
    throw new Error(
      `You must provide a unique 'id' value when creating a new SWR Cog instance.`,
    )
  }

  if (!swrCogStateMachine.states?.attempting) {
    throw new Error(
      `You must provide the custom 'attempting' state property when creating a new SWR Cog instance.`,
    )
  }

  const finalStateMachine = merge(
    {},
    swrDefaultStateMachine,
    swrCogStateMachine,
  )

  return createMachine(finalStateMachine, options)
}
