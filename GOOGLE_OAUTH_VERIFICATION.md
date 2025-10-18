# Google OAuth Verification - Vesta

## Justificación de Scopes para Google Calendar API

### Scopes Solicitados

- `https://www.googleapis.com/auth/calendar` - Ver, editar, compartir y borrar permanentemente todos los calendarios
- `https://www.googleapis.com/auth/calendar.events` - Ver y editar eventos en calendarios

### Justificación (999 caracteres)

Vesta es una plataforma integral de gestión inmobiliaria que requiere los scopes https://www.googleapis.com/auth/calendar y https://www.googleapis.com/auth/calendar.events para proporcionar sincronización bidireccional completa del calendario profesional de nuestros agentes inmobiliarios.

Funcionalidades específicas implementadas:

1. VISUALIZACIÓN INTEGRADA: Los agentes ven todos sus calendarios y eventos de Google Calendar directamente en el dashboard de Vesta, mostrando disponibilidad en tiempo real para agendar visitas a propiedades con clientes potenciales.

2. CREACIÓN DE EVENTOS: Cuando un cliente solicita visitar una propiedad, el agente crea un evento desde Vesta que incluye: título descriptivo, fecha/hora, dirección de la propiedad, datos de contacto del cliente, y notas sobre preferencias. Este evento se sincroniza automáticamente con Google Calendar.

3. EDICIÓN BIDIRECCIONAL: Los agentes modifican horarios, cambian ubicaciones, o añaden participantes a eventos desde Vesta, sincronizándose inmediatamente con Google Calendar.

4. GESTIÓN COMPLETA: Cancelar visitas en Vesta elimina automáticamente los eventos correspondientes de Google Calendar.

No podemos usar scopes más limitados porque:
- calendar.readonly no permite crear/editar eventos
- Solo calendar.events no proporciona acceso completo a la gestión de calendarios

Nuestros usuarios necesitan Vesta como sistema central de gestión, manejando su calendario profesional completamente desde nuestra plataforma sin cambiar entre aplicaciones, mejorando productividad y experiencia del cliente.

---

## Requisitos para Demo Video

### Configuración del Video

- **Plataforma**: YouTube (modo **Unlisted/No listado**)
- **Duración**: 3-7 minutos
- **Idioma**: Inglés (narración o texto en pantalla)
- **Ambiente**: Producción (no desarrollo local)

### Contenido Obligatorio

#### 1. Flujo OAuth Completo (1-2 min)
- [ ] Mostrar proceso de login completo
- [ ] OAuth consent screen en **inglés** (cambiar idioma en esquina inferior izquierda)
- [ ] App Name visible en consent screen
- [ ] OAuth Client ID visible en URL del navegador
- [ ] Usuario aceptando los scopes solicitados

#### 2. Demostración de Uso de Scopes (3-4 min)

**Para calendar.events:**
- [ ] Navegar a sección de calendario en Vesta
- [ ] Mostrar eventos existentes de Google Calendar en Vesta
- [ ] Crear nueva cita/visita a propiedad desde Vesta
- [ ] Abrir Google Calendar en otra pestaña
- [ ] Verificar que el evento aparece en Google Calendar
- [ ] Editar el evento desde Vesta (cambiar hora o añadir notas)
- [ ] Verificar que el cambio se refleja en Google Calendar
- [ ] Cancelar/eliminar una cita desde Vesta
- [ ] Verificar que desaparece de Google Calendar

#### 3. Elementos Visuales Requeridos
- [ ] Consent screen mostrando exactamente los scopes solicitados
- [ ] Idioma en inglés en consent screen
- [ ] Client ID visible en URL
- [ ] Sincronización bidireccional funcionando

### Estructura Sugerida del Video

