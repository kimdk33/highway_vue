<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

declare const Hls: {
  isSupported(): boolean
  new (opts?: object): {
    loadSource(src: string): void
    attachMedia(el: HTMLVideoElement): void
    destroy(): void
  }
}

const sourceUrl = ref('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8')
const statusText = ref('idle')
const jobId = ref<string | null>(null)
const jobInfo = ref('')
const manifestUrl = ref('')
const videoEl = ref<HTMLVideoElement | null>(null)

let hls: InstanceType<typeof Hls> | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null

function setStatus(obj: unknown) {
  if (typeof obj === 'string') {
    statusText.value = obj
    return
  }
  const o = obj as Record<string, unknown>
  const lines = [
    `job_id: ${o.job_id}`,
    `running: ${o.running} (returncode: ${o.returncode})`,
    `playlist_exists: ${o.playlist_exists}`,
    `manifest_url: ${o.manifest_url}`,
  ]
  if (Array.isArray(o.stderr_tail) && o.stderr_tail.length) {
    lines.push('', '--- ffmpeg stderr tail ---', o.stderr_tail.join('\n'))
  }
  statusText.value = lines.join('\n')
}

function stopPlayer() {
  if (hls) {
    hls.destroy()
    hls = null
  }
  if (videoEl.value) {
    videoEl.value.removeAttribute('src')
    videoEl.value.load()
  }
}

async function pollStatus() {
  if (!jobId.value) return
  try {
    const res = await fetch(`/stream/restream/status/${jobId.value}`)
    const data = await res.json()
    setStatus(data)
    if (data.manifest_url) manifestUrl.value = data.manifest_url
    if (data.playlist_exists && !hls && videoEl.value) {
      if (Hls.isSupported()) {
        hls = new Hls({ liveDurationInfinity: true })
        hls.loadSource(data.manifest_url)
        hls.attachMedia(videoEl.value)
      } else if (videoEl.value.canPlayType('application/vnd.apple.mpegurl')) {
        videoEl.value.src = data.manifest_url
      }
    }
  } catch (e) {
    setStatus(String(e))
  }
}

async function start() {
  stopPlayer()
  setStatus('starting...')
  manifestUrl.value = ''

  const res = await fetch('/stream/restream/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source_url: sourceUrl.value.trim() }),
  })
  const data = await res.json()
  if (!res.ok) {
    setStatus(data)
    return
  }

  jobId.value = data.job_id
  jobInfo.value = `job: ${data.job_id}`
  if (pollTimer) clearInterval(pollTimer)
  await pollStatus()
  pollTimer = setInterval(pollStatus, 1000)
}

async function stop() {
  if (!jobId.value) return
  setStatus('stopping...')
  try {
    const res = await fetch(`/stream/restream/stop/${jobId.value}`, { method: 'POST' })
    setStatus(await res.json())
  } finally {
    if (pollTimer) clearInterval(pollTimer)
    pollTimer = null
    stopPlayer()
    jobId.value = null
  }
}

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
  stopPlayer()
})
</script>

<template>
  <div class="stream-page">
    <h3>HLS 재생성(리스트림) 테스트</h3>
    <p class="muted">원본 HLS(m3u8) URL 입력 → 서버에서 ffmpeg로 TS 그대로 재생성 → 생성된 m3u8을 재생</p>

    <div class="row">
      <input v-model="sourceUrl" placeholder="https://example.com/live/index.m3u8" />
    </div>

    <div class="row">
      <button @click="start">Start</button>
      <button @click="stop" :disabled="!jobId">Stop</button>
      <span class="muted">{{ jobInfo }}</span>
    </div>

    <div class="row">
      <video ref="videoEl" controls autoplay muted class="video-player" />
    </div>

    <div class="row" v-if="manifestUrl">
      Manifest: <a :href="manifestUrl" target="_blank" rel="noreferrer">{{ manifestUrl }}</a>
    </div>

    <div class="row">
      <div class="muted">Status / ffmpeg stderr (tail)</div>
      <pre class="status-box">{{ statusText }}</pre>
    </div>
  </div>
</template>

<style scoped>
.stream-page {
  max-width: 960px;
  margin: 20px auto;
  padding: 16px;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

.row {
  margin: 10px 0;
}

input {
  width: min(900px, 100%);
  padding: 8px;
}

button {
  padding: 8px 12px;
  margin-right: 8px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.video-player {
  width: min(900px, 100%);
  background: #000;
}

.status-box {
  background: #111;
  color: #ddd;
  padding: 10px;
  overflow: auto;
  max-height: 220px;
}

.muted {
  color: #666;
}
</style>
