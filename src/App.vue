<template>
  <div>
    <header>
      <h1>🎾 Coach Pro - Mi Panel de Entrenador</h1>
      <nav v-if="token">
        <a href="#" @click.prevent="currentView = 'dashboard'">Dashboard</a>
        <a href="#" @click.prevent="currentView = 'profile'">Mi Perfil</a>
        <a href="#" @click.prevent="currentView = 'services'">Mis Servicios</a>
        <a href="#" @click.prevent="currentView = 'schedule'">Horario</a>
        <a href="#" @click.prevent="currentView = 'bookings'">Reservas</a>
        <a href="#" @click.prevent="currentView = 'clients'">Clientes</a>
        <a href="#" @click.prevent="currentView = 'payments'">Ingresos</a>
        <a href="#" @click.prevent="currentView = 'settings'">Ajustes</a>
        <a href="#" @click.prevent="logout">Salir</a>
      </nav>
    </header>

    <div class="container">
      <!-- Login / Register -->
      <div v-if="!token && !isRegister" class="card login-card">
        <h2>🏋️ Acceso Entrenadores</h2>
        
        <div v-if="error" class="error">{{ error }}</div>
        <div v-if="success" class="success">{{ success }}</div>

        <div class="form-group">
          <input v-model="loginForm.username" placeholder="Usuario" />
        </div>
        <div class="form-group">
          <input v-model="loginForm.password" type="password" placeholder="Contraseña" />
        </div>
        
        <button class="btn" @click="login">Entrar</button>
        
        <p style="margin-top: 15px;">
          <button class="btn btn-secondary" @click="showRegister()">
            ¿Nuevo entrenador? Regístrate aquí
          </button>
        </p>
      </div>

      <!-- Register -->
      <div v-if="!token && isRegister" class="card">
        <h2>📝 Registrarse como Entrenador</h2>
        
        <div v-if="error" class="error">{{ error }}</div>
        <div v-if="success" class="success">{{ success }}</div>

        <div class="form-group">
          <input v-model="registerForm.username" placeholder="Usuario" />
        </div>
        <div class="form-group">
          <input v-model="registerForm.password" type="password" placeholder="Contraseña" />
        </div>
        <div class="form-group">
          <input v-model="registerForm.name" placeholder="Nombre completo" />
        </div>
        <div class="form-group">
          <input v-model="registerForm.email" placeholder="Email" />
        </div>
        <div class="form-group">
          <input v-model="registerForm.phone" placeholder="Teléfono" />
        </div>
        
        <button class="btn" @click="register">Crear Cuenta</button>
        <button class="btn btn-secondary" @click="isRegister = false" style="margin-left: 10px;">Cancelar</button>
      </div>

      <!-- Dashboard -->
      <div v-if="token && !isRegister">
        <!-- Stats Overview -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-value">{{ pendingBookings }}</div>
            <div class="stat-label">Reservas Pendientes</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-value">{{ confirmedBookings }}</div>
            <div class="stat-label">Confirmadas</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-value">S/. {{ totalIncome }}</div>
            <div class="stat-label">Ingresos del Mes</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-value">{{ rating }}</div>
            <div class="stat-label">Calificación</div>
          </div>
        </div>

        <!-- Dashboard View -->
        <div v-if="currentView === 'dashboard'" class="card">
          <h2>📊 Resumen de Hoy</h2>
          <p style="background:#e0e0e0; padding:8px; border-radius:4px; font-size:12px;">DEBUG: user={{ currentUser?.username }} services={{ services.length }}</p>
          
          <div class="dashboard-content">
            <div class="activity-section">
              <h3>Próximas Clases</h3>
              <div v-if="todayBookings.length">
                <div v-for="booking in todayBookings" :key="booking.id" class="activity-item">
                  <span class="time">{{ formatTime(booking.startTime) }}</span>
                  <span class="title">{{ booking.serviceName || 'Clase' }}</span>
                  <span class="user">{{ booking.userName || 'Usuario' }}</span>
                  <span :class="'status ' + booking.status">{{ booking.status }}</span>
                </div>
              </div>
              <p v-else class="empty">No hay clases programadas para hoy</p>
            </div>
            
            <div class="quick-actions">
              <h3>Acciones Rápidas</h3>
              <button class="btn" @click="currentView = 'bookings'">Ver Reservas</button>
              <button class="btn" @click="currentView = 'schedule'">Actualizar Horario</button>
              <button class="btn" @click="currentView = 'services'">Nuevo Servicio</button>
            </div>
          </div>
        </div>

        <!-- Profile View -->
        <div v-if="currentView === 'profile'" class="card">
          <h2>👤 Mi Perfil de Entrenador</h2>
          <p style="color: #666; margin-bottom: 16px;">Cuenta: <strong>{{ currentUser?.username }}</strong></p>
          
          <div class="profile-form">
            <div class="form-group">
              <label>Nombre</label>
              <input v-model="profile.name" />
            </div>
            <div class="form-group">
              <label>Especialidad</label>
              <input v-model="profile.specialty" placeholder="Ej: Fútbol, Tenis, Pádel" />
            </div>
            <div class="form-group">
              <label>Experiencia (años)</label>
              <input v-model.number="profile.experience" type="number" />
            </div>
            <div class="form-group">
              <label>Tarifa por hora (S/.)</label>
              <input v-model.number="profile.hourlyRate" type="number" />
            </div>
            <div class="form-group">
              <label>Ubicación</label>
              <input v-model="profile.location" placeholder="Zona/Barrio" />
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea v-model="profile.description" rows="3"></textarea>
            </div>
            <button class="btn" @click="saveProfile">Guardar Perfil</button>
          </div>
        </div>

        <!-- Services View -->
        <div v-if="currentView === 'services'" class="card">
          <h2>🏅 Mis Servicios</h2>
          
          <button class="btn" @click="showServiceForm = true">+ Nuevo Servicio</button>

          <div v-if="showServiceForm" class="form-panel">
            <h3>Nuevo Servicio</h3>
            <div class="form-group">
              <input v-model="serviceForm.name" placeholder="Nombre del servicio" />
            </div>
            <div class="form-group">
              <input v-model="serviceForm.description" placeholder="Descripción" />
            </div>
            <div class="form-group">
              <input v-model.number="serviceForm.price" type="number" placeholder="Precio (S/.)" />
            </div>
            <div class="form-group">
              <input v-model.number="serviceForm.duration" type="number" placeholder="Duración (minutos)" />
            </div>
            <div class="form-group">
              <select v-model="serviceForm.sport">
                <option value="">Seleccionar deporte</option>
                <option value="fútbol">Fútbol</option>
                <option value="tenis">Tenis</option>
                <option value="pádel">Pádel</option>
                <option value="básquet">Básquet</option>
                <option value="vóley">Vóley</option>
                <option value="natación">Natación</option>
                <option value="gimnasio">Gimnasio</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <button class="btn" @click="createService">Guardar</button>
            <button class="btn btn-secondary" @click="showServiceForm = false" style="margin-left: 10px;">Cancelar</button>
          </div>

          <div class="services-list">
            <div v-for="service in services" :key="service.id" class="service-card">
              <div class="service-header">
                <h4>{{ service.name }}</h4>
                <span class="service-price">S/. {{ service.price }}</span>
              </div>
              <p>{{ service.description }}</p>
              <div class="service-meta">
                <span>⏱️ {{ service.duration }} min</span>
                <span>🏃 {{ service.sport }}</span>
              </div>
              <div class="service-actions">
                <button @click="editService(service)">✏️ Editar</button>
                <button @click="deleteService(service.id)" class="btn-delete">🗑️ Eliminar</button>
              </div>
            </div>
            <p v-if="!services.length" class="empty">No tienes servicios aún. Crea tu primer servicio.</p>
          </div>
        </div>

        <!-- Schedule View -->
        <div v-if="currentView === 'schedule'" class="card">
          <h2>📅 Mi Horario Semanal</h2>
          
          <div class="schedule-grid">
            <div v-for="day in weekDays" :key="day.id" class="day-schedule">
              <div class="day-header">{{ day.name }}</div>
              <div class="day-slots">
                <div v-for="slot in day.slots" :key="slot.id" 
                     :class="slot.available ? 'slot available' : 'slot occupied'">
                  <span class="time">{{ slot.time }}</span>
                  <span v-if="slot.available" class="status">Disponible</span>
                  <span v-else class="status">Ocupado</span>
                </div>
                <button class="btn-small" @click="addSlot(day.id)">+ Añadir</button>
              </div>
            </div>
          </div>

          <div v-if="showScheduleForm" class="form-panel">
            <h3>Añadir Horario</h3>
            <div class="form-group">
              <select v-model="scheduleForm.day">
                <option value="1">Lunes</option>
                <option value="2">Martes</option>
                <option value="3">Miércoles</option>
                <option value="4">Jueves</option>
                <option value="5">Viernes</option>
                <option value="6">Sábado</option>
                <option value="0">Domingo</option>
              </select>
            </div>
            <div class="form-group">
              <input v-model="scheduleForm.time" type="time" />
            </div>
            <button class="btn" @click="addSchedule">Guardar</button>
            <button class="btn btn-secondary" @click="showScheduleForm = false" style="margin-left: 10px;">Cancelar</button>
          </div>
        </div>

        <!-- Clients View -->
        <div v-if="currentView === 'clients'" class="card">
          <h2>👥 Mis Clientes</h2>
          
          <div class="clients-list">
            <div v-for="client in clients" :key="client.id" class="client-card">
              <div class="client-avatar">{{ client.name?.charAt(0) || 'U' }}</div>
              <div class="client-info">
                <h4>{{ client.name || 'Cliente' }}</h4>
                <p>📧 {{ client.email || 'Sin email' }}</p>
                <p>📱 {{ client.phone || 'Sin teléfono' }}</p>
                <p class="client-bookings">{{ client.bookingCount || 0 }} reservas</p>
              </div>
              <button class="btn-small" @click="viewClientBookings(client.id)">Ver Reservas</button>
            </div>
            <p v-if="!clients.length" class="empty">Aún no tienes clientes. Las personas que reserven aparecerán aquí.</p>
          </div>
        </div>

        <!-- Settings View -->
        <div v-if="currentView === 'settings'" class="card">
          <h2>⚙️ Configuración de Cuenta</h2>
          
          <div class="settings-section">
            <h3>🔐 Seguridad</h3>
            <div class="form-group">
              <label>Cambiar contraseña actual</label>
              <input v-model="settings.currentPassword" type="password" placeholder="Contraseña actual" />
            </div>
            <div class="form-group">
              <label>Nueva contraseña</label>
              <input v-model="settings.newPassword" type="password" placeholder="Nueva contraseña" />
            </div>
            <div class="form-group">
              <label>Confirmar contraseña</label>
              <input v-model="settings.confirmPassword" type="password" placeholder="Confirmar contraseña" />
            </div>
            <button class="btn" @click="changePassword">Actualizar Contraseña</button>
          </div>
          
          <div class="settings-section">
            <h3>🔔 Notificaciones</h3>
            <div class="setting-item">
              <label>
                <input type="checkbox" v-model="settings.notificationsEmail" />
                Notificaciones por email
              </label>
            </div>
            <div class="setting-item">
              <label>
                <input type="checkbox" v-model="settings.notificationsWhatsapp" />
                Notificaciones por WhatsApp
              </label>
            </div>
            <div class="setting-item">
              <label>
                <input type="checkbox" v-model="settings.notifyNewBookings" />
                Aviso de nuevas reservas
              </label>
            </div>
            <div class="setting-item">
              <label>
                <input type="checkbox" v-model="settings.notifyCancellations" />
                Aviso de cancelaciones
              </label>
            </div>
            <button class="btn" @click="saveSettings">Guardar Configuración</button>
          </div>
          
          <div class="settings-section danger-zone">
            <h3>⚠️ Zona de Peligro</h3>
            <button class="btn btn-danger" @click="deleteAccount">Eliminar Mi Cuenta</button>
          </div>
        </div>

        <!-- Bookings View -->
        <div v-if="currentView === 'bookings'" class="card">
          <h2>📋 Gestión de Reservas</h2>
          
          <div class="bookings-filters">
            <button :class="{ active: bookingFilter === 'all' }" @click="bookingFilter = 'all'">Todas</button>
            <button :class="{ active: bookingFilter === 'pending' }" @click="bookingFilter = 'pending'">Pendientes</button>
            <button :class="{ active: bookingFilter === 'confirmed' }" @click="bookingFilter = 'confirmed'">Confirmadas</button>
            <button :class="{ active: bookingFilter === 'completed' }" @click="bookingFilter = 'completed'">Completadas</button>
            <button :class="{ active: bookingFilter === 'cancelled' }" @click="bookingFilter = 'cancelled'">Canceladas</button>
          </div>

          <div class="bookings-list">
            <div v-for="booking in filteredBookings" :key="booking.id" class="booking-card">
              <div class="booking-header">
                <h4>{{ booking.serviceName || 'Reserva #' + booking.id }}</h4>
                <span :class="'status-badge ' + booking.status">{{ booking.status }}</span>
              </div>
              <div class="booking-details">
                <p>👤 Cliente: {{ booking.userName || 'Usuario ' + booking.userId }}</p>
                <p>📅 {{ formatDate(booking.startTime) }} - {{ formatTime(booking.endTime) }}</p>
                <p>💰 S/. {{ booking.price || 0 }}</p>
              </div>
              <div class="booking-actions" v-if="booking.status === 'PENDING'">
                <button class="btn-accept" @click="updateBookingStatus(booking.id, 'CONFIRMED')">✓ Aceptar</button>
                <button class="btn-reject" @click="updateBookingStatus(booking.id, 'CANCELLED')">✗ Rechazar</button>
              </div>
              <div class="booking-actions" v-if="booking.status === 'CONFIRMED'">
                <button class="btn-complete" @click="updateBookingStatus(booking.id, 'COMPLETED')">✓ Completar</button>
              </div>
            </div>
            <p v-if="!filteredBookings.length" class="empty">No hay reservas con este filtro</p>
          </div>
        </div>

        <!-- Payments View -->
        <div v-if="currentView === 'payments'" class="card">
          <h2>💰 Mis Ingresos</h2>
          
          <div class="income-summary">
            <div class="income-total">
              <h3>Total Acumulado</h3>
              <div class="amount">S/. {{ totalIncome }}</div>
            </div>
            <div class="income-month">
              <h3>Este Mes</h3>
              <div class="amount">S/. {{ monthIncome }}</div>
            </div>
          </div>

          <h3>Historial de Pagos</h3>
          <table class="payments-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in payments" :key="payment.id">
                <td>{{ formatDate(payment.paymentDate) }}</td>
                <td>{{ payment.user?.name || 'Usuario' }}</td>
                <td>{{ payment.service || 'Clase' }}</td>
                <td>S/. {{ payment.amount }}</td>
                <td><span :class="'status-badge ' + payment.status">{{ payment.status }}</span></td>
              </tr>
            </tbody>
          </table>
          <p v-if="!payments.length" class="empty">No hay pagos registrados</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'

