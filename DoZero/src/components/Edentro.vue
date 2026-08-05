<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
  title: String,
  description: String
});

const router = useRouter();

function goBack() {
  router.back();
}
</script>

<template>
  <div class="w-full max-w-3xl space-y-6">
    <div class="flex items-center justify-between">
      <button
        type="button"
        @click="goBack"
        class="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-700 transition hover:bg-slate-100"
      >
        ← Voltar
      </button>
      <span class="text-sm text-slate-500">Detalhes da tarefa</span>
    </div>

    <section class="rounded-3xl bg-slate-200 p-6 shadow-xl">
      <h1 class="text-3xl font-bold text-slate-900">{{ props.title || 'Sem título' }}</h1>
      <p class="mt-4 text-slate-600">{{ props.description || 'Sem descrição disponível.' }}</p>
    </section>
  </div>
</template>

