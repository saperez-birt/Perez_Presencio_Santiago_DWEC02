export class GastoCombustible {
    constructor(vehicleType, date, kilometers, precioViaje) {
        this.vehicleType = vehicleType;
        this.date = date;
        this.kilometers = kilometers;
        this.precioViaje = precioViaje;
    }

    convertToJSON() {
        return {
            vehicleType: this.vehicleType,
            date: this.date,
            kilometers: this.kilometers,
            precioViaje: parseFloat(this.precioViaje.toFixed(2))
        };
    }
}