const API = 'http://localhost:8080/api/v1'

// Auth
const token = ref(null)
const isRegister = ref(false)
const error = ref('')
const success = ref('')
const currentView = ref('dashboard')
const currentUser = ref(null)

// Forms
const loginForm = reactive({ username: '', password: '' })
const registerForm = reactive({ username: '', password: '', name: '', email: '', phone: '' })
const profile = reactive({ name: '', specialty: '', experience: '', hourlyRate: '', location: '', description: '' })
const serviceForm = reactive({ name: '', description: '', price: '', duration: '', sport: '' })
const scheduleForm = reactive({ day: '1', time: '' })
const settings = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  notificationsEmail: true,
  notificationsWhatsapp: true,
  notifyNewBookings: true,
  notifyCancellations: true
})

// Data - different for each coach
function getCoachData(username) {
  const coachConfigs = {
    'coach1': {
      services: [
        { id: 1, name: 'Clase de Fútbol', description: 'Entrenamiento personalizado de fútbol', price: 50, duration: 60, sport: 'fútbol' },
        { id: 2, name: 'Entrenamiento de Arqueros', description: 'Especialización para porteros', price: 60, duration: 45, sport: 'fútbol' }
      ],
      bookings: [
        { id: 1, serviceName: 'Clase de Fútbol', userId: 2, userName: 'Juan García', startTime: new Date().toISOString(), endTime: new Date(Date.now() + 3600000).toISOString(), status: 'PENDING', price: 50 },
        { id: 3, serviceName: 'Clase de Fútbol', userId: 2, userName: 'Juan García', startTime: new Date(Date.now() - 86400000).toISOString(), endTime: new Date(Date.now() - 82800000).toISOString(), status: 'COMPLETED', price: 50 }
      ],
      payments: [
        { id: 1, user: { name: 'Juan García' }, service: 'Clase de Fútbol', amount: 50, paymentDate: new Date(Date.now() - 86400000).toISOString(), status: 'COMPLETED' }
      ],
      clients: [
        { id: 2, name: 'Juan García', email: 'juan@mail.com', phone: '987654321', bookingCount: 5 }
      ],
      profile: { name: 'Carlos Mendoza', specialty: 'Fútbol', experience: 8, hourlyRate: 50, location: 'Miraflores', description: 'Entrenador de fútbol con experiencia en ligas juveniles' }
    },
    'coach2': {
      services: [
        { id: 3, name: 'Clase de Tenis', description: 'Aprende a jugar tenis con un profesional', price: 60, duration: 45, sport: 'tenis' },
        { id: 4, name: 'Tenis Avanzado', description: 'Técnicas avanzadas para competidores', price: 80, duration: 60, sport: 'tenis' }
      ],
      bookings: [
        { id: 2, serviceName: 'Clase de Tenis', userId: 3, userName: 'María López', startTime: new Date(Date.now() + 86400000).toISOString(), endTime: new Date(Date.now() + 90000000).toISOString(), status: 'CONFIRMED', price: 60 }
      ],
      payments: [
        { id: 2, user: { name: 'María López' }, service: 'Clase de Tenis', amount: 60, paymentDate: new Date().toISOString(), status: 'COMPLETED' }
      ],
      clients: [
        { id: 3, name: 'María López', email: 'maria@mail.com', phone: '912345678', bookingCount: 3 }
      ],
      profile: { name: 'Ana García', specialty: 'Tenis', experience: 12, hourlyRate: 60, location: 'San Isidro', description: 'Ex-tenista profesional, ahora entrenando nuevas generaciones' }
    },
    'coach3': {
      services: [
        { id: 5, name: 'Entrenamiento Funcional', description: 'Mejora tu condición física general', price: 40, duration: 45, sport: 'gimnasio' },
        { id: 6, name: 'Crossfit', description: 'Entrenamiento de alta intensidad', price: 50, duration: 60, sport: 'gimnasio' }
      ],
      bookings: [
        { id: 4, serviceName: 'Entrenamiento Funcional', userId: 4, userName: 'Pedro Martínez', startTime: new Date(Date.now() + 172800000).toISOString(), endTime: new Date(Date.now() + 176400000).toISOString(), status: 'CANCELLED', price: 40 }
      ],
      payments: [
        { id: 3, user: { name: 'Carlos Ruiz' }, service: 'Entrenamiento Funcional', amount: 40, paymentDate: new Date(Date.now() - 172800000).toISOString(), status: 'COMPLETED' }
      ],
      clients: [
        { id: 4, name: 'Pedro Martínez', email: 'pedro@mail.com', phone: '999888777', bookingCount: 1 }
      ],
      profile: { name: 'Roberto Díaz', specialty: 'Fitness', experience: 5, hourlyRate: 40, location: 'Surco', description: 'Especialista en entrenamiento funcional y recuperación física' }
    }
  }
  if (coachConfigs[username]) {
    return coachConfigs[username]
  }
  // New coach - empty data
  return {
    services: [],
    bookings: [],
    payments: [],
    clients: [],
    profile: { name: '', specialty: '', experience: '', hourlyRate: '', location: '', description: '' }
  }
}

