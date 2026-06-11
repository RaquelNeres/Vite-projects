<template>
  <div class="mb-4">
    <label class="text-sm text-muted block mb-2">Upload GPX (opcional)</label>
    <input type="file" accept=".gpx,application/gpx+xml" @change="onFile" />
  </div>
</template>

<script setup>
const emit = defineEmits(['parsed'])
function haversine(lat1, lon1, lat2, lon2) {
  const toRad = v => v * Math.PI / 180
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function parseGPX(text) {
  const parser = new DOMParser()
  const xml = parser.parseFromString(text, 'application/xml')
  const trkpts = Array.from(xml.querySelectorAll('trkpt'))
  if (!trkpts.length) return null
  const points = trkpts.map(pt => ({
    lat: parseFloat(pt.getAttribute('lat')),
    lon: parseFloat(pt.getAttribute('lon')),
    time: pt.querySelector('time') ? new Date(pt.querySelector('time').textContent) : null,
  })).filter(p => p.lat && p.lon)
  let dist = 0
  for (let i = 1; i < points.length; i++) {
    dist += haversine(points[i-1].lat, points[i-1].lon, points[i].lat, points[i].lon)
  }
  const firstTime = points[0].time
  const lastTime = points[points.length-1].time
  const duration = firstTime && lastTime ? Math.round((lastTime - firstTime)/1000) : 0
  return { distanceKm: +(dist/1000).toFixed(3), durationSeconds: duration, date: firstTime ? firstTime.toISOString().slice(0,10) : null }
}

function onFile(e) {
  const f = e.target.files[0]
  if (!f) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const res = parseGPX(reader.result)
      if (res) {
        emit('parsed', res)
      }
    } catch (err) {
      console.error('GPX parse error', err)
    }
  }
  reader.readAsText(f)
}
</script>

<style scoped>
input[type="file"] { display: block; }
</style>
