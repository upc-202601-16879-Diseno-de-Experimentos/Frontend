<template>
  <div class="profile-view">
    <h2>Mi Perfil de Entrenador</h2>
    
    <div class="profile-container" v-if="coachProfile">
      <!-- Info Card (Read Only / General info) -->
      <div class="card profile-summary-card" style="margin-bottom: 20px; display: flex; align-items: center; gap: 20px;">
        <img :src="coachProfile.imageUrl || 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6'" alt="Profile Photo" class="profile-avatar-large" />
        <div>
          <h3>{{ coachProfile.name }}</h3>
          <p class="subtitle">{{ coachProfile.expertise }} • {{ coachProfile.location || 'Sin ubicación' }}</p>
          <div class="rating-badge" style="display: flex; align-items: center; gap: 6px; margin-top: 8px;">
            <span class="star-icon" style="color: #F4A261; font-size: 1.2rem;">★</span>
            <strong>{{ (coachProfile.rating || 0).toFixed(1) }}</strong>
            <span class="total-reviews">({{ coachProfile.totalReviews || 0 }} opiniones)</span>
          </div>
        </div>
      </div>

      <!-- Edit Form Card -->
      <div class="card">
        <h3>Editar Información de Perfil</h3>
        <form @submit.prevent="updateProfile">
          <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="form-group">
              <label>Nombre Público</label>
              <input v-model="form.name" type="text" required />
            </div>
            <div class="form-group">
              <label>Especialidad</label>
              <input v-model="form.expertise" type="text" required />
            </div>
            <div class="form-group">
              <label>Deporte</label>
              <input v-model="form.sportType" type="text" required />
            </div>
            <div class="form-group">
              <label>Precio base por hora (USD)</label>
              <input v-model="form.pricePerHour" type="number" required min="0" />
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input v-model="form.phone" type="text" required />
            </div>
            <div class="form-group">
              <label>Email de Contacto</label>
              <input v-model="form.email" type="email" required />
            </div>
            <div class="form-group">
              <label>Ubicación / Ciudad</label>
              <input v-model="form.location" type="text" required />
            </div>
            <div class="form-group">
              <label>Años de Experiencia</label>
              <input v-model="form.experienceYears" type="number" required min="0" />
            </div>
            <div class="form-group" style="grid-column: span 2; border: 1px solid #F0E7E1; padding: 16px; border-radius: 16px; background: #FFF9F5; margin-top: 10px;">
              <label style="font-weight: bold; font-size: 1rem; color: #3D405B; margin-bottom: 12px; display: block;">Horario de Disponibilidad Semanal</label>
              
              <div class="weekly-schedule" style="display: flex; flex-direction: column; gap: 8px;">
                <div v-for="day in daysOfWeek" :key="day" style="display: flex; flex-direction: column; padding: 8px 0; border-bottom: 1px solid #F0E7E1;">
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <input type="checkbox" v-model="weeklyAvailability[day].active" @change="toggleDay(day)" :id="'check-' + day" style="cursor: pointer; width: 18px; height: 18px; accent-color: #E07A5F;" />
                      <label :for="'check-' + day" style="font-weight: 600; cursor: pointer; color: #3D405B; margin: 0;">{{ day }}</label>
                    </div>
                    <button v-if="weeklyAvailability[day].active" type="button" @click="addRange(day)" style="background: #81B29A; color: white; border: none; padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; cursor: pointer;">+ Rango</button>
                  </div>
                  
                  <div v-if="weeklyAvailability[day].active" style="margin-top: 8px; padding-left: 26px; display: flex; flex-direction: column; gap: 6px;">
                    <div v-for="(range, idx) in weeklyAvailability[day].ranges" :key="idx" style="display: flex; align-items: center; gap: 8px;">
                      <input v-model="range.start" type="time" required style="border: 1px solid #ccc; padding: 4px 8px; border-radius: 6px; font-size: 0.9rem;" />
                      <span>a</span>
                      <input v-model="range.end" type="time" required style="border: 1px solid #ccc; padding: 4px 8px; border-radius: 6px; font-size: 0.9rem;" />
                      <button type="button" @click="removeRange(day, idx)" style="background: none; border: none; color: #E07A5F; font-weight: bold; cursor: pointer; font-size: 1.1rem; padding: 0 4px;">✕</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label>Imagen de Perfil (URL)</label>
              <input v-model="form.imageUrl" type="url" placeholder="https://ejemplo.com/foto.jpg" />
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label>Descripción / Biografía</label>
              <textarea v-model="form.description" rows="4"></textarea>
            </div>
          </div>
          
          <p v-if="successMsg" class="success">{{ successMsg }}</p>
          <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

          <button type="submit" class="btn" style="margin-top: 10px;">Guardar Cambios</button>
        </form>
      </div>

      <!-- Reviews Section -->
      <div class="card reviews-card" style="margin-top: 20px;">
        <h3>Opiniones de Clientes</h3>
        <div v-if="reviews.length === 0" class="empty" style="padding: 1rem 0;">
          Aún no tienes valoraciones de tus alumnos.
        </div>
        <div v-else class="reviews-list">
          <div v-for="review in reviews" :key="review.id" class="review-item" style="border-bottom: 1px solid #F0E7E1; padding: 12px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <strong>Alumno #{{ review.userProfileId }}</strong>
              <div style="color: #F4A261;">
                <span v-for="n in 5" :key="n">{{ n <= review.rating ? '★' : '☆' }}</span>
              </div>
            </div>
            <p style="margin: 0; color: #5c5f73; font-style: italic;">"{{ review.comment || 'Sin comentarios' }}"</p>
            <small style="color: #82859C; font-size: 0.8rem;">Fecha: {{ new Date(review.createdAt).toLocaleDateString() }}</small>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="empty">Cargando perfil...</div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useCoach } from '../composables/useCoach'