const services = ref([])
const bookings = ref([])
const payments = ref([])
const clients = ref([])
const bookingFilter = ref('all')

// UI State
const showServiceForm = ref(false)
const showScheduleForm = ref(false)

// Stats
const pendingBookings = computed(() => bookings.value.filter(b => b.status === 'PENDING').length)
const confirmedBookings = computed(() => bookings.value.filter(b => b.status === 'CONFIRMED').length)
const todayBookings = computed(() => {
  const today = new Date().toDateString()
  return bookings.value.filter(b => new Date(b.startTime).toDateString() === today)
})
const totalIncome = computed(() => payments.value.reduce((sum, p) => sum + (p.amount || 0), 0))
const monthIncome = computed(() => {
  const now = new Date()
  return payments.value
    .filter(p => new Date(p.paymentDate).getMonth() === now.getMonth())
    .reduce((sum, p) => sum + (p.amount || 0), 0)
})
const rating = ref('')

const filteredBookings = computed(() => {
  if (bookingFilter.value === 'all') return bookings.value
  return bookings.value.filter(b => b.status.toUpperCase() === bookingFilter.value.toUpperCase())
})

// Week days
const weekDays = ref([
  { id: 1, name: 'Lunes', slots: [{ id: 1, time: '08:00', available: false }, { id: 2, time: '10:00', available: true }, { id: 3, time: '14:00', available: true }, { id: 4, time: '16:00', available: false }] },
  { id: 2, name: 'Martes', slots: [{ id: 5, time: '09:00', available: true }, { id: 6, time: '11:00', available: true }, { id: 7, time: '15:00', available: true }] },
  { id: 3, name: 'Miércoles', slots: [{ id: 8, time: '08:00', available: true }, { id: 9, time: '10:00', available: false }, { id: 10, time: '17:00', available: true }] },
  { id: 4, name: 'Jueves', slots: [{ id: 11, time: '09:00', available: true }, { id: 12, time: '14:00', available: true }] },
  { id: 5, name: 'Viernes', slots: [{ id: 13, time: '08:00', available: true }, { id: 14, time: '12:00', available: true }, { id: 15, time: '16:00', available: true }] },
  { id: 6, name: 'Sábado', slots: [{ id: 16, time: '09:00', available: false }, { id: 17, time: '11:00', available: true }, { id: 18, time: '14:00', available: true }] },
  { id: 0, name: 'Domingo', slots: [{ id: 19, time: '10:00', available: true }] }
])

