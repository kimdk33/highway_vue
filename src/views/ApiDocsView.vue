<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import SwaggerUI from 'swagger-ui-dist/swagger-ui-bundle.js'
import 'swagger-ui-dist/swagger-ui.css'
import openapiSpec from '../../openapi.json'

const container = ref<HTMLElement | null>(null)
let ui: ReturnType<typeof SwaggerUI> | null = null

onMounted(() => {
  if (!container.value) return
  ui = SwaggerUI({
    domNode: container.value,
    spec: openapiSpec,
    layout: 'BaseLayout',
    deepLinking: true,
  })
})

onUnmounted(() => {
  ui = null
})
</script>

<template>
  <div ref="container" class="swagger-container" />
</template>

<style scoped>
.swagger-container {
  width: 100%;
  min-height: 100vh;
}
</style>
