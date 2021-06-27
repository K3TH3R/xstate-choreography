<template>
  <div>
    <div class="flex justify-between items-center bg-gray-800 py-4 px-8">
      <div class="flex justify-center items-center">
        <img class="h-8 w-auto pr-4" :src="XStateLogo" alt="Workflow" />
        <h2 class="text-lg text-gray-50">Choreography</h2>
      </div>
      <BrowserStatus />
    </div>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
// https://reqres.in/api/register
import { useMachine } from '@xstate/vue'
import { defineComponent, provide } from 'vue'
import { appMachineDef, appMachineId } from './machines/App.machine'
import {
  choreoMachine,
  choreoMachineId,
} from './machines/Choreographer.machine'
import XStateLogo from '@/assets/logo-white.svg'
import BrowserStatus from './components/browserStatus.vue'

export default defineComponent({
  components: {
    BrowserStatus,
  },
  setup() {
    provide(appMachineId, useMachine(appMachineDef))
    provide(choreoMachineId, choreoMachine)

    return {
      XStateLogo,
    }
  },
})
</script>

<style>
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
</style>