import api from '../services/api'

const { coachProfile, loadData } = useCoach()
const reviews = ref([])

const form = reactive({
  name: '',
  expertise: '',
  sportType: '',
  pricePerHour: 0,
  description: '',
  phone: '',
  email: '',
  location: '',
  experienceYears: 0,
  availability: '',
  imageUrl: ''
})

const daysOfWeek = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']

const weeklyAvailability = ref({
  Lunes: { active: false, ranges: [] },
  Martes: { active: false, ranges: [] },
  Miercoles: { active: false, ranges: [] },
  Jueves: { active: false, ranges: [] },
  Viernes: { active: false, ranges: [] },
  Sabado: { active: false, ranges: [] },
  Domingo: { active: false, ranges: [] }
})

const parseAvailability = (availStr) => {
  const res = {}
  daysOfWeek.forEach(d => {
    res[d] = { active: false, ranges: [] }
  })
  
  if (!availStr) return res

  const trimmed = availStr.trim()
  if (trimmed.startsWith('{')) {
    try {
      const json = JSON.parse(trimmed)
      Object.keys(json).forEach(day => {
        if (res[day]) {
          res[day].active = true
          res[day].ranges = json[day].map(rangeStr => {
            const [start, end] = rangeStr.split('-')
            return { start: start.trim(), end: end.trim() }
          })
        }
      })
      return res
    } catch(e) {
      console.error('Error parsing JSON availability', e)
    }
  }

  // Fallback old text format
  const timeRegex = /(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/
  const match = trimmed.match(timeRegex)
  const defaultRange = match ? { start: match[1], end: match[2] } : { start: '09:00', end: '18:00' }

  const daysToActivate = []
  if (trimmed.toLowerCase().includes('lunes a viernes') || trimmed.toLowerCase().includes('lun a vie')) {
    daysToActivate.push('Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes')
  } else if (trimmed.toLowerCase().includes('lunes a sabado')) {
    daysToActivate.push('Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado')
  } else {
    daysToActivate.push('Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes')
  }

  daysToActivate.forEach(day => {
    res[day].active = true
    res[day].ranges.push({ ...defaultRange })
  })

  return res
}

const compileAvailability = () => {
  const result = {}
  daysOfWeek.forEach(day => {
    const data = weeklyAvailability.value[day]
    if (data.active && data.ranges.length > 0) {
      const validRanges = data.ranges
        .filter(r => r.start && r.end)
        .map(r => `${r.start}-${r.end}`)
      if (validRanges.length > 0) {
        result[day] = validRanges
      }
    }
  })
  return JSON.stringify(result)
}

const addRange = (day) => {
  weeklyAvailability.value[day].ranges.push({ start: '09:00', end: '17:00' })
}

const removeRange = (day, index) => {
  weeklyAvailability.value[day].ranges.splice(index, 1)
}

const toggleDay = (day) => {
  const data = weeklyAvailability.value[day]
  if (data.active && data.ranges.length === 0) {
    data.ranges.push({ start: '09:00', end: '17:00' })
  }
}

const successMsg = ref('')
const errorMsg = ref('')

const fetchReviews = async (coachId) => {
  try {
    const res = await api.get(`/reviews/coach/${coachId}`)
    reviews.value = res.data || []
  } catch (e) {
    console.error('Error fetching reviews', e)
  }
}

watch(coachProfile, (newVal) => {
  if (newVal) {
    Object.assign(form, {
      name: newVal.name || '',
      expertise: newVal.expertise || '',
      sportType: newVal.sportType || '',
      pricePerHour: newVal.pricePerHour || 0,
      description: newVal.description || '',
      phone: newVal.phone || '',
      email: newVal.email || '',
      location: newVal.location || '',
      experienceYears: newVal.experienceYears || 0,
      availability: newVal.availability || '',
      imageUrl: newVal.imageUrl || ''
    })
    weeklyAvailability.value = parseAvailability(newVal.availability)
    fetchReviews(newVal.id)
  }
}, { immediate: true })

onMounted(() => {
  loadData()
})

const updateProfile = async () => {
  successMsg.value = ''
  errorMsg.value = ''
  try {
    form.availability = compileAvailability()
    const updatedData = { ...coachProfile.value, ...form }
    await api.put(`/coaches/${coachProfile.value.id}`, updatedData)
    successMsg.value = 'Perfil actualizado exitosamente'
    await loadData()
  } catch (e) {
    errorMsg.value = 'Error al actualizar el perfil'
  }
}
</script>

<style scoped>
.profile-avatar-large {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #81B29A;
}
.subtitle {
  color: #82859C;
  margin: 4px 0 0 0;
  font-weight: 500;
}
</style>
