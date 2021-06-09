import { createMachine } from 'xstate'

// https://rickandmortyapi.com/api/character
// https://rickandmortyapi.com/api/location
// https://rickandmortyapi.com/api/episode

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

export const App = createMachine(context, state, options)
