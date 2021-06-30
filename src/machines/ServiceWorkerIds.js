/**
 * It appears that Node has some issues compiling circular dependencies. This is a
 * bit of a weird edge case where, because workers are compiled as "default" export,
 * we can't have our service worker IDs in the worker file. I originally had this in
 * App.machine.js, and it would throw this error:
 *
 * Uncaught ReferenceError: Cannot access 'browserStatusMachineId' before initialization
 *
 * Which according to the SO below, is a circular dependency issue. The quick solution for
 * now is to just have a separate file for service worker IDs.
 *
 * @see https://stackoverflow.com/questions/60122727/referenceerror-cannot-access-player-before-initialization
 */

export const fetchServiceWorkerId = 'fetchServiceWorker'
