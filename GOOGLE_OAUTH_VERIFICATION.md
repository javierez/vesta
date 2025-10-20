# Google OAuth Verification - Vesta

## Justificación de Scopes para Google Calendar API

### Scopes Solicitados

- `https://www.googleapis.com/auth/calendar.events` - Ver y editar eventos en calendarios

### Justificación (999 caracteres)

Vesta requires https://www.googleapis.com/auth/calendar.events to sync real estate agents' appointments from Vesta to Google Calendar.

USE CASES:

1. CREATE EVENTS: When agents schedule property viewings in Vesta, events auto-create in Google Calendar including client name, property address, date/time, and viewing notes.

2. UPDATE EVENTS: Agents modify appointment details in Vesta (reschedule times, update property addresses, add client notes) which sync instantly to Google Calendar.

3. DELETE EVENTS: Cancelled viewings in Vesta automatically remove from Google Calendar, preventing scheduling conflicts.

More restrictive scopes insufficient:
- calendar.readonly: read-only, no create/edit
- calendar.events.readonly: no create/modify

Agents need Vesta to auto-maintain Google Calendar, eliminating duplicate manual entry and reducing missed appointments. This one-way sync (Vesta→Google) keeps professional calendars current without toggling between apps.

---

## Información Adicional para Verificación

### Detalles de la Aplicación

**Nombre de la App:** Vesta
**Tipo de App:** Web Application (Real Estate Management Platform)
**URL de Producción:** https://v0-vesta-eight.vercel.app
**Dominios Autorizados:**
- v0-vesta-eight.vercel.app
- vesta.com (futuro dominio de producción)

### Credenciales de Usuario de Prueba

Para facilitar la verificación, proporcionamos una cuenta de prueba completa:

**Email:** test@vesta-demo.com
**Contraseña:** [Proporcionar contraseña de prueba]
**Rol:** Real Estate Agent (Agente Inmobiliario)

**Cuenta de Google Calendar de Prueba:**
**Email:** [Proporcionar email de Google]
**Contraseña:** [Proporcionar contraseña]

**Instrucciones para probar:**
1. Acceder a https://v0-vesta-eight.vercel.app
2. Iniciar sesión con las credenciales de prueba
3. Navegar a la sección "Calendario"
4. Click en el botón de integración (ícono de enlace)
5. Seleccionar "Conectar Google Calendar"
6. Usar la cuenta de Google de prueba para autorizar
7. Crear una cita de visita a propiedad
8. Verificar que aparece en Google Calendar

### Flujo de Sincronización

**Dirección:** Vesta → Google Calendar (una dirección solamente)
**Frecuencia:** Inmediata (cada vez que se crea/edita/elimina una cita)
**Datos Sincronizados:**
- Título del evento: "[Tipo] - [Nombre del Cliente]"
- Fecha y hora de inicio/fin
- Ubicación: Dirección de la propiedad
- Descripción: Notas sobre el cliente y preferencias
- Recordatorios: 15 minutos antes (configurable)

### Arquitectura Técnica

**Framework:** Next.js 15.2.3 (React 19)
**Autenticación:** BetterAuth (OAuth 2.0)
**Base de Datos:** SingleStore (MySQL compatible)
**Hosting:** Vercel (Production)
**API Integration:** googleapis npm package (Google Calendar API v3)

### Gestión de Tokens

**Almacenamiento:** Base de datos (tabla `user_integrations`)
**Refresh Token:** Sí, almacenado de forma segura
**Revocación:** Los usuarios pueden desconectar en cualquier momento desde la UI
**Expiración:** Se renueva automáticamente usando refresh token

### Políticas y Documentación

**Política de Privacidad:** [URL a tu política de privacidad]
**Términos de Servicio:** [URL a tus términos de servicio]
**Página de Soporte:** [URL de soporte o contacto]

### Otros Proyectos OAuth (si aplica)

**Proyecto Principal:** Vesta Production
**Google Cloud Project ID:** [Tu project ID]
**OAuth Client ID:** [Tu client ID visible en el video]

### Casos de Uso Detallados

1. **Agente programa visita a propiedad:**
   - Cliente: María García solicita ver apartamento en Calle Mayor 123
   - Agente crea cita en Vesta: "Visita - María García", 15:00-16:00, Calle Mayor 123
   - Evento se crea automáticamente en Google Calendar del agente
   - Agente ve la cita en su teléfono móvil (Google Calendar app)

