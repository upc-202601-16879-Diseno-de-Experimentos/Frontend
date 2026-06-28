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
      
      <div class="google-separator">
        <span>O</span>
      </div>

      <!-- Contenedor del botón oficial de Google -->
      <div class="google-btn-wrapper" style="display: flex; justify-content: center; margin-top: 15px; width: 100%;">
        <div id="google-btn-container" style="width: 100%;"></div>
      </div>
      
      <!-- Enlace para simulación local de desarrollo -->
      <div style="margin-top: 8px; text-align: center;">
        <button type="button" @click="handleMockGoogleLogin" style="font-size: 13px; color: #82859C; background: none; border: none; text-decoration: underline; cursor: pointer; font-weight: 600;">
          ¿Probar en local? Simular Google Login
        </button>
      </div>

      <div style="margin-top: 20px;">
        <button type="button" class="btn-secondary btn-small" @click="toggleRegister">
          {{ isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿Nuevo entrenador? Regístrate aquí' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const { login, register, loginWithGoogle } = useAuth()
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

// Load Google Identity Services SDK on mount
onMounted(async () => {
  const loaded = await new Promise((resolve) => {
    if (window.google) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })

  if (loaded && window.google) {
    initGoogleButton()
  }
})

const initGoogleButton = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id'
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: handleCredentialResponse
  })
  window.google.accounts.id.renderButton(
    document.getElementById('google-btn-container'),
    { theme: 'outline', size: 'large', width: 336 }
  )
}

const handleCredentialResponse = async (response) => {
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const ok = await loginWithGoogle(response.credential, 'ROLE_INSTRUCTOR')
    if (ok) {
      router.push('/dashboard')
    } else {
      errorMsg.value = 'Error al iniciar sesión con Google'
    }
  } catch (e) {
    errorMsg.value = e.message || 'Error al validar token de Google'
  }
}

const handleMockGoogleLogin = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  
  const devEmail = prompt("Ingresa tu correo de Google para simular el inicio de sesión (OAuth 2.0 Mock):")
  if (devEmail) {
    if (!devEmail.includes('@')) {
      errorMsg.value = 'Correo electrónico inválido'
      return
    }
    try {
      const mockToken = `mock-token-${devEmail}`
      const ok = await loginWithGoogle(mockToken, 'ROLE_INSTRUCTOR')
      if (ok) {
        router.push('/dashboard')
      } else {
        errorMsg.value = 'Error al iniciar sesión con Google Mock'
      }
    } catch (e) {
      errorMsg.value = e.message || 'Error al iniciar sesión con Google Mock'
    }
  }
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

<style scoped>
.google-separator {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 15px 0;
  color: #82859C;
  font-size: 0.85rem;
  font-weight: 600;
}

.google-separator::before,
.google-separator::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #F0E7E1;
}

.google-separator:not(:empty)::before {
  margin-right: .5em;
}

.google-separator:not(:empty)::after {
  margin-left: .5em;
}

.google-btn {
  background: white;
  color: #3C4043;
  border: 1px solid #DADCE0;
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  margin-top: 15px;
  transition: all 0.25s ease;
}

.google-btn:hover {
  background: #F8F9FA;
  border-color: #BEC1C6;
  box-shadow: 0 1px 3px rgba(60,64,67,0.3), 0 1px 2px rgba(60,64,67,0.15);
}

.google-logo {
  width: 20px;
  height: 20px;
}
</style>

