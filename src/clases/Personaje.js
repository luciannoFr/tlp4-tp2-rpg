import PromptSync from "prompt-sync";
import { Arma } from "./Arma.js";
import { Pocion } from "./Pocion.js";
import { Llave } from "./Llave.js";
import { Inventario } from "./Inventario.js";
import { delay } from "../utils/delay.js";

const prompt = PromptSync();

export class Personaje extends Arma {
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

        console.log(`[CREADO] El personaje ${this.nombre} fue creado con ${this.#vida} de vida`);
    }

    get vida() {
        return this.#vida;
    }

    set vida(cantidadDanio) {
        this.#vida -= cantidadDanio;
        if (this.#vida < 0) this.#vida = 0;
        console.log(` [DAÑO] ${this.nombre} recibió ${cantidadDanio}. Vida restante: ${this.#vida}`);
        if (this.#vida <= 0) {
            this.morir();
        }
    }

    curar(cantidad) {
        this.#vida += cantidad;
        console.log(`[CURACION] ${this.nombre} recupera ${cantidad} puntos de vida. Vida actual: ${this.#vida}`);
    }

    aumentarFuerza(cantidad) {
        this.danio += cantidad;
        console.log(` [BUFF] ${this.nombre} aumenta su fuerza en ${cantidad}. Daño actual: ${this.danio}`);
    }

    async atacar(objetivo) {
        console.log(` [ATAQUE] ${this.nombre} ataca a ${objetivo.nombre} con ${this.nombre_arma}`);
        await delay(800);
        objetivo.vida = this.danio;
    }

    morir() {
        console.log(` [MUERTE] ${this.nombre} ha caído en batalla`);
    }

    mostrarInventario() {
        this.inventario.mostrarInventario();
    }

    async usarPocion(turnoActual) {
        if (turnoActual - this.ultimoUsoPocion < 2) {
            console.log(` [Veneno] ${this.nombre} no puede usar poción en este turno`);
            return;
        }
        console.log("\n¿Quieres usar una poción?");
        await delay(800);
        const pociones = this.inventario.items.filter(item => item instanceof Pocion);
        if (pociones.length === 0) {
            console.log(" [Veneno] No hay pociones disponibles");
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
                console.log("No se usará ninguna poción.");
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
            console.log(`[Veneno] ${item.nombre} fue usada y eliminada del inventario`);
        }
        
        this.ultimoUsoPocion = turnoActual;
        await delay(800);
    }

    async usarPocionEnemigo(turnoActual) {
        if (turnoActual - this.ultimoUsoPocion < 2) return;
        const probabilidad = Math.random();
        if (probabilidad > 0.3) return;

        const pociones = this.inventario.items.filter(item => item instanceof Pocion);
        if (pociones.length === 0) return;

        const indiceAleatorio = Math.floor(Math.random() * pociones.length);
        const item = pociones[indiceAleatorio];
        console.log(`[ENEMIGO] ${this.nombre} usa una poción: ${item.nombre}`);
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
        console.log(` [BOTIN] ${this.nombre} obtiene el botín de ${rival.nombre}`);
    }
}
