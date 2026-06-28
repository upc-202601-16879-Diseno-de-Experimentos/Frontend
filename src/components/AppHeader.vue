<template>
  <header class="app-header">
    <div class="logo-section" @click="router.push('/dashboard')">
      <h1>🎾 MatchPoint</h1>
      <span class="badge">Coach</span>
    </div>
    <nav class="main-nav">
      <router-link to="/dashboard">Dashboard</router-link>
      <router-link to="/services">Servicios</router-link>
      <router-link to="/schedule">Horario</router-link>
      <router-link to="/bookings">Reservas</router-link>
      <router-link to="/clients">Clientes</router-link>
      <router-link to="/payments">Ingresos</router-link>
    </nav>
    <div class="profile-section">
      <div class="avatar-container" @click.stop="toggleDropdown">
        <img v-if="coachProfile?.imageUrl" :src="coachProfile.imageUrl" alt="Avatar" class="header-avatar" />
        <div v-else class="header-avatar-placeholder">
          {{ coachProfile?.name?.charAt(0).toUpperCase() || 'E' }}
        </div>
      </div>
      <transition name="fade">
        <div v-if="dropdownOpen" class="dropdown-menu">
          <div class="dropdown-header">
            <p class="user-name">{{ coachProfile?.name || 'Entrenador' }}</p>
            <p class="user-email">{{ coachProfile?.email || 'Sin correo' }}</p>
          </div>
          <hr class="divider" />
          <router-link to="/profile" @click="closeDropdown" class="dropdown-item">Mi Perfil</router-link>
          <router-link to="/settings" @click="closeDropdown" class="dropdown-item">Ajustes</router-link>
          <hr class="divider" />
          <a href="#" @click.prevent="handleLogout" class="dropdown-item logout-item">Cerrar Sesión</a>
        </div>
      </transition>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useCoach } from '../composables/useCoach'
import { useAuth } from '../composables/useAuth'

const { coachProfile } = useCoach()
const { logout } = useAuth()
const router = useRouter()

const dropdownOpen = ref(false)

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const handleLogout = () => {
  logout()
}

const handleClickOutside = (event) => {
  const el = document.querySelector('.profile-section')
  if (el && !el.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.app-header {
  background: #FFFFFF;
  color: #3D405B;
  padding: 12px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(224, 122, 95, 0.06);
  border-bottom: 1px solid #F0E7E1;
  position: relative;
  z-index: 100;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.logo-section h1 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #E07A5F;
  margin: 0;
}

.badge {
  background: #FFF1EB;
  color: #E07A5F;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  text-transform: uppercase;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.main-nav a {
  color: #82859C;
  text-decoration: none;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 12px;
  transition: all 0.25s ease;
  font-size: 0.95rem;
}

.main-nav a:hover,
.main-nav a.router-link-active {
  color: #E07A5F;
  background: #FFF1EB;
}

.profile-section {
  position: relative;
}

.avatar-container {
  cursor: pointer;
  border-radius: 50%;
  padding: 2px;
  border: 2px solid transparent;
  transition: all 0.25s ease;
}

.avatar-container:hover {
  border-color: #E07A5F;
}

.header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.header-avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #E07A5F;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
}

.dropdown-menu {
  position: absolute;
  top: 50px;
  right: 0;
  background: white;
  border: 1px solid #F0E7E1;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(61, 64, 91, 0.12);
  width: 220px;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  z-index: 110;
}

.dropdown-header {
  padding: 8px 16px 12px 16px;
}

.user-name {
  font-weight: 800;
  color: #3D405B;
  font-size: 0.95rem;
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  color: #82859C;
  font-size: 0.8rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.divider {
  border: 0;
  border-top: 1px solid #F4F1DE;
  margin: 8px 0;
}

.dropdown-item {
  color: #5C5F73;
  text-decoration: none;
  font-weight: 600;
  padding: 10px 16px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: block;
}

.dropdown-item:hover {
  background: #FFF9F5;
  color: #E07A5F;
}

.logout-item {
  color: #E07A5F;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 900px) {
  .app-header {
    padding: 10px 20px;
  }
  .main-nav a {
    padding: 6px 12px;
    font-size: 0.85rem;
  }
}

@media (max-width: 768px) {
  .app-header {
    flex-wrap: wrap;
    gap: 12px;
  }
  .main-nav {
    order: 3;
    width: 100%;
    justify-content: space-around;
  }
}
</style>
