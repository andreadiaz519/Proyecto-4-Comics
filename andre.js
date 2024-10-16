const urlApi = "https://gateway.marvel.com";
const urlComics = "/v1/public/comics";
const urlPersonajes = "/v1/public/characters";
const publicKey = "3739784980ad41f81a7c5876474526c1";
const ts = "Holamarvel";
const hash = "507629fe3eecbcbf2c65b872698375a3";
const paramAutenticacion = `?ts=${ts}&apikey=${publicKey}&hash=${hash}`;

// DOM
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
const fecha = document.getElementById('fecha');
const guionistas = document.getElementById('guionistas');
const personajes = document.getElementById('personajes');

// Variables de paginación
let pagina = 0;
let totalResultados = 0;
const elementosPorPagina = 20;  // Ahora se muestran 20 elementos por página
const btnSiguiente = document.getElementById('btnSiguiente');
const btnAnterior = document.getElementById('btnAnterior');
const btnPrimera = document.getElementById('btnPrimera');
const btnUltima = document.getElementById('btnUltima');
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

    totalResultados = data.data.total;
    document.getElementById('totalResultados').textContent = `RESULTADOS: ${totalResultados}`;
    
    items.forEach((item) => {
        const divElemento = document.createElement('div');
        divElemento.classList.add('text-center', 'flex', 'flex-col', 'items-center');

        const tituloItem = item.title || item.name;
        const imagenSrc = `${item.thumbnail.path}.${item.thumbnail.extension}`;
        const id = item.id;

        divElemento.innerHTML = `
            <div class="cursor-pointer w-full" data-id="${id}" data-fecha="${item.modified}">
                <img src="${imagenSrc}" alt="${tituloItem}" class="w-full h-80 object-cover mb-2"> 
                <h3 class="text-sm font-semibold truncate">${tituloItem}</h3>
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

    resultado.innerHTML = '<p class="text-center text-xl">Cargando...</p>';

    fetch(url, {
        method: "GET",
        headers: {
            "content-type": "application/json",
        },
    })
    .then((response) => {
        if (!response.ok) throw new Error('Error en la red');
        return response.json();
    })
    .then((data) => {
        mostrarResultados(data, tipo);
        manejarBotonesPaginacion();
    })
    .catch(error => {
        console.error('Error:', error);
        resultado.innerHTML = '<p class="text-center text-xl text-red-500">Error al cargar los datos.</p>';
    });
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
    .then((response) => {
        if (!response.ok) throw new Error('Error en la red');
        return response.json();
    })
    .then((data) => {
        const item = data.data.results[0];

        titulo.textContent = item.title || item.name;
        imagen.src = `${item.thumbnail.path}.${item.thumbnail.extension}`;
        descripcion.textContent = item.description || "Descripción no disponible.";

        if (tipo === 'comics') {
            // Mostrar detalles específicos de cómics
            fecha.textContent = `Fecha de publicación: ${item.dates.find(d => d.type === 'onsaleDate')?.date || 'No disponible'}`;
            guionistas.textContent = `Guionistas: ${item.creators.items.map(creator => creator.name).join(', ') || 'No disponible'}`;
            personajes.textContent = `Personajes incluidos: ${item.characters.items.map(character => character.name).join(', ') || 'No disponible'}`;
        } else {
            // Mostrar detalles específicos de personajes
            fecha.textContent = "";  // No aplica para personajes
            guionistas.textContent = "";  // No aplica para personajes
            personajes.textContent = `Cómics relacionados: ${item.comics.items.map(comic => comic.name).join(', ') || 'No disponible'}`;
        }

        detalles.classList.remove('hidden');
        resultado.classList.add('hidden');
    })
    .catch(error => {
        console.error('Error al obtener detalles:', error);
        alert('Error al cargar los detalles.');
    });
}

// Función para manejar botones de paginación
function manejarBotonesPaginacion() {
    const ultimaPagina = Math.ceil(totalResultados / elementosPorPagina) - 1;
    
    btnAnterior.disabled = pagina === 0;
    btnSiguiente.disabled = pagina >= ultimaPagina;
    btnPrimera.disabled = pagina === 0;
    btnUltima.disabled = pagina >= ultimaPagina;
    paginaActual.textContent = pagina + 1;
}

// Evento para cerrar detalles
cerrarDetalles.addEventListener('click', () => {
    detalles.classList.add('hidden');
    resultado.classList.remove('hidden');
});

// Eventos de paginación
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

btnPrimera.addEventListener('click', () => {
    pagina = 0;
    buscar(tipoBusqueda.value, inputBusqueda.value.trim());
});

btnUltima.addEventListener('click', () => {
    pagina = Math.ceil(totalResultados / elementosPorPagina) - 1;
    buscar(tipoBusqueda.value, inputBusqueda.value.trim());
});

// Evento de búsqueda
formBusqueda.addEventListener('submit', (event) => {
    event.preventDefault();
    pagina = 0; // Reiniciar a la primera página
    buscar(tipoBusqueda.value, inputBusqueda.value.trim());
});

// Cargar cómics por defecto al iniciar
window.onload = function() {
    buscar('comics', '');
};