<template>
  <div class="dashboard">
    <h2>Bienvenido, {{ coachProfile?.name || 'Entrenador' }}</h2>
    <p class="welcome-subtitle">Aquí tienes un resumen del estado de tu actividad deportiva y tus alumnos hoy.</p>
    
    <!-- Carrusel de Novedades y Contenido Recomendado -->
    <div 
      class="dashboard-carousel"
      @mouseenter="stopAutoplay"
      @mouseleave="startAutoplay"
    >
      <div 
        class="carousel-track" 
        :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
      >
        <div 
          v-for="(slide, index) in slides" 
          :key="index" 
          class="carousel-slide"
          :style="{ backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.85) 35%, rgba(0, 0, 0, 0.4) 70%, transparent), url(${slide.image})` }"
        >
          <div class="slide-content">
            <span class="slide-tag">{{ slide.tag }}</span>
            <h3 class="slide-title">{{ slide.title }}</h3>
            <p class="slide-desc">{{ slide.description }}</p>
            <div class="slide-meta" v-if="slide.meta">
              <span class="meta-item">{{ slide.meta }}</span>
            </div>
            <a 
              v-if="slide.link" 
              :href="slide.link" 
              target="_blank" 
              class="slide-btn"
            >
              {{ slide.btnText || 'Ver más' }}
            </a>
          </div>
        </div>
      </div>
      
      <!-- Controles de navegación -->
      <button class="carousel-control prev" @click="prevSlide">‹</button>
      <button class="carousel-control next" @click="nextSlide">›</button>
      
      <!-- Indicadores (puntos) -->
      <div class="carousel-indicators">
        <span 
          v-for="(_, index) in slides" 
          :key="index" 
          class="indicator-dot"
          :class="{ active: currentSlide === index }"
          @click="goToSlide(index)"
        ></span>
      </div>
    </div>
    
    <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 20px;">
      <div class="stat-card">
        <div class="stat-icon">🎾</div>
        <div class="stat-value">{{ stats.totalServices }}</div>
        <div class="stat-label">Servicios Activos</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-value">{{ stats.activeBookings }}</div>
        <div class="stat-label">Reservas Confirmadas</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-value">{{ stats.totalClients }}</div>
        <div class="stat-label">Total Clientes</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-value">${{ (stats.totalIncome || 0).toFixed(2) }}</div>
        <div class="stat-label">Ingresos Totales</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">★</div>
        <div class="stat-value">{{ (coachProfile?.rating || 0).toFixed(1) }}</div>
        <div class="stat-label">Calificación Promedio</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💬</div>
        <div class="stat-value">{{ coachProfile?.totalReviews || 0 }}</div>
        <div class="stat-label">Reseñas de Alumnos</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useCoach } from '../composables/useCoach'

const { stats, coachProfile, loadData } = useCoach()

const currentSlide = ref(0)
let autoplayInterval = null

const slides = ref([
  {
    tag: 'Torneos',
    title: 'Torneo de Primavera MatchPoint',
    description: 'Compite, diviértete y sube en el ranking de aficionados. Inscripciones abiertas para todas las categorías.',
    meta: '📅 Fecha: 15 de Julio | 📍 Sede: Club Central',
    image: '/ad_spring_tournament.png',
    link: '#',
    btnText: 'Inscribirse ya'
  },
  {
    tag: 'Promoción',
    title: '20% de Descuento en Canchas',
    description: 'Disfruta de nuestras canchas de cristal templado y alfombra premium de pádel.',
    meta: '🔥 Solo hasta este domingo 5 de Julio',
    image: '/ad_padel_promo.png',
    link: 'https://www.example.com',
    btnText: 'Reservar ahora'
  },
  {
    tag: 'Coach Destacado',
    title: 'Carlos Mendoza',
    description: 'Entrenador de la semana. Especialista en saque veloz y táctica de juego.',
    meta: '⭐ 4.9 de calificación | 150 alumnos activos',
    image: '/ad_coach_week.png',
    link: '#',
    btnText: 'Ver perfil'
  },
  {
    tag: 'Tips Deportivos',
    title: '5 Ejercicios para tu saque',
    description: 'Consejos prácticos de nuestros profesionales para mejorar tu velocidad y precisión hoy.',
    meta: '🎥 Video explicativo gratuito',
    image: '/ad_tennis_tips.png',
    link: 'https://domain.com',
    btnText: 'Ver tutorial'
  },
  {
    tag: 'Happy Hour',
    title: '30% de Descuento en Horas Valle',
    description: 'Entrena por las mañanas y ahorra en reservas de canchas seleccionadas.',
    meta: '⏰ Lunes a Viernes de 08:00 a 12:00',
    image: '/ad_happy_hour.png',
    link: 'https://www.example.com',
    btnText: 'Buscar cancha'
  },
  {
    tag: 'Club',
    title: 'Membresía Club MatchPoint',
    description: 'Únete para obtener reservas prioritarias, acceso exclusivo a torneos y descuentos con coaches.',
    meta: '✨ Beneficios exclusivos para socios premium',
    image: '/ad_membership.png',
    link: 'https://www.example.com/club',
    btnText: 'Conocer más'
  }
])

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length
}

