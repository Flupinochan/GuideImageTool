<template>
  <v-app-bar color="transparent">
    <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    <v-toolbar-title>Guide Image Tool</v-toolbar-title>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" location="start" temporary width="220">
    <v-container>
      <v-form ref="formRef" lazy-validation>
        <v-row dense>
          <v-col cols="12" class="mb-1">
            <h4>数値テキスト</h4>
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model.number="appSettings.numText.sharedTextConfig.fontSize"
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
              v-model="appSettings.numText.sharedTextConfig.fill"
              label="色"
              type="color"
              hide-details="auto"
              density="comfortable"
              outlined
              class="w-100"
            />
          </v-col>

          <v-col cols="12" class="mt-2 mb-1">
            <h4>枠</h4>
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model.number="appSettings.squareFrame.sharedSquareFrameConfig.strokeWidth"
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
              v-model="appSettings.squareFrame.sharedSquareFrameConfig.stroke"
              label="色"
              type="color"
              hide-details="auto"
              density="comfortable"
              outlined
              class="w-100"
            />
          </v-col>

          <v-col cols="4" class="mt-2 mb-1 d-flex justify-start align-center">
            <h4>外枠</h4>
          </v-col>
          <v-col cols="8" class="mt-2 mb-1 d-flex align-center">
            <v-switch
              v-model="appSettings.outerBorder.enabled"
              hide-details="auto"
              density="compact"
              color="primary"
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model.number="appSettings.outerBorder.thickness"
              label="外枠の太さ"
              type="number"
              min="1"
              max="200"
              step="1"
              hide-details="auto"
              density="comfortable"
              outlined
              class="w-100 mb-2"
              :disabled="!appSettings.outerBorder.enabled"
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="appSettings.outerBorder.color"
              label="色"
              type="color"
              hide-details="auto"
              density="comfortable"
              outlined
              class="w-100"
              :disabled="!appSettings.outerBorder.enabled"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-container>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useAppSettings } from '@/stores/useAppSettings'
import { ref } from 'vue'

const appSettings = useAppSettings()
const drawer = ref(false)
</script>

<style scoped></style>
