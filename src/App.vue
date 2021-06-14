<template>
  <div class="">
    <button class="bg-blue-700 text-gray-50 py-2 px-6" @click="send('INIT')">
      Fetch Characters
    </button>
    <div v-if="state.matches('running')">
      <CharacterList />
    </div>
  </div>
</template>

<script lang="ts">
import { useMachine } from '@xstate/vue'
import { defineComponent } from 'vue'
import { appMachine } from './machines/App.machine'
import CharacterList from './components/characterList.vue'

export default defineComponent({
  name: 'App',
  components: {
    CharacterList,
  },
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