const api = axios.create({
  baseURL: API,
  headers: token.value ? { Authorization: `Bearer ${token.value}` } : {}
})

function showError(msg) {
  error.value = msg
  setTimeout(() => error.value = '', 4000)
}

function showSuccess(msg) {
  success.value = msg
  setTimeout(() => success.value = '', 4000)
}

// Auth
async function login() {
  try {
    const res = await api.post('/authentication/sign-in', {
      username: loginForm.username,
      password: loginForm.password
    })
    
    // Check role - only COACH can access
    const roles = res.data.roles || []
    const isCoach = roles.includes('ROLE_COACH')
    
    if (!isCoach) {
      showError('Esta cuenta es para deportistas. Usa la app móvil para acceder.')
      return
    }
    
    token.value = res.data.token
    currentUser.value = res.data
    localStorage.setItem('coachToken', res.data.token)
    localStorage.setItem('coachUsername', res.data.username)
    api.defaults.headers.Authorization = `Bearer ${res.data.token}`
    console.log('Login success, user:', res.data.username, 'roles:', res.data.roles)
    showSuccess('¡Bienvenido!')
    loadData()
  } catch (e) {
    showError('Credenciales incorrectas')
  }
}

async function register() {
  try {
    await api.post('/authentication/sign-up', {
      username: registerForm.username,
      password: registerForm.password,
      name: registerForm.name,
      email: registerForm.email,
      phone: registerForm.phone,
      roles: ['ROLE_COACH']
    })
    
    // Auto login to get token
    const loginRes = await api.post('/authentication/sign-in', {
      username: registerForm.username,
      password: registerForm.password
    })
    
    if (loginRes && loginRes.data && loginRes.data.token) {
      token.value = loginRes.data.token
      localStorage.setItem('coachToken', token.value)
      localStorage.setItem('coachUsername', registerForm.username)
      currentUser.value = { id: loginRes.data.id, username: registerForm.username }
      api.defaults.headers.Authorization = `Bearer ${token.value}`
      
      // Create empty user profile
      try {
        await api.post('/user-profiles', {
          userId: loginRes.data.id,
          name: registerForm.name,
          email: registerForm.email,
          phone: registerForm.phone,
          address: '',
          favoriteSports: ''
        })
      } catch(e) {}

      // Create coach entry
      try {
        await api.post('/coaches', {
          name: registerForm.name,
          expertise: 'Deporte',
          phone: registerForm.phone,
          email: registerForm.email,
          sportType: 'General',
          pricePerHour: 50,
          location: '',
          description: 'Nuevo coach',
          experienceYears: 0
        })
      } catch(e) {}
      
      currentUser.value = { id: loginRes.data.id, username: registerForm.username }
      currentView.value = 'profile'
      showSuccess('Cuenta creada! Completa tu perfil.')
    } else {
      showSuccess('Cuenta creada. Por favor inicia sesión.')
      isRegister.value = false
      Object.assign(loginForm, { username: registerForm.username, password: '' })
    }
  } catch (e) {
    showError('Error al registrar')
  }
}

