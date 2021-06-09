<template>
  <div class="bg-gray-50">
    <ul v-if="state.context.characters">
      <li v-for="c in state.context.characters" :key="c.id">
        {{ c.id }}::{{ c.name }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useMachine } from '@xstate/vue'
import { fetchMachine } from './machines/fetch.machine'

export default defineComponent({
  name: 'App',
  components: {},
  setup() {
    const { state, send } = useMachine(fetchMachine)

    onMounted(() => {
      send({
        type: 'FETCH',
      })
    })

    return {
      state,
      send,
    }
  },
})
</script>

<style>
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
</style>
