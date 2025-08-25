<template>
  <div v-if="partida">
    <h2>Resultados de la partida</h2>

    <div class="cuadro">
      <strong>Resultado:</strong>
      <span v-if="ganadorPartida === 'Empate'"> Empate</span>
      <span v-else> Ganador: {{ ganadorPartida }}</span>
    </div>

    <div class="fila-datos">
      <div class="cuadro">
        <strong>Jugador 1: {{ jugador1 }}</strong>
        <p>Intentos totales: {{ totalIntentosJ1 }}</p>
        <p>Rondas ganadas: {{ rondasGanadasJ1 }}</p>
      </div>
      <div class="cuadro">
        <strong>Jugador 2: {{ jugador2 }}</strong>
        <p>Intentos totales: {{ totalIntentosJ2 }}</p>
        <p>Rondas ganadas: {{ rondasGanadasJ2 }}</p>
      </div>
    </div>
    <div class="cuadro">
      <strong>Detalle de Rondas:</strong>
      <ul>
        <li v-for="ronda in detalleRondas" :key="ronda.numero">
          <strong>Ronda {{ ronda.numero }}</strong>
          <ul>
            <li>Intentos de {{ jugador1 }}: {{ ronda.intentosJ1 }} ({{ ronda.duracionJ1 }}s)</li>
            <li>Intentos de {{ jugador2 }}: {{ ronda.intentosJ2 }} ({{ ronda.duracionJ2 }}s)</li>
            <li>Ganador de la ronda: {{ ronda.ganador }}</li>
          </ul>
        </li>
      </ul>
    </div>
    <div class="centrar-boton">
      <button @click="volverAlInicio">Volver al inicio</button>
    </div>
  </div>
  <div v-else>
    <p>No se encontraron datos de la partida.</p>
    <div class="centrar-boton">
       <button @click="volverAlInicio">Volver al inicio</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const partida = ref(null);

onMounted(() => {
  const partidaGuardada = sessionStorage.getItem('partida');
  if (partidaGuardada) {
    partida.value = JSON.parse(partidaGuardada);
  }
});


const ganadorPartida = computed(() => partida.value?.ganadorPartida || 'No definido');
const jugador1 = computed(() => partida.value?.jugador1 || '');
const jugador2 = computed(() => partida.value?.jugador2 || '');


const infoJugador1 = computed(() => partida.value?.informacionJugadores?.[jugador1.value]);
const infoJugador2 = computed(() => partida.value?.informacionJugadores?.[jugador2.value]);

const totalIntentosJ1 = computed(() => infoJugador1.value?.totalIntentos ?? 0);
const totalIntentosJ2 = computed(() => infoJugador2.value?.totalIntentos ?? 0);

const rondasGanadasJ1 = computed(() => {
  if (!infoJugador1.value) return 0;
  return infoJugador1.value.rondas.filter(r => r.adivinado).length;
});
const rondasGanadasJ2 = computed(() => {
  if (!infoJugador2.value) return 0;
  return infoJugador2.value.rondas.filter(r => r.adivinado).length;
});

const detalleRondas = computed(() => {
  if (!partida.value || !infoJugador1.value || !infoJugador2.value) return [];

  const detalles = [];
  for (let i = 0; i < partida.value.rondasTotales; i++) {
    const rondaJ1 = infoJugador1.value.rondas[i];
    const rondaJ2 = infoJugador2.value.rondas[i];
    
    let ganadorRonda = 'N/A';
    if (rondaJ1.adivinado && rondaJ2.adivinado) {
      if (rondaJ1.intentosUsados < rondaJ2.intentosUsados) {
        ganadorRonda = jugador1.value;
      } else if (rondaJ2.intentosUsados < rondaJ1.intentosUsados) {
        ganadorRonda = jugador2.value;
      } else { 
        ganadorRonda = rondaJ1.duracion < rondaJ2.duracion ? jugador1.value :
                       rondaJ2.duracion < rondaJ1.duracion ? jugador2.value : 'Empate';
      }
    } else if (rondaJ1.adivinado) {
        ganadorRonda = jugador1.value;
    } else if (rondaJ2.adivinado) {
        ganadorRonda = jugador2.value;
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
});


const volverAlInicio = () => {
  sessionStorage.removeItem('partida');
  router.push('/');
};

</script>

<style scoped>
.fila-datos {
  display: flex;
  gap: 16px;
  margin-bottom: 8px; 
}
.cuadro {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 16px;
  margin-bottom: 8px;
  flex: 1;
}
div {
  max-width: 500px;
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
button {
  margin-top: 16px;
  padding: 8px 18px;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
}
.centrar-boton {
  text-align: center;
  background: none;
  box-shadow: none;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  margin-bottom: 8px;
  padding: 8px;
  background: #f0f0f5;
  border-radius: 8px;
}
li ul {
  margin-top: 8px;
}
li ul li {
  background: #e9e9ef;
  font-size: 0.9em;
}
p {
  margin: 8px 0;
}
</style>