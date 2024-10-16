const urlApi = "https://gateway.marvel.com";
const urlComics = "/v1/public/comics";
const urlPersonajes = "/v1/public/characters";
const publicKey = "3739784980ad41f81a7c5876474526c1";
const ts = "Holamarvel";
const hash = "507629fe3eecbcbf2c65b872698375a3";
const paramAutenticacion = `?ts=${ts}&apikey=${publicKey}&hash=${hash}`;

// Referencias a elementos del DOM
const formBusqueda = document.getElementById('formBusqueda');
const inputBusqueda = document.getElementById('inputBusqueda');
const tipoBusqueda = document.getElementById('tipoBusqueda');
const resultado = document.getElementById('resultado');
const detalles = document.getElementById('detalles');
const titulo = document.getElementById('titulo');
const imagen = document.getElementById('imagen');
const descripcion = document.getElementById('descripcion');
const infoExtra = document.getElementById('infoExtra');
const cerrarDetalles = document.getElementById('cerrarDetalles');

// Variables de paginación
let pagina = 0;
const elementosPorPagina = 25;
const btnSiguiente = document.getElementById('btnSiguiente');
const btnAnterior = document.getElementById('btnAnterior');
const paginaActual = document.getElementById('paginaActual');

// Función para mostrar resultados
function mostrarResultados(data, tipo) {
    resultado.innerHTML = '';
    const items = data.data.results;

    if (items.length === 0) {
        resultado.innerHTML = '<p class="text-center text-xl">No se encontraron resultados.</p>';
        document.getElementById('totalResultados').textContent = 'RESULTADOS: 0';
        return;
    }

    document.getElementById('totalResultados').textContent = `RESULTADOS: ${data.data.total}`;
    items.forEach((item) => {
        const divElemento = document.createElement('div');
        divElemento.classList.add('text-center', 'flex', 'flex-col', 'items-center');

        const titulo = item.title || item.name;
        const imagenSrc = item.thumbnail.path + "." + item.thumbnail.extension;
        const id = item.id;

        divElemento.innerHTML = `
            <div class="cursor-pointer w-full" data-id="${id}">
                <img src="${imagenSrc}" alt="${titulo}" class="w-full h-80 object-cover mb-2"> 
                <h3 class="text-sm font-semibold truncate">${titulo}</h3>
            </div>
        `;

        resultado.appendChild(divElemento);

        divElemento.querySelector('div').addEventListener('click', () => {
            obtenerDetalles(id, tipo);
        });
    });
}

// Función para buscar cómics o personajes
function buscar(tipo, nombre) {
    let url = `${urlApi}${tipo === 'comics' ? urlComics : urlPersonajes}${paramAutenticacion}`;
    const offset = pagina * elementosPorPagina;
    url += `&offset=${offset}&limit=${elementosPorPagina}`;

    if (nombre) {
        const queryParam = tipo === 'comics' ? 'titleStartsWith' : 'nameStartsWith';
        url += `&${queryParam}=${encodeURIComponent(nombre)}`;
    }

    fetch(url, {
        method: "GET",
        headers: {
            "content-type": "application/json",
        },
    })
    .then((response) => response.json())
    .then((data) => {
        mostrarResultados(data, tipo);
        manejarBotonesPaginacion(data.data.total);
    })
    .catch(error => console.error('Error:', error));
}

// Función para obtener detalles del cómic o personaje
function obtenerDetalles(id, tipo) {
    const url = `${urlApi}${tipo === 'comics' ? urlComics : urlPersonajes}/${id}${paramAutenticacion}`;

    fetch(url, {
        method: "GET",
        headers: {
            "content-type": "application/json",
        },
    })
    .then((response) => response.json())
    .then((data) => {
        const item = data.data.results[0];

        titulo.textContent = item.title || item.name;
        imagen.src = item.thumbnail.path + "." + item.thumbnail.extension;
        descripcion.textContent = item.description || "Descripción no disponible.";

        let extraInfo = "";
        if (tipo === 'comics') {
            extraInfo = `Número de páginas: ${item.pageCount || 'No disponible'}<br>Fecha de publicación: ${item.dates.find(d => d.type === 'onsaleDate')?.date || 'No disponible'}`;
        } else {
            extraInfo = `Número de series: ${item.series.available || 'No disponible'}`;
        }

        infoExtra.innerHTML = extraInfo;

        detalles.classList.remove('hidden');
        resultado.classList.add('hidden');
    })
    .catch(error => console.error('Error al obtener detalles:', error));
}

// Evento para cerrar detalles
cerrarDetalles.addEventListener('click', () => {
    detalles.classList.add('hidden');
    resultado.classList.remove('hidden');
});

// Evento de búsqueda
formBusqueda.addEventListener('submit', (event) => {
    event.preventDefault();
    pagina = 0; // Reiniciar a la primera página
    buscar(tipoBusqueda.value, inputBusqueda.value.trim());
});

// Evento para botones de paginación
btnSiguiente.addEventListener('click', () => {
    pagina++;
    buscar(tipoBusqueda.value, inputBusqueda.value.trim());
});

btnAnterior.addEventListener('click', () => {
    if (pagina > 0) {
        pagina--;
        buscar(tipoBusqueda.value, inputBusqueda.value.trim());
    }
});

// Manejar visibilidad de botones de paginación
function manejarBotonesPaginacion(totalResultados) {
    btnAnterior.disabled = pagina === 0;
    btnSiguiente.disabled = (pagina + 1) * elementosPorPagina >= totalResultados;
    paginaActual.textContent = pagina + 1;
}

// Cargar cómics por defecto al iniciar
window.onload = function() {
    buscar('comics', '');
};
