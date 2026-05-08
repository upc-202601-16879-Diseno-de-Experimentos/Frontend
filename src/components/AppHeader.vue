<template>
  <header>
    <h1>🎾 Coach Pro - Mi Panel de Entrenador</h1>
    <nav>
      <router-link to="/dashboard">Dashboard</router-link>
      <router-link to="/profile">Mi Perfil</router-link>
      <router-link to="/services">Mis Servicios</router-link>
      <router-link to="/schedule">Horario</router-link>
      <router-link to="/bookings">Reservas</router-link>
      <router-link to="/clients">Clientes</router-link>
      <router-link to="/payments">Ingresos</router-link>
      <router-link to="/settings">Ajustes</router-link>
    </nav>
  </header>
</template>

<script setup>
// Header doesn't need logic right now
</script>

<style scoped>
/* Scoped styles if needed, but header styles are already in main.css */
</style>
