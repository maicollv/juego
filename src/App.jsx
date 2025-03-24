// src/App.js
import React, { useState, useEffect } from 'react';
import { db, addDoc, collection } from './firebase';

// Lista de frutas (con sus imágenes)
const cartas = [
  { id: 1, imagen: '/images/manzana.png', emparejado: false },
  { id: 2, imagen: '/images/manzana.png', emparejado: false },
  { id: 3, imagen: '/images/banana.png', emparejado: false },
  { id: 4, imagen: '/images/banana.png', emparejado: false },
  { id: 5, imagen: '/images/cereza.png', emparejado: false },
  { id: 6, imagen: '/images/cereza.png', emparejado: false },
  { id: 7, imagen: '/images/uva.png', emparejado: false },
  { id: 8, imagen: '/images/uva.png', emparejado: false },
  { id: 9, imagen: '/images/fresa.png', emparejado: false },
  { id: 10, imagen: '/images/fresa.png', emparejado: false },
  { id: 11, imagen: '/images/naranja.png', emparejado: false },
  { id: 12, imagen: '/images/naranja.png', emparejado: false },
];

// Asegúrate de que estas imágenes estén dentro de la carpeta `src/images/`

function App() {
  const [nombres, setNombres] = useState('');
  const [cartasJuego, setCartasJuego] = useState([]);
  const [cartasVolteadas, setCartasVolteadas] = useState([]);
  const [tiempo, setTiempo] = useState(0);
  const [jugando, setJugando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [parejasEncontradas, setParejasEncontradas] = useState(0);
  const [temporizador, setTemporizador] = useState(null);

  useEffect(() => {
    if (jugando) {
      const timer = setInterval(() => setTiempo((prev) => prev + 1), 1000);
      setTemporizador(timer);
      return () => clearInterval(timer);
    }
  }, [jugando]);

  const iniciarJuego = () => {
    if (!nombres.trim()) {
      setMensaje('Por favor ingrese un nombre.');
      return;
    }

    setMensaje('');
    setParejasEncontradas(0);
    setTiempo(0);
    setCartasVolteadas([]);
    setJugando(true);

    // Barajamos las cartas
    const cartasDesordenadas = [...cartas].sort(() => Math.random() - 0.5);
    setCartasJuego(cartasDesordenadas);
  };

  const manejarClick = (carta) => {
    // Si ya ha sido emparejada o si ya tenemos dos cartas volteadas, no hacer nada
    if (carta.emparejado || cartasVolteadas.length === 2) return;

    // Volteamos la carta
    setCartasVolteadas((prev) => [...prev, carta]);

    // Si ya hay dos cartas volteadas, verificamos si coinciden
    if (cartasVolteadas.length === 1) {
      const carta1 = cartasVolteadas[0];
      const carta2 = carta;

      // Si las cartas coinciden
      if (carta1.imagen === carta2.imagen) {
        setParejasEncontradas(parejasEncontradas + 1);
        setCartasJuego((prevCartas) =>
          prevCartas.map((c) =>
            c.imagen === carta1.imagen ? { ...c, emparejado: true } : c
          )
        );
      }

      // Si no coinciden, las volteamos de nuevo
      setTimeout(() => setCartasVolteadas([]), 1000);
    }
  };

  useEffect(() => {
    // Si se han encontrado todas las parejas, termina el juego
    if (parejasEncontradas === cartas.length / 2) {
      setJugando(false);
      setMensaje(`¡Juego Terminado! Tu tiempo fue: ${tiempo} segundos.`);
      guardarResultado();
    }
  }, [parejasEncontradas, tiempo]);

  const guardarResultado = async () => {
    try {
      await addDoc(collection(db, 'resultados'), {
        nombre: nombres,
        tiempo: tiempo,
        fecha: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error al guardar el resultado: ', error);
    }
  };

  const reiniciarJuego = () => {
    setNombres('');
    setMensaje('');
    setParejasEncontradas(0);
    setTiempo(0);
    setCartasVolteadas([]);
    setJugando(false);
  };

  return (
    <div className="App">
      <h1>Juego de Memoria con Frutas</h1>

      {!jugando && (
        <div>
          <label htmlFor="nombres">Ingrese su nombre:</label>
          <input
            type="text"
            id="nombres"
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
            placeholder="Ejemplo: Juan"
          />
          <button onClick={iniciarJuego}>Iniciar Juego</button>
        </div>
      )}

      {mensaje && <p>{mensaje}</p>}

      {jugando && (
        <div>
          <h2>Tiempo: {tiempo} segundos</h2>
          <div className="cartas">
            {cartasJuego.map((carta) => (
              <button
                key={carta.id}
                className="carta"
                onClick={() => manejarClick(carta)}
                disabled={carta.emparejado || cartasVolteadas.includes(carta)}
              >
                {cartasVolteadas.includes(carta) || carta.emparejado ? (
                  <img src={carta.imagen} alt="Fruta" />
                ) : (
                  '?'
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {mensaje && !jugando && (
        <button onClick={reiniciarJuego}>Nuevo Juego</button>
      )}
    </div>
  );
}

export default App;