2. **Cliente cambia horario:**
   - Agente actualiza la cita en Vesta: 15:00 → 17:00
   - Cambio se sincroniza a Google Calendar inmediatamente
   - Notificaciones de Google Calendar alertan al agente del cambio

3. **Visita se cancela:**
   - Cliente cancela la visita
   - Agente marca como cancelada en Vesta
   - Evento se elimina de Google Calendar
   - Libera el espacio en la agenda del agente

### Volumen de Uso Esperado

**Usuarios Iniciales:** ~50 agentes inmobiliarios
**Citas por agente/mes:** ~20-30
**API Calls estimados:** ~1,500 requests/mes
**Crecimiento proyectado:** 200 agentes en 6 meses

### Seguridad y Cumplimiento

- OAuth 2.0 con HTTPS obligatorio
- Tokens almacenados encriptados en base de datos
- No compartimos datos de calendario con terceros
- Cumplimiento con GDPR (usuarios pueden revocar acceso)
- Logs de auditoría para todas las operaciones de sincronización

### Contacto para Soporte de Verificación

**Desarrollador Principal:** [Tu nombre]
**Email de Contacto:** [Tu email]
**Disponibilidad:** [Tu zona horaria y horario disponible]

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
- [ ] Crear nueva cita/visita a propiedad desde Vesta (incluir nombre de cliente, dirección, notas)
- [ ] Abrir Google Calendar en otra pestaña del navegador
- [ ] Verificar que el evento aparece en Google Calendar con toda la información
- [ ] Regresar a Vesta y editar el evento (cambiar hora, dirección o añadir notas)
- [ ] Volver a Google Calendar y refrescar
- [ ] Verificar que los cambios se reflejan correctamente en Google Calendar
- [ ] Regresar a Vesta y cancelar/eliminar la cita
- [ ] Volver a Google Calendar y refrescar
- [ ] Verificar que el evento desaparece de Google Calendar

#### 3. Elementos Visuales Requeridos
- [ ] Consent screen mostrando exactamente el scope solicitado (calendar.events)
- [ ] Idioma en inglés en consent screen
- [ ] Client ID visible en URL del navegador
- [ ] Sincronización de Vesta hacia Google Calendar funcionando (crear, editar, eliminar)

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

02:30 - Create Event
        - Create property viewing appointment in Vesta
        - Include client name, property address, notes
        - Switch to Google Calendar tab
        - Show event appears there with all details

03:30 - Edit Event
        - Modify event details in Vesta (time, location, notes)
        - Refresh Google Calendar tab
        - Show changes synchronized from Vesta to Google Calendar

04:30 - Delete Event
        - Cancel appointment in Vesta
        - Refresh Google Calendar tab
        - Show it's removed from Google Calendar

05:00 - Conclusion
        "This demonstrates Vesta's one-way sync to Google Calendar, keeping agents' calendars automatically updated"
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
- [ ] OAuth consent screen visible mostrando solo `calendar.events` scope en inglés
- [ ] Client ID visible en URL del navegador
- [ ] Demuestra el scope calendar.events: crear, editar y eliminar eventos
- [ ] Muestra sincronización de Vesta → Google Calendar (una dirección solamente)
- [ ] Narración o texto explicativo en inglés
- [ ] Grabado en ambiente de producción real (no localhost)
- [ ] App Name en consent screen coincide con "Vesta"
- [ ] Link del video copiado y listo para pegar en formulario de Google

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
- Asegurar que el scope calendar.events está visible en inglés
- Mostrar Client ID en URL del navegador

**"Scope justification not clear"**
- Revisar que explicas POR QUÉ necesitas calendar.events
- Explicar por qué calendar.readonly no funciona (solo lectura, no permite crear/editar)
- Enfatizar la necesidad de crear, editar y eliminar eventos

**"Demo doesn't show all requested scopes"**
- Asegurar que demuestras el scope calendar.events completamente:
  - Crear evento desde Vesta → aparece en Google Calendar
  - Editar evento desde Vesta → se actualiza en Google Calendar
  - Eliminar evento desde Vesta → desaparece de Google Calendar

---

## Notas Adicionales

- Google puede tardar hasta 2-3 semanas en revisar
- Mantén el video en YouTube durante todo el proceso
- No cambies los scopes después de enviar (tendrás que volver a verificar)
- Si te rechazan, puedes reenviar con mejoras

