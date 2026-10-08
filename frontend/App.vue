<!-- src/App.vue -->
<template>
  <div v-if="cityList.length">
     <ul class="text-blue">
        <li v-for="city of cityList" key="city.code">
           {{ city.nom }}
        </li>
     </ul>
  </div>
  <div v-else class="text-red">
     Aucune donnée disponible
  </div>
</template>

<script setup> <!-- important, dois être présent dans tous les app.vue -->
import { ref, onMounted } from "vue"

const cityList = ref([])

onMounted(async () => {
  const response = await fetch("https://geo.api.gouv.fr/communes?codePostal=41100")
  cityList.value = await response.json()
})
</script>

<style scoped>
.text-blue {
   color: blue;
}
.text-red {
   color: red;
}
</style>