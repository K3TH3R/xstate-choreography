import { createMachine, sendParent, assign } from 'xstate'
import { interpretInWorker } from './invoke-worker'
import { set } from './db'

const VERSION = 1
const NAME = 'rnm-db'

const fetchMachine = createMachine(
  {
    id: 'fetcher',
    initial: 'idle',
    context: {
      characters: [],
    },
    states: {
      idle: {
        on: {
          FETCH_CHARACTERS: {
            target: 'fetching',
          },
        },
      },
      fetching: {
        invoke: {
          id: 'fetchCharacters',
          src: () =>
            fetch('https://rickandmortyapi.com/api/character').then((r) =>
              r.json(),
            ),
          onDone: {
            target: 'success',
            actions: ['sendParentCharacters'],
          },
          onError: {
            target: 'failure',
            actions: ['notifyError'],
          },
        },
      },
      success: {
        invoke: {
          id: 'storeCharactersLocally',
          src: 'storeCharactersLocallyService',
          onDone: {
            target: 'idle',
          },
          onError: {
            target: 'failure',
            actions: ['notifyError'],
          },
        },
      },
      failure: {
        on: {
          RETRY: 'fetching',
        },
      },
    },
  },
  {
    services: {
      storeCharactersLocallyService: (ctx, event) =>
        new Promise((resolve, reject) => {
          event.data.results.forEach(async (character) => {
            await set(character.id, character)
          })
        }),
    },
    actions: {
      storeLocally: assign((_ctx, event) => {
        return {
          characters: event.data,
        }
      }),
      sendParentCharacters: sendParent((_ctx, { data }) => {
        return {
          type: 'RECEIVE_CHARACTERS',
          data,
        }
      }),
      notifyError: sendParent((_ctx, event) => {
        return {
          type: 'ERROR_FETCHING',
          data: event.data,
        }
      }),
    },
  },
)

const service = interpretInWorker(fetchMachine)
service.start()
