<template>
  <div class="flex justify-center">
    <div
      v-if="state.context.characters"
      class="grid grid-cols-4 gap-8 max-w-6xl w-full"
    >
      <Character
        v-for="c in state.context.characters"
        :key="c.id"
        :character-ref="c"
      />
    </div>
  </div>
</template>

<script>
import { useActor } from '@xstate/vue'
import { Choreo } from '../machines/Choreographer.machine'
import { characterListRefId } from '../machines/CharacterList.machine'
import Character from './character.vue'

export default {
  components: {
    Character,
  },
  setup() {
    const { state } = useActor(Choreo.state.context.actors[characterListRefId])

    return { state }
  },
}
</script>
