<script setup>
import FramePags from './components/FramePags.vue'
import Forms from './components/Forms.vue'
import NavBar from './components/NavBar.vue'
import MenuElements from './components/MenuElements.vue'
import { reactive, onMounted } from 'vue'

const state = reactive({
  dados: [
    { id: 1, title: "Link 1", url: "https://example.com/link1", tags: ["tag1", "tag2"], pasta: "Pasta 0", description: "Descrição do Link 1" },
    { id: 2, title: "Link 2", url: "https://example.com/link2", tags: ["tag3"], pasta: "Pasta 2", description: "Descrição do Link 2" }
  ],
  pastas: [
    {}
  ]
})

// função que é ejecutada assim que carrega a pag
onMounted(() => {
  // verificando se tem algo no localStorage, se tiver transforma de volta para objeto e atribui ao estado
  try {
    // buscando achaves no storage, valores salvos como string
    const pastasStorage = localStorage.getItem('pastas')
    const dadosStorage = localStorage.getItem('dados')

    // verifica se existi valor, converte de String para array/objeto
    // insere os valores das chaves que estavam no Storage para o state
    if (pastasStorage) 
      state.pastas = JSON.parse(pastasStorage)
    if (dadosStorage)  
      state.dados  = JSON.parse(dadosStorage)
  } catch(e) {
    localStorage.removeItem('pastas')
    localStorage.removeItem('dados')
  }
})


// -----------------------------------  AVO - NavBar
function handleAddPasta(newPasta) {
  if (newPasta.title.trim() === '') return
  if (state.pastas.some(pasta => pasta.title === newPasta.title)) {
    alert('Já existe uma pasta com esse nome!')
    return
  }
  state.pastas.push(newPasta);

  localStorage.setItem('pastas', JSON.stringify(state.pastas))
}

function handleDeletePasta(id) {
  // permanece somente as pastas que não tem o id igual ao id recebido
  state.pastas = state.pastas.filter(pasta => pasta.id !== id)
  localStorage.setItem('pastas', JSON.stringify(state.pastas))
}

// -----------------------------------  PAI - Forms
function handleAddLink({title, url, tags, pasta, description}) {
  state.dados.push({
    id: state.dados.length + 1,
    title, url, tags, pasta, description
  })

  localStorage.setItem('dados', JSON.stringify(state.dados))
}

// -----------------------------------  PAI - Menu
function handleDeleteLink(id){
  state.dados = state.dados.filter(dados => dados.id !== id)
  localStorage.setItem('dados', JSON.stringify(state.dados))
}

function handleEditLink(dadoEditado) {
  const index = state.dados.findIndex(d => d.id === dadoEditado.id)
  if (index !== -1) {
    state.dados[index] = dadoEditado
    localStorage.setItem('dados', JSON.stringify(state.dados))
  }
}
</script>

<template>  
  <div class="bg-[#242424] flex min-h-screen">
    <!-- <FramePags/> -->
    <!-- add-pasta esta mandando id e title -->
    <NavBar
      :pastas="state.pastas"
      @add-pasta="handleAddPasta"
      @delete-pasta="handleDeletePasta"
    />

    <!-- recebendo os valores do usuario -->
     <div class="min-h-screen w-full mt-10">
       <Forms class="" 
         :pastas="state.pastas"
         @add-link="handleAddLink"
       />
   
      <MenuElements 
        class="ml-10 mt-5"
        :dados="state.dados"
        :pastas="state.pastas"
        @edit-link="handleEditLink"
        @delete-link="handleDeleteLink"
      />
     </div>

  </div>
</template>


<style></style>