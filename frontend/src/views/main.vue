<template>
  <div>
    <h2>Bienvenido a Number Battle</h2>
    <div v-if="error">{{ error }}</div>
    <div>
      <label>Nombre Jugador 1:</label>
      <input v-model="nombreJugador1" type="text" />
    </div>
    <div>
      <label>Nombre Jugador 2:</label>
      <input v-model="nombreJugador2" type="text" />
    </div>
    <div class="botones">
      <button @click="crearPartida">Crear partida</button>
      <button @click="verHistorial">Ver historial</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Swal from 'sweetalert2'

const nombreJugador1 = ref('')
const nombreJugador2 = ref('')
const partida = ref(null)
const error = ref('')

async function crearPartida() {
  partida.value = null
  try {
    const res = await fetch('http://localhost:3000/crearPartida', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombrePrimerJugador: nombreJugador1.value,
        nombreSegundoJugador: nombreJugador2.value
      })
    })
    const data = await res.json()
    if (!res.ok) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.error || 'Error al crear partida'
      })
    } else {
      partida.value = data
      sessionStorage.setItem('partida', JSON.stringify(data))
      Swal.fire({
        icon: 'success',
        title: 'Partida creada',
        text: '¡La partida se creó correctamente!'
      })
    }
  } catch (e) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo conectar con el servidor'
    })
  }
}

</script>

<style scoped>
div {
  max-width: 400px;
  margin: 25px auto;
  padding: 24px;
  background: #f7f7fa;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 24px;
}

label {
  display: block;
  margin-bottom: 6px;
  color: #34495e;
  font-weight: 500;
}

input[type="text"] {
  width: 100%;
  padding: 8px;
  margin-bottom: 16px;
  border: 1px solid #bfc9d1;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;
}

button {
  margin-right: 10px;
  padding: 8px 18px;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
}

button:last-of-type {
  background: #27ae60;
}

button:hover {
  background: #217dbb;
}

button:last-of-type:hover {
  background: #219150;
}

.botones {
  display: flex;
  justify-content: center; 
  gap: 12px; 
  margin-top: 16px;
}

h3 {
  margin-top: 24px;
  color: #2c3e50;
}

div[v-if="error"], div[v-if="mensajeError"] {
  color: #e74c3c;
  margin-top: 12px;
  font-weight: 500;
}
</style>