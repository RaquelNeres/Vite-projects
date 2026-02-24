<script setup>
    import { reactive } from 'vue'
    import Folders from './Folders.vue'

    const props = defineProps({
        pastas: Array,
    })

    // -----------------------------------  PAI
    const emit = defineEmits(['add-pasta', 'delete-pasta'])

    const form = reactive({ novaPasta: '' })

    // const deletar = (id) => {
    //     emit('delete-pasta', id)
    // }

    function deletar(id) {
        emit('delete-pasta', id)
    }

    function onAddTaskSubmit() {
        if (form.novaPasta.trim() === '') return

        const newTask = {
            id: props.pastas.length + 1,
            title: form.novaPasta,
        }

        emit('add-pasta', newTask)
        form.novaPasta = ''
    }
</script>

<template>
    <div class="h-dvh w-75 border-r border-white">
        <h1 class="text-xl font-bold text-amber-50 mt-8 ml-5 mb-5">Pastas</h1>

        <!-- passando os dados -->
        <Folders
            v-for="pasta in props.pastas"
            :key="pasta.id"
            :id="pasta.id"
            :title="pasta.title"
            @delete="deletar"
        />


        <div class="p-4 flex flex-col gap-2">
            <input 
                v-model="form.novaPasta"
                type="text" 
                placeholder="Nova Pasta" 
                class="border border-slate-500 text-white p-2 rounded-lg w-full bg-transparent"
            />
            <button 
                class="bg-amber-500 text-white p-2 rounded-lg hover:bg-amber-600 transition-colors"
                @click="onAddTaskSubmit"
            >
                Criar Pasta
            </button>
        </div>
    </div>
</template>
