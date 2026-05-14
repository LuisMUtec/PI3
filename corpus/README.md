# Corpus médico — fuentes para el agente RAG

Toda respuesta del agente debe poder citarse a una de estas fuentes oficiales.
Los PDFs descargados van a `corpus/raw/` (ignorado por git por tamaño).
Los archivos `.md` curados (o convertidos desde PDF) van a la raíz de `corpus/`
para que el script de ingesta los procese.

## Estructura

```
corpus/
├── raw/                 # PDFs originales (gitignored)
├── minsa/               # Markdown curado MINSA Perú
├── oms/                 # Markdown curado OMS / OPS
├── unfpa/               # Markdown curado UNFPA / UNICEF
└── curado/              # Material curado manualmente por el equipo
```

Cada `.md` debe iniciar con frontmatter YAML:

```yaml
---
source: MINSA            # MINSA | OMS | OPS | UNFPA | UNICEF | CURADO
document_title: Guía de atención integral de salud sexual y reproductiva
url: https://bvs.minsa.gob.pe/local/MINSA/...
fecha: 2023-05
organismo: Ministerio de Salud del Perú
---
```

## Fuentes prioritarias

### MINSA Perú
- Documento Técnico: Lineamientos de Política de Salud de Adolescentes
  https://bvs.minsa.gob.pe/local/MINSA/1262_DGSP167.pdf
- Guía Nacional de Atención Integral de Salud Sexual y Reproductiva
  https://bvs.minsa.gob.pe/local/MINSA/3989.pdf
- Norma Técnica de Planificación Familiar (R.M. N° 652-2016/MINSA)
  https://bvs.minsa.gob.pe/local/MINSA/4191.pdf

### OMS / OPS
- Salud sexual y reproductiva del adolescente (OPS)
  https://www.paho.org/es/temas/salud-adolescente
- Recomendaciones sobre prácticas seleccionadas para uso de anticonceptivos (OMS)
  https://www.who.int/es/publications/i/item/9789241565400

### UNFPA / UNICEF
- Embarazo en adolescentes — UNFPA América Latina
  https://lac.unfpa.org/es/temas/embarazo-adolescente
- Salud y desarrollo de los adolescentes — UNICEF
  https://www.unicef.org/lac/salud-adolescente

### Curado manualmente
Resúmenes redactados por el equipo para temas frecuentes en el contexto rural
de El Carmen (Ica) — siempre con cita a una fuente oficial.

## Reglas para el curado

1. Lenguaje accesible para adolescentes 13–19 años.
2. Sin moralización, sin asunciones de género u orientación.
3. Cada afirmación clínica debe trazarse a la fuente del frontmatter.
4. Evitar dosis específicas de medicamentos (derivar a profesional).
5. Marcar señales de alarma que ameriten derivación inmediata.
