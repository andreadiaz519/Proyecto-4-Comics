const urlApi = "https://gateway.marvel.com";
const urlPersonajes = "/v1/public/characters";
const urlComics = "/v1/public/comics"
const publicKey = "3739784980ad41f81a7c5876474526c1";
const ts = "Holamarvel";
const hash = "507629fe3eecbcbf2c65b872698375a3";
const paramAutenticacion = `?ts=${ts}&apikey=${publicKey}&hash=${hash}`;

// fetch(urlApi + urlPersonajes + paramAutenticacion, { 
//     method: "GET",
//     headers: {
//         // Authorization: ${publicKey},
//         "content-type": "application/json",
//     },
//     })

// .then((response) => response.json())
// .then((data) => console.log(data))
// .catch(error => console.error(error));


// Referencias a los elementos del DOM
const formBusqueda = document.getElementById('formBusqueda');
const inputBusqueda = document.getElementById('inputBusqueda');
const tipoBusqueda = document.getElementById('tipoBusqueda');
const resultado = document.getElementById('resultado');
const detalles = document.getElementById('detalles');
const titulo = document.getElementById('titulo');
const imagen = document.getElementById('imagen');
const descripcion = document.getElementById('descripcion');
const cerrarDetalles = document.getElementById('cerrarDetalles');

// Función para renderizar los resultados (comics/personajes)
function mostrarResultados(data, tipo) {
  resultado.innerHTML = ''; // Limpiamos el contenedor de resultados

    const items = data.data.results;

    if (items.length === 0) {
    resultado.innerHTML = '<p class="text-center text-xl">No se encontraron resultados.</p>';
    return;
}

  // Iterar sobre los resultados y crear tarjetas
    items.slice(0, 20).forEach((item) => {
        const card = document.createElement('div');
        card.classList.add('text-center', 'flex', 'flex-col', 'itmes-center');

    const titulo = item.title || item.name;
    const imagenSrc = item.thumbnail.path + "." + item.thumbnail.extension;
    const id = item.id;

    // Crear las tarjetas
    card.innerHTML = `
    <div class="cursor-pointer mb-4" data-id="${id}">
        <img src="${imagenSrc}" alt="${titulo}" class="w-full h-80 object-cover mb-2">
        <h3 class="text-sm font-semibold truncate mb-4">${titulo}</h3>
    </div>
    `;

    resultado.appendChild(card);

    // Evento para mostrar detalles
    card.querySelector('div').addEventListener('click', () => {
    obtenerDetalles(id, tipo);
    });
    });
}


// Función para buscar cómics o personajes según el tipo
function buscar(tipo, nombre) {
    let url = `${urlApi}${tipo === 'comics' ? urlComics : urlPersonajes}${paramAutenticacion}`;

    // Si hay un término de búsqueda, agregar el filtro
    if (nombre) {
        const queryParam = tipo === 'comics' ? 'titleStartsWith' : 'nameStartsWith';
        url += `&${queryParam}=${nombre}`;
    }

    fetch(url, { 
        method: "GET",
        headers: {
        "content-type": "application/json",
    },
})
    .then((response) => response.json())
    .then((data) => mostrarResultados(data, tipo))
    .catch(error => console.error('Error:', error));
}

  // Función para obtener los detalles del cómic o personaje seleccionado
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

    detalles.classList.remove('hidden');
    resultado.classList.add('hidden');
    })
    .catch(error => console.error('Error al obtener detalles:', error));
}

  // Evento para cerrar la sección de detalles
cerrarDetalles.addEventListener('click', () => {
    detalles.classList.add('hidden');
    resultado.classList.remove('hidden');
});

  // Evento de envío del formulario
formBusqueda.addEventListener('submit', (event) => {
    event.preventDefault();
    const nombre = inputBusqueda.value.trim();
    const tipo = tipoBusqueda.value; // 'comics' o 'characters'

    buscar(tipo, nombre);
});

  // Llamar a la función para cargar los cómics al cargar la página
window.onload = function() {
    buscar('comics'); // Cargar cómics por defecto
}