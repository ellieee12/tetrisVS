<!-- src/Stats.vue -->
<template>
  <div id="stats">
    <div class="box">
        <small> Played Games </small> <b>{{ nb_played_games }}</b>
    </div>
    <div class="box">
        <small> Multiplayer win </small> <b>{{ nb_win }}</b>
    </div>
    <div class="box">
        <small> Best Score </small> <b>{{ best_score }}</b>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted} from 'vue'

const props = defineProps({ user_id: Number })

const nb_played_games = ref(0)
const nb_win = ref(0)
const best_score = ref(0)

async function showStats() {
  console.log('Stats reçoit user_id =', props.user_id)
  try {
    const response = await fetch(`https://tetrisvs-api.vercel.app/users/${props.user_id}`, {
      credentials: 'include'
    })
    if (!response.ok) {
        console.log("Impossible to fetch user")
        return
    }
    const user = await response.json()
    nb_played_games.value = user.nb_played_games
    nb_win.value = user.nb_win
    best_score.value = user.best_score
  } catch (e) {
    console.error(e)
  }
}

async function updateStats({won, score}) {
  console.log('Stats reçoit user_id =', props.user_id)
  try {
    //On utilise Patch plutot que put car sinon necessite password 
    const response = await fetch(`https://tetrisvs-api.vercel.app/users/${props.user_id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nb_played_games: nb_played_games.value + 1,
      nb_win: nb_win.value + (won ? 1 : 0),
      best_score: Math.max(best_score.value, score)
    })
  })
  if (!response.ok) {
      console.log('status PATCH :', response.status)
      return
  }
      const user = await response.json()
      nb_played_games.value = user.nb_played_games
      nb_win.value = user.nb_win
      best_score.value = user.best_score
  } catch (e) {
      console.error(e)
  }
}

onMounted(showStats)

//Pour que jeu puisse accèder à updateStats
defineExpose({ updateStats })
</script>