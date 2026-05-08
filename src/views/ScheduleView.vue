<template>
  <div class="schedule-view">
    <h2>Mi Horario Semanal</h2>
    <div class="schedule-grid">
      <div v-for="(day, index) in weekDays" :key="index" class="day-schedule">
        <div class="day-header">{{ day }}</div>
        <div class="day-slots">
          <div class="slot available">
            <span class="time">09:00</span>
            <span class="status">Disponible</span>
          </div>
          <div class="slot occupied">
            <span class="time">10:30</span>
            <span class="status">Reservado</span>
          </div>
          <div class="slot available">
            <span class="time">15:00</span>
            <span class="status">Disponible</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
</script>
