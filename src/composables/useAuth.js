import { ref, computed } from 'vue'
import api from '../services/api'
import { useRouter } from 'vue-router'

const token = ref(localStorage.getItem('coachToken'))
const currentUser = ref({ username: localStorage.getItem('coachUsername') })

export function useAuth() {
  const router = useRouter()
  
  const isAuthenticated = computed(() => !!token.value)

  const login = async (username, password) => {
    try {
      const res = await api.post('/authentication/sign-in', { username, password })
      if (res && res.data && res.data.token) {
        token.value = res.data.token
        localStorage.setItem('coachToken', token.value)
        localStorage.setItem('coachUsername', username)
        currentUser.value = { id: res.data.id, username }
        // API interceptor will automatically use the new token
        return true
      }
      return false
    } catch (e) {
      throw new Error('Credenciales incorrectas')
    }
  }

  const register = async (userData) => {
    try {
      await api.post('/authentication/sign-up', {
        username: userData.username,
        password: userData.password,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        roles: ['ROLE_COACH']
      })
      
      // Auto login in background to create profile and coach
      const loginRes = await api.post('/authentication/sign-in', {
        username: userData.username,
        password: userData.password
      })
      
      if (loginRes && loginRes.data && loginRes.data.token) {
        const tempToken = loginRes.data.token
        const tempId = loginRes.data.id
        
        // Create empty user profile
        try {
          await api.post('/user-profiles', {
            userId: tempId,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            address: '',
            favoriteSports: ''
          }, { headers: { Authorization: `Bearer ${tempToken}` } })
        } catch(e) {}

        // Create coach entry
        try {
          await api.post('/coaches', {
            name: userData.name,
            expertise: 'Deporte',
            phone: userData.phone,
            email: userData.email,
            sportType: 'General',
            pricePerHour: 50,
            location: '',
            description: 'Nuevo coach',
            experienceYears: 0
          }, { headers: { Authorization: `Bearer ${tempToken}` } })
        } catch(e) {}
      }
      return true
    } catch (e) {
      throw new Error('Error al registrar cuenta')
    }
  }

  const logout = () => {
    token.value = null
    currentUser.value = null
    localStorage.removeItem('coachToken')
    localStorage.removeItem('coachUsername')
    if (router) {
      router.push('/login')
    }
  }

  return {
    token,
    currentUser,
    isAuthenticated,
    login,
    register,
    logout
  }
}
