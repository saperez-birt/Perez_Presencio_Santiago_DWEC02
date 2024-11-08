import { GastoCombustible } from "./components/GastoCombustible.js";

// ------------------------------ 1. VARIABLES GLOBALES ------------------------------
let tarifasJSON = null;
let gastosJSON = null;
/* Las rutas relativas en JavaScript se interpretan en función de la ubicación del archivo HTML que carga el script */
let tarifasJSONpath = './data/tarifasCombustible.json';
let gastosJSONpath = './data/gastosCombustible.json';

// ------------------------------ 2. CARGA INICIAL DE DATOS (NO TOCAR!) ------------------------------
// Esto inicializa los eventos del formulario y carga los datos iniciales
document.addEventListener('DOMContentLoaded', async () => {
    // Cargar los JSON cuando la página se carga, antes de cualquier interacción del usuario
    await cargarDatosIniciales();

    // mostrar datos en consola
    console.log('Tarifas JSON: ', tarifasJSON.tarifas);
    console.log('Gastos JSON: ', gastosJSON);

    calcularGastoTotal();

    // Inicializar eventos el formularios
    document.getElementById('fuel-form').addEventListener('submit', guardarGasto);
});

// Función para cargar ambos ficheros JSON al cargar la página
async function cargarDatosIniciales() {

    try {
        // Esperar a que ambos ficheros se carguen
        tarifasJSON = await cargarJSON(tarifasJSONpath);
        gastosJSON = await cargarJSON(gastosJSONpath);

    } catch (error) {
        console.error('Error al cargar los ficheros JSON:', error);
    }
}

/*  */
// Función para cargar un JSON desde una ruta específica
async function cargarJSON(path) {
    /* fetch(url) realiza una solicitud HTTP para obtener el recurso ubicado
    en la URL proporcionada. Pausamos la ejecucion hasta que la promesa devuelta
    por fetch se resuelva */
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Error al cargar el archivo JSON: ${path}`);
    }
    /* json() convierte el cuerpo de una respuesta HTTP en JSON.
        Debido a que esta conversion puede tardar un poco dependiendo 
        del tamaño del fichero, utilizamos await para que pause la ejecucion
        hasta que los datos JSON esten completamente disponibles. */
    return await response.json();
}

// ------------------------------ 3. FUNCIONES ------------------------------
// Calcular gasto total por año al iniciar la aplicación
function calcularGastoTotal() {
    // array asociativo con clave=año y valor=gasto total
    let aniosArray = {
        2010: 0,
        2011: 0,
        2012: 0,
        2013: 0,
        2014: 0,
        2015: 0,
        2016: 0,
        2017: 0,
        2018: 0,
        2019: 0,
        2020: 0
    }
    let i = 0;

    /* Controla que al crear una nueva fecha no haya un error.
    Su constructor devuelve Nan o "Invalid Date".
    Tambien controla si se ingresa un año que no
    esta entre los del array. */
    for (let gasto of gastosJSON) {
        const anio = new Date(gasto.date).getFullYear();
        if (isNaN(anio) || aniosArray[anio] === undefined) {
            console.log("Fecha erronea.")
        } else {
            // Se podria redondear las sumas en lugar de utilizar toFixed(2) para representarlo.
            //aniosArray[anio] = Math.round((aniosArray[anio] + gasto.precioViaje) * 100) / 100;
            aniosArray[anio] += gasto.precioViaje;
        }
    }

    // Comprueba que el elemento existe y modifica el contenido su contenido
    for (let anio in aniosArray) {
        const elemento = document.getElementById(`gasto${anio}`);
        if (elemento) {
            document.getElementById(`gasto${anio}`).innerText = aniosArray[anio].toFixed(2);
        } else {
            console.log(`El elemento gasto${anio} no existe.`)
        }
    }
/*  
    PRUEBAS BUCLES
    for (let i = 0; i < gastosJSON.length; i++) {
        console.log(gastosJSON[i]);
    }

    for (let gasto in gastosJSON) {
        console.log(gasto);
    }

    gastosJSON.forEach(gasto => {
    console.log(gasto);
    });

    gastosJSON.map((gasto) => {
        console.log(gasto);
    });

    for (let gasto of gastosJSON) {
        for (let key in gasto) {
            console.log(`${key}: ${gasto[key]}`);
        }
    } */
}

// guardar gasto introducido y actualizar datos
function guardarGasto(event) {
    event.preventDefault(); 

    // Obtener los datos del formulario
    const tipoVehiculo = document.getElementById('vehicle-type').value;
    const fecha = new Date(document.getElementById('date').value);
    const kilometros = parseFloat(document.getElementById('kilometers').value);

    // Calcular y obtener el precio de viaje
    let precioViaje = 0;
    for (let tarifa of tarifasJSON.tarifas) {
        if (fecha.getFullYear() === tarifa.anio) {
            for (let vehiculo in tarifa.vehiculos) {
                if (tipoVehiculo == vehiculo) {
                   precioViaje = kilometros * tarifa.vehiculos[vehiculo];
                }
            }
        }
    }
    const nuevoGasto = new GastoCombustible(tipoVehiculo, fecha.toISOString(), kilometros, precioViaje);
    console.log(nuevoGasto);

    gastosJSON.push(nuevoGasto.convertToJSON());
    console.log(gastosJSON);

    const gastosRecientesContainer = document.getElementById('expense-list'); // Asegúrate de que este ID exista en tu HTML
    const nuevaFila = document.createElement('li');
    nuevaFila.textContent = JSON.stringify(nuevoGasto, null, 2); // Asegúrate de formatear esto correctamente según lo que quieras mostrar
    gastosRecientesContainer.appendChild(nuevaFila);

    calcularGastoTotal();
    document.getElementById("fuel-form").reset();
}
