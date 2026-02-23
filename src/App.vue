<template>
  <v-app>
    <SettingsDrawer />
    <v-main>
      <div class="app-scroll">
        <div class="app-content">
          <CanvasPage />
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import SettingsDrawer from './components/AppDrawer.vue'
import CanvasPage from './components/CanvasPage.vue'
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
  overflow: hidden;
}
</style>

<style scoped>
.app-scroll {
  height: 100dvh;
  overflow: auto;
}

.app-content {
  padding: 10px;
  box-sizing: border-box;
  width: max-content;
  min-width: 100%;
}
</style>
