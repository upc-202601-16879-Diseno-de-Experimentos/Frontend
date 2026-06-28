<template>
  <div class="schedule-view">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2>Mi Horario Semanal</h2>
      <button 
        type="button" 
        class="btn" 
        :disabled="validationErrors.length > 0 || !coachProfile"
        @click="updateSchedule"
        :style="{ opacity: (validationErrors.length > 0 || !coachProfile) ? 0.6 : 1, cursor: (validationErrors.length > 0 || !coachProfile) ? 'not-allowed' : 'pointer' }"
      >
        Guardar Horario
      </button>
    </div>

    <div v-if="coachProfile">
      <p style="color: #6B7280; margin-bottom: 24px;">
        Configura tu disponibilidad por cada día de la semana. Puedes añadir múltiples bloques horarios y desactivar los días en los que no labores.
      </p>

      <!-- Global Validation Messages -->
      <div v-if="validationErrors.length > 0" class="validation-banner">
        <div class="banner-title">⚠️ Por favor corrige los siguientes errores:</div>
        <ul>
          <li v-for="(err, i) in validationErrors" :key="i">{{ err }}</li>
        </ul>
      </div>

      <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>
      <div v-if="errorMsg" class="alert alert-error">{{ errorMsg }}</div>

      <!-- Grid of Days -->
      <div class="days-container">
        <div v-for="day in daysOfWeek" :key="day" class="day-card" :class="{ inactive: !weeklyAvailability[day].active }">
          <div class="day-card-header">
            <div style="display: flex; align-items: center; gap: 12px;">
              <!-- Toggle switch for active/inactive day -->
              <label class="switch">
                <input type="checkbox" v-model="weeklyAvailability[day].active" @change="toggleDay(day)" />
                <span class="slider round"></span>
              </label>
              <span class="day-name">{{ displayDays[day] }}</span>
            </div>
            <button 
              v-if="weeklyAvailability[day].active" 
              type="button" 
              class="btn-secondary" 
              @click="addRange(day)"
            >
              + Agregar rango
            </button>
          </div>

          <div class="day-card-body">
            <!-- If inactive -->
            <div v-if="!weeklyAvailability[day].active" class="no-availability-text">
              Sin disponibilidad (Día de descanso)
            </div>

            <!-- If active and has ranges -->
            <div v-else class="ranges-list">
              <div v-for="(range, idx) in weeklyAvailability[day].ranges" :key="idx" class="range-row">
                <div class="time-inputs">
                  <div class="time-field">
                    <span>Inicio:</span>
                    <input v-model="range.start" type="time" required />
                  </div>
                  <span class="arrow-sep">➔</span>
                  <div class="time-field">
                    <span>Fin:</span>
                    <input v-model="range.end" type="time" required />
                  </div>
                </div>
                <button type="button" class="btn-remove" @click="removeRange(day, idx)">✕</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Weekly Preview -->
      <div class="weekly-preview-section">
        <h3>Vista Previa Semanal</h3>
        <div class="preview-grid">
          <div v-for="day in daysOfWeek" :key="day" class="preview-day-card" :class="{ disabled: !weeklyAvailability[day].active }">
            <div class="preview-day-name">{{ displayDays[day] }}</div>
            <div class="preview-slots">
              <template v-if="weeklyAvailability[day].active && weeklyAvailability[day].ranges.length > 0">
                <div 
                  v-for="(range, rIdx) in weeklyAvailability[day].ranges" 
                  :key="rIdx" 
                  class="preview-slot-badge"
                >
                  {{ range.start }} - {{ range.end }}
                </div>
              </template>
              <span v-else class="preview-no-slots">No disponible</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="empty">Cargando perfil del coach...</div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useCoach } from '../composables/useCoach'
import api from '../services/api'

const { coachProfile, loadData } = useCoach()

const daysOfWeek = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']
const displayDays = {
  Lunes: 'Lunes',
  Martes: 'Martes',
  Miercoles: 'Miércoles',
  Jueves: 'Jueves',
  Viernes: 'Viernes',
  Sabado: 'Sábado',
  Domingo: 'Domingo'
}

