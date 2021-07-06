<template>
  <div>
    <h2
      class="
        sm:text-lg sm:leading-snug
        font-semibold
        tracking-wide
        uppercase
        text-gray-500
        mb-3
      "
    >
      Timestamp of Update:
      <span class="text-orange-600">{{ state.context.updatedAt }}</span>
    </h2>
    <h1
      class="
        text-4xl
        sm:text-6xl
        lg:text-7xl
        leading-none
        font-extrabold
        tracking-tight
        text-gray-300
        mt-10
        mb-8
        sm:mt-14 sm:mb-10
      "
    >
      You've toggled the browser
      <span class="text-orange-600">{{ state.context.counter }}</span> times.
    </h1>
    <p
      class="
        max-w-4xl
        text-lg
        sm:text-2xl
        font-medium
        sm:leading-10
        space-y-6
        mb-6
        text-gray-300
      "
    >
      {{ state.context.msg }}
    </p>
  </div>
</template>

<script>
import { getActor } from '../machines/choreographer.machine'
import { useActor } from '@xstate/vue'
import { displayMachineId } from '../machines/display.machine'

export default {
  setup() {
    const { state } = useActor(getActor(displayMachineId))
    return {
      state,
    }
  },
}
</script>