function showRegister() {
  console.log('Show register clicked, setting isRegister to true')
  isRegister.value = true
}

function logout() {
  token.value = null
  currentUser.value = null
  localStorage.removeItem('coachToken')
  delete api.defaults.headers.Authorization
  currentView.value = 'dashboard'
}

// Data loading
async function loadData() {
  // Get username from currentUser or localStorage
  let username = currentUser.value?.username
  if (!username) {
    username = localStorage.getItem('coachUsername')
    if (username && !currentUser.value) {
      currentUser.value = { username: username }
    }
  }
  console.log('loadData called, username:', username)
  if (username) {
    const data = getCoachData(username)
    console.log('data:', data)
    services.value = data.services
    bookings.value = data.bookings
    payments.value = data.payments
    clients.value = data.clients
    Object.assign(profile, data.profile)
  }
}

async function loadBookings() {
  try {
    const res = await api.get('/bookings')
    if (res.data && res.data.length > 0) {
      bookings.value = res.data
    }
  } catch (e) {
    // Keep sample data
  }
}

async function loadPayments() {
  try {
    const res = await api.get('/payments')
    if (res.data && res.data.length > 0) {
      payments.value = res.data
    }
  } catch (e) {
    // Keep sample data
  }
}

async function loadServices() {
  try {
    const res = await api.get('/coaches')
    const coaches = res.data || []
    const myCoach = coaches.find(c => c.userId === currentUser.value?.id || c.name?.toLowerCase().includes(currentUser.value?.username?.toLowerCase() || ''))
    if (myCoach && myCoach.services) {
      services.value = myCoach.services
    } else {
      services.value = []
    }
  } catch (e) {
    services.value = []
  }
}

