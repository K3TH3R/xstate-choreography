<template>
  <div>
    <ul v-if="state.context.characters">
      <li v-for="c in state.context.characters" :key="c.id">
        {{ c.id }}::{{ c.name }}
      </li>
    </ul>
  </div>
</template>

<script>
import { useMachine } from '@xstate/vue'
import { fetchMachine } from './machines/fetch.machine'
export default {
  setup() {
    const { state, send } = useMachine(fetchMachine)
  },
}
</script>
