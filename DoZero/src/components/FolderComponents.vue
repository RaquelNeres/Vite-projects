<script setup>
const props = defineProps({
  id: Number,
  title: String,
  description: String,
  isCompleted: Boolean
});

const emit = defineEmits(['delete', 'toggle-complete']);

function handleDelete() {
  emit('delete', props.id);
}

function handleToggleComplete() {
  emit('toggle-complete', props.id);
}
</script>

<template>
  <div class="flex flex-col gap-3 rounded-3xl border border-slate-300 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
    <button
      type="button"
      @click="handleToggleComplete"
      class="flex-1 text-left"
    >
      <div :class="[props.isCompleted ? 'line-through text-slate-400' : 'text-slate-900']">
        <p class="text-lg font-semibold">{{ props.title }}</p>
        <p class="text-sm text-slate-500">{{ props.description }}</p>
      </div>
    </button>

    <div class="flex flex-wrap gap-2">
      <router-link
        :to="{ name: 'TaskDetails', query: { title: props.title, description: props.description } }"
        class="inline-flex items-center justify-center rounded-2xl bg-slate-700 px-4 py-3 text-white transition hover:bg-slate-800"
      >
        Detalhes
      </router-link>

      <button
        type="button"
        @click="handleDelete"
        class="inline-flex items-center justify-center rounded-2xl bg-red-500 px-4 py-3 text-white transition hover:bg-red-600"
      >
        Excluir
      </button>
    </div>
  </div>
</template>