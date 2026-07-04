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

      <!-- Botón de Google por redirect (sin popup, sin COOP) -->
      <div class="google-btn-wrapper" style="display: flex; justify-content: center; margin-top: 15px; width: 100%;">
        <button type="button" class="google-btn" @click="handleGoogleRedirect">
          <svg class="google-logo" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continuar con Google
        </button>
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

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id'

// Handle Google redirect callback on mount
onMounted(async () => {
  const hash = window.location.hash
  if (hash.includes('id_token=')) {
    const idToken = hash.split('id_token=')[1].split('&')[0]
    window.location.hash = ''
    window.history.replaceState(null, '', window.location.pathname)
    try {
      const ok = await loginWithGoogle(idToken, 'ROLE_USER')
      if (ok) {
        router.push('/dashboard')
      } else {
        errorMsg.value = 'Error al iniciar sesión con Google'
      }
    } catch (e) {
      errorMsg.value = e.message || 'Error al validar token de Google'
    }
  }
})

const handleGoogleRedirect = () => {
  const redirectUri = window.location.origin + '/login'
  const nonce = Math.random().toString(36).substring(2)
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=id_token&scope=openid%20email%20profile&nonce=${nonce}&prompt=select_account`
  window.location.href = url
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

