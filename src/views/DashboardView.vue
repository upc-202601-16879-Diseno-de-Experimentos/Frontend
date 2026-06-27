<template>
  <div class="dashboard">
    <h2>Bienvenido, {{ coachProfile?.name || 'Entrenador' }}</h2>
    <p class="welcome-subtitle">Aquí tienes un resumen del estado de tu actividad deportiva y tus alumnos hoy.</p>
    
    <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 20px;">
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
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-value">${{ (stats.totalIncome || 0).toFixed(2) }}</div>
        <div class="stat-label">Ingresos Totales</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">★</div>
        <div class="stat-value">{{ (coachProfile?.rating || 0).toFixed(1) }}</div>
        <div class="stat-label">Calificación Promedio</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💬</div>
        <div class="stat-value">{{ coachProfile?.totalReviews || 0 }}</div>
        <div class="stat-label">Reseñas de Alumnos</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCoach } from '../composables/useCoach'

const { stats, coachProfile, loadData } = useCoach()

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.welcome-subtitle {
  color: #82859C;
  font-size: 1rem;
  margin-top: 4px;
  font-weight: 500;
}
.stats-grid {
  margin-top: 20px;
}
.stat-card {
  background: white;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid #F0E7E1;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: all 0.3s ease;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px rgba(0,0,0,0.05);
}
.stat-icon {
  font-size: 1.8rem;
  margin-bottom: 12px;
}
.stat-value {
  font-size: 2.2rem;
  font-weight: 800;
  color: #3D405B;
  line-height: 1.1;
  margin-bottom: 6px;
}
.stat-label {
  font-size: 0.95rem;
  color: #82859C;
  font-weight: 600;
}
</style>
