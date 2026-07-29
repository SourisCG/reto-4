const pantalla = document.querySelector("#pantalla");
const operacionActual = document.querySelector("#operacion");
const botones = document.querySelectorAll(".boton");

const simbolosOperacion = {
  "*": "×",
  "/": "÷",
  "+": "+",
  "-": "−"
};

const estado = {
  valorMostrado: "0",
  expresion: "",
  primerOperando: null,
  operacion: null,
  esperandoSegundoOperando: false,
  resultadoMostrado: false,
  tieneError: false
};

function actualizarPantalla() {
  pantalla.textContent = estado.valorMostrado;
  operacionActual.textContent = estado.expresion || "Listo para comenzar";
}

function reiniciarEstado() {
  estado.valorMostrado = "0";
  estado.expresion = "";
  estado.primerOperando = null;
  estado.operacion = null;
  estado.esperandoSegundoOperando = false;
  estado.resultadoMostrado = false;
  estado.tieneError = false;
}

function prepararNuevoNumero() {
  estado.valorMostrado = "0";
  estado.expresion = "";
  estado.primerOperando = null;
  estado.operacion = null;
  estado.esperandoSegundoOperando = false;
  estado.resultadoMostrado = false;
  estado.tieneError = false;
}

function introducirNumero(numero) {
  if (estado.tieneError || estado.resultadoMostrado) {
    prepararNuevoNumero();
  }

  if (estado.esperandoSegundoOperando) {
    estado.valorMostrado = numero;
    estado.expresion += numero;
    estado.esperandoSegundoOperando = false;
  } else if (estado.valorMostrado === "0") {
    estado.valorMostrado = numero;

    if (!estado.expresion) {
      estado.expresion = numero;
    } else if (!estado.expresion.endsWith(` ${numero}`)) {
      estado.expresion = `${estado.expresion.slice(0, -1)}${numero}`;
    }
  } else {
    estado.valorMostrado += numero;
    estado.expresion += numero;
  }

  actualizarPantalla();
}

function realizarOperacion(primerOperando, segundoOperando, operacion) {
  switch (operacion) {
    case "+":
      return primerOperando + segundoOperando;
    case "-":
      return primerOperando - segundoOperando;
    case "*":
      return primerOperando * segundoOperando;
    case "/":
      return segundoOperando === 0 ? null : primerOperando / segundoOperando;
    default:
      return segundoOperando;
  }
}

function guardarOperacion(operacion) {
  if (estado.tieneError) {
    return;
  }

  const valorActual = Number(estado.valorMostrado);
  const simbolo = simbolosOperacion[operacion];

  if (estado.primerOperando === null) {
    estado.primerOperando = valorActual;
    estado.expresion = `${formatearResultado(valorActual)} ${simbolo} `;
  } else if (estado.operacion && !estado.esperandoSegundoOperando) {
    const resultado = realizarOperacion(estado.primerOperando, valorActual, estado.operacion);

    if (resultado === null) {
      mostrarError();
      return;
    }

    estado.valorMostrado = formatearResultado(resultado);
    estado.primerOperando = resultado;
    estado.expresion += ` ${simbolo} `;
  } else if (estado.esperandoSegundoOperando) {
    estado.expresion = estado.expresion.replace(/[+−×÷] $/, `${simbolo} `);
  }

  estado.operacion = operacion;
  estado.esperandoSegundoOperando = true;
  estado.resultadoMostrado = false;
  actualizarPantalla();
}

function mostrarResultado() {
  if (estado.tieneError || estado.primerOperando === null || !estado.operacion || estado.esperandoSegundoOperando) {
    return;
  }

  const segundoOperando = Number(estado.valorMostrado);
  const resultado = realizarOperacion(estado.primerOperando, segundoOperando, estado.operacion);

  if (resultado === null) {
    mostrarError();
    return;
  }

  estado.valorMostrado = formatearResultado(resultado);
  estado.expresion = `${estado.expresion} =`;
  estado.primerOperando = null;
  estado.operacion = null;
  estado.esperandoSegundoOperando = false;
  estado.resultadoMostrado = true;
  actualizarPantalla();
}

function formatearResultado(resultado) {
  if (Number.isInteger(resultado)) {
    return String(resultado);
  }

  return String(Number(resultado.toFixed(10)));
}

function mostrarError() {
  estado.valorMostrado = "No se puede dividir entre 0";
  estado.expresion = `${estado.expresion} = Error`;
  estado.primerOperando = null;
  estado.operacion = null;
  estado.esperandoSegundoOperando = false;
  estado.resultadoMostrado = false;
  estado.tieneError = true;
  actualizarPantalla();
}

function manejarClic(evento) {
  const boton = evento.currentTarget;
  const numero = boton.dataset.number;
  const operacion = boton.dataset.operation;
  const accion = boton.dataset.action;

  if (numero !== undefined) {
    introducirNumero(numero);
  } else if (operacion !== undefined) {
    guardarOperacion(operacion);
  } else if (accion === "equals") {
    mostrarResultado();
  } else if (accion === "clear") {
    reiniciarEstado();
    actualizarPantalla();
  }
}

botones.forEach((boton) => boton.addEventListener("click", manejarClic));
actualizarPantalla();
