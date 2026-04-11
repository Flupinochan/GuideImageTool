import { useBaseImageLayer } from '@/stores/useBaseImageLayer'
import type { StageRefLike, TransformerRefLike } from '@/types/canvasRefs'
import type { Ref } from 'vue'

export function useCanvasExport(
  stageRef: Ref<StageRefLike | undefined>,
  squareFrameTransformerRef: Ref<TransformerRefLike | undefined>,
) {
  const baseImageLayer = useBaseImageLayer()

  async function createExportBlob() {
    if (!stageRef.value || !squareFrameTransformerRef.value) return null
    const stage = stageRef.value.getNode()
    if (stage.width() === 0 || stage.height() === 0) return null
    squareFrameTransformerRef.value.getNode().nodes([])
    return await new Promise<Blob>((resolve, reject) =>
      stage
        .toCanvas({ pixelRatio: 1 / baseImageLayer.scale })
        .toBlob(
          (value) => (value ? resolve(value) : reject(new Error('Failed to create blob'))),
          'image/png',
        ),
    )
  }

  async function copyCanvasToClipboard() {
    const blob = await createExportBlob()
    if (!blob) return

    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ])
  }

  async function exportCanvas() {
    const blob = await createExportBlob()
    if (!blob) return

    const dataURL = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `guide-image-tool_${Date.now()}.png`
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return {
    copyCanvasToClipboard,
    exportCanvas,
  }
}
