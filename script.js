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
  tokens: [],
  numeroActual: "",
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
  estado.tokens = [];
  estado.numeroActual = "";
  estado.resultadoMostrado = false;
  estado.tieneError = false;
}

function prepararNuevoNumero() {
  estado.valorMostrado = "0";
  estado.expresion = "";
  estado.tokens = [];
  estado.numeroActual = "";
  estado.resultadoMostrado = false;
  estado.tieneError = false;
}

function introducirNumero(numero) {
  if (estado.tieneError || estado.resultadoMostrado) {
    prepararNuevoNumero();
  }

  if (estado.numeroActual === "0") {
    estado.numeroActual = numero;
  } else {
    estado.numeroActual += numero;
  }

  estado.valorMostrado = estado.numeroActual;
  actualizarExpresion();
}

function guardarOperacion(operacion) {
  if (estado.tieneError) {
    return;
  }

  if (estado.resultadoMostrado) {
    estado.tokens = [Number(estado.valorMostrado)];
    estado.numeroActual = estado.valorMostrado;
    estado.expresion = estado.valorMostrado;
    estado.resultadoMostrado = false;
  }

  if (estado.numeroActual !== "") {
    estado.tokens.push(Number(estado.numeroActual));
    estado.numeroActual = "";
  }

  if (estado.tokens.length === 0) {
    estado.tokens.push(0);
  }

  const ultimoToken = estado.tokens[estado.tokens.length - 1];

  if (esOperador(ultimoToken)) {
    estado.tokens[estado.tokens.length - 1] = operacion;
  } else {
    estado.tokens.push(operacion);
  }

  actualizarExpresion();
}

function mostrarResultado() {
  const tokensParaCalcular = [...estado.tokens];

  if (estado.numeroActual !== "") {
    tokensParaCalcular.push(Number(estado.numeroActual));
  }

  if (tokensParaCalcular.length < 3 || esOperador(tokensParaCalcular.at(-1))) {
    return;
  }

  const expresionCompleta = renderizarTokens(tokensParaCalcular);
  const resultado = evaluarExpresion(tokensParaCalcular);

  if (resultado === null) {
    mostrarError(`${expresionCompleta} = Error`);
    return;
  }

  estado.valorMostrado = formatearResultado(resultado);
  estado.expresion = `${expresionCompleta} =`;
  estado.tokens = [];
  estado.numeroActual = estado.valorMostrado;
  estado.resultadoMostrado = true;
  actualizarPantalla();
}

function evaluarExpresion(tokens) {
  const valores = [...tokens];

  for (let indice = 1; indice < valores.length - 1; indice += 2) {
    const operacion = valores[indice];

    if (operacion !== "*" && operacion !== "/") {
      continue;
    }

    const primerOperando = valores[indice - 1];
    const segundoOperando = valores[indice + 1];

    if (operacion === "/" && segundoOperando === 0) {
      return null;
    }

    const resultado = operacion === "*"
      ? primerOperando * segundoOperando
      : primerOperando / segundoOperando;

    valores.splice(indice - 1, 3, resultado);
    indice -= 2;
  }

  let resultado = valores[0];

  for (let indice = 1; indice < valores.length; indice += 2) {
    resultado = valores[indice] === "+"
      ? resultado + valores[indice + 1]
      : resultado - valores[indice + 1];
  }

  return resultado;
}

function actualizarExpresion() {
  const tokensVisibles = [...estado.tokens];

  if (estado.numeroActual !== "") {
    tokensVisibles.push(Number(estado.numeroActual));
  }

  estado.expresion = renderizarTokens(tokensVisibles);
  actualizarPantalla();
}

function renderizarTokens(tokens) {
  return tokens.map((token) => {
    if (typeof token === "number") {
      return formatearResultado(token);
    }

    return simbolosOperacion[token];
  }).join(" ");
}

function esOperador(token) {
  return typeof token === "string";
}

function formatearResultado(resultado) {
  if (Number.isInteger(resultado)) {
    return String(resultado);
  }

  return String(Number(resultado.toFixed(10)));
}

function mostrarError(expresion) {
  estado.valorMostrado = "No se puede dividir entre 0";
  estado.expresion = expresion;
  estado.tokens = [];
  estado.numeroActual = "";
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
