import { ref } from 'vue'
import api from '../services/api'
import { useAuth } from './useAuth'

// Global state so it's shared across components
const coachProfile = ref(null)
const coachServices = ref([])
const bookings = ref([])
const clients = ref([])
const payments = ref([])

const stats = ref({
  totalServices: 0,
  activeBookings: 0,
  totalClients: 0
})

let loadingPromise = null
let lastFetchTime = 0
const CACHE_DURATION = 3000 // 3 seconds cache

export function useCoach() {
  const { currentUser } = useAuth()

  const loadData = async (force = false) => {
    try {
      if (!currentUser.value || !currentUser.value.username) return;

      const now = Date.now()
      if (!force && lastFetchTime && (now - lastFetchTime < CACHE_DURATION)) {
        return; // Skip loading if cached and not forced
      }

      if (loadingPromise) {
        return loadingPromise;
      }

      loadingPromise = (async () => {
        try {
          // 1. Get user profile
          let userId = currentUser.value.id
          if (!userId) {
            const usersRes = await api.get('/user-profiles')
            const profile = usersRes.data.find(u => u.email === currentUser.value.username || u.name === currentUser.value.username)
            if (profile) {
              userId = profile.userId
              currentUser.value.id = userId // Cache userId in currentUser
            }
          }
          
          if (!userId) return

          // 2. Get coach entity
          let coach = coachProfile.value
          if (!coach || force) {
            const coachesRes = await api.get('/coaches')
            coach = coachesRes.data.find(c => 
              c.name === currentUser.value.username || 
              c.email === currentUser.value.username ||
              (c.email && c.email.split('@')[0] === currentUser.value.username)
            )
            
            if (!coach && coachesRes.data.length > 0) {
              // Fallback to first coach for testing if none matches
              coach = coachesRes.data[coachesRes.data.length - 1]
            }
            if (coach) {
              coachProfile.value = coach
            }
          }
          
          if (coach) {
            // Load services
            const servRes = await api.get(`/coaches/${coach.id}/services`)
            coachServices.value = servRes.data || []
            
            // Load reviews
            let coachReviews = []
            try {
              const revRes = await api.get(`/reviews/coach/${coach.id}`)
              coachReviews = revRes.data || []
            } catch(e) {
              console.error('Error fetching coach reviews', e)
            }

            // Load bookings
            try {
              const bookRes = await api.get(`/bookings/coach/${coach.id}`)
              const rawBookings = bookRes.data || []
              
              // Fetch all user profiles to map client details
              let usersMap = {}
              try {
                const usersRes = await api.get('/user-profiles')
                usersRes.data.forEach(u => {
                  usersMap[u.id] = u
                })
              } catch(e) { console.error('Could not fetch profiles for details') }
              
              bookings.value = rawBookings.map(b => {
                 const actualSchedule = b.schedule || b.startTime || b.date
                 const clientProfileId = b.user?.id || b.userProfileId
                 const userProfile = usersMap[clientProfileId] || {}
                 return {
                     ...b,
                     userProfileId: clientProfileId,
                     schedule: actualSchedule,
                     clientName: userProfile.name || b.user?.name || `Cliente #${clientProfileId || '?'}`,
                     clientPhone: userProfile.phone || 'Sin teléfono',
                     clientEmail: userProfile.email || 'Sin email',
                     clientPhoto: userProfile.profileImageUrl || '',
                     sportReserved: b.coachService?.name || 'Alquiler / Cancha'
                 }
              })
              
              // Extract unique clients
              const uniqueClients = {}
              bookings.value.forEach(b => {
                const userId = b.userProfileId
                if (!userId) return

                const review = coachReviews.find(r => r.userProfileId === userId)

                if (!uniqueClients[userId]) {
                  uniqueClients[userId] = {
                    id: userId,
                    name: b.clientName,
                    phone: b.clientPhone,
                    email: b.clientEmail,
                    photo: b.clientPhoto,
                    sportReserved: b.sportReserved,
                    bookingsCount: 1,
                    lastBooking: b.startTime || b.schedule,
                    pendingBookings: b.status === 'PENDING' ? [b] : [],
                    bookings: [b],
                    review: review || null
                  }
                } else {
                  uniqueClients[userId].bookingsCount++
                  uniqueClients[userId].bookings.push(b)
                  if (b.status === 'PENDING') {
                    uniqueClients[userId].pendingBookings.push(b)
                  }
                  // Update lastBooking if newer
                  const currentLast = new Date(uniqueClients[userId].lastBooking)
                  const newTime = new Date(b.startTime || b.schedule)
                  if (newTime > currentLast) {
                    uniqueClients[userId].lastBooking = b.startTime || b.schedule
                  }
                }
              })
              clients.value = Object.values(uniqueClients)
            } catch(e) {
              bookings.value = []
              clients.value = []
            }
            
            // Load payments from API
            try {
              const payRes = await api.get(`/payments/coach/${coach.id}`)
              payments.value = payRes.data || []
            } catch(e) {
              console.error('Error fetching coach payments', e)
              payments.value = []
            }
            
            stats.value = {
              totalServices: coachServices.value.length,
              activeBookings: bookings.value.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED').length,
              totalClients: clients.value.length,
              totalIncome: payments.value.reduce((acc, p) => acc + (p.amount || 0), 0)
            }
          }
          lastFetchTime = Date.now()
        } catch (innerError) {
          console.error('Error inside loading promise', innerError)
        }
      })();

      await loadingPromise
    } catch (e) {
      console.error('Error loading coach data', e)
    } finally {
      loadingPromise = null
    }
  }

  const createService = async (serviceData) => {
    if (!coachProfile.value) return false
    try {
      await api.post(`/coaches/${coachProfile.value.id}/services`, serviceData)
      await loadData(true)
      return true
    } catch (e) {
      console.error('Error al crear servicio', e)
      return false
    }
  }

  const updateService = async (serviceId, serviceData) => {
    try {
      await api.put(`/coaches/services/${serviceId}`, serviceData)
      await loadData(true)
      return true
    } catch (e) {
      console.error('Error updating service', e)
      return false
    }
  }

  const deleteService = async (serviceId) => {
    try {
      await api.delete(`/coaches/services/${serviceId}`)
      await loadData(true)
      return true
    } catch (e) {
      console.error('Error deleting service', e)
      return false
    }
  }

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status })
      await loadData(true)
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
    payments,
    stats,
    loadData,
    createService,
    updateService,
    deleteService,
    updateBookingStatus
  }
}
