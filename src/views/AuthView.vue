<template>
  <div class="login-card card">
    <h2>{{ isRegister ? 'Registro de Entrenador' : 'Acceso Entrenadores' }}</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Usuario</label>
        <input v-model="form.username" type="text" required />
      </div>
      
      <div v-if="isRegister" class="form-group">
        <label>Nombre Completo</label>
        <input v-model="form.name" type="text" required />
      </div>
      <div v-if="isRegister" class="form-group">
        <label>Email</label>
        <input v-model="form.email" type="email" required />
      </div>
      <div v-if="isRegister" class="form-group">
        <label>Teléfono</label>
        <input v-model="form.phone" type="text" required />
      </div>

      <div class="form-group">
        <label>Contraseña</label>
        <input v-model="form.password" type="password" required />
      </div>
      
      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      <p v-if="successMsg" class="success">{{ successMsg }}</p>
      
      <button type="submit" class="btn" style="width:100%">
        {{ isRegister ? 'Crear Cuenta' : 'Entrar' }}
      </button>
      
      <div style="margin-top: 20px;">
        <button type="button" class="btn-secondary btn-small" @click="toggleRegister">
          {{ isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿Nuevo entrenador? Regístrate aquí' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const { login, register } = useAuth()
const router = useRouter()

const isRegister = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const form = reactive({
  username: '',
  password: '',
  name: '',
  email: '',
  phone: ''
})

const toggleRegister = () => {
  isRegister.value = !isRegister.value
  errorMsg.value = ''
  successMsg.value = ''
}

const handleSubmit = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  
  try {
    if (isRegister.value) {
      await register(form)
      successMsg.value = 'Cuenta creada exitosamente. Por favor, inicia sesión.'
      isRegister.value = false
      form.password = ''
    } else {
      const ok = await login(form.username, form.password)
      if (ok) {
        router.push('/dashboard')
      } else {
        errorMsg.value = 'Error al iniciar sesión'
      }
    }
  } catch (e) {
    errorMsg.value = e.message || 'Ha ocurrido un error'
  }
}
</script>
