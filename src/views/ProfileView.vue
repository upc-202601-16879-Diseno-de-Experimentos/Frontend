<template>
  <div class="profile-view">
    <h2>Mi Perfil de Entrenador</h2>
    <div class="card" v-if="coachProfile">
      <form @submit.prevent="updateProfile">
        <div class="form-group">
          <label>Nombre Público</label>
          <input v-model="form.name" type="text" required />
        </div>
        <div class="form-group">
          <label>Especialidad</label>
          <input v-model="form.expertise" type="text" />
        </div>
        <div class="form-group">
          <label>Deporte</label>
          <input v-model="form.sportType" type="text" />
        </div>
        <div class="form-group">
          <label>Precio base por hora (USD)</label>
          <input v-model="form.pricePerHour" type="number" />
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <textarea v-model="form.description" rows="4"></textarea>
        </div>
        
        <p v-if="successMsg" class="success">{{ successMsg }}</p>
        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

        <button type="submit" class="btn">Guardar Cambios</button>
      </form>
    </div>
    <div v-else class="empty">Cargando perfil...</div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useCoach } from '../composables/useCoach'
import api from '../services/api'

const { coachProfile, loadData } = useCoach()

const form = reactive({
  name: '',
  expertise: '',
  sportType: '',
  pricePerHour: 0,
  description: ''
})

const successMsg = ref('')
const errorMsg = ref('')

watch(coachProfile, (newVal) => {
  if (newVal) {
    Object.assign(form, {
      name: newVal.name,
      expertise: newVal.expertise,
      sportType: newVal.sportType,
      pricePerHour: newVal.pricePerHour,
      description: newVal.description
    })
  }
}, { immediate: true })

onMounted(() => {
  loadData()
})

const updateProfile = async () => {
  successMsg.value = ''
  errorMsg.value = ''
  try {
    const updatedData = { ...coachProfile.value, ...form }
    await api.put(`/coaches/${coachProfile.value.id}`, updatedData)
    successMsg.value = 'Perfil actualizado exitosamente'
    await loadData()
  } catch (e) {
    errorMsg.value = 'Error al actualizar el perfil'
  }
}
</script>
