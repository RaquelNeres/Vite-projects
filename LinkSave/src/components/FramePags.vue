<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    link: String,
    carregado: Boolean
})

const urlDigitada = ref(props.link || '')
const carregado = ref(props.carregado || false)

// Dicionário de transformações para sites conhecidos
const transformarParaEmbed = (url) => {
  if (!url) return null;

  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const id = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)?.[1]
    return `https://www.youtube.com/embed/${id}`
  }

  // LinkedIn
  if (url.includes('linkedin.com')) {
    const id = decodeURIComponent(url).match(/activity-(\d{10,20})/)?.[1]
    return id ? `https://www.linkedin.com/embed/feed/update/urn:li:activity:${id}` : url
  }

  // Spotify
  if (url.includes('spotify.com')) {
    return url.replace('open.spotify.com/', 'open.spotify.com/embed/')
  }

  // Instagram
  if (url.includes('instagram.com/p/')) {
    const cleanUrl = url.split('?')[0] // Remove trackers
    return `${cleanUrl}embed`
  }

  // Caso padrão: Tenta carregar o link como ele é
  return url
}

const urlFinal = computed(() => transformarParaEmbed(urlDigitada.value))

</script>

<template>
  <div class="w-full h-125 flex flex-col">
    <div v-if="carregado" class="flex-1 flex flex-col overflow-hidden rounded-lg border border-gray-200">
      <iframe
        :src="urlFinal"
        class="w-full flex-1 border-0"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    </div>
  </div>
</template>