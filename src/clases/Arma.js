export class Arma {
    #tipo
    
    constructor(nombre_arma, tipo, danio, alcance, min_nivel) {
        this.nombre_arma = nombre_arma;
        this.#tipo = tipo;
        this.danio = danio;
        this.alcance = alcance;
        this.min_nivel = min_nivel;
    }

    sacarArma() {
        console.log(`[ACCION] ${this.nombre_arma} fue sacada lista para la batalla`);
    }

    guardarArma() {
        console.log(`[ACCION] ${this.nombre_arma} fue guardada`);
    }
}
