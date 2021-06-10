<template>
  <div class="">
    <button
      class="bg-blue-700 text-gray-50 py-2 px-6"
      @click="send('FETCH_CHARACTERS')"
    >
      Fetch Characters
    </button>
  </div>
</template>

<script lang="ts">
import { useMachine } from '@xstate/vue'
import { defineComponent } from 'vue'
import { assign, createMachine, send } from 'xstate'
import { invokeWebWorker } from './workers/invoke-worker'
import FetcherWorker from './workers/fetcher?worker'

const appMachine = createMachine({
  id: 'app',
  invoke: {
    id: 'fetcher',
    src: invokeWebWorker(new FetcherWorker()),
  },
  context: {
    characters: [],
  },
  on: {
    FETCH_CHARACTERS: {
      actions: [send({ type: 'FETCH_CHARACTERS' }, { to: 'fetcher' })],
    },
    RECEIVE_CHARACTERS: {
      actions: [
        assign({
          characters: (_ctx, event) => {
            console.log('RECEIVED CHARACTERS', event)
            return event.data.characters
          },
        }),
      ],
    },
  },
})

export default defineComponent({
  name: 'App',
  components: {},
  setup() {
    const { state, send } = useMachine(appMachine)

    return { state, send }
  },
})
</script>

<style>
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
</style>
