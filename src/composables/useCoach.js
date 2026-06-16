import { ref } from 'vue'
import api from '../services/api'
import { useAuth } from './useAuth'

// Global state so it's shared across components
const coachProfile = ref(null)
const coachServices = ref([])
const bookings = ref([])
const clients = ref([])

const stats = ref({
  totalServices: 0,
  activeBookings: 0,
  totalClients: 0
})

export function useCoach() {
  const { currentUser } = useAuth()

  const loadData = async () => {
    try {
      if (!currentUser.value || !currentUser.value.username) return;

      // 1. Get user profile
      let userId = currentUser.value.id
      if (!userId) {
        const usersRes = await api.get('/user-profiles')
        const profile = usersRes.data.find(u => u.email === currentUser.value.username || u.name === currentUser.value.username)
        if (profile) userId = profile.userId
      }
      
      if (!userId) return

      // 2. Get coach entity
      const coachesRes = await api.get('/coaches')
      let coach = coachesRes.data.find(c => c.name === currentUser.value.username || c.email === currentUser.value.username)
      
      if (!coach && coachesRes.data.length > 0) {
        // Fallback to first coach for testing if none matches
        coach = coachesRes.data[coachesRes.data.length - 1]
      }
      
      if (coach) {
        coachProfile.value = coach
        
        // Load services
        const servRes = await api.get(`/coaches/${coach.id}/services`)
        coachServices.value = servRes.data || []
        
        // Load bookings
        try {
          const bookRes = await api.get(`/bookings/coach/${coach.id}`)
          bookings.value = bookRes.data || []
          
          // Extract unique clients
          const uniqueClients = {}
          bookings.value.forEach(b => {
            const userId = b.user?.id || b.userProfileId
            const userName = b.user?.name || `Cliente #${userId}`
            if (userId && !uniqueClients[userId]) {
              uniqueClients[userId] = {
                id: userId,
                name: userName,
                bookingsCount: 1,
                lastBooking: b.startTime || b.schedule,
                pendingBookings: b.status === 'PENDING' ? [b] : []
              }
            } else if (userId) {
              uniqueClients[userId].bookingsCount++
              if (b.status === 'PENDING') {
                uniqueClients[userId].pendingBookings.push(b)
              }
            }
          })
          clients.value = Object.values(uniqueClients)
        } catch(e) {
          bookings.value = []
          clients.value = []
        }
        
        stats.value = {
          totalServices: coachServices.value.length,
          activeBookings: bookings.value.filter(b => b.status === 'CONFIRMED' || !b.status).length, // Bookings no tienen status aun en backend
          totalClients: clients.value.length,
          totalIncome: bookings.value.reduce((acc, b) => acc + (b.amount || 0), 0)
        }
      }
    } catch (e) {
      console.error('Error loading coach data', e)
    }
  }

  const createService = async (serviceData) => {
    if (!coachProfile.value) return false
    try {
      await api.post(`/coaches/${coachProfile.value.id}/services`, serviceData)
      await loadData()
      return true
    } catch (e) {
      console.error('Error al crear servicio', e)
      return false
    }
  }

  const deleteService = async (serviceId) => {
    try {
      await api.delete(`/coaches/services/${serviceId}`)
      await loadData()
      return true
    } catch (e) {
      console.error('Error deleting service', e)
      return false
    }
  }

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await api.put(`/bookings/${bookingId}`, { status })
      await loadData()
      return true
    } catch (e) {
      console.error('Error updating booking status', e)
      return false
    }
  }

  return {
    coachProfile,
    coachServices,
    bookings,
    clients,
    stats,
    loadData,
    createService,
    deleteService,
    updateBookingStatus
  }
}
