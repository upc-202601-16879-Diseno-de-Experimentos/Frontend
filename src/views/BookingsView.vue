<template>
  <div class="bookings-view">
    <h2>Gestión de Reservas</h2>
    
    <div class="bookings-filters">
      <button :class="{ active: filter === 'CONFIRMED' }" @click="filter = 'CONFIRMED'">Confirmadas</button>
      <button :class="{ active: filter === 'COMPLETED' }" @click="filter = 'COMPLETED'">Completadas</button>
      <button :class="{ active: filter === 'ALL' }" @click="filter = 'ALL'">Todas (Aprobadas)</button>
    </div>

    <div v-if="filteredBookings.length === 0" class="empty">
      No hay reservas en esta categoría.
    </div>

    <div v-for="booking in filteredBookings" :key="booking.id" class="booking-card">
      <div class="booking-header">
        <h4>Reserva #{{ booking.id }}</h4>
        <span class="status-badge" :class="booking.status">{{ getStatusText(booking.status) }}</span>
      </div>
      <div class="booking-details">
        <p><strong>Fecha:</strong> {{ formatDate(booking.schedule) }}</p>
        <p><strong>Cliente ID:</strong> {{ booking.userProfileId }}</p>
      </div>
      
      <div class="booking-actions" v-if="booking.status === 'PENDING'">
        <button class="btn-accept" @click="handleStatusUpdate(booking.id, 'CONFIRMED')">Aceptar</button>
        <button class="btn-reject" @click="handleStatusUpdate(booking.id, 'CANCELLED')">Rechazar</button>
      </div>
      <div class="booking-actions" v-if="booking.status === 'CONFIRMED'">
        <button class="btn-complete" @click="handleStatusUpdate(booking.id, 'COMPLETED')">Marcar Completada</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCoach } from '../composables/useCoach'

const { bookings, loadData, updateBookingStatus } = useCoach()
const filter = ref('CONFIRMED')

onMounted(() => {
  loadData()
})

const filteredBookings = computed(() => {
  if (filter.value === 'ALL') return bookings.value.filter(b => b.status !== 'PENDING')
  return bookings.value.filter(b => b.status === filter.value)
})

const getStatusText = (status) => {
  const map = {
    'PENDING': 'Pendiente',
    'CONFIRMED': 'Confirmada',
    'COMPLETED': 'Completada',
    'CANCELLED': 'Cancelada'
  }
  return map[status] || status
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'Fecha por definir'
  return new Date(dateStr).toLocaleString()
}

const handleStatusUpdate = async (id, status) => {
  await updateBookingStatus(id, status)
}
</script>
