const normalizarTexto = (texto) => {
  return String(texto || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const redondear = (valor, decimales = 6) => {
  return Number(Number(valor).toFixed(decimales));
};

const calcularFactores = (actorNombre, variables) => {
  const actor = normalizarTexto(actorNombre);

  const v1 = Number(variables.v1);
  const v2 = Number(variables.v2);
  const v3 = Number(variables.v3);
  const v4 = Number(variables.v4);
  const v5 = Number(variables.v5);
  const v6 = Number(variables.v6);
  const v7 = Number(variables.v7);
  const v8 = Number(variables.v8);
  const v9 = Number(variables.v9);
  const v10 = Number(variables.v10);
  const v11 = Number(variables.v11);

  const f1 = 0.5 * v1 + 0.5 * v2;
  const f2 = 0.5 * v3 + 0.5 * v4;

  let f3 = 0;
  let f4 = 0;
  let total = 0;

  if (actor === 'disposicion final') {
    f3 = (1 / 3) * v5 + (1 / 3) * v6 + (1 / 3) * v7;
    f4 = 0.25 * v8 + 0.25 * v9 + 0.25 * v10 + 0.25 * v11;
    total = 0.212 * f1 + 0.316 * f2 + 0.211 * f3 + 0.261 * f4;
  } else if (actor === 'recolectores') {
    f3 = 0.5 * v5 + 0.5 * v6;
    f4 = 0.2 * v7 + 0.2 * v8 + 0.2 * v9 + 0.2 * v10 + 0.2 * v11;
    total = 0.18 * f1 + 0.27 * f2 + 0.216 * f3 + 0.334 * f4;
  } else if (actor === 'generadores') {
    f3 = (1 / 3) * v5 + (1 / 3) * v6 + (1 / 3) * v7;
    f4 = 0.25 * v8 + 0.25 * v9 + 0.25 * v10 + 0.25 * v11;
    total = 0.263 * f1 + 0.26 * f2 + 0.263 * f3 + 0.214 * f4;
  } else {
    throw new Error(`No existe fórmula configurada para el actor "${actorNombre}"`);
  }

  return {
    f1: redondear(f1),
    f2: redondear(f2),
    f3: redondear(f3),
    f4: redondear(f4),
    total: redondear(total)
  };
};

module.exports = {
  calcularFactores,
  redondear,
  normalizarTexto
};