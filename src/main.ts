import { mdiFileImage } from '@mdi/js'
import { createPinia } from 'pinia'
import type { Component } from 'vue'
import { createApp } from 'vue'
import VueKonva from 'vue-konva'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import 'vuetify/styles'
import colors from 'vuetify/util/colors'
import App from './App.vue'

const app = createApp(App as Component)

const pinia = createPinia()

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases: {
      ...aliases,
      fileImage: mdiFileImage,
    },
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'system',
    themes: {
      light: { colors: { primary: colors.blue.base } },
      dark: { colors: { primary: colors.blue.base } },
    },
  },
  defaults: {
    global: {
      color: 'primary',
      variant: 'outlined',
    },
  },
})

app.use(pinia).use(vuetify).use(VueKonva).mount('#app')
