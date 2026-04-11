<template>
  <div class="d-flex align-center ga-1">
    <v-btn
      v-for="text in numberText"
      :key="text"
      class="text-h6"
      @click="handleAddText(text)"
      :disabled="!baseImageLayer.isValid"
    >
      {{ text }}
    </v-btn>
    <v-btn @click="handleAddSquareFrame" :disabled="!baseImageLayer.isValid">枠</v-btn>
    <v-number-input
      v-model="scalePercent"
      :disabled="!baseImageLayer.isValid"
      variant="solo"
      control-variant="split"
      :step="10"
      :min="10"
      hide-details
      density="compact"
      style="width: 140px"
      class="flex-grow-0"
    />
    <v-btn @click="copyCanvasToClipboard" :disabled="!baseImageLayer.isValid"> コピー</v-btn>
    <v-btn @click="exportCanvas" :disabled="!baseImageLayer.isValid">保存</v-btn>
  </div>
  <v-btn
    v-if="showMenu"
    @click="handleDelete"
    variant="elevated"
    :style="{
      position: 'fixed',
      top: `${menuPosition.y}px`,
      left: `${menuPosition.x}px`,
      zIndex: 1000,
    }"
  >
    Delete
  </v-btn>
  <div v-show="!baseImageLayer.isValid">
    <v-file-upload
      style="margin-top: 10px; margin-bottom: 10px"
      density="comfortable"
      variant="comfortable"
      accept="image/*"
      @update:model-value="handleFileUpload"
    >
      <template #item />
    </v-file-upload>
  </div>
  <v-stage
    style="margin-top: 10px"
    ref="stageRef"
    :config="baseImageLayer.stageConfig"
    @click="handleStageClick"
    @contextmenu="handleContextMenu"
  >
    <v-layer ref="imageLayerRef" :config="baseImageLayer.imageLayerConfig">
      <v-image
        v-for="imageConfig in baseImageLayer.imageConfigs"
        :key="imageConfig.id"
        :config="imageConfig"
        @click="handleImageClick(imageConfig.id)"
      />
    </v-layer>
    <v-layer ref="numTextLayerRef" :config="numTextLayer.layerConfig">
      <v-text
        v-for="textConfig in numTextLayer.textConfigs"
        :key="textConfig.id"
        v-bind="numTextLayer.getEffective(textConfig)"
        @click="handleNumTextClick(textConfig.id)"
      />
    </v-layer>
    <v-layer ref="squareFrameLayerRef" :config="squareFramelayer.layerConfig">
      <v-rect
        v-for="squareFrameConfig in squareFramelayer.squareFrameConfig"
        :key="squareFrameConfig.id"
        v-bind="squareFramelayer.getEffective(squareFrameConfig)"
        @click="handleSquareFrameClick(squareFrameConfig.id)"
      />
      <v-transformer
        ref="squareFrameTransformerRef"
        :config="{
          anchorSize: 8,
          rotateEnabled: false,
          borderEnabled: false,
          keepRatio: false,
        }"
      />
    </v-layer>
  </v-stage>
</template>

<script setup lang="ts">
import { useCanvasExport } from '@/composables/useCanvasExport'
import { useImageUpload } from '@/composables/useImageUpload'
import { dragEndHandler, dragMoveHandler } from '@/libraries/snap'
import { useBaseImageLayer } from '@/stores/useBaseImageLayer'
import { useNumTextLayer } from '@/stores/useNumTextLayer'
import { useSquareFrameLayer } from '@/stores/useSquareFrameLayer'
import type { LayerRefLike, StageRefLike, TransformerRefLike } from '@/types/canvasRefs'
import type Konva from 'konva'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

const stageRef = ref<StageRefLike>()
const imageLayerRef = ref<LayerRefLike>()
const numTextLayerRef = ref<LayerRefLike>()
const squareFrameLayerRef = ref<LayerRefLike>()
const squareFrameTransformerRef = ref<TransformerRefLike>()

const showMenu = ref(false)
const selectedId = ref<string>('')
const menuPosition = ref({ x: 0, y: 0 })

const baseImageLayer = useBaseImageLayer()
const numTextLayer = useNumTextLayer()
const squareFramelayer = useSquareFrameLayer()
const { handlePaste, handleFileUpload } = useImageUpload()
const { copyCanvasToClipboard, exportCanvas } = useCanvasExport(stageRef, squareFrameTransformerRef)

const numberText = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩']

const scalePercent = computed<number>({
  get: () => Math.round(baseImageLayer.scale * 100),
  set: (val: number) => {
    const n = Number(val) || 10
    const clamped = Math.max(10, n)
    baseImageLayer.scale = clamped / 100
  },
})

function handleStageClick(event: Konva.KonvaEventObject<MouseEvent>) {
  if (!stageRef.value || !squareFrameTransformerRef.value) return
  if (event.target === stageRef.value.getNode()) {
    squareFrameTransformerRef.value.getNode().nodes([])
    return
  }
  handleContextMenu(event)
}

