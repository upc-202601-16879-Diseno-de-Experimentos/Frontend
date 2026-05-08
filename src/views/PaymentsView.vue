<template>
  <div class="payments-view">
    <h2>Mis Ingresos</h2>
    
    <div class="income-summary">
      <div class="income-total">
        <h3>Ingresos Totales</h3>
        <div class="amount">$1,250.00</div>
      </div>
      <div class="income-month">
        <h3>Este Mes</h3>
        <div class="amount">$450.00</div>
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
          <tr>
            <td>15 May 2026</td>
            <td>Cliente #12</td>
            <td>Clase de Tenis</td>
            <td>$50.00</td>
            <td><span class="status-badge COMPLETED">Pagado</span></td>
          </tr>
          <tr>
            <td>10 May 2026</td>
            <td>Cliente #8</td>
            <td>Clase Grupal</td>
            <td>$30.00</td>
            <td><span class="status-badge COMPLETED">Pagado</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
// En una implementación real, calcularíamos esto basado en las reservas COMPLETADAS
</script>
