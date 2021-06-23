<template>
  <div>
    <div class="py-4 flex justify-center items-center bg-gray-800">
      <img class="h-8 w-auto pr-4" :src="XStateLogo" alt="Workflow" />
      <h2 class="text-lg text-gray-50">Choreography Playground</h2>
    </div>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
// https://reqres.in/api/register
import { useMachine } from '@xstate/vue'
import { defineComponent, provide } from 'vue'
import { appMachineDef } from './machines/App.machine'
import { choreoMachine } from './machines/Choreographer.machine'
import XStateLogo from '@/assets/logo-white.svg'

export default defineComponent({
  name: 'App',
  setup() {
    provide('appMachine', useMachine(appMachineDef))
    provide('choreoMachine', choreoMachine)

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