function handleAddText(text: string) {
  if (!squareFrameTransformerRef.value) return
  squareFrameTransformerRef.value.getNode().nodes([])
  numTextLayer.add(text)
}

async function handleAddSquareFrame() {
  if (!squareFrameTransformerRef.value) return
  squareFrameTransformerRef.value.getNode().nodes([])
  squareFramelayer.add()
  await nextTick()
  handleSquareFrameClick(squareFramelayer.squareFrameConfig.at(-1)?.id)
}

function handleSquareFrameClick(frameId: string | undefined) {
  if (!frameId || !stageRef.value || !squareFrameTransformerRef.value) return
  const node = stageRef.value.getNode().findOne(`#${frameId}`)
  if (!node) return
  selectedId.value = frameId
  squareFrameTransformerRef.value.getNode().nodes([node])
}

function handleNumTextClick(textId: string | undefined) {
  if (!textId || !stageRef.value || !numTextLayerRef.value) return
  const node = stageRef.value.getNode().findOne(`#${textId}`)
  if (!node) return
  selectedId.value = textId
}

function handleImageClick(imageId: string | undefined) {
  if (!imageId || !stageRef.value) return
  const node = stageRef.value.getNode().findOne(`#${imageId}`)
  if (!node) return
  selectedId.value = imageId
}

function handleContextMenu(event: Konva.KonvaEventObject<MouseEvent>) {
  if (!stageRef.value) return
  if (event.target === stageRef.value.getNode()) {
    showMenu.value = false
    return
  }
  event.evt.preventDefault()
  selectedId.value = event.target.id()
  menuPosition.value = { x: event.evt.clientX, y: event.evt.clientY }
  showMenu.value = true
}

const handleWindowClick = () => {
  showMenu.value = false
}

function handleDelete() {
  if (!selectedId.value || !stageRef.value || !squareFrameTransformerRef.value) return

  const node = stageRef.value.getNode().findOne(`#${selectedId.value}`)
  if (!node) return

  squareFrameTransformerRef.value.getNode().nodes([])
  node.destroy()

  showMenu.value = false
}

function handleArrowKeys(e: KeyboardEvent) {
  if (!selectedId.value) return

  const step = 1
  let dx = 0
  let dy = 0
  switch (e.key) {
    case 'ArrowUp':
      dy = -step
      break
    case 'ArrowDown':
      dy = step
      break
    case 'ArrowLeft':
      dx = -step
      break
    case 'ArrowRight':
      dx = step
      break
    default:
      return
  }

  // テキストの同期
  const text = numTextLayer.textConfigs.find((t) => t.id === selectedId.value)
  if (text) {
    text.x += dx
    text.y += dy
    return
  }

  // フレームの同期
  const frame = squareFramelayer.squareFrameConfig.find((f) => f.id === selectedId.value)
  if (frame) {
    frame.x += dx
    frame.y += dy
  }
}

onMounted(() => {
  window.addEventListener('paste', handlePaste)
  window.addEventListener('click', handleWindowClick)
  window.addEventListener('keydown', handleArrowKeys)

  if (!stageRef.value) return
  const stage = stageRef.value.getNode()

  const textLayer = numTextLayerRef.value?.getNode()
  const frameLayer = squareFrameLayerRef.value?.getNode()
  const imageLayer = imageLayerRef.value?.getNode()

  if (textLayer) {
    textLayer.on('dragmove', dragMoveHandler(stage, textLayer))
    textLayer.on('dragend', dragEndHandler(textLayer))
    // draggableによる移動をstoreに反映するため
    textLayer.on('dragend', (event: Konva.KonvaEventObject<DragEvent>) => {
      const node = event.target
      const id = node.id()
      const t = numTextLayer.textConfigs.find((item) => item.id === id)
      if (t) {
        t.x = node.x()
        t.y = node.y()
      }
    })
  }
  if (frameLayer) {
    frameLayer.on('dragmove', dragMoveHandler(stage, frameLayer))
    frameLayer.on('dragend', dragEndHandler(frameLayer))
    // draggableによる移動をstoreに反映するため
    frameLayer.on('dragend', (event: Konva.KonvaEventObject<DragEvent>) => {
      const node = event.target
      const id = node.id()
      const f = squareFramelayer.squareFrameConfig.find((item) => item.id === id)
      if (f) {
        f.x = node.x()
        f.y = node.y()
      }
    })
  }
  if (imageLayer) {
    imageLayer.on('dragmove', dragMoveHandler(stage, imageLayer))
    imageLayer.on('dragend', dragEndHandler(imageLayer))
  }
})

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste)
  window.removeEventListener('click', handleWindowClick)
  window.removeEventListener('keydown', handleArrowKeys)

  numTextLayerRef.value?.getNode().off('dragmove dragend')
  squareFrameLayerRef.value?.getNode().off('dragmove dragend')
})
</script>

<style scoped></style>
