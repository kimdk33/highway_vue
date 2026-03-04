<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AnomalyAlertList from '../components/AnomalyAlertList.vue'
import TrafficAlertList from '../components/TrafficAlertList.vue'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

const mapContainer = ref<HTMLElement | null>(null)

const tabs = [
  { id: 'map-traffic-all', label: '교통 지도' },
  { id: 'map-traffic-2', label: '도로 공사' },
  { id: 'map-traffic-3', label: '도로 통제' },
  { id: 'map-traffic-4', label: '기상 경고' },
]
const activeTab = ref('map-traffic-all')

async function initMap() {
  if (!mapContainer.value) return

  const options = {
    center: new kakao.maps.LatLng(37.286, 127.446),
    level: 11,
  }
  const map = new kakao.maps.Map(mapContainer.value, options)

  const res = await fetch(`${API_BASE}/api/v1/cctvs/`)
  const cctvList: { name: string; latitude: number | null; longitude: number | null }[] =
    await res.json()

  const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png'
  const imageSize = new kakao.maps.Size(24, 35)
  const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize)

  for (const cctv of cctvList) {
    if (cctv.latitude == null || cctv.longitude == null) continue
    new kakao.maps.Marker({
      map,
      position: new kakao.maps.LatLng(cctv.latitude, cctv.longitude),
      title: cctv.name,
      image: markerImage,
    })
  }
}

onMounted(() => {
  initMap()
})
</script>

<template>
  <div class="container">
    <main class="content-area">
      <section id="traffic" class="content-section active">
        <h2>🚦 교통상황 및 교통정보</h2>

        <div class="detail-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="detail-item"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div ref="mapContainer" class="map-container" />
      </section>
    </main>

    <aside class="sidebar right-aligned" id="dynamic-alerts">
      <AnomalyAlertList />
      <TrafficAlertList />
    </aside>
  </div>
</template>
