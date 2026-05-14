export type Derivacion = {
  nombre: string;
  telefono: string;
  descripcion: string;
};

export const DERIVACIONES_PRIORITARIAS: Derivacion[] = [
  {
    nombre: "Línea 100",
    telefono: "100",
    descripcion:
      "Atención gratuita 24/7 ante violencia familiar, sexual o psicológica.",
  },
  {
    nombre: "Línea AMA 113 opción 5",
    telefono: "113",
    descripcion:
      "Salud mental y prevención del suicidio del Ministerio de Salud.",
  },
  {
    nombre: "CEM (Centro Emergencia Mujer)",
    telefono: "",
    descripcion:
      "Atención psicológica, social y legal ante violencia. CEM Chincha: Av. Mariscal Castilla 545.",
  },
  {
    nombre: "DEMUNA Chincha",
    telefono: "",
    descripcion:
      "Defensoría Municipal del Niño y Adolescente. Plaza de Armas, Chincha Alta.",
  },
  {
    nombre: "Centro de Salud El Carmen",
    telefono: "",
    descripcion:
      "Establecimiento de salud local con atención diferenciada para adolescentes.",
  },
];

export function bloqueDerivacion(): string {
  const lineas = DERIVACIONES_PRIORITARIAS.map((d) => {
    const tel = d.telefono ? ` (📞 ${d.telefono})` : "";
    return `• *${d.nombre}*${tel} — ${d.descripcion}`;
  });
  return [
    "💚 *Buscar ayuda profesional:*",
    ...lineas,
    "Si la situación es urgente, contacta al *Centro de Salud más cercano* o llama al *106 (SAMU)*.",
  ].join("\n");
}
