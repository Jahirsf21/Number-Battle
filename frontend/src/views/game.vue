<template>
  <div>
    <h2>Number Battle</h2>
    <div v-if="partida">
      <div class="fila-datos">
        <div class="cuadro">
          <strong>Turno Actual:</strong> {{ turnoActual }}
        </div>
      </div>
      
      <div class="fila-datos">
        <div class="cuadro">
          <strong>Ronda actual:</strong>
          <span v-if="turnoActual === jugador1">{{ rondaActualJ1 + 1 }}</span>
          <span v-else>{{ rondaActualJ2 + 1 }}</span>
          / 3
        </div>
        
        <div class="cuadro">
          <strong>Intentos totales:</strong>
          <span v-if="turnoActual === jugador1">{{ totalIntentosJ1 }}</span>
          <span v-else>{{ totalIntentosJ2 }}</span>
        </div>
      </div>

      <div class="cuadro">
        <strong>Intentos usados en esta ronda:</strong>
        <span v-if="turnoActual === jugador1">{{ intentosUsadosJ1 }}</span>
        <span v-else>{{ intentosUsadosJ2 }}</span>
      </div>

      <div class="cuadro">
        <strong>Tiempo transcurrido:</strong> {{ tiempoTurno }}s
      </div>

      <div style="margin-top: 24px;">
        <label>Adivina el número:</label>
        <input v-model="intentoActual" type="number" min="1" max="100" :disabled="juegoTerminado" @keyup.enter="realizarIntento"/>
        <button @click="realizarIntento" :disabled="juegoTerminado || !intentoActual">Intentar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const partida = ref(JSON.parse(sessionStorage.getItem('partida')))
const intentoActual = ref('')
const router = useRouter()



const jugador1 = computed(() => partida.value?.jugador1)
const jugador2 = computed(() => partida.value?.jugador2)
const turnoActual = computed(() => partida.value?.turnoActual)
const juegoTerminado = computed(() => partida.value?.juegoTerminado)
const ganadorPartida = computed(() => partida.value?.ganadorPartida)

const infoJugador1 = computed(() => partida.value?.informacionJugadores?.[jugador1.value])
const infoJugador2 = computed(() => partida.value?.informacionJugadores?.[jugador2.value])

const rondaActualJ1 = computed(() => infoJugador1.value?.rondaActual ?? 0)
const rondaActualJ2 = computed(() => infoJugador2.value?.rondaActual ?? 0)

const intentosUsadosJ1 = computed(() => {
  const ronda = infoJugador1.value?.rondas?.[rondaActualJ1.value]
  return ronda ? ronda.intentosUsados : 0
})
const intentosUsadosJ2 = computed(() => {
  const ronda = infoJugador2.value?.rondas?.[rondaActualJ2.value]
  return ronda ? ronda.intentosUsados : 0
})

const totalIntentosJ1 = computed(() => infoJugador1.value?.totalIntentos ?? 0)
const totalIntentosJ2 = computed(() => infoJugador2.value?.totalIntentos ?? 0)


const tiempoTurno = ref(0)
let intervalo = null

onMounted(() => {
  intervalo = setInterval(() => {
    if (!partida.value?.juegoTerminado && partida.value?.timestampTurnoInicio) {
      tiempoTurno.value = Math.floor((Date.now() - partida.value.timestampTurnoInicio) / 1000)
    }
  }, 1000)
})

onUnmounted(() => clearInterval(intervalo))

const mostrarMensaje = (mensaje, tipo = 'info') => {
  Swal.fire({
    icon: tipo,
    title: 'Resultado del Intento',
    text: mensaje,
    timer: tipo === 'success' ? 3000 : 1800, 
    showConfirmButton: false
  })
}

const realizarIntento = async () => {
  if (!intentoActual.value || juegoTerminado.value) return;

  try {
    const res = await fetch('http://localhost:3000/realizarIntento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partidaId: partida.value.id,
        jugador: turnoActual.value,
        intento: parseInt(intentoActual.value)
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Ocurrió un error en el servidor')

    mostrarMensaje(data.mensaje, data.tipo)
    partida.value = data.partidaActualizada
    sessionStorage.setItem('partida', JSON.stringify(data.partidaActualizada))
    intentoActual.value = ''
    tiempoTurno.value = 0 
  } catch (error) {
    console.error("Error al realizar el intento:", error)
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
    });
  }
}

const mostrarMensajeFinal = () => {
  let titulo, texto, icono;
  
  if (ganadorPartida.value === 'Empate') {
    titulo = '¡Juego terminado!';
    texto = 'La partida ha resultado en un empate.';
    icono = 'info';
  } else {
    titulo = '¡Felicidades!';
    texto = `El ganador es: ${ganadorPartida.value}`;
    icono = 'success';
  }

  Swal.fire({
    title: titulo,
    text: texto,
    icon: icono,
    confirmButtonText: 'Ver Estadísticas'
  }).then((result) => {
    if (result.isConfirmed) {
      router.push('stats');
    }
  });
};

watch(juegoTerminado, (nuevoValor) => {
  if (nuevoValor) {
    mostrarMensajeFinal();
  }
});
</script>

<style scoped>
.fila-datos {
  display: flex;
  gap: 16px;
  margin-bottom: px; 
}
.cuadro {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 12px;
  margin-bottom: 8px;
  flex: 1;
}
div {
  max-width: 400px;
  margin: 4px auto;
  padding: 16px;
  background: #f7f7fa;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 16px; 
}
label {
  display: block;
  margin-bottom: 4px;
  color: #34495e;
  font-weight: 500;
}
input[type="number"] {
  width: 100%;
  padding: 8px;
  margin-bottom: 12px;
  border: 1px solid #bfc9d1;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;
}
button {
  margin-top: 6px;
  padding: 8px 18px;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
}
button:disabled {
  background: #bfc9d1;
  cursor: not-allowed;
}
</style>