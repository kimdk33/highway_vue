<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

interface Detection {
  id: number
  cctv_id: number
  detected_at: string
  anomaly_type: string
  confidence: number
  is_confirmed: boolean
}

interface CctvMap {
  [id: number]: string
}

const items = ref<Detection[]>([])
const cctvNames = ref<CctvMap>({})
let timer: ReturnType<typeof setInterval> | null = null

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

async function fetchCctvs() {
  const res = await fetch(`${API_BASE}/api/v1/cctvs/`)
  const data: { id: number; name: string }[] = await res.json()
  cctvNames.value = Object.fromEntries(data.map((c) => [c.id, c.name]))
}

async function fetchDetections() {
  const res = await fetch(`${API_BASE}/api/v1/detections/?limit=20`)
  items.value = await res.json()
}

onMounted(async () => {
  await fetchCctvs()
  await fetchDetections()
  timer = setInterval(fetchDetections, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="alert-section anomaly-section">
    <h3 class="alert-title">🚨 이상징후 탐지 알림</h3>
    <div class="alert-box scrollable-box">
      <div class="alert-header">
        <span class="col-type">종류</span>
        <span class="col-location">위치</span>
        <span class="col-time">시간</span>
      </div>
      <div v-for="item in items" :key="item.id" class="alert-item new">
        <span class="col-type">{{ item.anomaly_type }}</span>
        <span class="col-location" :title="cctvNames[item.cctv_id]">{{ cctvNames[item.cctv_id] ?? item.cctv_id }}</span>
        <span class="col-time" :title="item.detected_at">{{ formatTime(item.detected_at) }}</span>
      </div>
    </div>
  </div>
</template>