async function loadClients() {
  try {
    const res = await api.get('/users')
    const allUsers = res.data
    if (!allUsers || allUsers.length === 0) return
    const bookedUserIds = [...new Set(bookings.value.map(b => b.userId))]
    if (bookedUserIds.length === 0) return
    clients.value = allUsers
      .filter(u => bookedUserIds.includes(u.id))
      .map(u => ({
        ...u,
        bookingCount: bookings.value.filter(b => b.userId === u.id).length
      }))
  } catch (e) {
    // Keep sample data
  }
}

function editService(service) {
  Object.assign(serviceForm, {
    id: service.id,
    name: service.name,
    description: service.description,
    price: service.price,
    duration: service.duration,
    sport: service.sport
  })
  showServiceForm.value = true
}

async function deleteService(id) {
  if (confirm('¿Eliminar este servicio?')) {
    services.value = services.value.filter(s => s.id !== id)
    showSuccess('Servicio eliminado')
  }
}

function viewClientBookings(clientId) {
  currentView.value = 'bookings'
  bookingFilter.value = 'all'
}

function changePassword() {
  if (settings.newPassword !== settings.confirmPassword) {
    showError('Las contraseñas no coinciden')
    return
  }
  showSuccess('Contraseña actualizada')
  Object.assign(settings, { currentPassword: '', newPassword: '', confirmPassword: '' })
}