```
00:00 - Introducción
        "This video demonstrates Vesta's integration with Google Calendar"

00:30 - OAuth Flow
        - Login to Vesta
        - OAuth consent screen appears
        - Highlight scopes being requested
        - Show Client ID in browser URL
        - Accept permissions

02:00 - Calendar Integration Demo
        - Show Vesta calendar view
        - Display existing Google Calendar events

02:30 - Create Event
        - Create property viewing appointment in Vesta
        - Switch to Google Calendar tab
        - Show event appears there

03:30 - Edit Event
        - Modify event details in Vesta
        - Switch to Google Calendar
        - Show changes synchronized

04:30 - Delete Event
        - Cancel appointment in Vesta
        - Show it's removed from Google Calendar

05:00 - Conclusion
        "This demonstrates full bidirectional sync between Vesta and Google Calendar"
```

### Herramientas de Grabación Recomendadas

**macOS:**
- QuickTime Player (nativo)
- ScreenFlow (profesional)
- Loom (fácil)

**Windows:**
- OBS Studio (gratis)
- Camtasia (profesional)
- Loom (fácil)

**Edición:**
- iMovie (Mac)
- DaVinci Resolve (gratis, ambos)
- Camtasia (ambos)

### Preparación Antes de Grabar

1. **Configurar cuenta de prueba limpia**
   - Usuario de prueba con pocos eventos en calendario
   - No usar cuenta personal con datos sensibles

2. **Preparar ambiente**
   - Cerrar pestañas innecesarias
   - Limpiar notificaciones
   - Tener Google Calendar abierto en pestaña separada
   - Verificar que OAuth consent está en inglés

3. **Ensayar el flujo**
   - Practicar 2-3 veces antes de grabar
   - Anotar tiempo de cada sección
   - Preparar texto/narración en inglés

4. **Verificaciones técnicas**
   - Resolución mínima: 1280x720 (720p)
   - Audio claro (si usas narración)
   - Buen contraste y legibilidad

### Checklist Final

- [ ] Video subido a YouTube
- [ ] Visibilidad configurada como **Unlisted**
- [ ] Duración entre 3-7 minutos
- [ ] OAuth consent screen visible con scopes en inglés
- [ ] Client ID visible en URL del navegador
- [ ] Demuestra CADA scope solicitado
- [ ] Muestra sincronización bidireccional con Google Calendar
- [ ] Narración o texto explicativo en inglés
- [ ] Grabado en ambiente de producción real
- [ ] App Name en consent screen coincide con "Vesta"
- [ ] Link del video copiado y listo para pegar en formulario

---

## Proceso de Verificación

### 1. Preparar Documentación
- [ ] Completar OAuth consent screen
- [ ] Añadir política de privacidad (URL pública)
- [ ] Añadir términos de servicio (URL pública)
- [ ] Configurar dominio autorizado

### 2. Crear Demo Video
- [ ] Seguir checklist anterior
- [ ] Subir a YouTube (Unlisted)
- [ ] Verificar que link funciona

### 3. Solicitar Verificación
- [ ] Ir a Google Cloud Console
- [ ] OAuth consent screen > Publish app
- [ ] Completar formulario de verificación
- [ ] Pegar justificación de scopes (999 chars)
- [ ] Pegar link de YouTube
- [ ] Añadir links de documentación adicional

### 4. Tiempo de Respuesta
- **Típico**: 3-5 días laborables
- **Máximo**: 2-3 semanas
- **Revisar email**: Google puede pedir aclaraciones

### 5. Posibles Rechazos y Soluciones

**"Video doesn't show consent screen clearly"**
- Volver a grabar mostrando consent screen completo
- Asegurar que scopes están en inglés
- Mostrar Client ID en URL

**"Scope justification not clear"**
- Revisar que explicas POR QUÉ necesitas cada scope
- Explicar por qué scopes más limitados no funcionan

**"Demo doesn't show all requested scopes"**
- Asegurar que demuestras CADA scope solicitado
- Mostrar sincronización bidireccional clara

---

## Notas Adicionales

- Google puede tardar hasta 2-3 semanas en revisar
- Mantén el video en YouTube durante todo el proceso
- No cambies los scopes después de enviar (tendrás que volver a verificar)
- Si te rechazan, puedes reenviar con mejoras
