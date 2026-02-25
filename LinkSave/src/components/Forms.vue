<script setup>
import { ref } from 'vue'

const props = defineProps({
    pastas: Array,
})

const emit = defineEmits(['add-link'])

const title = ref('')
const url = ref('')
const tags = ref('')
const pasta = ref('Todos os Links')
const description = ref('')

function handleAddLink() {
  const tagsArray = tags.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag !== '')

  emit('add-link', {
    title: title.value,
    url: url.value,
    tags: tagsArray, 
    pasta: pasta.value,
    description: description.value
  })

  title.value = ''
  url.value = ''
  tags.value = ''
  pasta.value = 'Todos os Links'
  description.value = ''
}
</script>

<template>
    <div>
        <h1 class="text-white text-3xl ml-10 mb-5">Forms</h1>

        <div class="ml-10 mr-10 p-5
        grid grid-cols-2 gap-4 bg-[#1f2937]">
            <input
                required 
                type="text" 
                v-model="title"
                placeholder="Título" 
                class="border border-slate-500 bg-[#374151] text-white p-2 rounded-lg w-full"
            />
            <input
                required 
                type="text" 
                v-model="url"
                placeholder="URL" 
            class="border border-slate-500 bg-[#374151] text-white p-2 rounded-lg w-full"
            />
            <input
                type="text"     
                v-model="tags"
                placeholder="Tags" 
                class="border border-slate-500 bg-[#374151] text-white p-2 rounded-lg w-full"
            />

            <select
                v-model="pasta"
                class="bg-slate-700 text-white p-2 rounded border border-slate-500 w-full">
                <option>Todos os Links</option>
                <option v-for="pasta in pastas" :value="pasta.title">
                    <span>
                        {{ pasta.title }}
                    </span>
                </option>
                <option @click="" value="novo">+ Criar pasta...</option>
            </select>
            <input
                type="text" 
                v-model="description"
                placeholder="Descrição" 
                class="border border-slate-500 bg-[#374151] col-span-2
            text-white p-2 rounded-lg w-full pb-20"
            />

            <button @click="handleAddLink(title, url, tags, pasta, description)" 
            class="bg-sky-700 w-30 p-2.5 rounded-lg text-left ml-3 
            hover:bg-sky-600 transition-colors duration-200">
                Adicionar link
            </button>

        </div>

    </div>
</template>