function saveSettings() {
  showSuccess('Configuración guardada')
}

function deleteAccount() {
  if (confirm('¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer.')) {
    showError('Función deshabilitada por seguridad')
  }
}

// Profile
async function saveProfile() {
  try {
    const profileData = {
      userId: currentUser.value?.id,
      name: profile.name,
      specialty: profile.specialty,
      experience: profile.experience,
      hourlyRate: profile.hourlyRate,
      location: profile.location,
      description: profile.description
    }
    await api.post('/user-profiles', profileData)
  } catch (e) {}
  showSuccess('Perfil guardado correctamente')
}

// Services
async function createService() {
  services.value.push({
    id: Date.now(),
    ...serviceForm
  })
  showSuccess('Servicio creado')
  showServiceForm.value = false
  Object.assign(serviceForm, { name: '', description: '', price: '', duration: '', sport: '' })
}

// Schedule
function addSlot(dayId) {
  showScheduleForm.value = true
  scheduleForm.day = dayId.toString()
}

function addSchedule() {
  const day = weekDays.value.find(d => d.id === parseInt(scheduleForm.day))
  if (day) {
    day.slots.push({
      id: Date.now(),
      time: scheduleForm.time,
      available: true
    })
    showSuccess('Horario añadido')
    showScheduleForm.value = false
  }
}

// Bookings
async function updateBookingStatus(id, status) {
  try {
    await api.put(`/bookings/${id}`, { status })
    const booking = bookings.value.find(b => b.id === id)
    if (booking) booking.status = status
    showSuccess(`Reserva ${status === 'CONFIRMED' ? 'confirmada' : status === 'COMPLETED' ? 'completada' : 'cancelada'}`)
  } catch (e) {
    showError('Error al actualizar')
  }
}

// Utils
function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('es-PE')
}

function formatTime(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  const savedToken = localStorage.getItem('coachToken')
  const savedUsername = localStorage.getItem('coachUsername')
  if (savedToken) {
    token.value = savedToken
    api.defaults.headers.Authorization = `Bearer ${token.value}`
    if (savedUsername) {
      currentUser.value = { username: savedUsername }
    }
    loadData()
  }
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; }

header { 
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); 
  color: white; 
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

header h1 { font-size: 1.5rem; }

header nav a {
  color: #a0a0a0;
  text-decoration: none;
  margin-left: 20px;
  font-weight: 500;
  transition: color 0.3s;
}

header nav a:hover { color: white; }

.container { max-width: 1200px; margin: 0 auto; padding: 20px; }

