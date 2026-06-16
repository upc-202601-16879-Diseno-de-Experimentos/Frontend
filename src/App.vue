<template>
  <div v-if="isAuthenticated">
    <AppHeader />
    <div class="container">
      <router-view></router-view>
    </div>
  </div>
  <div v-else>
    <router-view></router-view>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from './composables/useAuth'
import AppHeader from './components/AppHeader.vue'

const { isAuthenticated, logout } = useAuth()
const router = useRouter()
const route = useRoute()

</script>

<style>
/* Los estilos globales se han movido a src/assets/main.css */
</style>