const successMsg = ref('')
const errorMsg = ref('')

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

  // Fallback old text format "08:00-18:00"
  const timeRegex = /(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/
  const match = trimmed.match(timeRegex)
  const defaultRange = match ? { start: match[1], end: match[2] } : { start: '09:00', end: '18:00' }

  // By default, activate Monday to Saturday
  const daysToActivate = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']
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

// Validation logic
const validationErrors = computed(() => {
  const errors = []
  daysOfWeek.forEach(day => {
    const data = weeklyAvailability.value[day]
    if (!data.active) return

    if (data.ranges.length === 0) {
      errors.push(`El día ${displayDays[day]} está marcado como disponible pero no tiene ningún rango de horario.`)
      return
    }

    // Check for empty or invalid values, then overlaps/duplicates
    const sortedRanges = []
    data.ranges.forEach((r, idx) => {
      if (!r.start || !r.end) {
        errors.push(`En ${displayDays[day]}, el rango ${idx + 1} tiene horas incompletas.`)
      } else {
        if (r.start >= r.end) {
          errors.push(`En ${displayDays[day]}, la hora de inicio (${r.start}) debe ser menor que la hora de fin (${r.end}).`)
        }
        sortedRanges.push({ start: r.start, end: r.end, index: idx })
      }
    })

    // Sort to check overlaps
    sortedRanges.sort((a, b) => a.start.localeCompare(b.start))

    for (let i = 0; i < sortedRanges.length - 1; i++) {
      const current = sortedRanges[i]
      const next = sortedRanges[i + 1]
      
      if (current.end > next.start) {
        if (current.start === next.start && current.end === next.end) {
          errors.push(`En ${displayDays[day]}, hay rangos duplicados: ${current.start} - ${current.end}.`)
        } else {
          errors.push(`En ${displayDays[day]}, el rango ${current.start}-${current.end} se superpone con ${next.start}-${next.end}.`)
        }
      }
    }
  })
  return errors
})

watch(coachProfile, (newVal) => {
  if (newVal) {
    weeklyAvailability.value = parseAvailability(newVal.availability)
  }
}, { immediate: true })

onMounted(() => {
  loadData()
})

const updateSchedule = async () => {
  successMsg.value = ''
  errorMsg.value = ''
  
  if (validationErrors.value.length > 0) {
    errorMsg.value = 'Corrige los errores de validación antes de guardar.'
    return
  }

  try {
    const jsonStr = compileAvailability()
    const updatedData = { ...coachProfile.value, availability: jsonStr }
    await api.put(`/coaches/${coachProfile.value.id}`, updatedData)
    successMsg.value = '¡Horario guardado exitosamente!'
    await loadData()
  } catch (e) {
    errorMsg.value = 'Error al actualizar el horario en el servidor.'
    console.error(e)
  }
}
</script>

<style scoped>
.schedule-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 10px;
}

.validation-banner {
  background-color: #FFF5F5;
  border-left: 4px solid #E53E3E;
  padding: 14px 18px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(229, 62, 62, 0.05);
}

.banner-title {
  font-weight: bold;
  color: #C53030;
  margin-bottom: 6px;
}

.validation-banner ul {
  margin: 0;
  padding-left: 20px;
  color: #742A2A;
  font-size: 0.95rem;
}

.alert {
  padding: 12px 18px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-weight: 500;
}

.alert-success {
  background-color: #ECFDF5;
  color: #065F46;
  border: 1px solid #A7F3D0;
}

.alert-error {
  background-color: #FEF2F2;
  color: #991B1B;
  border: 1px solid #FCA5A5;
}

.days-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 30px;
}

@media (min-width: 768px) {
  .days-container {
    grid-template-columns: 1fr 1fr;
  }
}

.day-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #E5E7EB;
  padding: 18px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.day-card.inactive {
  background: #F9FAFB;
  border-color: #F3F4F6;
  opacity: 0.85;
}

.day-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #F3F4F6;
  padding-bottom: 12px;
  margin-bottom: 12px;
}

.day-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1F2937;
}

.day-card.inactive .day-name {
  color: #9CA3AF;
}

.btn-secondary {
  background: #F3F4F6;
  color: #4B5563;
  border: 1px solid #E5E7EB;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #E5E7EB;
  color: #1F2937;
}

.no-availability-text {
  padding: 20px 0;
  text-align: center;
  color: #9CA3AF;
  font-size: 0.95rem;
  font-style: italic;
}

.ranges-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.range-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #F9FAFB;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #F3F4F6;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-field {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #4B5563;
}

.time-field input {
  border: 1px solid #D1D5DB;
  padding: 4px 8px;
  border-radius: 6px;
  outline: none;
  font-size: 0.9rem;
  color: #1F2937;
}

.time-field input:focus {
  border-color: #E07A5F;
  box-shadow: 0 0 0 1px #E07A5F;
}

.arrow-sep {
  color: #9CA3AF;
}

.btn-remove {
  background: none;
  border: none;
  color: #EF4444;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-remove:hover {
  background: #FEE2E2;
}

/* Switch styling */
.switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 24px;
}

.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #D1D5DB;
  transition: .3s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
}

input:checked + .slider {
  background-color: #E07A5F;
}

input:focus + .slider {
  box-shadow: 0 0 1px #E07A5F;
}

input:checked + .slider:before {
  transform: translateX(18px);
}

.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}

/* Weekly Preview Section */
.weekly-preview-section {
  background: #FFF9F5;
  border: 1px solid #F0E7E1;
  border-radius: 20px;
  padding: 24px;
  margin-top: 40px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.01);
}

.weekly-preview-section h3 {
  margin-bottom: 16px;
  color: #3D405B;
  font-size: 1.25rem;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
}

.preview-day-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.preview-day-card.disabled {
  background: #F3F4F6;
  border-color: #E5E7EB;
}

.preview-day-name {
  font-weight: bold;
  color: #3D405B;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.preview-day-card.disabled .preview-day-name {
  color: #9CA3AF;
}

.preview-slots {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

.preview-slot-badge {
  background: #F4FBF7;
  color: #10B981;
  border: 1px solid #D1FAE5;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  width: 100%;
  text-align: center;
}

.preview-no-slots {
  font-size: 0.8rem;
  color: #9CA3AF;
  font-style: italic;
}
</style>