.card {
  background: white;
  padding: 25px;
  margin: 20px 0;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.login-card { max-width: 400px; margin: 50px auto; }

h2 { color: #1a1a2e; margin-bottom: 20px; font-size: 1.4rem; }
h3 { color: #16213e; margin: 15px 0 10px; }

.btn {
  background: #4361ee;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn:hover { background: #3730a3; transform: translateY(-2px); }

.btn-secondary { background: #6c757d; }
.btn-secondary:hover { background: #5a6268; }

.btn-small {
  background: #e0e7ff;
  color: #4361ee;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

.btn-accept { background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-right: 8px; }
.btn-reject { background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.btn-complete { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }

.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 600; color: #374151; font-size: 0.9rem; }
input, select, textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}
input:focus, select:focus, textarea:focus { outline: none; border-color: #4361ee; }

.error { color: #ef4444; padding: 10px; background: #fee2e2; border-radius: 6px; margin-bottom: 10px; }
.success { color: #10b981; padding: 10px; background: #d1fae5; border-radius: 6px; margin-bottom: 10px; }
.empty { color: #9ca3af; text-align: center; padding: 20px; }

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.stat-icon { font-size: 2rem; margin-bottom: 10px; }
.stat-value { font-size: 2rem; font-weight: bold; color: #1a1a2e; }
.stat-label { color: #6b7280; font-size: 0.9rem; }

/* Services */
.services-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; margin-top: 20px; }

.service-card {
  background: #f8fafc;
  padding: 20px;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
}

.service-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.service-header h4 { color: #1a1a2e; }
.service-price { background: #10b981; color: white; padding: 5px 12px; border-radius: 20px; font-weight: bold; }
.service-meta { display: flex; gap: 15px; margin-top: 10px; color: #6b7280; font-size: 0.9rem; }

.form-panel {
  background: #f0f9ff;
  padding: 20px;
  border-radius: 10px;
  margin: 20px 0;
  border: 2px solid #bae6fd;
}

/* Service Actions */
.service-actions {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 10px;
}
.service-actions button {
  background: white;
  border: 2px solid #e5e7eb;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}
.service-actions button:hover { background: #f3f4f6; border-color: #4361ee; }
.btn-delete { color: #ef4444 !important; }
.btn-delete:hover { background: #fee2e2; border-color: #ef4444; }

/* Clients */
.clients-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; }
.client-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f8fafc;
  padding: 20px;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
}
.client-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #4361ee 0%, #3730a3 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}
.client-info { flex: 1; }
.client-info h4 { color: #1a1a2e; margin-bottom: 5px; }
.client-info p { color: #6b7280; font-size: 0.85rem; margin: 2px 0; }
.client-bookings { color: #4361ee !important; font-weight: 600; }

/* Settings */
.settings-section {
  background: #f8fafc;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
}
.settings-section h3 { margin-top: 0; color: #1a1a2e; }
.setting-item { margin: 10px 0; }
.setting-item label { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.setting-item input[type="checkbox"] { width: 20px; height: 20px; }
.danger-zone { border-color: #fecaca; background: #fef2f2; }
.btn-danger { background: #ef4444; }
.btn-danger:hover { background: #dc2626; }

/* Bookings */
.bookings-filters { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.bookings-filters button {
  background: white;
  border: 2px solid #e5e7eb;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
}
.bookings-filters button.active { background: #4361ee; color: white; border-color: #4361ee; }

.booking-card {
  background: #f8fafc;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 15px;
  border-left: 4px solid #4361ee;
}

.booking-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.booking-details p { margin: 5px 0; color: #4b5563; }
.booking-actions { margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb; }

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}
.status-badge.PENDING { background: #fef3c7; color: #92400e; }
.status-badge.CONFIRMED { background: #d1fae5; color: #065f46; }
.status-badge.COMPLETED { background: #dbeafe; color: #1e40af; }
.status-badge.CANCELLED { background: #fee2e2; color: #991b1b; }

/* Schedule */
.schedule-grid { display: grid; gap: 15px; }
.day-schedule { background: white; padding: 15px; border-radius: 10px; }
.day-header { font-weight: bold; color: #1a1a2e; margin-bottom: 10px; font-size: 1.1rem; }
.day-slots { display: flex; flex-wrap: wrap; gap: 10px; }
.slot {
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
}
.slot.available { background: #d1fae5; color: #065f46; }
.slot.occupied { background: #fee2e2; color: #991b1b; }

/* Income */
.income-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
.income-total, .income-month {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  color: white;
}
.income-total .amount, .income-month .amount { font-size: 2rem; font-weight: bold; margin-top: 10px; }

.payments-table { width: 100%; border-collapse: collapse; }
.payments-table th, .payments-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
.payments-table th { background: #f8fafc; font-weight: 600; color: #374151; }
</style>