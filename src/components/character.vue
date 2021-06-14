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
      border-gray-700 border
    "
  >
    <div class="flex-row justify-between items-center w-full h-full">
      <div class="relative">
        <img
          class="w-full h-full"
          :src="state.context.image"
          :alt="state.context.name"
        />
        <div
          class="
            absolute
            right-0
            bottom-0
            bg-gray-800
            px-2
            pt-2
            pb-1
            rounded-tl-md
          "
        >
          <div class="flex w-full items-center">
            <div class="w-3 h-3 rounded-full mr-2" :class="statusFlagClasses" />
            <div class="text-gray-300 text-xs uppercase">
              {{ state.context.status }}
            </div>
          </div>
        </div>
      </div>
      <div class="flex-row w-full px-4 py-4">
        <div class="text-lg font-bold text-gray-50">
          {{ state.context.name }}
        </div>
        <div class="italic text-gray-400">
          {{ state.context.species }} - {{ state.context.gender }}
        </div>
        <div class="flex-col w-full mt-4">
          <div class="text-gray-500 text-xs uppercase">Last Known Location</div>
          <div class="text-gray-100 mt-1">
            {{ state.context.location.name }}
          </div>
        </div>
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
        return 'bg-green-400'
      } else if (state.value.context.status === 'Dead') {
        return 'bg-red-500'
      }
      return 'bg-gray-500'
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
