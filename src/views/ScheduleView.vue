<template>
  <div class="schedule-view">
    <h2>Mi Horario Semanal</h2>
    <div class="card" v-if="coachProfile">
      <form @submit.prevent="updateSchedule">
        <p>Configura tu rango de trabajo diario. Este horario se reflejará dinámicamente en la app móvil.</p>
        <div style="display: flex; gap: 20px; margin-top: 15px;">
          <div class="form-group" style="flex: 1;">
            <label>Hora de Inicio</label>
            <input v-model="startTime" type="time" required />
          </div>
          <div class="form-group" style="flex: 1;">
            <label>Hora de Fin</label>
            <input v-model="endTime" type="time" required />
          </div>
        </div>
        
        <p v-if="successMsg" class="success">{{ successMsg }}</p>
        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

        <button type="submit" class="btn">Guardar Horario</button>
      </form>
    </div>
    <div v-else class="empty">Cargando perfil...</div>
    
    <div style="margin-top: 40px;">
      <h3>Vista Previa Semanal</h3>
      <div class="schedule-grid">
        <div v-for="(day, index) in weekDays" :key="index" class="day-schedule">
          <div class="day-header">{{ day }}</div>
          <div class="day-slots">
            <div class="slot available">
              <span class="time">{{ startTime || '09:00' }} - {{ endTime || '18:00' }}</span>
              <span class="status">Disponible</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useCoach } from '../composables/useCoach'
import api from '../services/api'

const { coachProfile, loadData } = useCoach()
const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const startTime = ref('08:00')
const endTime = ref('18:00')

const successMsg = ref('')
const errorMsg = ref('')

watch(coachProfile, (newVal) => {
  if (newVal && newVal.availability) {
    const parts = newVal.availability.split('-')
    if (parts.length === 2) {
      startTime.value = parts[0].trim()
      endTime.value = parts[1].trim()
    }
  }
}, { immediate: true })

onMounted(() => {
  loadData()
})

const updateSchedule = async () => {
  successMsg.value = ''
  errorMsg.value = ''
  try {
    const updatedData = { ...coachProfile.value, availability: `${startTime.value}-${endTime.value}` }
    await api.put(`/coaches/${coachProfile.value.id}`, updatedData)
    successMsg.value = 'Horario actualizado exitosamente'
    await loadData()
  } catch (e) {
    errorMsg.value = 'Error al actualizar el horario'
  }
}
</script>
