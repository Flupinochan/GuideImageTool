import type Konva from 'konva'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useBaseImageLayer } from './useBaseImageLayer'

export const useNumTextLayer = defineStore('numTextLayer', () => {
  const baseImageLayer = useBaseImageLayer()

  const layerConfig = ref({
    id: `num-text-${crypto.randomUUID()}`,
  } as Konva.LayerConfig)
  const textConfigs = ref([] as Konva.TextConfig[])

  const add = (text: string) => {
    if (!baseImageLayer.isValid()) return

    const baseCenter = baseImageLayer.getCenter()

    const newTextConfig: Konva.TextConfig = {
      id: `num-text-${crypto.randomUUID()}`,
      text,
      x: baseCenter.x,
      y: baseCenter.y,
      fontSize: 40,
      fill: 'red',
      draggable: true,
    }

    textConfigs.value.push(newTextConfig)
  }

  return {
    layerConfig,
    textConfigs,
    add,
  }
})
