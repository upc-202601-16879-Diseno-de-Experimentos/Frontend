<template>
  <div class="bookings-view">
    <h2>Gestión de Reservas</h2>
    
    <div class="bookings-filters" style="display: flex; gap: 8px; margin-bottom: 20px;">
      <button :class="{ active: filter === 'PENDING' }" @click="filter = 'PENDING'" class="filter-btn">Pendientes</button>
      <button :class="{ active: filter === 'CONFIRMED' }" @click="filter = 'CONFIRMED'" class="filter-btn">Confirmadas</button>
      <button :class="{ active: filter === 'COMPLETED' }" @click="filter = 'COMPLETED'" class="filter-btn">Completadas</button>
      <button :class="{ active: filter === 'ALL' }" @click="filter = 'ALL'" class="filter-btn">Todas</button>
    </div>

    <div v-if="filteredBookings.length === 0" class="empty">
      No hay reservas en esta categoría.
    </div>

    <div v-for="booking in filteredBookings" :key="booking.id" class="booking-card" style="background: white; padding: 20px; border-radius: 16px; border: 1px solid #F0E7E1; margin-bottom: 16px;">
      <div class="booking-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h4 style="margin: 0; color: #3D405B;">Reserva #{{ booking.id }}</h4>
        <span class="status-badge" :class="booking.status">{{ getStatusText(booking.status) }}</span>
      </div>
      <div class="booking-details" style="color: #5c5f73; font-size: 0.95rem; line-height: 1.6;">
        <p style="margin: 4px 0;"><strong>Fecha y Hora:</strong> {{ formatDate(booking.schedule) }}</p>
        <p style="margin: 4px 0;"><strong>Cliente:</strong> {{ booking.clientName }}</p>
        <p style="margin: 4px 0;" v-if="booking.coachService"><strong>Servicio:</strong> {{ booking.coachService.name }} (${{ booking.coachService.price }})</p>
        <p style="margin: 4px 0;" v-if="booking.amount && !booking.coachService"><strong>Monto:</strong> ${{ booking.amount }}</p>
      </div>
      
      <div class="booking-actions" v-if="booking.status === 'PENDING'" style="display: flex; gap: 8px; margin-top: 16px; justify-content: flex-end;">
        <button class="btn-accept" style="background: #81B29A; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;" @click="handleStatusUpdate(booking.id, 'CONFIRMED')">Aceptar</button>
        <button class="btn-reject" style="background: #E07A5F; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;" @click="handleStatusUpdate(booking.id, 'REJECTED')">Rechazar</button>
      </div>
      <div class="booking-actions" v-if="booking.status === 'CONFIRMED'" style="display: flex; gap: 8px; margin-top: 16px; justify-content: flex-end;">
        <button class="btn-complete" style="background: #3D405B; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;" @click="handleStatusUpdate(booking.id, 'COMPLETED')">Marcar Completada</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCoach } from '../composables/useCoach'

const { bookings, loadData, updateBookingStatus } = useCoach()
const filter = ref('PENDING')

onMounted(() => {
  loadData()
})

const filteredBookings = computed(() => {
  if (filter.value === 'ALL') return bookings.value
  return bookings.value.filter(b => b.status === filter.value)
})

const getStatusText = (status) => {
  const map = {
    'PENDING': 'Pendiente',
    'CONFIRMED': 'Confirmada',
    'COMPLETED': 'Completada',
    'CANCELLED': 'Cancelada',
    'REJECTED': 'Rechazada'
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

<style scoped>
.filter-btn {
  background: #F4F1DE;
  color: #3D405B;
  border: 1px solid #F0E7E1;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}
.filter-btn.active {
  background: #3D405B;
  color: white;
  border-color: #3D405B;
}
.status-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
}
.status-badge.PENDING {
  background: #F4A261;
  color: white;
}
.status-badge.CONFIRMED {
  background: #81B29A;
  color: white;
}
.status-badge.COMPLETED {
  background: #3D405B;
  color: white;
}
.status-badge.CANCELLED, .status-badge.REJECTED {
  background: #E07A5F;
  color: white;
}
</style>
