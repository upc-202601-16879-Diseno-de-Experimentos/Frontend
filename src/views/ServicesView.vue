<template>
  <div class="services-view">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2>Mis Servicios</h2>
      <button class="btn" @click="showNewForm = !showNewForm">
        {{ showNewForm ? 'Cancelar' : '+ Nuevo Servicio' }}
      </button>
    </div>

    <div v-if="showNewForm" class="form-panel">
      <h3>Crear Nuevo Servicio</h3>
      <form @submit.prevent="handleCreate">
        <div class="form-group">
          <label>Nombre del Servicio</label>
          <input v-model="newService.name" type="text" required placeholder="Ej: Clase particular de Tenis" />
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <textarea v-model="newService.description" required placeholder="Detalles de la sesión..."></textarea>
        </div>
        <div class="form-group">
          <label>Precio (USD)</label>
          <input v-model="newService.price" type="number" required min="0" />
        </div>
        <button type="submit" class="btn">Guardar Servicio</button>
      </form>
    </div>

    <div v-if="coachServices.length === 0" class="empty">
      No tienes servicios creados. Empieza ofreciendo tu primera clase.
    </div>

    <div class="services-list">
      <div v-for="service in coachServices" :key="service.id" class="service-card">
        <div class="service-header">
          <h4>{{ service.name }}</h4>
          <span class="service-price">${{ service.price }}</span>
        </div>
        <p>{{ service.description }}</p>
        <div class="service-actions">
          <button class="btn-delete" @click="handleDelete(service.id)">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useCoach } from '../composables/useCoach'

const { coachServices, createService, deleteService, loadData } = useCoach()
const showNewForm = ref(false)

const newService = reactive({
  name: '',
  description: '',
  price: 0
})

onMounted(() => {
  loadData()
})

const handleCreate = async () => {
  const ok = await createService({ ...newService })
  if (ok) {
    showNewForm.value = false
    newService.name = ''
    newService.description = ''
    newService.price = 0
  }
}

const handleDelete = async (id) => {
  if (confirm('¿Seguro que deseas eliminar este servicio?')) {
    await deleteService(id)
  }
}
</script>
