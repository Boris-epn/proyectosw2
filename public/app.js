// app.js
const API_URL = 'http://localhost:3000/api';

function guardarSesion(datos) {
  localStorage.setItem('usuario', JSON.stringify(datos));
}

function obtenerSesion() {
  const raw = localStorage.getItem('usuario');
  if (!raw) return null;
  return JSON.parse(raw);
}

function cerrarSesion() {
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
}

function protegerPagina(rolNecesario) {
  const sesion = obtenerSesion();
  if (!sesion || sesion.rol !== rolNecesario) {
    window.location.href = 'index.html';
  }
  return sesion;
}
