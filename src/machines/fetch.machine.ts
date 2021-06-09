import { assign, createMachine, DoneInvokeEvent } from 'xstate'
import { assertEventType } from './utils'

interface FetchContext {
  characters?: Character[]
  error?: Error
}

type InitialContext = FetchContext & {
  characters: undefined
  error: undefined
}

type ReadyContext = FetchContext & {
  characters: Character[]
  error: undefined
}
type LoadingContext = FetchContext & {
  characters: Character[]
  error: undefined
}

type SuccessContext = FetchContext & {
  characters: Character[]
  error: undefined
}

type FailureContext = FetchContext & {
  characters: undefined
  error: Error
}

type InitialState = { value: 'initial'; context: InitialContext }
type ReadyState = { value: 'ready'; context: ReadyContext }
type LoadingState = { value: 'loading'; context: LoadingContext }
type SuccessState = { value: 'success'; context: SuccessContext }
type FailureState = { value: 'failure'; context: FailureContext }

type FetchState =
  | InitialState
  | ReadyState
  | LoadingState
  | SuccessState
  | FailureState

type FetchEvent =
  | { type: 'FETCH' }
  | DoneInvokeEvent<any>
  | { type: 'RETRY'; data: { results: [] } }

const storeCharactersAction = assign<FetchContext, FetchEvent>({
  characters: (_ctx, event) => {
    assertEventType(event, 'done.invoke.fetch')
    console.log('storeCharactersAction', event)
    return event.data.results
  },
})

const storeCharactersErrorAction = assign<FetchContext, FetchEvent>({
  characters: (_ctx, event) => {
    assertEventType(event, 'error.platform.fetch')
    return undefined
  },
  error: (_ctx, event) => {
    assertEventType(event, 'error.platform.fetch')
    return event.data
  },
})

export const fetchMachine = createMachine<FetchContext, FetchEvent, FetchState>(
  {
    id: 'fetch',
    initial: 'initial',
    context: {
      characters: undefined,
      error: undefined,
    },
    states: {
      initial: {
        on: {
          FETCH: 'loading',
        },
      },
      ready: {
        on: {
          FETCH: 'loading',
        },
      },
      loading: {
        invoke: {
          id: 'fetch',
          src: () =>
            fetch('https://rickandmortyapi.com/api/character').then((r) =>
              r.json(),
            ),
          onDone: {
            target: 'success',
            actions: ['storeCharacters'],
          },
          onError: {
            target: 'failure',
            actions: ['notifyError'],
          },
        },
      },
      success: {
        after: {
          2500: 'ready',
        },
      },
      failure: {
        on: {
          RETRY: 'loading',
        },
      },
    },
  },
  {
    actions: {
      storeCharacters: storeCharactersAction,
      notifyError: storeCharactersErrorAction,
    },
  },
)
