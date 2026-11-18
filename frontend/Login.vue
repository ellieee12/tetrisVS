<!-- src/Login.vue -->
<template>
  <div class="login">
    <form @submit.prevent>
        <p>Login : </p>
        <input type="text" v-model="userLogin" />
        <p> Password :</p>
        <input type="password" v-model="userPwd" />

        <button v-on:click="onSubmit">Log in</button>
    </form>
    <p v-if="erreur">{{ erreur }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const userLogin = ref('') //sont utilisées apres pour récupérer les valeurs
const userPwd = ref('')
const erreur = ref(null)
const emit = defineEmits(['authentified'])

async function onSubmit(){
    erreur.value = null
    try {
        const reponse = await fetch('http://localhost:3000/login', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pseudo: userLogin.value, pwd: userPwd.value })
        })
        if (reponse.ok) {
            const data = await reponse.json()
            emit('authentified', data.user_id)
        } else {
            console.log('status :', reponse.status)
            erreur.value = 'The login or the password is incorrect'
        }
    } catch (e) {
        console.error(e)
        erreur.value = 'Sorry :( The server encountered a problem'
    }
}
</script>