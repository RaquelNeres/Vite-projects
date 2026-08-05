<script setup>
import { ref, watch, onMounted } from 'vue';
import FolderComponents from '@/components/FolderComponents.vue';

const tasks = ref([]);
const title = ref('');
const description = ref('');
const STORAGE_KEY = 'tasks';

onMounted(() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    tasks.value = stored
      ? JSON.parse(stored)
      : [
          { id: 1, title: 'Aprender Vue', description: 'Criar app de lista de tarefas com rota de detalhes', isCompleted: false },
          { id: 2, title: 'Migrar do React', description: 'Fazer layout igual ao projeto antigo usando Vue', isCompleted: false }
        ];
  } catch (error) {
    tasks.value = [];
  }
});

watch(
  tasks,
  (value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  },
  { deep: true }
);

function handleAddTask() {
  if (!title.value.trim() || !description.value.trim()) return;

  tasks.value.push({
    id: Date.now(),
    title: title.value,
    description: description.value,
    isCompleted: false
  });

  title.value = '';
  description.value = '';
}

function handleDelete(id) {
  tasks.value = tasks.value.filter(task => task.id !== id);
}

function handleToggleComplete(id) {
  tasks.value = tasks.value.map(task => {
    if (task.id === id) {
      return { ...task, isCompleted: !task.isCompleted };
    }
    return task;
  });
}
</script>

<template>
  <div class="w-full max-w-3xl space-y-6">
    <header class="text-center">
      <h1 class="text-4xl font-bold text-white">Detalhes da Tarefa</h1>
    </header>

    <section class="bg-slate-200 p-6 rounded-3xl shadow-xl">
      <form @submit.prevent="handleAddTask" class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2">
          <input
            v-model="title"
            type="text"
            placeholder="Título da tarefa"
            class="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
          <input
            v-model="description"
            type="text"
            placeholder="Descrição da tarefa"
            class="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>

        <button
          type="submit"
          class="w-full rounded-2xl bg-slate-700 px-5 py-3 text-white font-semibold hover:bg-slate-800 transition"
        >
          Adicionar Tarefa
        </button>
      </form>
    </section>

    <section class="bg-slate-200 p-6 rounded-3xl shadow-xl">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-semibold text-slate-700">Minhas Tarefas</h2>
        <span class="text-sm text-slate-500">{{ tasks.length }} itens</span>
      </div>

      <div class="space-y-4">
        <FolderComponents
          v-for="task in tasks"
          :key="task.id"
          :id="task.id"
          :title="task.title"
          :description="task.description"
          :is-completed="task.isCompleted"
          @delete="handleDelete"
          @toggle-complete="handleToggleComplete"
        />

        <p v-if="tasks.length === 0" class="text-slate-500 text-center py-8">Nenhuma tarefa adicionada ainda.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
</style>
