---
marp: true
theme: default
paginate: true
header: "Proyectos Interdisciplinarios 3 — UTEC"
footer: "Agente RAG para Orientación Sexual Anónima"
style: |
  section {
    background-color: #f8fafc;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #1f2937;
    padding: 50px;
  }

  h1 {
    color: #0f172a;
    font-size: 2.1em;
    margin-bottom: 0.3em;
    border-bottom: 3px solid #0f766e;
    padding-bottom: 10px;
  }

  h2 {
    color: #0f766e;
    font-size: 1.35em;
    margin-top: 0.4em;
  }

  h3 {
    color: #134e4a;
  }

  p, li {
    font-size: 1em;
    line-height: 1.5;
  }

  strong {
    color: #111827;
  }

  blockquote {
    border-left: 5px solid #0f766e;
    background: #ecfeff;
    padding: 12px 18px;
    border-radius: 6px;
    font-size: 0.95em;
  }

  table {
    font-size: 0.9em;
  }

  .card {
    background: white;
    border-radius: 10px;
    padding: 18px;
    box-shadow: 0 3px 8px rgba(0,0,0,0.06);
    margin-top: 12px;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }

  .accent {
    color: #0f766e;
    font-weight: bold;
  }

  .small {
    font-size: 0.82em;
  }
---

# Implementación de un Agente RAG

## Orientación sexual anónima para adolescentes

### Integrantes
- Joel Cayllahua
- Abel Escobar
- Piero Pilco
- Leonardo Montoya
- Luis Maquera

### Docente
Giancarlo Espinoza Delgado

### Lugar de implementación
El Carmen, Ica

---

# 1. Usuario Objetivo

## Perfil principal

Adolescentes de **13 a 19 años** residentes en **El Carmen (Ica)**.

### Características del contexto

- Entornos rurales con fuerte presión social y juicio moral.
- Acceso frecuente a teléfonos inteligentes.
- Uso habitual de internet para resolver dudas personales.
- Baja disposición a consultar presencialmente temas sensibles.

<div class="card">

### Caso representativo

**Miguel Flores, 16 años**

Evita consultar en centros de salud o farmacias locales por miedo a ser reconocido.  
Busca información durante la noche desde su celular para mantener privacidad y anonimato.

</div>

---

# Mapa de Empatía

<div class="grid-2">

<div class="card">

### ¿Qué piensa y siente?

- Temor al rechazo social.
- Inseguridad al hablar de sexualidad.
- Desconfianza hacia adultos del entorno.

</div>

<div class="card">

### ¿Qué hace actualmente?

- Busca información en Google y redes sociales.
- Obtiene respuestas contradictorias.
- Formula preguntas indirectas para evitar exposición.

</div>

</div>

---

# 2. Problema Identificado

Los adolescentes de El Carmen enfrentan una **limitación de acceso a orientación sexual confiable** debido al miedo al estigma social.

> Necesitan un canal seguro, inmediato y completamente anónimo que permita resolver dudas sin exposición pública.

<div class="card">

### Consecuencias observadas

- Desinformación sobre salud sexual.
- Mayor riesgo de ETS.
- Embarazos adolescentes no planificados.
- Retraso en la búsqueda de ayuda profesional.

</div>

---

# Pregunta de Diseño

## ¿Cómo podríamos...?

- Brindar orientación confiable sin generar temor al juicio social.
- Garantizar disponibilidad permanente del servicio.
- Detectar casos que requieran derivación médica.
- Facilitar el acceso desde herramientas ya conocidas por el usuario.

---

# 3. Evaluación de Soluciones

## Matriz de selección

| Alternativa | Innovación | Viabilidad |
|:--|:--:|:--:|
| **Agente RAG vía WhatsApp** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Chatbot de flujo fijo | ⭐⭐ | ⭐⭐⭐⭐ |
| Telemedicina tradicional | ⭐⭐⭐ | ⭐⭐ |
| Buzón físico anónimo | ⭐ | ⭐⭐ |

<div class="card">

### Criterio de selección

Se priorizó:

- Facilidad de acceso.
- Bajo costo de implementación.
- Capacidad de responder preguntas abiertas.
- Adaptabilidad a consultas reales.

</div>

---

# 4. Solución Propuesta

# Agente RAG especializado vía WhatsApp

Sistema conversacional basado en arquitectura **Retrieval-Augmented Generation (RAG)**.

El agente responde utilizando únicamente información médica previamente validada.

---

# Componentes Principales

<div class="grid-2">

<div class="card">

### WhatsApp como canal

- Plataforma familiar para adolescentes.
- No requiere instalar nuevas aplicaciones.
- Reduce barreras de adopción.

</div>

<div class="card">

### Arquitectura RAG

- Consulta documentos médicos especializados.
- Reduce respuestas incorrectas o inventadas.
- Mejora precisión y confiabilidad.

</div>

</div>

---

# Valor Diferencial

<div class="grid-2">

<div class="card">

### Anonimato

El usuario puede consultar sin revelar identidad ni acudir físicamente a un centro de salud.

</div>

<div class="card">

### Triaje Inteligente

El sistema puede identificar situaciones sensibles y recomendar atención profesional cuando sea necesario.

</div>

</div>

---

# Impacto Esperado

## Para los adolescentes

- Espacio seguro para resolver dudas.
- Acceso rápido a información confiable.
- Reducción del miedo y la desinformación.

## Para el sistema de salud

- Disminución de consultas repetitivas.
- Prevención temprana.
- Mejor canal de comunicación con jóvenes.

---

# 5. Objetivo General

> Implementar un prototipo digital de orientación sexual anónima que reduzca las barreras sociales de acceso mediante inteligencia artificial y procesamiento de lenguaje natural.

---

# Objetivos Esperados

- Reducir riesgos asociados a desinformación sexual.
- Fortalecer el acceso temprano a orientación preventiva.
- Generar un modelo replicable en comunidades rurales.
- Integrar tecnología accesible con enfoque social.

---

# Conclusión

## Propuesta de Valor

El proyecto combina:

- Inteligencia artificial
- Acceso anónimo
- Información médica validada
- Uso de plataformas cotidianas

para abordar una problemática social con impacto directo en salud preventiva juvenil.

---

# Gracias

## ¿Preguntas?

### Proyecto
Agente RAG para Orientación Sexual Anónima

### Curso
Proyectos Interdisciplinarios 3 — UTEC