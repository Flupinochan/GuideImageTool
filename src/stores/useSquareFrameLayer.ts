import type Konva from 'konva'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAppSettings } from './useAppSettings'
import { useBaseImageLayer } from './useBaseImageLayer'

interface SquareFrameConfig extends Konva.RectConfig {
  id: string
  name: string
  x: number
  y: number
  draggable: boolean
  strokeScaleEnabled: boolean
  shadowForStrokeEnabled: boolean
}

interface SharedSquareFrameConfig extends Partial<Konva.RectConfig> {
  stroke?: string
  strokeWidth?: number
}

export const useSquareFrameLayer = defineStore('squareFrameLayer', () => {
  const baseImageLayer = useBaseImageLayer()
  const appSettings = useAppSettings()

  const getStrokeWidth = () => Number(appSettings.squareFrame.sharedSquareFrameConfig.strokeWidth)

  const layerConfig = ref({
    id: `square-frame-layer-${crypto.randomUUID()}`,
  } as Konva.LayerConfig)
  const squareFrameConfig = ref([] as SquareFrameConfig[])
  const sharedSquareFrameConfig = appSettings.squareFrame
    .sharedSquareFrameConfig as SharedSquareFrameConfig

  const add = () => {
    if (!baseImageLayer.isValid) return

    const baseCenter = baseImageLayer.getCenter()

    const newSquareFrameConfig: SquareFrameConfig = {
      id: `square-frame-${crypto.randomUUID()}`,
      name: 'object',
      x: baseCenter.x,
      y: baseCenter.y,
      width: 100,
      height: 100,
      draggable: true,
      strokeScaleEnabled: false,
      shadowForStrokeEnabled: false,
    }

    squareFrameConfig.value.push(newSquareFrameConfig)
  }

  const getEffective = (config: SquareFrameConfig): Konva.RectConfig => {
    return {
      ...sharedSquareFrameConfig,
      strokeWidth: getStrokeWidth(),
      id: config.id,
      name: config.name,
      x: config.x,
      y: config.y,
      width: config.width,
      height: config.height,
      draggable: config.draggable,
      strokeScaleEnabled: config.strokeScaleEnabled,
      shadowForStrokeEnabled: config.shadowForStrokeEnabled,
    } as Konva.RectConfig
  }

  return {
    layerConfig,
    squareFrameConfig,
    sharedSquareFrameConfig,
    add,
    getEffective,
  }
})