---

## PLANTILLA PARA COMPLETAR ANTES DE ENVIAR

### 📝 Checklist de Información a Completar

Antes de enviar a Google, asegúrate de completar TODA esta información:

#### 1. Credenciales de Usuario de Prueba
```
Usuario Vesta:
- Email: ___________________________
- Contraseña: ______________________

Usuario Google Calendar:
- Email: ___________________________
- Contraseña: ______________________
```

#### 2. URLs y Documentación
```
- Política de Privacidad: _____________________________________
- Términos de Servicio: ______________________________________
- Página de Soporte: _________________________________________
```

#### 3. Google Cloud Project Info
```
- Project ID: ________________________________________________
- OAuth Client ID: ___________________________________________
- Redirect URI: https://v0-vesta-eight.vercel.app/api/google/calendar/callback
```

#### 4. Video de Demostración
```
- YouTube URL: _______________________________________________
- Duración: ____ minutos
- Verificado que muestra:
  [ ] OAuth consent screen en inglés
  [ ] Client ID visible en URL
  [ ] Crear evento desde Vesta
  [ ] Evento aparece en Google Calendar
  [ ] Editar evento desde Vesta
  [ ] Cambios reflejados en Google Calendar
  [ ] Eliminar evento desde Vesta
  [ ] Evento desaparece de Google Calendar
```

#### 5. Contacto
```
- Nombre Desarrollador: _____________________________________
- Email de Contacto: ________________________________________
- Zona Horaria: ____________________________________________
```

#### 6. Información Adicional a Pegar en el Formulario

**Texto para el campo "Additional Information":**

```
APPLICATION DETAILS:
- App Name: Vesta
- Production URL: https://v0-vesta-eight.vercel.app
- Type: Real Estate Management Platform (Web Application)

TEST CREDENTIALS:
- Vesta Test Account: [EMAIL]
- Google Calendar Test Account: [GMAIL]
(Passwords provided separately if needed)

TESTING INSTRUCTIONS:
1. Login at https://v0-vesta-eight.vercel.app with test credentials
2. Navigate to "Calendario" (Calendar section)
3. Click integration button (link icon)
4. Connect Google Calendar using test Google account
5. Create a property viewing appointment
6. Verify event appears in Google Calendar
7. Edit/delete appointment in Vesta and verify sync

SYNC FLOW:
Direction: Vesta → Google Calendar (one-way only)
Frequency: Immediate (on create/update/delete)
Data synced: Event title, date/time, property address, client notes

TECHNICAL STACK:
- Framework: Next.js 15.2.3
- API: googleapis (Google Calendar API v3)
- Hosting: Vercel
- Database: SingleStore

SECURITY:
- OAuth 2.0 with HTTPS
- Tokens stored encrypted in database
- Users can revoke access anytime
- GDPR compliant

VOLUME:
- Initial: ~50 real estate agents
- ~20-30 appointments per agent/month
- Estimated API calls: ~1,500/month

PRIVACY POLICY: [YOUR URL]
TERMS OF SERVICE: [YOUR URL]
SUPPORT: [YOUR EMAIL]

Demo video shows complete OAuth flow and all calendar.events scope functionality (create/update/delete events syncing from Vesta to Google Calendar).
```

---

### 🚀 PASOS FINALES ANTES DE ENVIAR

1. [ ] Completar TODAS las credenciales arriba
2. [ ] Crear cuentas de prueba (Vesta + Google)
3. [ ] Añadir URLs de política de privacidad y términos de servicio
4. [ ] Grabar y subir video de demostración a YouTube (unlisted)
5. [ ] Verificar que video muestra TODO el checklist
6. [ ] Copiar el texto "Additional Information" y reemplazar [EMAIL], [GMAIL], [YOUR URL]
7. [ ] Ir a Google Cloud Console > OAuth consent screen
8. [ ] Click "Publish App"
9. [ ] Completar formulario de verificación
10. [ ] Pegar justificación (955 caracteres)
11. [ ] Pegar URL del video de YouTube
12. [ ] Pegar información adicional
13. [ ] Enviar y esperar 3-5 días laborables

---

**¡IMPORTANTE!** No envíes el formulario hasta que hayas completado TODO lo anterior. Google rechazará solicitudes incompletas.
