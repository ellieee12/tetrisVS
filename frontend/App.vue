<!-- src/App.vue -->
<!--
░▀█▀░█▀▀░▀█▀░█▀▄░▀█▀░█▀▀░░░█░█░█▀▀
░░█░░█▀▀░░█░░█▀▄░░█░░▀▀█░░░▀▄▀░▀▀█
░░▀░░▀▀▀░░▀░░▀░▀░▀▀▀░▀▀▀░░░░▀░░▀▀▀ :P
-->
<template>
  <Login v-if="!isAuthentified" @authentified="onAuth" />
  <Jeu v-else :user_id="user_id" />
</template>

<script setup>
import { ref } from 'vue'
import Login from './Login.vue'
import Jeu from './Jeu.vue'
const isAuthentified = ref(false)
const user_id = ref(null)

function onAuth(id) {
  console.log('App reçoit id =', id)
  user_id.value = id
  isAuthentified.value = true
}
</script>