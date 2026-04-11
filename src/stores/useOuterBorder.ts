import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOuterBorder = defineStore('outerBorder', () => {
  const enabled = ref(false)
  const thickness = ref(1)
  const color = ref('#444444')

  return {
    enabled,
    thickness,
    color,
  }
})
