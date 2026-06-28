<template>
  <div class="clients-view">
    <div class="view-header">
      <h2>Mis Clientes</h2>
      <p class="subtitle">Gestiona y visualiza el historial y valoraciones de los deportistas que reservan tus clases.</p>
    </div>
    
    <div v-if="clients.length === 0" class="empty-state">
      <div class="empty-icon">👥</div>
      <h3>Sin clientes registrados</h3>
      <p>Aún no tienes clientes. ¡Tus próximos alumnos aparecerán aquí!</p>
    </div>

    <div class="clients-list" v-else>
      <div v-for="client in clients" :key="client.id" class="client-card">
        <!-- Client Profile Header -->
        <div class="client-card-header">
          <div class="avatar-container">
            <img v-if="client.photo" :src="client.photo" alt="Avatar" class="client-avatar" />
            <div v-else class="client-avatar-placeholder">{{ client.name.charAt(0).toUpperCase() }}</div>
          </div>
          
          <div class="client-main-info">
            <h3>{{ client.name }}</h3>
            <div class="client-contact-info">
              <span>✉️ {{ client.email }}</span>
              <span v-if="client.phone">📞 {{ client.phone }}</span>
            </div>
          </div>
        </div>

        <!-- Review / Rating Section -->
        <div class="client-review-section">
          <h4 class="section-title">Calificación y Reseña</h4>
          <div v-if="client.review" class="review-box">
            <div class="review-meta">
              <div class="stars">
                <span v-for="star in 5" :key="star" class="star" :class="{ filled: star <= client.review.rating }">★</span>
              </div>
              <span class="review-date">{{ formatDate(client.review.createdAt) }}</span>
            </div>
            <p class="review-comment">"{{ client.review.comment }}"</p>
          </div>
          <div v-else class="no-review-badge">
            El cliente aún no ha dejado una reseña.
          </div>
        </div>

        <!-- Bookings List Section -->
        <div class="client-bookings-section">
          <h4 class="section-title">Historial de Reservas ({{ client.bookings.length }})</h4>
          <div class="bookings-grid">
            <div v-for="booking in client.bookings" :key="booking.id" class="booking-item-card">
              <div class="booking-item-header">
                <span class="booking-service">{{ booking.coachService?.name || booking.sportReserved || 'Clase' }}</span>
                <span class="status-tag" :class="booking.status">{{ getStatusText(booking.status) }}</span>
              </div>
              
              <div class="booking-item-body">
                <div><strong>Deporte:</strong> {{ coachProfile?.sportType || coachProfile?.expertise || 'General' }}</div>
                <div><strong>📅 Fecha:</strong> {{ formatDate(booking.startTime || booking.schedule) }}</div>
                <div><strong>🕒 Hora:</strong> {{ formatTime(booking.startTime) }} - {{ formatTime(booking.endTime) }}</div>
              </div>

              <!-- Pending Actions inside client card if any pending bookings -->
              <div v-if="booking.status === 'PENDING'" class="booking-item-actions">
                <button @click="handleStatusUpdate(booking.id, 'CONFIRMED')" class="btn-approve-sm">Aprobar</button>
                <button @click="handleStatusUpdate(booking.id, 'REJECTED')" class="btn-reject-sm">Rechazar</button>
              </div>
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

const { clients, coachProfile, loadData, updateBookingStatus } = useCoach()

const handleStatusUpdate = async (id, status) => {
  await updateBookingStatus(id, status)
}

onMounted(() => {
  loadData()
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
}

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
</script>

<style scoped>
.clients-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px 0;
}
.view-header {
  margin-bottom: 24px;
}
.view-header h2 {
  font-size: 1.8rem;
  color: #3D405B;
  margin: 0 0 6px 0;
}
.subtitle {
  color: #82859C;
  font-size: 0.95rem;
  margin: 0;
}

.empty-state {
  background: white;
  border-radius: 20px;
  border: 1px solid #F0E7E1;
  padding: 48px;
  text-align: center;
  margin-top: 20px;
}
.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}
.empty-state h3 {
  margin: 0 0 8px 0;
  color: #3D405B;
}
.empty-state p {
  color: #82859C;
  margin: 0;
}

.clients-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.client-card {
  background: white;
  border: 1px solid #F0E7E1;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.01);
  transition: all 0.3s ease;
}
.client-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.03);
}

.client-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid #F4F1DE;
  padding-bottom: 16px;
  margin-bottom: 16px;
}
.client-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}
.client-avatar-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #E07A5F;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
}
.client-main-info h3 {
  margin: 0 0 6px 0;
  color: #3D405B;
  font-size: 1.25rem;
}
.client-contact-info {
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  color: #82859C;
}

.section-title {
  font-size: 0.9rem;
  color: #E07A5F;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px 0;
  font-weight: 700;
}

.client-review-section {
  margin-bottom: 20px;
}
.review-box {
  background: #FFF9F5;
  border: 1px dashed #F2CC8F;
  border-radius: 12px;
  padding: 14px 16px;
}
.review-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.stars {
  display: flex;
  gap: 2px;
}
.star {
  color: #ddd;
  font-size: 1rem;
}
.star.filled {
  color: #F2CC8F;
}
.review-date {
  font-size: 0.8rem;
  color: #82859C;
}
.review-comment {
  margin: 0;
  font-size: 0.9rem;
  color: #5c5f73;
  font-style: italic;
  line-height: 1.4;
}
.no-review-badge {
  display: inline-block;
  background: #F4F1DE;
  color: #82859C;
  font-size: 0.85rem;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 500;
}

.client-bookings-section {
  border-top: 1px solid #F4F1DE;
  padding-top: 16px;
}
.bookings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}
.booking-item-card {
  background: #FAFAFA;
  border: 1px solid #EAEAEA;
  border-radius: 12px;
  padding: 12px;
}
.booking-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  border-bottom: 1px solid #F0F0F0;
  padding-bottom: 6px;
}
.booking-service {
  font-weight: 600;
  font-size: 0.9rem;
  color: #3D405B;
}
.status-tag {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}
.status-tag.PENDING {
  background: #F4A261;
  color: white;
}
.status-tag.CONFIRMED {
  background: #81B29A;
  color: white;
}
.status-tag.COMPLETED {
  background: #3D405B;
  color: white;
}
.status-tag.CANCELLED, .status-tag.REJECTED {
  background: #E07A5F;
  color: white;
}

.booking-item-body {
  font-size: 0.85rem;
  color: #5c5f73;
  line-height: 1.5;
}

.booking-item-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  justify-content: flex-end;
}
.btn-approve-sm, .btn-reject-sm {
  border: none;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-approve-sm:hover, .btn-reject-sm:hover {
  opacity: 0.9;
}
.btn-approve-sm {
  background: #81B29A;
  color: white;
}
.btn-reject-sm {
  background: #E07A5F;
  color: white;
}
</style>
