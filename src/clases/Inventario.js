import { Arma } from "./Arma.js";
import { Pocion } from "./Pocion.js";

export class Inventario {
    constructor() {
        this.items = [];
    }

    agregarItem(item) {
        this.items.push(item);
        console.log(` [INVENTARIO] Se agregó ${item.nombre} al inventario`);
    }

    mostrarInventario() {
        console.log(" Inventario:");
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
