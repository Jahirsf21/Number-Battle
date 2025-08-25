<template>
  <div class="contenedor-historial">
    <h2>Historial de Partidas</h2>
    <div v-if="cargando" class="cuadro-info">
      <p>Cargando historial...</p>
    </div>
    <div v-else-if="historial.length > 0">
      <div v-for="partida in historial" :key="partida.id" class="cuadro-partida">
        <div class="cuadro resultado-general">
          <strong>Resultado Partida {{ partida.id }} :</strong>
          <span v-if="partida.ganadorPartida === 'Empate'"> Empate</span>
          <span v-else> Ganador: {{ partida.ganadorPartida }}</span>
        </div>
        <div class="fila-datos">
          <div class="cuadro">
            <strong>Jugador 1: {{ partida.jugador1 }}</strong>
            <p>Intentos totales: {{ partida.informacionJugadores[partida.jugador1]?.totalIntentos ?? 0 }}</p>
            <p>Rondas ganadas: {{ calcularRondasGanadas(partida, partida.jugador1) }}</p>
          </div>
          <div class="cuadro">
            <strong>Jugador 2: {{ partida.jugador2 }}</strong>
            <p>Intentos totales: {{ partida.informacionJugadores[partida.jugador2]?.totalIntentos ?? 0 }}</p>
            <p>Rondas ganadas: {{ calcularRondasGanadas(partida, partida.jugador2) }}</p>
          </div>
        </div>
        <div class="cuadro">
          <strong>Detalle de Rondas:</strong>
          <ul>
            <li v-for="ronda in calcularDetalleRondas(partida)" :key="ronda.numero">
              <strong>Ronda {{ ronda.numero }}</strong>
              <ul>
                <li>Intentos de {{ partida.jugador1 }}: {{ ronda.intentosJ1 }} ({{ ronda.duracionJ1 }}s)</li>
                <li>Intentos de {{ partida.jugador2 }}: {{ ronda.intentosJ2 }} ({{ ronda.duracionJ2 }}s)</li>
                <li>Ganador de la ronda: {{ ronda.ganador }}</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else class="cuadro-info">
      <p>No hay partidas completadas en el historial.</p>
    </div>
    <div class="centrar-boton">
      <button @click="volverAlInicio">Volver al Inicio</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const historial = ref([]);
const cargando = ref(true);
const router = useRouter();


const cargarHistorial = async () => {
  try {
    const response = await fetch('http://localhost:3000/partidas');
    if (!response.ok) throw new Error('No se pudo cargar el historial');
    const data = await response.json();
    historial.value = data.sort((a, b) => b.id - a.id);
  } catch (error) {
    console.error("Error al cargar el historial:", error);
  } finally {
    cargando.value = false;
  }
};

onMounted(cargarHistorial);


function calcularRondasGanadas(partida, nombreJugador) {
  const infoJugador = partida.informacionJugadores[nombreJugador];
  if (!infoJugador) return 0;
  return infoJugador.rondas.filter(r => r.adivinado).length;
}


function calcularDetalleRondas(partida) {
  const detalles = [];
  const infoJ1 = partida.informacionJugadores[partida.jugador1];
  const infoJ2 = partida.informacionJugadores[partida.jugador2];

  if (!infoJ1 || !infoJ2) return [];

  for (let i = 0; i < partida.rondasTotales; i++) {
    const rondaJ1 = infoJ1.rondas[i];
    const rondaJ2 = infoJ2.rondas[i];
    
    let ganadorRonda = 'No definida';
    if (rondaJ1.adivinado && rondaJ2.adivinado) {
      if (rondaJ1.intentosUsados < rondaJ2.intentosUsados) {
        ganadorRonda = partida.jugador1;
      } else if (rondaJ2.intentosUsados < rondaJ1.intentosUsados) {
        ganadorRonda = partida.jugador2;
      } else { 
        ganadorRonda = rondaJ1.duracion < rondaJ2.duracion ? partida.jugador1 :
                       rondaJ2.duracion < rondaJ1.duracion ? partida.jugador2 : 'Empate';
      }
    } else if (rondaJ1.adivinado) {
      ganadorRonda = partida.jugador1;
    } else if (rondaJ2.adivinado) {
      ganadorRonda = partida.jugador2;
    }

    detalles.push({
      numero: i + 1,
      intentosJ1: rondaJ1.intentosUsados,
      duracionJ1: rondaJ1.duracion,
      intentosJ2: rondaJ2.intentosUsados,
      duracionJ2: rondaJ2.duracion,
      ganador: ganadorRonda,
    });
  }
  return detalles;
}

const volverAlInicio = () => {
  router.push('/');
};
</script>

<style scoped>
.contenedor-historial {
  max-width: 600px;
  margin: 16px auto;
  padding: 16px;
  background: #f7f7fa;
  border-radius: 12px;
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 24px;
}


.cuadro-partida {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.cuadro-info {
  text-align: center;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
}

.fila-datos {
  display: flex;
  gap: 16px;
  margin-bottom: 8px; 
}

.cuadro {
  background: #f9f9f9;
  border-radius: 12px;
  border: 1px solid #eee;
  padding: 16px;
  margin-bottom: 8px;
  flex: 1;
}

.resultado-general {
  text-align: center;
  font-size: 1.1em;
  font-weight: bold;
}

.centrar-boton {
  text-align: center;
  margin-top: 16px;
}

button {
  padding: 10px 20px;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

ul { list-style-type: none; padding: 0; }
li { margin-bottom: 8px; padding: 8px; background: #f0f0f5; border-radius: 8px; }
li ul { margin-top: 8px; }
li ul li { background: #e9e9ef; font-size: 0.9em; }
p { margin: 8px 0; }
</style>