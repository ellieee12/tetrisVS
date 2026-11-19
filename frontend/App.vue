<!-- src/App.vue -->
<!--
░▀█▀░█▀▀░▀█▀░█▀▄░▀█▀░█▀▀░░░█░█░█▀▀
░░█░░█▀▀░░█░░█▀▄░░█░░▀▀█░░░▀▄▀░▀▀█
░░▀░░▀▀▀░░▀░░▀░▀░▀▀▀░▀▀▀░░░░▀░░▀▀▀ :P
-->
<template>
  <p v-if="verifyingAuth">Chargement...</p>
  <Login v-else-if="!isAuthentified" @authentified="onAuth" />
  <Jeu v-else :user_id="user_id" />
</template>

<script setup>
import Login from './Login.vue'
import Jeu from './Jeu.vue'
import {ref, onMounted} from "vue";
const isAuthentified = ref(false)
const user_id = ref(null)
const verifyingAuth = ref(true)

function onAuth(id) {
  console.log('App reçoit id =', id)
  user_id.value = id
  isAuthentified.value = true
}

onMounted(async () => {
  try {
    const res = await fetch('https://tetrisvs-api.vercel.app/login/', {
      credentials: 'include'
    })
    if (res.ok) {
      const data = await res.json()
      onAuth(data.user_id)
    }
  } catch (e) {
    console.error(e)
  } finally {
    verifyingAuth.value = false
  }
})

</script>