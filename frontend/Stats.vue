<!-- src/Stats.vue -->
<template>
  <div id="stats">
    <div class="box">
        <small> Played Games </small> <b>{{ nb_played_games }}</b>
    </div>
    <div class="box">
        <small> Wins </small> <b>{{ nb_win }}</b>
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
    const response = await fetch(`http://localhost:3000/users/${props.user_id}`, {
      credentials: 'include'
    })
    if (!response.ok) {
        console.log("PROBLEMEMEME")
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

</script>