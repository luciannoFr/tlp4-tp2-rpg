import PromptSync from "prompt-sync";
const prompt = PromptSync();

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Pocion {
    constructor(nombre, efecto, tipo, cantidad) {
        this.nombre = nombre;
        this.efecto = efecto;
        this.tipo = tipo;
        this.cantidad = cantidad;
    }
}

class Llave {
    constructor(nombre) {
        this.nombre = nombre;
    }
}

class Arma {
    #tipo
    
    constructor(nombre_arma, tipo, danio, alcance, min_nivel) {
        this.nombre_arma = nombre_arma;
        this.#tipo = tipo;
        this.danio = danio;
        this.alcance = alcance;
        this.min_nivel = min_nivel;
    }

    sacarArma() {
        console.log(`Saca su ${this.nombre_arma}`);
    }

    guardarArma() {
        console.log(`Guarda su ${this.nombre_arma}`);
    }
}

class Inventario {
    constructor() {
        this.items = [];
    }
    agregarItem(item) {
        this.items.push(item);
    }
    mostrarInventario() {
        console.log("Inventario:");
        if (this.items.length === 0) {
            console.log("(vacío)");
        } else {
            this.items.forEach((item, index) => {
                if (item instanceof Arma) {
                    console.log(`${index + 1}- Arma: ${item.nombre_arma}`);
                } else if (item instanceof Pocion) {
                    console.log(`${index + 1}- Poción: ${item.nombre} (${item.efecto})`);
                } else {
                    console.log(`${index + 1}- ${item.nombre}`);
                }
            });
        }
    }
}

class Personaje extends Arma {
    #vida
    ultimoUsoPocion = 0;
    
    constructor(nombre, vida, nivel, velocidad, fuerza, resistencia, magia, nombre_arma, tipo, danio, alcance, min_nivel) {
        super(nombre_arma, tipo, danio, alcance, min_nivel);
        this.nombre = nombre;
        this.#vida = vida;
        this.nivel = nivel;
        this.velocidad = velocidad;
        this.fuerza = fuerza;
        this.resistencia = resistencia;
        this.magia = magia;

        this.inventario = new Inventario();
        this.inventario.agregarItem(new Arma(nombre_arma, tipo, danio, alcance, min_nivel));
        this.inventario.agregarItem(new Pocion("Poción de vida", "Recupera 400 HP", "vida", 400));
        this.inventario.agregarItem(new Pocion("Poción de fuerza", "Aumenta 200 de daño", "fuerza", 200));
        this.inventario.agregarItem(new Llave("Llave dorada"));
    }

    get vida() {
        return this.#vida;
    }

