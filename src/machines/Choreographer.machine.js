import { createMachine } from 'xstate'

const context = {}

const state = {
  id: 'app',
  initial: 'idle',
  states: {
    idle: {},
    running: {},
  },
}

const options = {
  guards: {},
  services: {},
  actions: {},
}
export const Choreo = createMachine(context, state, options)
