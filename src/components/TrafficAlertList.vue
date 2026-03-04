<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

interface TrafficInfo {
  id: number
  cctv_id: number
  recorded_at: string
  vehicle_count: number
  avg_speed: number | null
  congestion_level: string
}

interface CctvItem {
  id: number
  name: string
}

const items = ref<TrafficInfo[]>([])
const cctvList = ref<CctvItem[]>([])
let timer: ReturnType<typeof setInterval> | null = null

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

function cctvName(id: number) {
  return cctvList.value.find((c) => c.id === id)?.name ?? String(id)
}

function trafficLabel(info: TrafficInfo) {
  return `${info.vehicle_count}대 (${info.congestion_level})`
}

async function fetchCctvs() {
  const res = await fetch(`${API_BASE}/api/v1/cctvs/`)
  cctvList.value = await res.json()
}

async function fetchTraffic() {
  if (!cctvList.value.length) return
  // 각 CCTV별 최신 교통량 조회
  const results: TrafficInfo[] = []
  for (const cctv of cctvList.value) {
    const res = await fetch(`${API_BASE}/api/v1/traffic/?cctv_id=${cctv.id}&limit=1`)
    const data: TrafficInfo[] = await res.json()
    if (data.length) results.push(data[0])
  }
  items.value = results.sort(
    (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
  )
}

onMounted(async () => {
  await fetchCctvs()
  await fetchTraffic()
  timer = setInterval(fetchTraffic, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="alert-section traffic-section">
    <h3 class="alert-title">📊 교통량 변화 알림</h3>
    <div class="alert-box scrollable-box">
      <div class="alert-header">
        <span class="col-type">교통량</span>
        <span class="col-location">위치</span>
        <span class="col-time">시간</span>
      </div>
      <div v-for="item in items" :key="item.id" class="alert-item new">
        <span class="col-type">{{ trafficLabel(item) }}</span>
        <span class="col-location">{{ cctvName(item.cctv_id) }}</span>
        <span class="col-time" :title="item.recorded_at">{{ formatTime(item.recorded_at) }}</span>
      </div>
    </div>
  </div>
</template>
