<template>
  <div class="clients-view">
    <h2>Mis Clientes</h2>
    
    <div v-if="clients.length === 0" class="empty">
      Aún no tienes clientes. ¡Tus próximos clientes aparecerán aquí!
    </div>

    <div class="clients-list">
      <div v-for="client in clients" :key="client.id" class="client-card" style="display: block; margin-bottom: 20px; border: 1px solid #F0E7E1; padding: 16px; border-radius: 16px;">
        <div class="client-header" style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
          <img v-if="client.photo" :src="client.photo" alt="Avatar" class="client-avatar-img" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;" />
          <div v-else class="client-avatar" style="width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #E07A5F; color: white; font-weight: bold; font-size: 1.2rem;">{{ client.name.charAt(0).toUpperCase() }}</div>
          
          <div class="client-info" style="flex: 1;">
            <h4 style="margin: 0 0 4px 0; color: #3D405B; font-size: 1.15rem;">{{ client.name }}</h4>
            <p style="margin: 0; font-size: 0.85rem; color: #81B29A; font-weight: 600;">Deporte: {{ client.sportReserved }}</p>
          </div>
        </div>
        
        <div class="client-details" style="background: #FFF9F5; padding: 12px; border-radius: 12px; font-size: 0.85rem; color: #5c5f73; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
          <div><strong>📞 Teléfono:</strong> {{ client.phone }}</div>
          <div><strong>✉️ Email:</strong> {{ client.email }}</div>
          <div><strong>📅 Reservas:</strong> {{ client.bookingsCount }} en total</div>
          <div><strong>🕒 Última:</strong> {{ formatDate(client.lastBooking) }}</div>
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
