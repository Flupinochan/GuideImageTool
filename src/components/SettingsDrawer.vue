<template>
  <div>
    <v-btn
      text
      @click="drawer = !drawer"
      aria-label="Toggle settings"
      class="position-fixed"
      :style="{ left: '10px', top: '10px', zIndex: 2000 }"
    >
      {{ drawer ? '設定を閉じる' : '設定を開く' }}
    </v-btn>

    <v-navigation-drawer
      v-model="drawer"
      location="start"
      temporary
      width="220"
      color="grey-darken-4"
    >
      <div class="pt-8"></div>
      <v-container class="pa-4">
        <v-form ref="formRef" lazy-validation>
          <v-row dense>
            <v-col cols="12" class="mt-4 mb-1">
              <h4>テキスト</h4>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model.number="numTextLayer.sharedTextConfig.fontSize"
                label="フォントサイズ"
                type="number"
                min="8"
                max="256"
                step="1"
                hide-details="auto"
                density="comfortable"
                outlined
                class="w-100 mb-2"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="numTextLayer.sharedTextConfig.fill"
                label="色"
                type="color"
                hide-details="auto"
                density="comfortable"
                outlined
                class="w-100"
              />
            </v-col>

            <v-col cols="12" class="mt-4 mb-1">
              <h4>枠線</h4>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="squareFramelayer.sharedSquareFrameConfig.strokeWidth"
                label="枠線の太さ"
                type="number"
                min="1"
                max="20"
                step="1"
                hide-details="auto"
                density="comfortable"
                outlined
                class="w-100 mb-2"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="squareFramelayer.sharedSquareFrameConfig.stroke"
                label="色"
                type="color"
                hide-details="auto"
                density="comfortable"
                outlined
                class="w-100"
              />
            </v-col>

            <v-col cols="12" class="d-flex justify-start mt-4">
              <v-btn color="primary" class="me-2" @click="onSave">保存</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-container>
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import { useNumTextLayer } from '@/stores/useNumTextLayer'
import { useSquareFrameLayer } from '@/stores/useSquareFrameLayer'
import { ref } from 'vue'

const numTextLayer = useNumTextLayer()
const squareFramelayer = useSquareFrameLayer()

const drawer = ref(false)

function onSave() {
  drawer.value = false
}
</script>

<style scoped></style>
