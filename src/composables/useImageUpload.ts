import { useBaseImageLayer } from '@/stores/useBaseImageLayer'
import { nextTick } from 'vue'

export function useImageUpload() {
  const baseImageLayer = useBaseImageLayer()

  function loadImageFile(file: File) {
    if (!file.type.startsWith('image/')) return

    const blobUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = async () => {
      baseImageLayer.add(img)
      URL.revokeObjectURL(blobUrl)
      await nextTick()
      console.log('isValid:', baseImageLayer.isValid)
    }
    img.src = blobUrl
  }

  function handlePaste(event: ClipboardEvent) {
    const pastedFiles = event.clipboardData?.files[0]
    if (!pastedFiles) return
    loadImageFile(pastedFiles)
  }

  function handleFileUpload(files: File | File[] | null) {
    const file = Array.isArray(files) ? files[0] : files
    if (!file) return
    loadImageFile(file)
  }

  return {
    handlePaste,
    handleFileUpload,
  }
}
