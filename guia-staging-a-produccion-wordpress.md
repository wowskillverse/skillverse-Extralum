# Guía paso a paso: de Staging a Producción (WordPress)

## 0) Preguntas clave para el cliente (antes de empezar)

Usa este bloque como formulario inicial. Si estas respuestas no están claras, el proyecto se bloquea más adelante.

### Accesos y propiedad
- ¿Quién es el dueño del dominio y del DNS?
- ¿Quién administra el hosting actual?
- ¿Tienen acceso a panel de hosting (cPanel, Plesk, CloudPanel, etc.)?
- ¿Tienen acceso admin de WordPress en producción?
- ¿Tienen acceso al repositorio de código actual (GitHub/GitLab/Bitbucket)?
- ¿Quién aprueba cambios en contenido, SEO, diseño y publicación?

### Ambiente de staging
- ¿Ya existe subdominio para staging? (ej: `staging.tudominio.com`)
- Si no existe, ¿podemos crearlo en DNS y hosting?
- ¿Staging estará protegido con contraseña/IP allowlist?
- ¿Staging debe copiar base de datos + media + plugins de producción?
- ¿Quieren staging en otro hosting o en el mismo servidor?

### Código y arquitectura actual
- ¿El sitio actual usa tema propio, tema comercial, page builder (Elementor/Avada), o mezcla?
- ¿Tienen tema hijo configurado?
- ¿Hay despliegue por Git o todo se sube manualmente?
- ¿Existen mu-plugins o personalizaciones fuera del tema/plugin principal?

### Analytics, tags y conversiones
- ¿Usan GA4, GTM, Meta Pixel, LinkedIn Insight u otras etiquetas?
- ¿Cuáles eventos y conversiones son críticos de mantener?
- ¿Quién tiene acceso a GA4/GTM/Search Console?
- ¿Tienen documentación actual de eventos/embudos?
- ¿Hay reportes de negocio que dependan de URLs específicas?

### SEO y URLs
- ¿Cuáles URLs son críticas para no afectar tráfico orgánico?
- ¿Se mantendrán exactamente los mismos slugs en el rediseño?
- ¿Hay redirects existentes que debamos conservar?
- ¿Tienen sitemap y Search Console activos?
- ¿Tienen requerimientos de SEO local, multilenguaje o schema?

### Contenido y funcionalidad
- ¿Qué páginas entran en fase 1 (MVP) y cuáles en fases siguientes?
- ¿Qué contenido (videos, imágenes, PDFs) ya está final y aprobado?
- ¿Hay formularios, CRM, chat, WhatsApp, e-commerce o integraciones externas?
- ¿Hay requisitos legales: cookies, consentimiento, privacidad, términos?

### Operación y seguridad
- ¿Quién maneja backups y rollback?
- ¿Cuál es la ventana de mantenimiento para pasar a producción?
- ¿Hay restricciones de firewall, WAF, CDN (Cloudflare), o cache de servidor?
- ¿Cuál es el SLA esperado después del go-live?

### Criterios de éxito (de negocio)
- ¿Cómo se define éxito en 7, 30 y 90 días?
- ¿Qué KPI no puede bajar al publicar? (sesiones, leads, conversion rate, etc.)
- ¿Qué baseline usarán para comparar resultados?

---

## 1) Pipeline recomendado (resumen)

1. Descubrimiento + accesos  
2. Preparar staging seguro  
3. Tomar baseline técnico/SEO/analytics  
4. Desarrollar y migrar por fases  
5. QA funcional + SEO + tracking  
6. UAT con cliente  
7. Plan de release y rollback  
8. Go-live controlado  
9. Monitoreo post-producción

---

## 2) Paso a paso detallado

## Paso 1: Kickoff y control de accesos
- Consolidar respuestas del bloque de preguntas clave.
- Crear matriz de accesos (dominio, hosting, WP admin, repositorio, analytics).
- Definir responsables por área: desarrollo, contenido, SEO, analytics, aprobación final.
- Definir alcance de fase 1 y backlog de siguientes fases.

**Entregable:** Documento de alcance + matriz de accesos + responsables.

## Paso 2: Crear staging
- Crear subdominio `staging`.
- Crear entorno WordPress espejo (misma versión PHP/MySQL idealmente).
- Clonar sitio de producción (DB + `wp-content`).
- Configurar protección de acceso (basic auth o restricción IP).
- Forzar `noindex` en staging.

**Checklist mínimo:**
- Staging abre correctamente.
- Login funciona.
- Medios y plugins cargan.
- No indexa en motores de búsqueda.