    set vida(cantidadDanio) {
        this.#vida -= cantidadDanio;
        if (this.#vida < 0) this.#vida = 0;
        console.log(`${this.nombre} recibió ${cantidadDanio} puntos de daño. Vida restante: ${this.#vida}`);
        if (this.#vida <= 0) {
            this.morir();
        }
    }

    curar(cantidad) {
        this.#vida += cantidad;
        console.log(`${this.nombre} recupera ${cantidad} puntos de vida. Vida actual: ${this.#vida}`);
    }

    aumentarFuerza(cantidad) {
        this.danio += cantidad;
        console.log(`${this.nombre} aumenta su fuerza de ataque en ${cantidad}. Daño actual: ${this.danio}`);
    }

    async atacar(objetivo) {
        console.log(`${this.nombre} ataca a ${objetivo.nombre} con su ${this.nombre_arma}`);
        await delay(800);
        objetivo.vida = this.danio;
    }

    morir() {
        console.log(`${this.nombre} ha caído en batalla`);
    }

    mostrarInventario() {
        this.inventario.mostrarInventario();
    }

    async usarPocion(turnoActual) {
        if (turnoActual - this.ultimoUsoPocion < 2) {
            return;
        }
        console.log("\n¿Quieres usar una poción?");
        await delay(800);
        const pociones = this.inventario.items.filter(item => item instanceof Pocion);
        if (pociones.length === 0) {
            console.log("Ya no tenés pociones para la pelea.");
            return;
        }
        
        pociones.forEach((pocion, index) => {
            console.log(`${index + 1}- Poción: ${pocion.nombre} (${pocion.efecto})`);
        });
        
        let eleccion;
        let inputValido = false;
        
        while (!inputValido) {
            const input = prompt("Elige el número de la poción o 0 para no usar: ");
            eleccion = parseInt(input);
            
            if (isNaN(eleccion)) {
                console.log("Por favor ingresa un número válido.");
                continue;
            }
            
            if (eleccion === 0) {
                console.log("No se usará ninguna poción en este turno.");
                return;
            }
            
            if (eleccion < 0 || eleccion > pociones.length) {
                console.log(`El número debe estar entre 0 y ${pociones.length}.`);
                continue;
            }
            
            inputValido = true;
        }
        
        const item = pociones[eleccion - 1];
        if (item.tipo === "vida") this.curar(item.cantidad);
        if (item.tipo === "fuerza") this.aumentarFuerza(item.cantidad);
        
        const indexReal = this.inventario.items.findIndex(i => i === item);
        if (indexReal !== -1) {
            this.inventario.items.splice(indexReal, 1);
        }
        
        this.ultimoUsoPocion = turnoActual;
        await delay(800);
    }

    async usarPocionEnemigo(turnoActual) {
        if (turnoActual - this.ultimoUsoPocion < 2) {
            return;
        }
        const probabilidad = Math.random();
        if (probabilidad > 0.3) {
            return;
        }
        const pociones = this.inventario.items.filter(item => item instanceof Pocion);
        if (pociones.length === 0) {
            return;
        }
        const indiceAleatorio = Math.floor(Math.random() * pociones.length);
        const item = pociones[indiceAleatorio];
        console.log(`${this.nombre} decide usar una poción: ${item.nombre}`);
        await delay(800);
        if (item.tipo === "vida") this.curar(item.cantidad);
        if (item.tipo === "fuerza") this.aumentarFuerza(item.cantidad);
        const indexReal = this.inventario.items.indexOf(item);
        this.inventario.items.splice(indexReal, 1);
        this.ultimoUsoPocion = turnoActual;
        await delay(800);
    }

    obtenerBotin(rival) {
        rival.inventario.items.forEach(obj => {
            this.inventario.agregarItem(obj);
        });
        console.log(`${this.nombre} guardó en su inventario los objetos obtenidos de ${rival.nombre}`);
    }
}

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

console.log(" _____ _ _            _                                        _     ");
console.log("|   __| |_|___ ___   | |_ _ _    ___ ___ ___ ___ ___ ___ ___  |_|___ ");
console.log("|   __| | | . | -_|  |  _| | |  | . | -_|  _|_ -| . |   | .'| | | -_|");
console.log("|_____|_|_|_  |___|  |_| |___|  |  _|___|_| |___|___|_|_|__,|_| |___|");
console.log("          |___|                 |_|                         |___|    ");

console.log("Elige a tu personaje:");
const eleccionJugador = parseInt(prompt("> ")) - 1;
if (eleccionJugador < 0 || eleccionJugador >= personajes.length) {
    console.log("Opción inválida.");
    process.exit();
}
let jugador = personajes[eleccionJugador];

console.log("\nInventario de tu personaje:");
jugador.mostrarInventario();

console.log("\nElige a tu oponente:");
personajes.forEach((p, i) => {
    if (i !== eleccionJugador) console.log(`${i + 1}: ${p.nombre}`);
});

console.log(" _____ _ _                _    _____               _         ");
console.log("|   __| |_|___ ___    ___| |  |   __|___ ___ _____|_|___ ___ ");
console.log("|   __| | | . | -_|  | .'| |  |   __|   | -_|     | | . | . |");
console.log("|_____|_|_|_  |___|  |__,|_|  |_____|_|_|___|_|_|_|_|_  |___|");
console.log("          |___|                                     |___|    ");

const eleccionEnemigo = parseInt(prompt("> ")) - 1;
if (eleccionEnemigo < 0 || eleccionEnemigo >= personajes.length || eleccionEnemigo === eleccionJugador) {
    console.log("Opción inválida.");
    process.exit();
}
let enemigo = personajes[eleccionEnemigo];

(async () => {
    console.log(`\n${jugador.nombre} VS ${enemigo.nombre}\n`);
    console.log(`
                                                                __ 
 _____           _                _                _           |  |
|   __|_____ ___|_|___ ___ ___   | |___    ___ ___| |___ ___   |  |
|   __|     | . | | -_|- _| .'|  | | .'|  | . | -_| | -_| .'|  |__|
|_____|_|_|_|  _|_|___|___|__,|  |_|__,|  |  _|___|_|___|__,|  |__|
            |_|                           |_|                      `);
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
            console.log(`${jugador.nombre} ha vencido a ${enemigo.nombre}`);
            await delay(800);
            jugador.guardarArma();
            await delay(800);
            jugador.obtenerBotin(enemigo);
            await delay(800);
            console.log("\nInventario después de la victoria:");
            await delay(800);
            jugador.mostrarInventario();
            combateTerminado = true;
            console.log(`
                                                             __ 
 _____ _____ _____    _____ _____ _____ _____ ____  _____   |  |
|  |  |  _  |   __|  |   __|  _  |   | |  _  |     \|     |  |  |
|     |     |__   |  |  |  |     | | | |     |  |  |  |  |  |__|
|__|__|__|__|_____|  |_____|__|__|_|___|__|__|____/|_____|  |__|
                                                                `);
            break;
        }

        await enemigo.usarPocionEnemigo(turno);
        await delay(800);
        await enemigo.atacar(jugador);
        await delay(800);
        console.log(`Vida de ${jugador.nombre}: ${jugador.vida} | Vida de ${enemigo.nombre}: ${enemigo.vida}`);
        await delay(800);
        if (jugador.vida <= 0) {
            console.log(`${enemigo.nombre} ha vencido a ${jugador.nombre}`);
            await delay(800);
            enemigo.guardarArma();
            await delay(800);
            enemigo.obtenerBotin(jugador);
            await delay(800);
            console.log("\nInventario del vencedor:");
            await delay(800);
            enemigo.mostrarInventario();
            combateTerminado = true;
            console.log(`
                                                                   __ 
 _____ _____ _____    _____ _____ _____ ____  _____ ____  _____   |  |
|  |  |  _  |   __|  |  _  |   __| __  |     \|_   _|     \|     |  |  |
|     |     |__   |  |   __|   __|    -|  |  |_| |_|  |  |  |  |  |__|
|__|__|__|__|_____|  |__|  |_____|__|__|____/|_____|____/|_____|  |__|
                                                                    `);
            break;
        }

        turno++;
        await delay(1000);
    }
})();