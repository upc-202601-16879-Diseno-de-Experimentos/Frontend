<template>
  <div class="clients-view">
    <h2>Mis Clientes</h2>
    
    <div v-if="clients.length === 0" class="empty">
      Aún no tienes clientes. ¡Tus próximos clientes aparecerán aquí!
    </div>

    <div class="clients-list">
      <div v-for="client in clients" :key="client.id" class="client-card">
        <div class="client-avatar">{{ client.name.charAt(0) }}</div>
        <div class="client-info">
          <h4>{{ client.name }}</h4>
          <p class="client-bookings">{{ client.bookingsCount }} reservas totales</p>
          <p>Última reserva: {{ formatDate(client.lastBooking) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCoach } from '../composables/useCoach'

const { clients, loadData } = useCoach()

onMounted(() => {
  loadData()
})

const formatDate = (dateStr) => {
  if (!dateStr) return 'Reciente'
  return new Date(dateStr).toLocaleDateString()
}
</script>
