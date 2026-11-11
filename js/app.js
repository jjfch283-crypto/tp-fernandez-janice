const API_URL = "https://rickandmortyapi.com/api/episode";

const formulario = document.querySelector("#formulario-busqueda");
const campoNombre = document.querySelector("#nombre");
const campoTemporada = document.querySelector("#temporada");
const botonBuscar = document.querySelector("#boton-buscar");
const contenedorResultados = document.querySelector("#resultados");
const mensaje = document.querySelector("#mensaje");
const contador = document.querySelector("#contador");

const mostrarMensaje = (texto) => {
  mensaje.textContent = texto;
};

const obtenerTexto = (valor) => {
  if (valor === null || valor === undefined || valor === "" || valor === "unknown") {
    return "Desconocido";
  }
  return valor;
};

const pedirEpisodios = async (nombre, temporada) => {
  const url = new URL(API_URL);

  if (nombre) {
    url.searchParams.set("name", nombre);
  }
  if (temporada) {
    url.searchParams.set("episode", temporada);
  }

  const respuesta = await fetch(url);

  if (respuesta.status === 404) {
    return [];
  }
  if (!respuesta.ok) {
    throw new Error("No se pudieron obtener los episodios. Intenta nuevamente.");
  }

  const datos = await respuesta.json();
  return datos.results;
};

const crearTarjeta = (episodio) => {
  const tarjeta = document.createElement("article");
  tarjeta.classList.add("tarjeta");

  const codigo = document.createElement("span");
  codigo.classList.add("tarjeta-codigo");
  codigo.textContent = obtenerTexto(episodio.episode);

  const titulo = document.createElement("h3");
  titulo.textContent = obtenerTexto(episodio.name);

  const fecha = document.createElement("p");
  fecha.classList.add("detalle");
  const etiquetaFecha = document.createElement("strong");
  etiquetaFecha.textContent = "Fecha de emisión: ";
  fecha.append(etiquetaFecha, document.createTextNode(obtenerTexto(episodio.air_date)));

  const personajes = document.createElement("p");
  personajes.classList.add("detalle");
  const etiquetaPersonajes = document.createElement("strong");
  etiquetaPersonajes.textContent = "Cantidad de personajes: ";
  personajes.append(etiquetaPersonajes, document.createTextNode(String(episodio.characters.length)));

  tarjeta.append(codigo, titulo, fecha, personajes);
  return tarjeta;
};

const mostrarEpisodios = (episodios) => {
  contenedorResultados.replaceChildren();

  episodios.forEach((episodio) => {
    contenedorResultados.append(crearTarjeta(episodio));
  });

  contador.textContent = `${episodios.length} episodio(s) encontrado(s)`;
};

const buscarEpisodios = async (nombre, temporada) => {
  botonBuscar.disabled = true;
  botonBuscar.textContent = "Buscando...";
  contador.textContent = "Buscando...";
  mostrarMensaje("Buscando episodios...");
  contenedorResultados.replaceChildren();

  try {
    const episodios = await pedirEpisodios(nombre, temporada);

    if (episodios.length === 0) {
      mostrarMensaje("Sin resultados. Prueba con otro nombre o temporada.");
      contador.textContent = "0 episodios";
      return;
    }

    mostrarMensaje("");
    mostrarEpisodios(episodios);
  } catch (error) {
    mostrarMensaje(`Ocurrió un error: ${error.message}`);
    contador.textContent = "No se pudo completar la búsqueda";
  } finally {
    botonBuscar.disabled = false;
    botonBuscar.textContent = "Buscar episodios";
  }
};

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const nombre = campoNombre.value.trim();
  const temporada = campoTemporada.value;

  if (!nombre && !temporada) {
    mostrarMensaje("Escribe un nombre o selecciona una temporada antes de buscar.");
    contador.textContent = "Faltan criterios";
    return;
  }

  const busqueda = { nombre, temporada };
  localStorage.setItem("ultimaBusquedaEpisodios", JSON.stringify(busqueda));
  buscarEpisodios(nombre, temporada);
});

const restaurarBusqueda = () => {
  const guardado = localStorage.getItem("ultimaBusquedaEpisodios");

  if (!guardado) {
    return;
  }

  try {
    const busqueda = JSON.parse(guardado);
    campoNombre.value = busqueda.nombre || "";
    campoTemporada.value = busqueda.temporada || "";

    if (campoNombre.value || campoTemporada.value) {
      buscarEpisodios(campoNombre.value, campoTemporada.value);
    }
  } catch (error) {
    localStorage.removeItem("ultimaBusquedaEpisodios");
    mostrarMensaje("No se pudo restaurar la búsqueda anterior.");
  }
};

restaurarBusqueda();
