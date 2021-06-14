<template>
  <div
    class="
      relative
      rounded-md
      flex
      items-center
      justify-between
      overflow-hidden
      flex-grow
      bg-gray-800
    "
  >
    <div class="flex justify-between items-center w-full">
      <div class="flex-col w-full px-4 py-4">
        <div class="text-xl font-bold text-gray-50">
          {{ state.context.name }}
        </div>
        <div class="italic text-gray-100">
          {{ state.context.species }} - {{ state.context.gender }}
        </div>
        <div class="flex w-full mt-4">
          <div class="w-3 h-3 rounded-full mr-2" :class="statusFlagClasses" />
          <div class="text-gray-300 text-xs uppercase">
            {{ state.context.status }}
          </div>
        </div>
        <div class="flex-col w-full mt-4">
          <div class="text-gray-500 text-xs uppercase">Last Known Location</div>
          <div class="text-gray-100 mt-2">
            {{ state.context.location.name }}
          </div>
        </div>
      </div>
      <div class="h-full">
        <img
          class="w-full h-full"
          :src="state.context.image"
          :alt="state.context.name"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { useActor } from '@xstate/vue'
import { computed } from '@vue/runtime-core'

export default {
  props: {
    characterRef: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { state, send } = useActor(props.characterRef)
    const statusFlagClasses = computed(() => {
      if (state.value.context.status === 'Alive') {
        return 'bg-green-700'
      } else if (state.value.context.status === 'Dead') {
        return 'bg-red-700'
      }
      return 'bg-gray-700'
    })

    console.log(state.value.context)

    return {
      state,
      send,
      statusFlagClasses,
    }
  },
}
</script>
