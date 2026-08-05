<template>
  <div class="-apple-system bg-[#131217] text-base [zoom:1.1] min-h-screen">
    <div class="max-w-[1070px] mx-auto flex justify-between items-start">

      <img 
        v-if="!showSidebar"
        @click="showSidebar = true"
        id="menu-btn"
        class="fixed top-2 left-2 z-50 block md:hidden p-2 cursor-pointer bg-[#131217] hover:bg-gray-800"
        src="../../../public/img/opcao.png" 
        alt="abrir barra lateral"
      />

      <div class="text-[#D9D7E0] text-justify 
              grid gap-7 justify-between
              max-w-[703px] mx-auto px-5 ml-8 mr-10   
          ">
        <h1 class="mt-16 text-[50px] mb-1">
            Ferramentas
        </h1>
        <div class="bg-[#070808] p-5 
        border-2 border-solid rounded-xl">
            <p class="text-[12px] mb-1">
                FEVEREIRO 2026
            </p>
            <a class="flex" href="../ferramentas/sql.html">
                <h2 class="text-[24px] mb-5">SQL</h2>
                <img class="h-4 ml-2 mt-1" src="../../../img/docker.png" alt="">
            </a>
            <p class="text-[14px]">
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. Velit nihil u
            </p>
        </div>
        <div class="bg-[#070808] p-5 
        border-2 border-solid rounded-xl">
            <p class="text-[12px] mb-1">
                FEVEREIRO 2026
            </p>
            <a class="flex" href="">
                <h2 class="text-[24px] mb-5">Markdown</h2>
                <img class="h-6 ml-2 mt-1" src="../../../img/markdown.png" alt="">
            </a>
            <p class="text-[14px]">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorum, voluptatum voluptatibus! Sunt voluptates minus est, voluptatum nostrum
            </p>
        </div>

        <div class="flex justify-between w-full mt-1 mb-10">
          <router-link to="/ferramentas" class="flex items-center">
            <img src="../../../public/img/seta.png" alt="Anterior" />
          </router-link>
          <router-link to="" class="flex items-center">
            <img class="-scale-x-100" src="../../../public/img/seta.png" alt="Próximo" />
          </router-link>
          
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const showSidebar = inject('showSidebar') || { value: false }
</script>
