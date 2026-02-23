import type Konva from 'konva'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useBaseImageLayer } from './useBaseImageLayer'

interface TextConfig extends Konva.TextConfig {
  id: string
  name: string
  text: string
  x: number
  y: number
  draggable: boolean
}

interface SharedTextConfig extends Partial<Konva.TextConfig> {
  fontSize?: number
  fill?: string
}

export const useNumTextLayer = defineStore('numTextLayer', () => {
  const baseImageLayer = useBaseImageLayer()

  const layerConfig = ref({
    id: `num-text-${crypto.randomUUID()}`,
  } as Konva.LayerConfig)
  const textConfigs = ref([] as TextConfig[])
  const sharedTextConfig = ref({
    fontSize: 40,
    fill: '#ff0000',
  } as SharedTextConfig)

  const add = (text: string) => {
    if (!baseImageLayer.isValid()) return

    const baseCenter = baseImageLayer.getCenter()

    const newTextConfig: TextConfig = {
      id: `num-text-${crypto.randomUUID()}`,
      name: 'object',
      text,
      x: baseCenter.x,
      y: baseCenter.y,
      draggable: true,
    }

    textConfigs.value.push(newTextConfig)
  }

  const getEffective = (config: TextConfig): Konva.TextConfig => {
    return {
      ...sharedTextConfig.value,
      id: config.id,
      name: config.name,
      text: config.text,
      x: config.x,
      y: config.y,
      draggable: config.draggable,
    } as Konva.TextConfig
  }

  return {
    layerConfig,
    textConfigs,
    sharedTextConfig,
    add,
    getEffective,
  }
})
