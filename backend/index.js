const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

app.use(cors());
app.use(express.json());

const archivoPartidas = path.join(__dirname, "partidas.json");

let partidas = obtenerPartidas();

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

function guardarPartidas() {
  try {
    fs.writeFileSync(ArchivoPartidas, JSON.stringify(partidas, null, 2));
    console.log("Partidas guardadas en el archivo.");
  } catch (error)
  {
    console.error("Error al guardar las partidas:", error);
  }
}



app.post("/crearPartida", (req, res) => {
  const { nombrePrimerJugador, nombreSegundoJugador } = req.body;

  if (!nombrePrimerJugador || !nombreSegundoJugador) {
    return res.status(400).json({ error: "Los nombres de los jugadores no pueden estar vacíos" });
  }
  
  let jugadores = [nombrePrimerJugador, nombreSegundoJugador];
  jugadores = jugadores.sort(() => Math.random() - 0.5);
  const turnoInicial = jugadores[0];

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


app.listen(3000, () => {
  console.log("Servidor escuchando en el puerto 3000");
});
