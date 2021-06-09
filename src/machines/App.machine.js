import { createMachine } from 'xstate'

export const AppMachine = createMachine({
  id: 'appMachine',
  initial: 'idle',
  context: {},
  states: {
    idle: {
      on: {
        INIT: {
          target: 'running',
        },
      },
    },
    running: {},
  },
})
