<template>
  <div class="settings-view">
    <h2>Ajustes y Privacidad</h2>
    
    <div class="settings-section">
      <h3>Notificaciones</h3>
      <div class="setting-item">
        <label>
          <input type="checkbox" checked>
          Recibir email por cada nueva reserva
        </label>
      </div>
      <div class="setting-item">
        <label>
          <input type="checkbox" checked>
          Recordatorios diarios de horario
        </label>
      </div>
    </div>

    <div class="settings-section">
      <h3>Privacidad</h3>
      <div class="setting-item">
        <label>
          <input type="checkbox" checked>
          Mostrar mi perfil en búsquedas públicas
        </label>
      </div>
    </div>

    <div class="settings-section danger-zone">
      <h3>Zona de Peligro</h3>
      <p style="color: #82859C; margin-bottom: 15px; font-size: 0.9rem;">
        Estas acciones son irreversibles y afectarán tu cuenta permanentemente.
      </p>
      <button class="btn btn-danger">Eliminar mi cuenta</button>
    </div>
  </div>
</template>

<script setup>
// Settings view
</script>
