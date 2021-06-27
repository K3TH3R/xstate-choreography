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
    <Notifications />
  </div>
</template>

<script lang="ts">
// https://reqres.in/api/register
import { defineComponent, provide } from 'vue'
import XStateLogo from '@/assets/logo-white.svg'
import { useMachine } from '@xstate/vue'
import { appMachine } from './machines/app.machine'
import {
  choreographerMachine,
  choreographerMachineId,
} from './machines/choreographer.machine'
import BrowserStatus from './components/browserStatus.vue'
import Notifications from './components/notifications.vue'

export default defineComponent({
  components: {
    BrowserStatus,
    Notifications,
  },
  setup() {
    const app = useMachine(appMachine, {
      devTools: true,
    })
    provide(choreographerMachineId, choreographerMachine)

    return {
      XStateLogo,
      app,
    }
  },
})
</script>

<style>
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
</style>
