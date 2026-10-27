
const formularioRegistro = document.getElementById('formulario-registro');

formularioRegistro.addEventListener('submit', function (evento) {

  evento.preventDefault();

  const nombreUsuario = document.getElementById('nombre-usuario').value.trim();
  const correo = document.getElementById('correo').value.trim();
  const contrasena = document.getElementById('contrasena').value;
  const confirmarContrasena = document.getElemzentById('confirmar-contrasena').value;

  if (contrasena !== confirmarContrasena) {
    alert('Las contraseñas no coinciden.');
    return;
  } x

  alert(
    'Formulario recibido correctamente para el usuario: ' +
    nombreUsuario
  );
});