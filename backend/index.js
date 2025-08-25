const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const fs =  require("fs");

app.use(cors());
app.use(express.json());

const archivoPartidas = path.join(__dirname, "partidas.json");

let partidas = obtenerPartidas();


// Método para obtener las partidas de un json
// En caso de no existir el archivo retorna un array vacio.
// Si el archivo existe pero esta vacio retorna un array vacio.
// Si el archivo existe y tiene información retorna los datos parseados.
function obtenerPartidas() {
  if (!fs.existsSync(archivoPartidas)) return [];
  try {
    const data = fs.readFileSync(archivoPartidas, "utf-8");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error al leer o parsear partidas.json:", error);
    return [];
  }
}

// Método para guardar las partidas en un json
function guardarPartidas() {
  try {
    fs.writeFileSync(archivoPartidas, JSON.stringify(partidas, null, 2));
    console.log("Partidas guardadas en el archivo.");
  } catch (error)
  {
    console.error("Error al guardar las partidas:", error);
  }
}


// Método POST
// recibe el nombre del jugador 1 y del jugador
// retorna los datos correspondientes a la partida creada y guarda la partida en el json
app.post("/crearPartida", (req, res) => {
  const { nombrePrimerJugador, nombreSegundoJugador } = req.body;

  if (!nombrePrimerJugador || !nombreSegundoJugador) {
    return res.status(400).json({ error: "Los nombres de los jugadores no pueden estar vacíos" });
  }
  
  let jugadores = [nombrePrimerJugador, nombreSegundoJugador]; 
  jugadores = jugadores.sort(() => Math.random() - 0.5); //se cambia el orden de los jugadores de forma random
  const turnoInicial = jugadores[0]; //el jugador en la primera posición sera el que empieza el juego

  const partida = {
    id: partidas.length +1,
    jugador1: jugadores[0],
    jugador2: jugadores[1],
    rondasTotales: 3,
    turnoActual: turnoInicial,
    juegoTerminado: false,
    ganadorPartida: null,
    timestampTurnoInicio: Date.now(),
    informacionJugadores: {
      [jugadores[0]]: {
        rondas: Array.from({ length: 3 }, () => ({
          numeroSecreto: Math.floor(Math.random() * 100) + 1,
          intentosUsados: 0,
          adivinado: false,
          duracion: 0
        })),
        rondaActual: 0,
        totalIntentos: 0
      },
      [jugadores[1]]: {
        rondas: Array.from({ length: 3 }, () => ({
          numeroSecreto: Math.floor(Math.random() * 100) + 1,
          intentosUsados: 0,
          adivinado: false,
          duracion: 0
        })),
        rondaActual: 0,
        totalIntentos: 0
      }
    }
  };

  partidas.push(partida);
  guardarPartidas();
  res.json(partida);
});

// Método POST, recibe el id de la partida que se esta jugando, el jugador actual y el número ingresado para adivinar.
// Si el id no existe en las partidas guardadas retorna un mensaje de error 
// Finaliza si ya se acabaron todas las rondas ambos jugadores
// retorna la partida actualiza, el mensaje y su tipo (se estan usando sweetAlerts)
app.post("/realizarIntento", (req, res) => {
  const { partidaId, jugador, intento } = req.body;
  const partida = partidas.find(p => p.id === partidaId);

  if (!partida) return res.status(404).json({ error: "Partida no encontrada" });
  // Se elimina la validación de juego terminado para permitir el último turno del segundo jugador
  // if (partida.juegoTerminado) return res.status(400).json({ error: "El juego ya ha terminado" });
  if (partida.turnoActual !== jugador && !partida.juegoTerminado) return res.status(400).json({ error: "No es tu turno" });

  const jugadorObj = partida.informacionJugadores[jugador];
  const oponenteNombre = partida.jugador1 === jugador ? partida.jugador2 : partida.jugador1;
  const oponenteObj = partida.informacionJugadores[oponenteNombre];

  // Prevenir errores si un jugador intenta jugar después de haber terminado sus rondas
  if (jugadorObj.rondaActual >= partida.rondasTotales) {
    return res.status(400).json({ error: "Ya has completado todas tus rondas." });
  }

  const ronda = jugadorObj.rondas[jugadorObj.rondaActual];
  const guess = parseInt(intento);

  let mensaje = "";
  let tipo = "info";

  ronda.intentosUsados++;
  jugadorObj.totalIntentos++;

  if (guess === ronda.numeroSecreto) {
    ronda.adivinado = true;
    mensaje = `¡Correcto! Adivinaste el número en la ronda ${jugadorObj.rondaActual + 1}.`;
    tipo = "success";
    ronda.duracion = Math.floor((Date.now() - partida.timestampTurnoInicio) / 1000);
    jugadorObj.rondaActual++; 
    const jugadorActualTermino = jugadorObj.rondaActual === partida.rondasTotales;
    const oponenteTermino = oponenteObj.rondaActual === partida.rondasTotales;

    if (jugadorActualTermino && !oponenteTermino) {
      partida.turnoActual = oponenteNombre;
      partida.timestampTurnoInicio = Date.now();
      mensaje += ` Turno de ${oponenteNombre}.`;

    } else if (jugadorActualTermino && oponenteTermino) {
      partida.juegoTerminado = true;
      partida.turnoActual = null;

      if (jugadorObj.totalIntentos < oponenteObj.totalIntentos) {
        partida.ganadorPartida = jugador;
      } else if (oponenteObj.totalIntentos < jugadorObj.totalIntentos) {
        partida.ganadorPartida = oponenteNombre;
      } else {
        
        const tiempoTotalJugador = jugadorObj.rondas.reduce((total, r) => total + r.duracion, 0);
        const tiempoTotalOponente = oponenteObj.rondas.reduce((total, r) => total + r.duracion, 0);

        if (tiempoTotalJugador < tiempoTotalOponente) {
          partida.ganadorPartida = jugador;
        } else if (tiempoTotalOponente < tiempoTotalJugador) {
          partida.ganadorPartida = oponenteNombre;
        } else {
          partida.ganadorPartida = "Empate";
        }
      }
       mensaje += " ¡Juego terminado!";
    } else {
       partida.timestampTurnoInicio = Date.now();
    }

  } else {
    mensaje = guess < ronda.numeroSecreto ? "El número secreto es MÁS ALTO." : "El número secreto es MÁS BAJO.";
  }

  guardarPartidas();

  res.json({
    mensaje,
    tipo,
    partidaActualizada: partida
  });
});

// Método GET, retorna todas las partidas finalizadas.
app.get("/partidas", (req, res) => {
  const partidasTerminadas = partidas.filter(p => p.juegoTerminado);
  res.json(partidasTerminadas);
});


app.listen(3000, () => {
  console.log("Servidor escuchando en el puerto 3000");
});
