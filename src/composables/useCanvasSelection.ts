import { useNumTextLayer } from '@/stores/useNumTextLayer'
import { useSquareFrameLayer } from '@/stores/useSquareFrameLayer'
import type { StageRefLike, TransformerRefLike } from '@/types/canvasRefs'
import type Konva from 'konva'
import { ref, type Ref } from 'vue'

export function useCanvasSelection(
  stageRef: Ref<StageRefLike | undefined>,
  squareFrameTransformerRef: Ref<TransformerRefLike | undefined>,
) {
  const numTextLayer = useNumTextLayer()
  const squareFramelayer = useSquareFrameLayer()

  const selectedId = ref('')
  const showMenu = ref(false)
  const menuPosition = ref({ x: 0, y: 0 })

  // Square, NumText, Image選択処理
  function getNodeById(id: string) {
    if (!stageRef.value) return null
    return stageRef.value.getNode().findOne(`#${id}`)
  }

  function selectNodeById(id: string | undefined, onSelected?: (node: Konva.Node) => void) {
    if (!id) return
    const node = getNodeById(id)
    if (!node) return
    selectedId.value = id
    onSelected?.(node)
  }

  function handleSquareFrameClick(frameId: string | undefined) {
    selectNodeById(frameId, (node) => {
      if (!squareFrameTransformerRef.value) return
      squareFrameTransformerRef.value.getNode().nodes([node])
    })
  }

  function handleNumTextClick(textId: string | undefined) {
    selectNodeById(textId)
  }

  function handleImageClick(imageId: string | undefined) {
    selectNodeById(imageId)
  }

  //
  function handleStageClick(event: Konva.KonvaEventObject<MouseEvent>) {
    if (!stageRef.value || !squareFrameTransformerRef.value) return
    if (event.target === stageRef.value.getNode()) {
      squareFrameTransformerRef.value.getNode().nodes([])
      return
    }
    handleContextMenu(event)
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

    const node = getNodeById(selectedId.value)
    if (!node) return

    e.preventDefault()

    const text = numTextLayer.textConfigs.find((textConfig) => textConfig.id === selectedId.value)
    if (text) {
      text.x += dx
      text.y += dy
      return
    }

    const frame = squareFramelayer.squareFrameConfig.find(
      (frameConfig) => frameConfig.id === selectedId.value,
    )
    if (frame) {
      frame.x += dx
      frame.y += dy
    }
  }

  return {
    showMenu,
    menuPosition,
    handleStageClick,
    handleSquareFrameClick,
    handleNumTextClick,
    handleImageClick,
    handleContextMenu,
    handleWindowClick,
    handleDelete,
    handleArrowKeys,
  }
}
