<template>
  <div>
    <v-btn
      text
      @click="drawer = !drawer"
      aria-label="Toggle settings"
      :style="{ position: 'fixed', left: '10px', top: '10px', zIndex: 2000 }"
    >
      {{ drawer ? '設定を閉じる' : '設定を開く' }}
    </v-btn>

    <v-navigation-drawer
      v-model="drawer"
      location="start"
      temporary
      width="320"
      color="grey-darken-4"
    >
      <div class="pt-12"></div>
      <v-container class="pa-4">
        <v-form ref="formRef" lazy-validation>
          <v-row dense>
            <v-col cols="12">
              <div class="text-subtitle-1 font-weight-medium" style="margin-top: 8px">テキスト</div>
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
                class="w-100"
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

            <v-col cols="12">
              <div class="text-subtitle-1 font-weight-medium" style="margin-top: 8px">枠線</div>
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
                class="w-100"
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

            <v-col cols="12" class="d-flex justify-start">
              <v-btn color="primary" class="me-2" @click="onSave">保存</v-btn>
              <v-btn text @click="drawer = false">閉じる</v-btn>
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
