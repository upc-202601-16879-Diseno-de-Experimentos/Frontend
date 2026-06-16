<template>
  <div class="dashboard">
    <h2>Bienvenido, Entrenador</h2>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🎾</div>
        <div class="stat-value">{{ stats.totalServices }}</div>
        <div class="stat-label">Servicios Activos</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-value">{{ stats.activeBookings }}</div>
        <div class="stat-label">Reservas Confirmadas</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-value">{{ stats.totalClients }}</div>
        <div class="stat-label">Total Clientes</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCoach } from '../composables/useCoach'

const { stats, loadData } = useCoach()

onMounted(() => {
  loadData()
})
</script>
