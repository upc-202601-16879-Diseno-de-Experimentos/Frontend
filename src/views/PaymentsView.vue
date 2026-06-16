<template>
  <div class="payments-view">
    <h2>Mis Ingresos</h2>
    
    <div class="income-summary">
      <div class="income-total">
        <h3>Ingresos Totales</h3>
        <div class="amount">${{ (stats?.totalIncome || 0).toFixed(2) }}</div>
      </div>
      <div class="income-month">
        <h3>Este Mes</h3>
        <div class="amount">${{ (stats?.totalIncome || 0).toFixed(2) }}</div>
      </div>
    </div>

    <h3>Historial de Pagos</h3>
    <div style="background: white; border-radius: 20px; overflow: hidden; border: 1px solid #F0E7E1;">
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
          <tr v-for="booking in bookings" :key="booking.id">
            <td>{{ new Date(booking.startTime).toLocaleDateString() }}</td>
            <td>{{ booking.user?.name || 'Cliente' }}</td>
            <td>{{ booking.coachService?.name || 'Servicio' }}</td>
            <td>${{ (booking.amount || 0).toFixed(2) }}</td>
            <td><span class="status-badge COMPLETED">Pagado</span></td>
          </tr>
          <tr v-if="bookings.length === 0">
            <td colspan="5" style="text-align: center; padding: 2rem;">No hay pagos registrados</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCoach } from '../composables/useCoach'

const { stats, bookings, loadData } = useCoach()

onMounted(async () => {
  await loadData()
})
</script>
