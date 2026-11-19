<!-- src/Login.vue -->
<template>
  <div class="login">

    <!-- LOG IN-->
    <form v-if="hasAccount" @submit.prevent>
        <p>Login : </p>
        <input type="text" v-model="userLogin" />
        <p> Password :</p>
        <input type="password" v-model="userPwd" />

        <button type="button" v-on:click="onSubmit"> Log in </button>
        <button type="button" @click="hasAccount = false"> Sign up </button>
    </form>

    <!-- SIGN UP-->
    <form v-else @submit.prevent>
        <p>Login : </p>
        <input type="text" v-model="userLogin" />
        <p> Password :</p>
        <input type="password" v-model="userPwd" />
        <p> Confirm password :</p>
        <input type="password" v-model="userPwdConfirm" />

        <button type="button" @click="onSignup"> Sign up </button>
        <button type="button" @click="hasAccount = true"> You already have an account </button>
    </form>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const userLogin = ref('')
const userPwd = ref('')

const hasAccount = ref(true)  
const userPwdConfirm = ref('') 

const error = ref(null)
const emit = defineEmits(['authentified'])

async function onSubmit(){
    error.value = null
    try {
        const reponse = await fetch('https://tetrisvs-api.vercel.app/login', {
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
            if (reponse.status == 401){
                error.value = 'The login or the password is incorrect'
            }
        }
    } catch (e) {
        console.error(e)
        error.value = 'Sorry :( The server encountered a problem'
    }
}

async function onSignup() {
    error.value = null
    if (userPwd.value !== userPwdConfirm.value) {
        error.value = 'The passwords do not match'
        return
    }
    try {
        const reponse = await fetch('https://tetrisvs-api.vercel.app/users', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pseudo: userLogin.value, pwd: userPwd.value })
        })
        if (reponse.ok) {
            await onSubmit()
        } else {
                        console.log('status :', reponse.status)
            if (reponse.status == 400) {
                error.value = 'Please fill in all fields'
            } else {
                error.value = 'Could not create the account (pseudo already taken?)'
            }
        }
    } catch (e) {
        console.error(e)
        error.value = 'Sorry :( The server encountered a problem'
    }
}
</script>