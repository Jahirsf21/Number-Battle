const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());

app.post("/crearPartida", (req, res) => {
  const { nombrePrimerJugador, nombreSegundoJugador } = req.body;

  if (!nombrePrimerJugador || !nombreSegundoJugador) {
    return res.status(400).json({ error: "Los nombres de los jugadores no pueden estar vacíos" });
  }
  
  let jugadores = [nombrePrimerJugador, nombreSegundoJugador];
  jugadores = jugadores.sort(() => Math.random() - 0.5);
  const turnoInicial = jugadores[0];
  const partida = {
    jugador1: jugadores[0],
    jugador2: jugadores[1],
    rondasTotales: 6,
    rondaActual: 1,
    tiempoInicio: null,
    tiempoTotal: null,
    informacionJugadores: {
      [jugadores[0]]: {
        intentos: 3,
        numeroSecreto: Math.floor(Math.random() * 100) + 1,
        duracion: null
      },
      [jugadores[1]]: {
        intentos: 3,
        numeroSecreto: Math.floor(Math.random() * 100) + 1,
        duracion: null
      }
    },
    turnoInicial
  };

  res.json(partida);
});


app.listen(3000, () => {
  console.log("Servidor escuchando en el puerto 3000");
});
