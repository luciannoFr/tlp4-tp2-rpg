import PromptSync from "prompt-sync";
import { Personaje } from "./clases/Personaje.js";
import { delay } from "./utils/delay.js";

const prompt = PromptSync();

const ASCII_GANASTE = `
                                                             __ 
 _____ _____ _____    _____ _____ _____ _____ ____  _____   |  |
|  |  |  _  |   __|  |   __|  _  |   | |  _  |    \\|     |  |  |
|     |     |__   |  |  |  |     | | | |     |  |  |  |  |  |__|
|__|__|__|__|_____|  |_____|__|__|_|___|__|__|____/|_____|  |__|
`;

const ASCII_PERDISTE = `
                                                                   __ 
 _____ _____ _____    _____ _____ _____ ____  _____ ____  _____   |  |
|  |  |  _  |   __|  |  _  |   __| __  |    \\|_   _|    \\      |  |  |
|     |     |__   |  |   __|   __|    -|  |  |_| |_|  |  |  |  |  |__|
|__|__|__|__|_____|  |__|  |_____|__|__|____/|_____|____/|_____|  |__|
`;

const mago = new Personaje("Merlín", 5000, 40, 10, 5, 5, 100, "Báculo sagrado", "Mágico", 1000, "larga distancia", 30);
const guerrero = new Personaje("Conan", 6500, 35, 7, 20, 15, 0, "Espada legendaria", "Cuerpo a cuerpo", 600, "corta distancia", 20);
const arquero = new Personaje("Legolas", 5500, 38, 15, 8, 10, 0, "Arco élfico", "A distancia", 700, "larga distancia", 25);
const tanque = new Personaje("Goliath", 8000, 30, 4, 25, 30, 0, "Maza pesada", "Cuerpo a cuerpo", 550, "corta distancia", 15);
const troll = new Personaje("Gruk", 6000, 25, 5, 18, 20, 0, "Garrote de piedra", "Cuerpo a cuerpo", 50, "corta distancia", 10);

const personajes = [mago, guerrero, arquero, tanque, troll];

console.log(`
 _____     _              _        _____           _       _   _         _           
|  _  |___| |___ ___    _| |___   |     |___ _____| |_ ___| |_|_|___ ___| |_ ___ ___ 
|   __| -_| | -_| .'|  | . | -_|  |   --| . |     | . | .'|  _| | -_|   |  _| -_|_ -|
|__|  |___|_|___|__,|  |___|___|  |_____|___|_|_|_|___|__,|_| |_|___|_|_|_| |___|___|
`);

personajes.forEach((p, i) => {
  console.log(`${i + 1}: ${p.nombre}`);
});

console.log("\nElige a tu personaje:");
const eleccionJugador = parseInt(prompt("> ")) - 1;
if (eleccionJugador < 0 || eleccionJugador >= personajes.length) {
  console.log("Opción inválida.");
  process.exit();
}
let jugador = personajes[eleccionJugador];

console.log(`\nInventario de ${jugador.nombre}:`);
jugador.mostrarInventario();

console.log("\nElige a tu oponente:");
personajes.forEach((p, i) => {
  if (i !== eleccionJugador) console.log(`${i + 1}: ${p.nombre}`);
});
const eleccionEnemigo = parseInt(prompt("> ")) - 1;
if (eleccionEnemigo < 0 || eleccionEnemigo >= personajes.length || eleccionEnemigo === eleccionJugador) {
  console.log("Opción inválida.");
  process.exit();
}
let enemigo = personajes[eleccionEnemigo];

(async () => {
  console.log(`\n ${jugador.nombre} VS ${enemigo.nombre} \n`);
  await delay(800);
  jugador.sacarArma();
  await delay(800);
  enemigo.sacarArma();
  await delay(800);

  let combateTerminado = false;
  let turno = 0;

  while (!combateTerminado) {
    await jugador.usarPocion(turno);
    await delay(800);
    await jugador.atacar(enemigo);
    await delay(800);
    console.log(`Vida de ${jugador.nombre}: ${jugador.vida} | Vida de ${enemigo.nombre}: ${enemigo.vida}`);
    await delay(800);
    if (enemigo.vida <= 0) {
      console.log(` ${jugador.nombre} ha vencido a ${enemigo.nombre}`);
      await delay(800);
      jugador.guardarArma();
      await delay(800);
      jugador.obtenerBotin(enemigo);
      await delay(800);
      console.log("\n Inventario después de la victoria:");
      await delay(800);
      jugador.mostrarInventario();
      console.log(ASCII_GANASTE);
      combateTerminado = true;
      break;
    }

    await enemigo.usarPocionEnemigo(turno);
    await delay(800);
    await enemigo.atacar(jugador);
    await delay(800);
    console.log(` Vida de ${jugador.nombre}: ${jugador.vida} | Vida de ${enemigo.nombre}: ${enemigo.vida}`);
    await delay(800);
    if (jugador.vida <= 0) {
      console.log(` ${enemigo.nombre} ha vencido a ${jugador.nombre}`);
      await delay(800);
      enemigo.guardarArma();
      await delay(800);
      enemigo.obtenerBotin(jugador);
      await delay(800);
      console.log("\n Inventario del vencedor:");
      await delay(800);
      enemigo.mostrarInventario();
      console.log(ASCII_PERDISTE);
      combateTerminado = true;
      break;
    }

    turno++;
    await delay(1000);
  }
})();

