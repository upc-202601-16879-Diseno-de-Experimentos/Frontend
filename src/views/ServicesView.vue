<template>
  <div class="services-view">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2>Mis Servicios</h2>
      <button class="btn" @click="toggleForm">
        {{ showForm ? 'Cancelar' : '+ Nuevo Servicio' }}
      </button>
    </div>

    <!-- Create / Edit Form Panel -->
    <div v-if="showForm" class="form-panel" style="background: #FFF; padding: 20px; border-radius: 16px; border: 1px solid #F0E7E1; margin-bottom: 20px;">
      <h3>{{ isEditing ? 'Editar Servicio' : 'Crear Nuevo Servicio' }}</h3>
      <form @submit.prevent="handleSave">
        <div class="form-group">
          <label>Nombre del Servicio</label>
          <input v-model="formService.name" type="text" required placeholder="Ej: Clase particular de Tenis" />
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <textarea v-model="formService.description" required placeholder="Detalles de la sesión..." rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>Precio (USD)</label>
          <input v-model="formService.price" type="number" required min="0" />
        </div>
        <button type="submit" class="btn">{{ isEditing ? 'Guardar Cambios' : 'Crear Servicio' }}</button>
      </form>
    </div>

    <div v-if="coachServices.length === 0" class="empty">
      No tienes servicios creados. Empieza ofreciendo tu primera clase.
    </div>

    <div class="services-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
      <div v-for="service in coachServices" :key="service.id" class="service-card" style="background: white; padding: 20px; border-radius: 16px; border: 1px solid #F0E7E1; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="service-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <h4 style="margin: 0; font-size: 1.1rem; color: #3D405B;">{{ service.name }}</h4>
            <span class="service-price" style="background: #F4F1DE; color: #3D405B; font-weight: 800; padding: 4px 8px; border-radius: 8px; font-size: 0.9rem;">${{ service.price }}</span>
          </div>
          <p style="color: #5c5f73; font-size: 0.9rem; margin-bottom: 16px; line-height: 1.4;">{{ service.description }}</p>
        </div>
        <div class="service-actions" style="display: flex; gap: 8px; justify-content: flex-end;">
          <button class="btn" style="background: #F4A261 !important; color: white !important; border: none; padding: 6px 12px; font-size: 0.85rem; border-radius: 8px; cursor: pointer; font-weight: 600;" @click="startEdit(service)">Editar</button>
          <button class="btn" style="background: #E07A5F !important; color: white !important; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.85rem;" @click="handleDelete(service.id)">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useCoach } from '../composables/useCoach'

const { coachServices, createService, updateService, deleteService, loadData } = useCoach()
const showForm = ref(false)
const isEditing = ref(false)
const editingServiceId = ref(null)

const formService = reactive({
  name: '',
  description: '',
  price: 0
})

onMounted(() => {
  loadData()
})

const toggleForm = () => {
  if (showForm.value) {
    resetForm()
  } else {
    showForm.value = true
    isEditing.value = false
  }
}

const startEdit = (service) => {
  isEditing.value = true
  editingServiceId.value = service.id
  Object.assign(formService, {
    name: service.name,
    description: service.description,
    price: service.price
  })
  showForm.value = true
}

const resetForm = () => {
  showForm.value = false
  isEditing.value = false
  editingServiceId.value = null
  formService.name = ''
  formService.description = ''
  formService.price = 0
}

const handleSave = async () => {
  let ok = false
  if (isEditing.value) {
    ok = await updateService(editingServiceId.value, { ...formService })
  } else {
    ok = await createService({ ...formService })
  }
  if (ok) {
    resetForm()
  }
}

const handleDelete = async (id) => {
  if (confirm('¿Seguro que deseas eliminar este servicio?')) {
    await deleteService(id)
  }
}
</script>
