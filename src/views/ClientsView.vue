<template>
  <div class="clients-view">
    <h2>Mis Clientes</h2>
    
    <div v-if="clients.length === 0" class="empty">
      Aún no tienes clientes. ¡Tus próximos clientes aparecerán aquí!
    </div>

    <div class="clients-list">
      <div v-for="client in clients" :key="client.id" class="client-card" style="display: block;">
        <div class="client-header" style="display: flex; align-items: center; margin-bottom: 12px;">
          <div class="client-avatar">{{ client.name.charAt(0) }}</div>
          <div class="client-info">
            <h4>{{ client.name }}</h4>
            <p class="client-bookings">{{ client.bookingsCount }} reservas totales</p>
            <p>Última reserva: {{ formatDate(client.lastBooking) }}</p>
          </div>
        </div>
        
        <div class="client-pending-bookings" v-if="client.pendingBookings && client.pendingBookings.length > 0">
          <h5 style="margin-top: 16px; margin-bottom: 8px; color: #E07A5F;">Reservas Pendientes de Aprobación:</h5>
          <div v-for="booking in client.pendingBookings" :key="booking.id" style="background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>Reserva #{{ booking.id }}</strong> - {{ formatDate(booking.schedule) }}
            </div>
            <div>
              <button @click="handleStatusUpdate(booking.id, 'CONFIRMED')" style="background: #81B29A; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-right: 8px;">Aprobar</button>
              <button @click="handleStatusUpdate(booking.id, 'CANCELLED')" style="background: #E07A5F; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">Rechazar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCoach } from '../composables/useCoach'

const { clients, loadData, updateBookingStatus } = useCoach()

const handleStatusUpdate = async (id, status) => {
  await updateBookingStatus(id, status)
}

onMounted(() => {
  loadData()
})

const formatDate = (dateStr) => {
  if (!dateStr) return 'Reciente'
  return new Date(dateStr).toLocaleDateString()
}
</script>