const goToSlide = (index) => {
  currentSlide.value = index
}

const startAutoplay = () => {
  stopAutoplay()
  autoplayInterval = setInterval(nextSlide, 6000)
}

const stopAutoplay = () => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
    autoplayInterval = null
  }
}

onMounted(() => {
  loadData()
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<style scoped>
.welcome-subtitle {
  color: #82859C;
  font-size: 1rem;
  margin-top: 4px;
  font-weight: 500;
  margin-bottom: 24px;
}

/* Carrusel Styling */
.dashboard-carousel {
  position: relative;
  width: 100%;
  height: 320px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(224, 122, 95, 0.08);
  margin-bottom: 32px;
  background: #3D405B;
  border: 1px solid #F0E7E1;
}

.carousel-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
}

.carousel-slide {
  min-width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 60px;
}

.slide-content {
  color: white;
  max-width: 500px;
  z-index: 2;
  text-align: left;
}

.slide-tag {
  background: rgba(224, 122, 95, 0.25);
  border: 1px solid rgba(224, 122, 95, 0.4);
  color: #FFEAE5;
  padding: 6px 14px;
  font-size: 0.78rem;
  font-weight: 700;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  display: inline-block;
  margin-bottom: 16px;
  backdrop-filter: blur(4px);
}

.slide-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 12px;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.slide-desc {
  font-size: 1rem;
  color: #E2E4F0;
  margin-bottom: 16px;
  line-height: 1.5;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.slide-meta {
  font-size: 0.88rem;
  color: #F4F5FB;
  font-weight: 600;
  margin-bottom: 24px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.slide-btn {
  background: #E07A5F;
  color: white;
  text-decoration: none;
  padding: 12px 28px;
  font-weight: 700;
  font-size: 0.95rem;
  border-radius: 100px;
  display: inline-block;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(224, 122, 95, 0.3);
}

.slide-btn:hover {
  background: #D4694D;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(224, 122, 95, 0.5);
}

/* Controles */
.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
  font-size: 2rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  z-index: 10;
}

.carousel-control:hover {
  background: rgba(255, 255, 255, 0.3);
  scale: 1.05;
}

.carousel-control.prev {
  left: 20px;
}

.carousel-control.next {
  right: 20px;
}

/* Indicadores */
.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.indicator-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator-dot.active {
  background: #E07A5F;
  width: 28px;
  border-radius: 10px;
}

.stats-grid {
  margin-top: 0;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid #F0E7E1;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: all 0.3s ease;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px rgba(0,0,0,0.05);
}
.stat-icon {
  font-size: 1.8rem;
  margin-bottom: 12px;
}
.stat-value {
  font-size: 2.2rem;
  font-weight: 800;
  color: #3D405B;
  line-height: 1.1;
  margin-bottom: 6px;
}
.stat-label {
  font-size: 0.95rem;
  color: #82859C;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-carousel {
    height: 380px;
  }
  .carousel-slide {
    padding: 0 40px;
  }
  .slide-title {
    font-size: 1.6rem;
  }
  .slide-desc {
    font-size: 0.9rem;
  }
  .carousel-control {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
}
</style>