## Paso 3: Baseline (antes de tocar nada)
- Exportar medición actual:
  - GA4 (tráfico, conversiones, páginas top).
  - Search Console (consultas, cobertura, errores).
  - Lighthouse/Web Vitals de páginas clave.
- Mapear URLs críticas y redirects vigentes.
- Inventariar scripts de terceros y eventos activos.

**Entregable:** Baseline comparativo pre-rediseño.

## Paso 4: Estrategia técnica de implementación
- Definir patrón de cambios:
  - Tema hijo + plantillas, o
  - Plugin de funcionalidades + bloques/plantillas.
- Establecer pipeline de despliegue (manual controlado o por Git).
- Definir estándares:
  - Nombres de clases/JS.
  - Estructura de assets.
  - Convención de versiones (cache busting).

**Recomendación:** Evitar tocar tema padre directamente.

## Paso 5: Desarrollo en staging por fases
- Implementar primero páginas de mayor impacto (ej. home).
- Mantener URLs objetivo.
- Migrar assets optimizados (video, imágenes, JS/CSS).
- Integrar formularios y componentes críticos.
- Versionar cambios en repositorio.

**Buenas prácticas:**
- Cambios pequeños y reversibles.
- Commits por feature.
- Feature flags simples cuando sea posible.

## Paso 6: QA técnico y visual
- Pruebas cross-browser (Chrome, Safari, Edge, móvil).
- Pruebas responsive (breakpoints reales).
- Validar:
  - Header/footer.
  - Navegación.
  - Formularios.
  - Estado de carga de assets.
- Revisar consola del navegador (errores JS).
- Revisar red (404, 500, assets bloqueados).

**Criterio de salida QA:** sin errores críticos P1/P2.

## Paso 7: QA de analytics y tags
- Verificar que el contenedor GTM/GA4 no se duplique.
- Confirmar page_view y eventos clave.
- Validar conversiones en tiempo real (GA4 Realtime / DebugView).
- Revisar consentimiento de cookies y disparos condicionados.

**Riesgo común:** doble medición por tags en tema + GTM simultáneamente.

## Paso 8: QA SEO antes de UAT
- Confirmar canonical correcto por página.
- Confirmar títulos/meta/OG en páginas críticas.
- Confirmar sitemap.
- Confirmar redirects 301 necesarios.
- Verificar que staging sigue con `noindex`.

## Paso 9: UAT (aprobación cliente)
- Demostración guiada en staging.
- Lista de ajustes finales (punch list).
- Firma de aprobación de contenido y comportamiento.

**Entregable:** Acta de aprobación UAT.

## Paso 10: Plan de release y rollback
- Definir fecha/hora de publicación (baja demanda).
- Ejecutar backup completo previo:
  - DB
  - `wp-content`
  - configuración de servidor
- Definir rollback en pasos exactos y tiempos (RTO).
- Definir responsables de guardia durante release.

## Paso 11: Go-live a producción
- Aplicar cambios aprobados.
- Purgar cachés (plugin, servidor, CDN).
- Verificar homepage y páginas críticas.
- Verificar formularios y eventos de conversión.
- Verificar que producción sí esté indexable (`index,follow`).

## Paso 12: Monitoreo 24-72 horas
- Monitorear:
  - Errores 404/500.
  - Conversión.
  - Rendimiento.
  - Eventos de analytics.
- Corregir desviaciones de forma priorizada.
- Crear reporte de cierre de despliegue.

---

## 3) Checklist de “no bloquearse” (rápido)

- [ ] Dominio + DNS + hosting bajo control.
- [ ] Accesos completos confirmados (WP, Git, GA4, GTM, GSC).
- [ ] Staging operativo y protegido.
- [ ] Baseline de SEO/analytics documentado.
- [ ] Plan de URLs y redirects definido.
- [ ] QA funcional, SEO y tracking aprobado.
- [ ] Plan de rollback probado.
- [ ] Ventana de release acordada con cliente.

---

## 4) Recomendación específica para tu caso

Dado que ya validaste experiencia visual en GitHub Pages:
- Usa esa versión como referencia visual.
- En WordPress, integra la home en staging primero.
- Conserva estructura de URL de producción actual.
- Migra tags/analytics sin duplicar scripts.
- Publica por fases para reducir riesgo (home -> páginas secundarias).

---

## 5) Plantilla breve de cronograma sugerido

- Semana 1: accesos + staging + baseline  
- Semana 2: desarrollo home + QA técnico  
- Semana 3: analytics/SEO QA + UAT cliente  
- Semana 4: go-live + monitoreo + ajustes

---

Si quieres, el siguiente paso es convertir esta guía en un plan operativo con responsables (RACI), fechas reales y checklist diario para tu equipo.
