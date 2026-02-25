<script setup>
    import { ref, nextTick } from 'vue'
import FramePags from './FramePags.vue'

    const props = defineProps({
        dados: Array,
        pastas: Array
    })

    const itemAberto = ref(null);

    function alternarFrame(id) {
        if (itemAberto.value === id) {
            itemAberto.value = null;
        } else {
            itemAberto.value = id;   
        }
    }


    const emit = defineEmits(['delete-link', 'edit-link'])

    const dadoSelecionado = ref(null)

    const title = ref('')
    const url = ref('')
    const tags = ref('')
    const pasta = ref('Todos os Links')
    const description = ref('')

    function handleDeleteLink(id) {
        emit('delete-link', id)
    }

    function abrirModalEditar(dado) {
        dadoSelecionado.value = dado
        title.value = dado.title ?? ''
        url.value = dado.url ?? ''
        tags.value = (dado.tags ?? []).join(', ')
        pasta.value = dado.pasta ?? 'Todos os Links'
        description.value = dado.description ?? ''

        const modal = document.getElementById('modal')
        if (modal) modal.showModal()
    }

    const expandidos = ref({})

    function toggleExpandido(id) {
        expandidos.value[id] = !expandidos.value[id]
    }

    function handleEditLink() {
        const tagsArray = tags.value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== '')

        emit('edit-link', {
            id: dadoSelecionado.value.id,
            title: title.value,
            url: url.value,
            tags: tagsArray,
            pasta: pasta.value,
            description: description.value
        })

        document.getElementById('modal').close()
    }
</script>

<template>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full pr-15 ml-15 mt-5">
        <div
            class="border border-slate-500 p-4 rounded-lg flex flex-col gap-2"
            v-for="dado in props.dados"
            :key="dado.id"
        >
            <h1 class="text-sky-400 text-xl font-semibold">{{ dado.title }}</h1>

            <p class="text-slate-400 text-sm">
                Pasta: {{ dado.pasta }}
                <span v-if="dado.createdAt"> • {{ dado.createdAt }}</span>
            </p>

            <p class="text-white text-sm" v-if="dado.description">
                <span v-if="expandidos[dado.id] || (dado.description?.length ?? 0) <= 100">
                    {{ dado.description ?? '' }}
                </span>
                <span v-else>
                    {{ dado.description?.slice(0, 100) }}...
                </span>
                <button
                    v-if="(dado.description?.length ?? 0) > 100"
                    @click="toggleExpandido(dado.id)"
                    class="text-sky-400 ml-1 hover:underline"
                >
                    {{ expandidos[dado.id] ? 'Ler menos' : 'Ler mais' }}
                </button>
            </p>

            <div class="flex gap-2 flex-wrap" v-if="dado.tags?.length">
                <span
                    v-for="tag in dado.tags"
                    :key="tag"
                    class="bg-slate-600 text-white text-xs px-2 py-1 rounded-full"
                >
                    {{ tag }}
                </span>
            </div>

            <!-- Linha: Abrir Link | Mostrar Post -->
            <div class="flex justify-between items-center mt-1">
                <a
                    :href="dado.url"
                    target="_blank"
                    class="text-sky-400 text-sm hover:underline cursor-pointer"
                >
                    Abrir Link
                </a>

                <button
                    class="text-sky-400 text-sm hover:underline cursor-pointer"
                    @click="alternarFrame(dado.id)"
                >
                    {{ itemAberto === dado.id ? 'Fechar Post' : 'Mostrar Post' }}
                </button>
            </div>

            <FramePags 
                v-if="itemAberto === dado.id"
                :link="dado.url" 
                :carregado="true"
            />

            <div class="flex-1 flex items-end justify-end gap-3 -mx-4 -mb-4 px-4 py-3 mt-2 bg-slate-400/10 rounded-b-lg">
                <button
                    class="bg-yellow-500 hover:bg-yellow-400 text-white text-sm font-medium px-4 py-1.5 rounded cursor-pointer transition-colors"
                    @click="abrirModalEditar(dado)"
                >
                    Editar
                </button>
                <button
                    class="bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-4 py-1.5 rounded cursor-pointer transition-colors"
                    @click="handleDeleteLink(dado.id)"
                >
                    Excluir
                </button>
            </div>
        </div>
    </div>

    <Teleport to="body">
        <dialog id="modal" class="m-auto rounded-lg p-0 bg-transparent backdrop:bg-black/50">
            <div class="bg-slate-800 p-6 rounded-lg shadow-lg">
                <template v-if="dadoSelecionado">
                    <h2 class="text-white text-lg font-bold mb-4">Editar: {{ dadoSelecionado.title }}</h2>

                    <div class="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            v-model="title"
                            placeholder="Título"
                            class="border border-slate-500 bg-[#374151] text-white p-2 rounded-lg w-full"
                        />
                        <input
                            type="text"
                            v-model="url"
                            placeholder="URL"
                            class="border border-slate-500 bg-[#374151] text-white p-2 rounded-lg w-full"
                        />
                        <input
                            type="text"
                            v-model="tags"
                            placeholder="Tags (separadas por vírgula)"
                            class="border border-slate-500 bg-[#374151] text-white p-2 rounded-lg w-full"
                        />
                        <select
                            v-model="pasta"
                            class="bg-slate-700 text-white p-2 rounded border border-slate-500 w-full"
                        >
                            <option>Todos os Links</option>
                            <option v-for="pasta in props.pastas" :key="pasta.title" :value="pasta.title">
                                {{ pasta.title }}
                            </option>
                        </select>
                        <textarea
                            v-model="description"
                            placeholder="Descrição"
                            class="border border-slate-500 bg-[#374151] col-span-2 text-white p-2 rounded-lg w-full h-24"
                        />
                    </div>

                    <div class="flex gap-3 mt-4">
                        <button
                            @click="handleEditLink"
                            class="bg-sky-700 text-white px-4 py-2 rounded hover:bg-sky-600 transition-colors"
                        >
                            Salvar
                        </button>
                        <button
                            class="cursor-pointer bg-slate-700 text-white px-4 py-2 rounded"
                            onclick="modal.close()"
                        >
                            Fechar
                        </button>
                    </div>
                </template>
            </div>
        </dialog>
    </Teleport>
</template>