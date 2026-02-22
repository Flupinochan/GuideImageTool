import type Konva from 'konva'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useBaseImageLayer } from './useBaseImageLayer'

export const useSquareFrameLayer = defineStore('squareFrameLayer', () => {
  const baseImageLayer = useBaseImageLayer()

  const layerConfig = ref({
    id: `square-frame-layer-${crypto.randomUUID()}`,
  } as Konva.LayerConfig)
  const squareFrameConfig = ref([] as Konva.RectConfig[])

  const add = () => {
    if (!baseImageLayer.isValid()) return

    const baseCenter = baseImageLayer.getCenter()

    const newSquareFrameConfig: Konva.RectConfig = {
      id: `square-frame-${crypto.randomUUID()}`,
      name: 'object',
      x: baseCenter.x,
      y: baseCenter.y,
      width: 100,
      height: 100,
      stroke: 'red',
      strokeWidth: 2,
      draggable: true,
      strokeScaleEnabled: false,
    }

    squareFrameConfig.value.push(newSquareFrameConfig)
  }

  return {
    layerConfig,
    squareFrameConfig,
    add,
  }
})
