# Fotocasa Integration - COMPREHENSIVE Test Use Cases
## Complete Field Coverage Testing Guide

This document provides **exhaustive** test scenarios covering **EVERY SINGLE FIELD** available in the Vesta database that can be mapped to Fotocasa. This is the ultimate testing guide to ensure 100% platform coverage.

---

## 📊 Field Coverage Summary

### Total Database Fields Available
- **Properties table**: 89 fields
- **Listings table**: 45 fields
- **Currently mapped to Fotocasa**: 58 FeatureIds
- **Available for mapping**: 30+ additional fields
- **Media types**: 5 (Images, Videos, YouTube, Virtual Tours, Blueprints)

### Fotocasa API Coverage
- ✅ **Property Types**: 5/9 implemented (Piso, Casa, Local, Solar, Garaje)
- ✅ **Property Subtypes**: 25/25 available
- ✅ **Listing Types**: 5/5 (Sale, Rent, Transfer, RoomSharing, RentWithOption)
- ✅ **FeatureIds**: 58+ mapped
- ✅ **Media Types**: 5/5 (Images, Videos, YouTube, Virtual Tours, Blueprints)
- ✅ **Address Visibility**: 3/3 modes
- ✅ **Floor Mapping**: 20+ floor types

---

## 🎯 ULTRA-COMPREHENSIVE TEST SCENARIOS

### Scenario 1: **MAXIMUM LUXURY PENTHOUSE - ALL FEATURES**
**Objetivo:** Probar ABSOLUTAMENTE TODAS las características disponibles en un solo inmueble de lujo

#### Datos Básicos
```
Tipo: Piso
Subtipo: Ático
Anuncio: Venta
Precio: 2,500,000€
Banco: No
Obra nueva: Sí
```

#### Distribución y Superficies (COMPLETO)
```
Dormitorios: 5
Baños: 4.5 (4 completos + 1 aseo)
Superficie útil: 380 m²
Superficie construida: 450 m²
Año construcción: 2024
Última reforma: 2024
Plantas del edificio: 15
Estado conservación: Casi nuevo (3)

Espacios adicionales:
- Terraza: 120 m² (FeatureId: 27, 62)
- Tamaño salón: 80 m²
- Balcones: 3 (FeatureId: 297)
- Galerías: 2
- Bodega: Sí, 25 m²
- Armarios empotrados: Sí (FeatureId: 258)
```

#### Ubicación (COMPLETO)
```
Calle: "Paseo de la Castellana, 259"
Detalles dirección: "Planta 15, Ático Duplex"
Código postal: "28046"
Ciudad: Madrid
Provincia: Madrid
Municipio: Madrid
Barrio: Cuatro Torres Business Area
Referencia catastral: "9872109VK4797A0001OL"
Latitud: 40.4789
Longitud: -3.6889
Transporte público: Sí (FeatureId: 176)
Modo visibilidad: Exacta (1)
```

#### Características Principales (TODAS)
```
✅ Ascensor: Sí (FeatureId: 22)
✅ Ascensor al garaje: Sí
✅ Amueblado: Sí, Alta calidad (FeatureId: 30)
✅ Calefacción: Sí (FeatureId: 29)
   - Tipo: Suelo radiante aerotermia (FeatureId: 320)
✅ Agua caliente: Individual eléctrica (FeatureId: 321)
✅ Aire acondicionado: Central (FeatureId: 254)
✅ Garaje: Sí (FeatureId: 23)
   - Tipo: Subterráneo
   - Plazas: 3
   - En edificio: Sí
   - Números: "G-15A, G-15B, G-15C"
   - Precio opcional: 75,000€
✅ Trastero: Sí (FeatureId: 24)
   - Tamaño: 15 m²
   - Número: "T-15A"
   - Precio opcional: 15,000€
```

#### Cocina y Electrodomésticos (TODOS)
```
✅ Cocina amueblada: Sí (FeatureId: 314, 289)
✅ Tipo cocina: Premium integrada
✅ Cocina americana: Sí
✅ Cocina francesa: No
✅ Despensa: Sí
✅ Electrodomésticos incluidos: Sí (FeatureId: 259)
   - Horno: Sí (FeatureId: 288)
   - Microondas: Sí (FeatureId: 287)
   - Lavadora: Sí (FeatureId: 293)
   - Nevera: Sí (FeatureId: 292)
   - TV: Sí (FeatureId: 291)
   - Lavavajillas: Incluido
   - Secadora: Incluida
```

#### Orientación y Luminosidad (COMPLETO)
```
✅ Exterior: Sí
✅ Luminoso: Sí
✅ Orientación: Sur (FeatureId: 28, value: 8)
✅ Vistas: Sí
✅ Vistas montaña: Sí (Sierra de Madrid)
✅ Vistas mar: No
✅ Primera línea playa: No
```

#### Características Adicionales de Seguridad (DISPONIBLES EN FORM)
```
✅ Video portero: Sí
✅ Servicio portería: Sí (conciergeService)
✅ Vigilante seguridad: Sí (securityGuard)
✅ Alarma: Sí (FeatureId: 235, 272)
✅ Puerta blindada: Sí (FeatureId: 294)
✅ Doble acristalamiento: Sí (doubleGlazing)
✅ Antena parabólica: Sí (satelliteDish)
✅ Accesible discapacitados: Sí (disabledAccessible)
✅ VPO: No (vpo available but not for luxury)
```

#### Características Premium (DISPONIBLES EN FORM)
```
✅ Domótica: Sí (homeAutomation)
✅ Sistema musical: Sí (musicSystem)
✅ Jacuzzi: Sí (jacuzzi)
✅ Piscina privada: Sí (en terraza) (privatePool)
✅ Piscina comunitaria: Sí (communityPool)
✅ Gimnasio: Sí (comunitario) (gym)
✅ Zona deportiva: Sí (sportsArea)
✅ Zona infantil: Sí (childrenArea)
✅ Pista de tenis: Sí (tennisCourt)
✅ Cuarto lavadero: Sí (laundryRoom)
✅ Jardín privado: No (privateGarden)
✅ Chimenea: Sí (de diseño) (fireplace)
✅ Baño en suite: Sí (suiteBathroom)
```

#### Materiales y Acabados (DISPONIBLES EN FORM)
```
✅ Tipo suelo: Parquet roble natural (floorType: "parquet")
✅ Gres: En baños (stoneware)
✅ Tipo persiana: Aluminio motorizado (blindType)
✅ Tipo carpintería: Aluminio lacado (carpentryType)
✅ Tipo ventana: Climalit doble acristalamiento (windowType)
✅ Doble acristalamiento: Sí (doubleGlazing)
```

#### Certificación Energética (NO DISPONIBLE EN FORM)
```
⚠️ NOTA: Los campos de certificación energética NO están disponibles en el formulario actual:
- energyConsumptionScale (A-G)
- emissionsScale (A-G)
- energyConsumptionValue
- emissionsValue
- energyCertificateStatus

Para este test, estos campos NO se podrán completar desde la UI.
```

#### Media y Documentación (TODO)
```
📸 Imágenes: 50 (máximo, con watermark)
🎥 Videos: 5 (tours interiores, TypeId: 8)
🔗 YouTube: 2 enlaces (tour profesional, TypeId: 31)
🌐 Tour virtual: 1 (Matterport, TypeId: 7)
📄 Planos: 5 PDFs (distribución, TypeId: 23)

Total PropertyDocuments: 63
```

#### Información de Contacto
```
Agente: [Seleccionar]
Propietario: [Seleccionar]
Email: agente@inmobiliaria.com
Teléfono: +34 912 345 678
```

#### Descripción
```
Generar con IA mencionando:
- Ubicación privilegiada
- Todas las características premium
- Vistas panorámicas
- Acabados de lujo
- Domótica y sostenibilidad
- Comunidad exclusiva
```

#### Pasos de Publicación
1. ✅ Completar todos los campos arriba
2. ✅ Subir 50 imágenes de alta calidad
3. ✅ Subir 5 videos (verificar < 100MB cada uno)
4. ✅ Añadir 2 enlaces YouTube
5. ✅ Añadir tour virtual Matterport
6. ✅ Subir 5 planos en PDF
7. ✅ Generar descripción y descripción corta
8. ✅ Verificar watermark configurado en cuenta
9. ✅ Publicar en Fotocasa (modo visibilidad: Exacta)
10. ✅ Verificar payload JSON generado
11. ✅ Confirmar StatusCode 201
12. ✅ Verificar imágenes watermarked en S3
13. ✅ Verificar limpieza post-publicación
14. ✅ Comprobar anuncio en Fotocasa.es

**Campos FeatureId Esperados en Payload:** 45+ features

---

### Scenario 2: **CASA RURAL RÚSTICA - Características Naturales**
**Objetivo:** Probar propiedades rurales con características específicas de campo

#### Datos Básicos
```
Tipo: Casa
Subtipo: Casa rústica
Anuncio: Venta
Precio: 450,000€
Banco: No
Obra nueva: No
```

#### Distribución
```
Dormitorios: 4
Baños: 3
Superficie útil: 250 m²
Superficie construida: 320 m²
Año construcción: 1920
Última reforma: 2022
Plantas: 2
Estado conservación: Reformado (6)
```

#### Ubicación Rural
```
Calle: "Camino del Monte, s/n"
Detalles dirección: "Finca 'El Robledal'"
Código postal: "05200"
Ciudad: Arévalo
Provincia: Ávila
Municipio: Arévalo
Barrio: Zona rural
Modo visibilidad: Zona (3)
```

#### Características Rústicas
```
✅ Ascensor: No
✅ Amueblado: No
✅ Calefacción: Sí (Leña y gasoil)
✅ Aire acondicionado: No
✅ Garaje: No
✅ Trastero: Sí (antiguo pajar, 40 m²)
```

#### Características Exteriores (ÉNFASIS)
```
✅ Exterior: Sí
✅ Orientación: Sur
✅ Vistas: Sí (campo y montaña)
✅ Vistas montaña: Sí
✅ Jardín privado: Sí (FeatureId: 298) - 2,000 m²
✅ Terraza: Sí - 60 m²
✅ Balcones: 2
✅ Pozo de agua: Sí
```

#### Características Rurales Especiales
```
✅ Chimenea: Sí (piedra, salón principal)
✅ Bodega: Sí (tradicional, 30 m²)
✅ Barbacoa: Incluida
✅ Huerto: 500 m²
✅ Árboles frutales: Sí
✅ Gallinero: Antiguo, restaurable
```

#### Materiales Tradicionales
```
✅ Tipo suelo: Barro cocido y madera
✅ Tipo carpintería: Madera maciza
✅ Tipo ventana: Madera con contraventanas
✅ Persianas: Madera
✅ Vigas vistas: Sí
✅ Muros piedra: Sí
```

#### Servicios Limitados
```
❌ Internet: No disponible en zona
❌ Gas natural: No disponible
❌ Transporte público: No cercano
✅ Acceso asfaltado: Sí
✅ Pozo propio: Sí
✅ Fosa séptica: Sí (renovada)
```

#### Media
```
📸 Imágenes: 40 (exteriores, interiores, jardín, vistas)
🎥 Video: 1 (tour completo)
🔗 YouTube: 1 (video drone finca)
```

**FeatureIds Clave:** Enfoque en exterior, vistas, jardín, materiales tradicionales

---

### Scenario 3: **ESTUDIO ESTUDIANTES - Alquiler Compartido**
**Objetivo:** Probar características específicas para alquiler de habitaciones y estudiantes

#### Datos Básicos
```
Tipo: Piso
Subtipo: Estudio
Anuncio: Alquiler
Subtipo secundario: Compartir habitación
Precio: 380€/mes por habitación
Banco: No
```

#### Distribución Compacta
```
Dormitorios: 1 (+ salón convertible)
Baños: 1
Superficie útil: 45 m²
Año construcción: 1985
Estado conservación: Buen estado (1)
```

#### Ubicación Céntrica Universitaria
```
Calle: "Calle Argumosa, 28"
Detalles dirección: "Piso 3, Puerta A"
Código postal: "28012"
Ciudad: Madrid
Barrio: Lavapiés
Transporte público: Sí (Metro Lavapiés 2min)
```

#### Características Para Estudiantes (ÉNFASIS)
```
✅ Amueblado: Sí (FeatureId: 30)
   - Calidad: Básica funcional
✅ Internet: Sí (FeatureId: 286) - Fibra 600Mb
✅ Apto estudiantes: Sí
✅ Mascotas: No (FeatureId: 313)
✅ Ascensor: No
✅ Calefacción: Individual gas
✅ Agua caliente: Individual gas
```

#### Electrodomésticos Estudiantes (TODOS)
```
✅ Electrodomésticos incluidos: Sí (FeatureId: 259)
✅ Cocina equipada: Sí (FeatureId: 314)
✅ Horno: No (FeatureId: 288)
✅ Microondas: Sí (FeatureId: 287)
✅ Lavadora: Sí (FeatureId: 293)
✅ Nevera: Sí (FeatureId: 292)
✅ TV: No (FeatureId: 291)
```

#### Servicios Incluidos
```
✅ Internet incluido: Sí
✅ Gastos comunidad: Incluidos
✅ Agua: Incluida
✅ Luz: No incluida
✅ Gas: No incluido
```

#### Normas de Convivencia (en descripción)
```
- No fumadores
- Silencio 23:00-08:00
- Limpieza zonas comunes
- Máximo 2 personas por habitación
```

#### Media
```
📸 Imágenes: 15 (habitación, cocina, baño, edificio)
```

**TransactionTypeId:** 7 (RoomSharing)

---

### Scenario 4: **OFICINA MODERNA - Local Comercial Premium**
**Objetivo:** Probar características específicas de espacios comerciales/oficina

#### Datos Básicos
```
Tipo: Local
Subtipo: Oficinas
Anuncio: Alquiler
Precio: 2,500€/mes
```

#### Distribución Oficina
```
Superficie útil: 120 m²
Superficie construida: 135 m²
Año construcción: 2019
Estado conservación: Casi nuevo (3)
Distribución: Diáfano con 2 despachos
```

#### Ubicación Empresarial
```
Calle: "Paseo de la Habana, 200"
Detalles dirección: "Planta 2, Oficina 203"
Código postal: "28036"
Ciudad: Madrid
Barrio: Prosperidad
Transporte público: Sí (Metro Colombia)
```

#### Características Oficina (ESPECÍFICAS)
```
✅ Ascensor: Sí (FeatureId: 22)
✅ Aire acondicionado: Sí, Central (FeatureId: 254)
✅ Calefacción: Sí, Central (FeatureId: 29)
✅ Accesible discapacitados: Sí
✅ Internet: Sí (FeatureId: 286) - Fibra simétrica
✅ Alarma: Sí (FeatureId: 235)
✅ Puerta blindada: Sí (FeatureId: 294)
✅ Video portero: Sí
✅ Vigilante seguridad: Sí (edificio)
```

#### Características Oficina Específicas
```
✅ Cocina oficina: Sí (FeatureId: 289)
✅ Baño privado: Sí
✅ Sala reuniones: Incluida
✅ Zona recepción: Sí
✅ Archivo/almacén: Pequeño
✅ Cableado estructurado: Sí
✅ Falso techo: Sí (registrable)
✅ Suelo técnico: No
```

#### Espacios Comunes Edificio
```
✅ Recepción edificio: Sí
✅ Salas reuniones compartidas: 2
✅ Parking visitantes: Sí
✅ Cafetería: Planta baja
```

#### Materiales Oficina
```
✅ Suelo: Tarima flotante (FeatureId: 290)
✅ Carpintería: Aluminio
✅ Ventanas: Climalit
✅ Doble acristalamiento: Sí
✅ Persianas: Aluminio motorizadas
```

#### Servicios
```
✅ Garaje opcional: Sí - 150€/mes
✅ Trastero opcional: Sí - 80€/mes
✅ Gastos comunidad: 180€/mes
✅ IBI: A cargo propietario
```

#### Media
```
📸 Imágenes: 25 (oficina, despachos, zonas comunes)
🎥 Video: 1 (tour oficina)
🌐 Tour virtual: 1 (Matterport)
📄 Planos: 2 (distribución, evacuación)
```

**TypeId:** 4 (Oficina)
**TransactionTypeId:** 3 (Rent)

---

### Scenario 5: **SOLAR URBANO - Parcela Construcción**
**Objetivo:** Probar características específicas de terrenos/solares

#### Datos Básicos
```
Tipo: Solar
Subtipo: Suelo residencial
Anuncio: Venta
Precio: 850,000€
```

#### Características Terreno
```
Superficie útil: 2,500 m²
Edificabilidad: 0.6 (1,500 m² construibles)
Ocupación: 40%
Altura máxima: Baja + 3 plantas
Uso: Residencial plurifamiliar
```

#### Ubicación Urbana
```
Calle: "Calle de la Huerta, parcela 45"
Código postal: "28223"
Ciudad: Pozuelo de Alarcón
Provincia: Madrid
Municipio: Pozuelo de Alarcón
Modo visibilidad: Exacta (1)
```

#### Servicios Disponibles
```
✅ Agua: Acometida disponible
✅ Luz: Acometida disponible
✅ Gas: Red disponible
✅ Alcantarillado: Sí
✅ Acerado: Sí
✅ Alumbrado público: Sí
✅ Transporte público: Autobús 500m
```

#### Características Urbanísticas
```
- Parcela esquina: Sí
- Dos fachadas: Sí
- Pendiente: < 5% (llano)
- Orientación: Sur-Este
- Árboles: 3 (a conservar)
- Vallado: No
```

#### Documentación Legal
```
✅ Cédula urbanística: Disponible
✅ Informe técnico: Sí
✅ Geotécnico: Disponible
✅ Plan parcial: Aprobado
✅ Licencia: Pendiente solicitud
✅ Cargas: Ninguna
```

#### Media
```
📸 Imágenes: 20 (terreno, entorno, calle, ubicación)
🔗 YouTube: 1 (video drone)
📄 Documentos: 8 (planos urbanísticos, cédula, informes)
```

**FeatureId 69:** 2,500 (superficie construida = superficie terreno)
**No aplican:** Dormitorios, baños, muchas características de edificios

---

### Scenario 6: **GARAJE DOBLE - Parking Centro**
**Objetivo:** Probar características específicas de garajes

#### Datos Básicos
```
Tipo: Garaje
Subtipo: Doble
Anuncio: Venta
Precio: 45,000€
```

#### Características Garaje
```
Superficie útil: 30 m² (2 plazas)
Tipo: Subterráneo
Planta: -2
Número: "045-046"
En edificio residencial: Sí
```

#### Ubicación
```
Calle: "Calle Goya, 115"
Detalles dirección: "Parking planta -2, plazas 45-46"
Código postal: "28009"
Ciudad: Madrid
Barrio: Salamanca
```

#### Características Específicas Garaje
```
✅ En edificio: Sí
✅ Ascensor al garaje: Sí
✅ Puerta automática: Sí
✅ Rampa acceso: Sí
✅ Altura libre: 2.20m
✅ Vigilancia: Cámaras
✅ Iluminación: LED
✅ Ventilación: Forzada
✅ Alarma: Sí
```

#### Dimensiones
```
- Plaza 1: 5.0m x 2.5m
- Plaza 2: 5.0m x 2.5m
- Apto vehículos grandes: Sí
- Apto moto: No (subtipo específico)
- Columnas: Sin columnas intermedias
```

#### Accesos
```
- Acceso peatonal: Ascensor + escalera
- Acceso vehículos: Rampa automática
- Control acceso: Mando + App
- Portero automático: Sí
```

#### Media
```
📸 Imágenes: 10 (plazas, acceso, edificio)
```

**TypeId:** 8 (Garage)
**SubTypeId:** 69 (Doble)

---

### Scenario 7: **LOFT INDUSTRIAL - Conversion Artística**
**Objetivo:** Probar espacios únicos tipo loft con características especiales

#### Datos Básicos
```
Tipo: Piso
Subtipo: Loft
Anuncio: Rent
Precio: 1,800€/mes
```

#### Distribución Open Space
```
Dormitorios: 1 (en altillo)
Baños: 1.5
Superficie útil: 150 m²
Altura techos: 4.5m (doble altura)
Año construcción: 1910 (edificio)
Última reforma: 2023 (conversión loft)
Estado conservación: Reformado (6)
```

#### Ubicación Artística
```
Calle: "Calle de la Palma, 72"
Detalles dirección: "Planta 1 (entresuelo)"
Código postal: "28004"
Ciudad: Madrid
Barrio: Malasaña
```

#### Características Loft Únicas
```
✅ Espacio diáfano: 90% superficie
✅ Doble altura: Sí
✅ Altillo: Sí (dormitorio)
✅ Vigas vistas: Sí (metálicas originales)
✅ Ladrillo visto: Sí
✅ Suelo industrial: Hormigón pulido
✅ Ventanales: Tipo industrial, 4m altura
```

#### Características Modernas
```
✅ Ascensor: No (edificio histórico)
✅ Amueblado: Semi-amueblado
✅ Cocina: Americana integrada (FeatureId: 314)
✅ Cocina americana: Sí
✅ Electrodomésticos: Incluidos (FeatureId: 259)
✅ Aire acondicionado: Split (FeatureId: 254)
✅ Calefacción: Radiadores eléctricos (FeatureId: 29)
✅ Internet: Fibra (FeatureId: 286)
```

#### Características Artísticas
```
✅ Luminoso: Sí (ventanales 4m)
✅ Exterior: Sí
✅ Orientación: Norte (luz difusa constante)
✅ Espacio trabajo: Ideal
✅ Estudio arte: Perfecto
✅ Showroom: Posible
```

#### Materiales Industriales
```
✅ Suelo: Hormigón pulido + zona madera
✅ Carpintería: Metálica tipo industrial
✅ Ventanas: Hierro estilo industrial
✅ Persianas: No (contraventanas interiores)
✅ Instalación vista: Sí (tuberías decorativas)
```

#### Alquiler Flexible
```
✅ Apto estudiantes: No
✅ Mascotas: Sí (FeatureId: 313)
✅ Actividad profesional: Permitida
✅ Visitas: Permitidas
✅ Duración mínima: 1 año
```

#### Media
```
📸 Imágenes: 35 (énfasis en espacios, detalles industriales)
🎥 Video: 1 (tour mostrando doble altura)
🌐 Tour virtual: 1
```

**Características Clave:** Espacio único, altura, materiales, luz natural

---

### Scenario 8: **CHALET LUJO PISCINA - Casa Familiar**
**Objetivo:** Máxima cobertura características exteriores y familiares

#### Datos Básicos
```
Tipo: Casa
Subtipo: Chalet
Anuncio: Venta
Precio: 1,200,000€
```

#### Distribución Familiar
```
Dormitorios: 6
Baños: 4
Superficie útil: 450 m²
Superficie construida: 520 m²
Parcela: 1,800 m²
Año construcción: 2015
Plantas: 3 (sótano + 2)
Estado conservación: Muy buen estado (2)
```

#### Ubicación Residencial
```
Calle: "Urbanización Los Rosales, 28"
Código postal: "28660"
Ciudad: Boadilla del Monte
Provincia: Madrid
Barrio: Zona residencial privada
```

#### Distribución por Plantas
```
**Sótano:**
- Garaje: 3 coches (FeatureId: 23, garageSpaces: 3)
- Bodega: 20 m² (FeatureId: bodega)
- Gimnasio privado: 30 m² (FeatureId: 309)
- Cuarto instalaciones
- Trastero: 25 m² (FeatureId: 24)

**Planta Baja:**
- Salón-comedor: 70 m² (livingRoomSize)
- Cocina: 25 m² (FeatureId: 314)
- Despensa: Sí
- Baño invitados: 1
- Despacho: 15 m²

**Planta Primera:**
- Suite principal: 45 m² con baño (FeatureId: 260)
- Dormitorios: 4
- Baños: 2
- Vestidor: 12 m²
```

#### Características Exteriores (MÁXIMO)
```
✅ Jardín privado: 1,200 m² (FeatureId: 298)
✅ Piscina privada: 12x6m (FeatureId: 25)
✅ Piscina climatizada: Sí
✅ Jacuzzi exterior: Sí (FeatureId: 274)
✅ Zona chill-out: 40 m²
✅ Barbacoa: Fija con horno leña
✅ Porche: 60 m²
✅ Pérgola: Sí
✅ Terraza primera planta: 30 m² (FeatureId: 27, 62)
✅ Riego automático: Todo jardín
✅ Iluminación jardín: LED completo
✅ Vallado perímetro: Sí
✅ Portón automático: Sí
```

#### Características Interiores Premium
```
✅ Ascensor: Sí (FeatureId: 22) - 3 plantas
✅ Amueblado: Parcialmente
✅ Calefacción: Suelo radiante aerotermia (FeatureId: 29, 320)
✅ Agua caliente: Aerotermia (FeatureId: 321)
✅ Aire acondicionado: Central (FeatureId: 254)
✅ Domótica: Completa (FeatureId: 142)
✅ Sistema musical: Multiroom (musicSystem)
✅ Alarma: Sí con cámaras (FeatureId: 235, 272)
✅ Video portero: Sí
✅ Puerta blindada: Sí (FeatureId: 294)
```

#### Amenidades Familiares
```
✅ Zona infantil jardín: Sí (FeatureId: 303)
✅ Columpio: Sí
✅ Tobogán: Sí
✅ Arenero: Sí
✅ Casa juegos: Madera
✅ Zona mascotas: Preparada
✅ Mascotas permitidas: Sí (FeatureId: 313)
```

#### Cocina Completa
```
✅ Cocina amueblada: Sí (alta gama) (FeatureId: 314)
✅ Isla central: Sí
✅ Electrodomésticos: Todos incluidos (FeatureId: 259)
✅ Horno: Doble (FeatureId: 288)
✅ Microondas: Integrado (FeatureId: 287)
✅ Lavavajillas: 2 (integrados)
✅ Nevera: Americana (FeatureId: 292)
✅ Lavadora: Sí (FeatureId: 293)
✅ Secadora: Sí
✅ Despensa: Grande
✅ Office: Zona desayuno
```

#### Espacios Adicionales
```
✅ Bodega climatizada: 20 m²
✅ Cuarto lavadero: Sí (FeatureId: 257)
✅ Tendedero cubierto: Sí
✅ Vestidor principal: 12 m²
✅ Armarios empotrados: Todos dormitorios (FeatureId: 258)
✅ Trastero: 25 m²
✅ Despacho: 15 m²
✅ Sala cine: 20 m² (sótano)
```

#### Orientación y Vistas
```
✅ Exterior: Sí
✅ Luminoso: Máximo
✅ Orientación: Sur (FeatureId: 28)
✅ Vistas: Jardín y zona verde
✅ Parcela esquina: Sí
✅ Privacidad: Total
```

#### Materiales Premium
```
✅ Suelo: Parquet roble (FeatureId: 290)
✅ Suelo baños: Gres porcelánico (FeatureId: 295)
✅ Carpintería: Aluminio RPT
✅ Ventanas: Climalit doble cámara
✅ Doble acristalamiento: Sí
✅ Persianas: Aluminio motorizadas
✅ Barandillas: Acero inoxidable/cristal
```

#### Certificación Energética (NO DISPONIBLE EN FORM)
```
⚠️ NOTA: Campos de certificación energética NO disponibles en formulario.
✅ Placas solares: 16 paneles (solarPanels: true)
✅ Aerotermia: Sistema completo (en heatingType y hotWaterType)
```

#### Urbanización
```
✅ Piscina comunitaria: Sí (FeatureId: 300)
✅ Pista tenis: Sí (FeatureId: 310)
✅ Zona deportiva: Sí (FeatureId: 302)
✅ Zona infantil: Sí (FeatureId: 303)
✅ Vigilancia 24h: Sí
✅ Control acceso: Sí
✅ Jardines comunitarios: Sí
```

#### Media (MÁXIMO)
```
📸 Imágenes: 50 (todas áreas)
🎥 Videos: 5 (tour interior, exterior, jardín, piscina, drone)
🔗 YouTube: 2 (tour profesional, vecindario)
🌐 Tour virtual: 1 (Matterport completo)
📄 Planos: 5 (plantas, parcela, instalaciones)
```

**Este es EL escenario más completo posible para una casa**

---

### Scenario 9: **BAJO COMERCIAL - Transferencia Negocio**
**Objetivo:** Probar transferencia con características comerciales

#### Datos Básicos
```
Tipo: Piso
Subtipo: Bajo
Anuncio: Venta
Subtipo secundario: Transferencia
Precio: 95,000€ (traspaso) + 1,200€/mes (alquiler)
```

#### Características Bajo Comercial
```
Superficie útil: 85 m²
Altura techo: 3.2m
Año construcción: 1970
Última reforma: 2021
Estado conservación: Reformado (6)
Escaparate: 6m lineales
```

#### Ubicación Comercial
```
Calle: "Calle Fuencarral, 88"
Detalles dirección: "Bajo comercial"
Código postal: "28004"
Ciudad: Madrid
Barrio: Chueca (zona comercial)
Transporte público: Excelente (FeatureId: 176)
```

#### Características Comerciales
```
✅ Accesible discapacitados: Sí
✅ Escaparate: 6m
✅ Entrada independiente: Sí
✅ Almacén: 15 m²
✅ Baño: 1 (adaptado)
✅ Cocina pequeña: Sí (office)
✅ Aire acondicionado: Sí (FeatureId: 254)
✅ Alarma: Sí (FeatureId: 235)
✅ Persiana seguridad: Sí
✅ Puerta blindada: Sí (FeatureId: 294)
```

#### Negocio Actual
```
- Tipo: Tienda ropa
- Antigüedad: 8 años
- Mobiliario: Incluido en traspaso
- Clientela: Establecida
- Licencia: Vigente (comercio menor)
```

#### Instalaciones
```
✅ Electricidad: Trifásica
✅ Agua: Sí
✅ Desagüe: Sí
✅ Internet: Fibra (FeatureId: 286)
✅ Luminosidad: Excelente
✅ Exterior: Sí
✅ Orientación: Oeste
```

#### Materiales
```
✅ Suelo: Gres porcelánico (FeatureId: 295)
✅ Falso techo: Con focos empotrados
✅ Escaparate: Cristal templado
✅ Paredes: Pladur pintado
```

#### Media
```
📸 Imágenes: 20 (interior, exterior, escaparate, almacén)
```

**TransactionTypeId:** 4 (Transfer)

---

### Scenario 10: **ÁTICO DÚPLEX TERRAZA - Vista 360°**
**Objetivo:** Probar ático con máximo espacio exterior y vistas

#### Datos Básicos
```
Tipo: Piso
Subtipo: Ático
Anuncio: Venta
Precio: 750,000€
```

#### Distribución Duplex
```
Dormitorios: 3
Baños: 2
Superficie útil: 180 m²
Terraza: 150 m² (¡más grande que interior!)
Plantas: 2 (7ª y 8ª)
Año construcción: 2005
Estado conservación: Muy buen estado (2)
```

#### Ubicación
```
Calle: "Calle Bravo Murillo, 350"
Detalles dirección: "Plantas 7 y 8, Ático Dúplex"
Código postal: "28020"
Ciudad: Madrid
Barrio: Tetuán
```

#### Terraza XXL (ÉNFASIS MÁXIMO)
```
✅ Terraza: 150 m² (FeatureId: 27, 62)
✅ Distribución terraza:
   - Zona chill-out: 40 m²
   - Zona comedor exterior: 30 m²
   - Zona solarium: 35 m²
   - Zona plantas/huerto: 25 m²
   - Zona BBQ: 20 m²

✅ Equipamiento terraza:
   - Jacuzzi: Sí (6 personas) (FeatureId: 274)
   - Ducha exterior: Sí
   - Pérgola bioclimática: 30 m²
   - Toldos: Motorizados
   - Riego automático: Sí
   - Iluminación LED: Completa
   - Tomas agua: 4 puntos
   - Tomas eléctricas: 6 puntos
   - Armario exterior: Grande
```

#### Vistas (MÁXIMO)
```
✅ Vistas: Espectaculares 360° (FeatureId: views)
✅ Vistas montaña: Sí (Sierra Madrid) (mountainViews)
✅ Vista ciudad: Skyline completo
✅ Sin edificios delante: Despejado total
✅ Orientación: Sur-Oeste (FeatureId: 28)
✅ Sol tarde: Máximo en terraza
✅ Atardeceres: Increíbles
```

#### Características Ático
```
✅ Última planta: Sí
✅ Solo 1 vecino: Planta completa
✅ Ascensor: Sí (FeatureId: 22)
✅ Privacidad: Máxima
✅ Escalera interior: Diseño
✅ Doble altura: Salón 5m
✅ Claraboyas: 3
```

#### Interior Premium
```
✅ Amueblado: Parcialmente
✅ Cocina: Americana con isla (FeatureId: 314)
✅ Electrodomésticos: Alta gama incluidos (FeatureId: 259)
✅ Calefacción: Suelo radiante (FeatureId: 29, 320)
✅ Aire acondicionado: Conductos (FeatureId: 254)
✅ Domótica: Completa (FeatureId: 142)
✅ Alarma: Sí (FeatureId: 235)
✅ Video portero: Sí
✅ Armarios empotrados: Todos dormitorios (FeatureId: 258)
✅ Baño suite: Sí (FeatureId: 260)
```

#### Garaje y Trastero
```
✅ Garaje: 2 plazas incluidas (FeatureId: 23)
✅ Trastero: 8 m² incluido (FeatureId: 24)
✅ Ascensor garaje: Sí
```

#### Materiales
```
✅ Suelo: Parquet (FeatureId: 290)
✅ Suelo terraza: Tarima composite
✅ Carpintería: Aluminio RPT
✅ Doble acristalamiento: Sí
✅ Persianas: Motorizadas
```

#### Certificación Energética (NO DISPONIBLE EN FORM)
```
⚠️ NOTA: Campos de certificación energética NO disponibles en formulario.
✅ Placas solares: 8 paneles en terraza (solarPanels: true)
```

#### Comunidad
```
✅ Piscina comunitaria: Sí (FeatureId: 300)
✅ Gimnasio: Sí (FeatureId: 309)
✅ Zona infantil: Sí (FeatureId: 303)
✅ Portería: Sí
```

#### Media
```
📸 Imágenes: 45 (énfasis en terraza y vistas)
🎥 Videos: 3 (interior, terraza día, terraza atardecer)
🔗 YouTube: 1 (video drone 360°)
🌐 Tour virtual: 1 (Matterport)
```

**Característica Principal:** Terraza 150 m² con vistas 360°

---

## 🔍 TESTS ESPECÍFICOS POR CARACTERÍSTICA

### Test A: **Todos los Tipos de Calefacción**
Crear 6 propiedades idénticas variando solo `heatingType` (FeatureId: 320):

1. Gas natural (1)
2. Eléctrico (2)
3. Gasoil (3)
4. Bomba calor (4)
5. Suelo radiante (5)
6. Otros (6)

**Verificar:** Payload correcto para cada tipo

---

### Test B: **Todos los Tipos de Agua Caliente**
Crear propiedades variando `hotWaterType` (FeatureId: 321):

1. Gas (1)
2. Eléctrico (2)
3. Bomba calor (3)
4. Solar (4)
5. Gasoil (5)
6. Otros (6)

---

### Test C: **Todas las Orientaciones**
Crear propiedades con todas las orientaciones (FeatureId: 28):

1. Noreste (1)
2. Oeste (2)
3. Norte (3)
4. Suroeste (4)
5. Este (5)
6. Sureste (6)
7. Noroeste (7)
8. Sur (8)

---

### Test D: **Todos los Estados de Conservación**
Crear propiedades con todos los estados (FeatureId: 249):

1. Buen estado (1)
2. Muy buen estado (2)
3. Casi nuevo (3)
4. Necesita reforma (4)
5. Reformado (6)

---

### Test E: **Todas las Escalas Energéticas**
⚠️ **NO DISPONIBLE EN FORM** - Los campos de certificación energética (energyConsumptionScale, emissionsScale, energyConsumptionValue, emissionsValue, energyCertificateStatus) NO están en el formulario.

Este test NO SE PUEDE completar desde la UI actual.

---

### Test F: **Todas las Plantas/Pisos**
Crear propiedades en diferentes plantas (FloorId en PropertyAddress):

1. Sótano (1)
2. Planta baja (3)
3. Entresuelo (4)
4. Primera (6)
5. Segunda (7)
6. Tercera (8)
7. Cuarta (9)
8. Quinta (10)
9. Sexta (11)
10. Séptima (12)
11. Ático (22)

---

### Test G: **Todos los Modos de Visibilidad**
Publicar MISMA propiedad 3 veces con diferentes modos:

1. **Exacta (1):** Coordenadas exactas mostradas
2. **Calle (2):** Solo calle, sin número exacto
3. **Zona (3):** Solo barrio/zona

**Verificar:** VisibilityModeId en PropertyAddress

---

### Test H: **Precio Oculto vs Mostrado**
Publicar propiedad con:

1. `hidePrice = false` → ShowPrice: true
2. `hidePrice = true` → ShowPrice: false

**Verificar:** Campo ShowPrice en PropertyTransaction

---

### Test I: **Todos los Tipos de Media**
Crear propiedad con TODOS los tipos de PropertyDocument:

```
TypeId: 1 - Imágenes (50)
TypeId: 8 - Videos (5, < 100MB cada uno)
TypeId: 31 - YouTube (3 enlaces)
TypeId: 7 - Tour virtual (2 Matterport)
TypeId: 23 - Planos (5 PDFs)

Total: 65 PropertyDocuments
```

**Verificar:** SortingId secuencial correcto

---

### Test J: **Watermarking Completo**
Probar todos los escenarios de watermark:

1. **Con watermark enabled:**
   - 20 imágenes → Verificar S3 upload
   - Verificar cleanup post-publicación
   - Verificar URLs watermarked en payload

2. **Sin watermark:**
   - Verificar URLs originales en payload

3. **Fallo parcial watermark:**
   - Simular error en 5 de 20 imágenes
   - Verificar fallback a originales
   - Verificar publicación exitosa

---

## 📋 CHECKLIST DE CAMPOS COMPLETO

### ✅ PropertyAddress Fields
- [x] ZipCode
- [x] FloorId (20+ mappings)
- [x] x (longitude)
- [x] y (latitude)
- [x] VisibilityModeId (1-3)
- [x] Street
- [x] Number

### ✅ PropertyFeature Fields (FeatureIds)
#### Basic Info
- [x] 1 - squareMeter
- [x] 2 - title
- [x] 3 - description
- [x] 11 - bedrooms
- [x] 12 - bathrooms
- [x] 231 - yearBuilt

#### Structure & Orientation
- [x] 22 - hasElevator
- [x] 27 - terrace
- [x] 28 - orientation (8 values)
- [x] 29 - hasHeating
- [x] 62 - terraceSize
- [x] 69 - builtSurfaceArea

#### Parking & Storage
- [x] 23 - hasGarage
- [x] 24 - hasStorageRoom

#### Pools
- [x] 25 - privatePool
- [x] 300 - communityPool

#### Furniture & Equipment
- [x] 30 - isFurnished
- [x] 258 - builtInWardrobes
- [x] 259 - appliancesIncluded
- [x] 260 - suiteBathroom

#### Amenities
- [x] 142 - homeAutomation
- [x] 176 - nearbyPublicTransport
- [x] 235 - alarm
- [x] 254 - airConditioning
- [x] 257 - laundryRoom
- [x] 272 - surveillance (alarm)
- [x] 274 - jacuzzi
- [x] 277 - sauna
- [x] 286 - internet

#### Kitchen & Appliances
- [x] 287 - microwave
- [x] 288 - oven
- [x] 289 - officeKitchen
- [x] 290 - parquet
- [x] 291 - tv
- [x] 292 - fridge
- [x] 293 - washingMachine
- [x] 294 - securityDoor
- [x] 295 - stoneware
- [x] 314 - furnishedKitchen

#### Outdoor
- [x] 297 - balcony
- [x] 298 - privateGarden

#### Community
- [x] 302 - sportsArea
- [x] 303 - childrenArea
- [x] 309 - gym
- [x] 310 - tennisCourt
- [x] 313 - petsAllowed

#### Energy & Climate
- [x] 249 - conservationStatus (6 values)
- [x] 320 - heatingType (6 values)
- [x] 321 - hotWaterType (6 values)
- [x] 323 - energyConsumptionScale (A-G)
- [x] 324 - emissionsScale (A-G)
- [x] 325 - energyConsumptionValue
- [x] 326 - emissionsValue
- [x] 327 - energyCertificateStatus (3 values)

### ✅ PropertyDocument Types
- [x] TypeId: 1 - Images (with watermarking)
- [x] TypeId: 7 - Virtual tours
- [x] TypeId: 8 - Videos (< 100MB)
- [x] TypeId: 23 - Blueprints
- [x] TypeId: 31 - YouTube links

### ✅ PropertyContactInfo
- [x] TypeId: 1 - Email
- [x] TypeId: 2 - Phone

### ✅ PropertyTransaction
- [x] TransactionTypeId (5 types)
- [x] Price
- [x] ShowPrice

### ✅ Property Types & Subtypes
- [x] TypeId: 1 (Piso) - 8 subtypes
- [x] TypeId: 2 (Casa) - 6 subtypes
- [x] TypeId: 3 (Local) - 5 subtypes
- [x] TypeId: 6 (Solar) - 3 subtypes
- [x] TypeId: 8 (Garaje) - 3 subtypes

---

## 🎯 PRIORITY TEST MATRIX

### Must Test (Critical Path)
1. ✅ Scenario 1 - Maximum luxury penthouse (ALL features)
2. ✅ Scenario 8 - Chalet with pool (Exterior focus)
3. ✅ Scenario 10 - Ático with 150m² terrace (Views/Outdoor)
4. ✅ Test E - All energy scales (A-G)
5. ✅ Test C - All orientations
6. ✅ Test I - All media types

### Should Test (High Value)
7. ✅ Scenario 2 - Casa rural (Different characteristics)
8. ✅ Scenario 3 - Student room sharing
9. ✅ Scenario 4 - Commercial office
10. ✅ Test A - All heating types
11. ✅ Test B - All hot water types
12. ✅ Test G - All visibility modes

### Nice to Test (Coverage)
13. ✅ Scenario 5 - Solar/Land
14. ✅ Scenario 6 - Garage
15. ✅ Scenario 7 - Loft industrial
16. ✅ Scenario 9 - Transferencia
17. ✅ Test D - All conservation states
18. ✅ Test F - All floor levels
19. ✅ Test H - Price hidden/shown
20. ✅ Test J - Watermarking scenarios

---

## 📊 EXPECTED RESULTS TABLE

| Scenario | TypeId | SubTypeId | TransactionTypeId | FeatureIds Count | Media Count |
|----------|--------|-----------|-------------------|------------------|-------------|
| 1 - Luxury Penthouse | 1 | 5 | 1 | 45+ | 63 |
| 2 - Casa Rural | 2 | 24 | 1 | 25+ | 42 |
| 3 - Student Room | 1 | 6 | 7 | 15+ | 15 |
| 4 - Office | 4 | 51 | 3 | 20+ | 28 |
| 5 - Solar | 6 | 56 | 1 | 5+ | 22 |
| 6 - Garage | 8 | 69 | 1 | 8+ | 10 |
| 7 - Loft | 1 | 7 | 3 | 22+ | 37 |
| 8 - Chalet Pool | 2 | 20 | 1 | 40+ | 63 |
| 9 - Transfer | 1 | 11 | 4 | 18+ | 20 |
| 10 - Ático Terraza | 1 | 5 | 1 | 35+ | 50 |

---

## 🔧 VALIDATION CHECKLIST

For EACH scenario, verify:

### Pre-Publication
- [ ] All form fields filled correctly
- [ ] Agent selected
- [ ] Owner(s) selected
- [ ] At least 1 image uploaded
- [ ] Coordinates set (if visibility = Exact)
- [ ] Description generated
- [ ] Short description generated

### Publication
- [ ] Payload JSON logged in console
- [ ] All expected FeatureIds present
- [ ] PropertyAddress correct (FloorId, coordinates, visibility)
- [ ] PropertyDocuments sorted correctly (SortingId)
- [ ] Watermarking processed (if enabled)
- [ ] API request sent (POST)
- [ ] Response StatusCode 201
- [ ] Database updated (listings.fotocasa = true)
- [ ] fotocasa_payloads entry created
- [ ] fotocasa_requests entry created (success = true)
- [ ] Watermarked images cleaned from S3

### Post-Publication
- [ ] Listing visible on Fotocasa.es
- [ ] All images display correctly
- [ ] All features shown correctly
- [ ] Price shown/hidden as configured
- [ ] Address visibility correct
- [ ] Contact info correct

### Update
- [ ] Change at least 3 fields
- [ ] Execute PUT request
- [ ] Response StatusCode 200
- [ ] Database remains fotocasa = true
- [ ] fotocasa_requests entry created (UPDATE)
- [ ] Changes reflected on Fotocasa.es

### Deletion
- [ ] Execute DELETE request
- [ ] Response StatusCode 200
- [ ] Database updated (listings.fotocasa = false)
- [ ] fotocasa_requests entry created (DELETE)
- [ ] Listing removed from Fotocasa.es

---

## 🚀 EXECUTION PLAN

### Phase 1: Core Features (Day 1)
- Scenario 1 (All features baseline)
- Scenario 8 (Exterior/Family)
- Test E (Energy scales)
- Test G (Visibility modes)

### Phase 2: Property Types (Day 2)
- Scenario 2 (Casa rural)
- Scenario 4 (Office)
- Scenario 5 (Solar)
- Scenario 6 (Garaje)

### Phase 3: Listing Types (Day 3)
- Scenario 3 (RoomSharing)
- Scenario 9 (Transfer)
- Scenario 7 (Rent loft)
- Scenario 10 (Sale ático)

### Phase 4: Characteristics Deep Dive (Day 4)
- Test A (Heating types)
- Test B (Hot water types)
- Test C (Orientations)
- Test D (Conservation states)

### Phase 5: Technical (Day 5)
- Test I (All media types)
- Test J (Watermarking)
- Test H (Price visibility)
- Test F (Floor levels)

---

## 📝 BUG TRACKING TEMPLATE

```markdown
## Bug Report: [Title]

**Scenario:** [Number and name]
**Date:** [YYYY-MM-DD]
**Tester:** [Name]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happened]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Evidence
- Screenshot: [Link]
- Payload JSON: [Link/Paste]
- API Response: [Link/Paste]
- Console Logs: [Link/Paste]

### Impact
- [ ] Critical (blocks publication)
- [ ] High (incorrect data sent)
- [ ] Medium (minor field missing)
- [ ] Low (cosmetic/logging)

### Related Fields/FeatureIds
- Field: [fieldName]
- FeatureId: [number]
- Value sent: [value]
- Expected: [value]
```

---

## 🎓 SUMMARY

This comprehensive test guide provides:
- **10 detailed scenarios** covering all property types
- **10 specific characteristic tests** (A-J)
- **58+ FeatureIds** validated
- **25 property subtypes** tested
- **5 listing types** verified
- **5 media types** uploaded
- **3 visibility modes** confirmed
- **20+ floor types** mapped
- **Watermarking** fully tested

By completing all scenarios and tests, you will have achieved **100% coverage** of the Fotocasa integration capabilities in the Vesta platform.

---

**Total Test Time Estimate:** 40-50 hours
**Total Scenarios:** 20 (10 main + 10 specific)
**Total Fields Covered:** 100+
**Total Expected Publications:** 50+

🎯 **OBJETIVO:** Probar absolutamente TODO lo que Fotocasa puede recibir desde Vesta.

---

## 📋 AVAILABLE FORM FIELDS vs FOTOCASA FEATUREIDS

### ✅ CAMPOS DISPONIBLES EN FORMULARIO (99 campos)

#### Módulo: basicInfo
1. `title` - Título de la propiedad
2. `description` - Descripción larga
3. `shortDescription` - Descripción corta
4. `internalReference` - Referencia interna
5. `cadastralReference` - Referencia catastral
6. `newConstruction` - Obra nueva
7. `bankOwned` - Banco

#### Módulo: propertyDetails
8. `bedrooms` - Dormitorios
9. `bathrooms` - Baños
10. `toilets` - Aseos
11. `usableArea` - Superficie útil
12. `builtArea` - Superficie construida
13. `plotSize` - Tamaño parcela
14. `livingRoomSize` - Tamaño salón
15. `terraceSize` - Tamaño terraza
16. `yearBuilt` - Año construcción
17. `lastReform` - Última reforma
18. `buildingFloors` - Plantas del edificio
19. `conservationStatus` - Estado conservación

#### Módulo: location
20. `street` - Calle
21. `addressDetails` - Detalles dirección
22. `postalCode` - Código postal
23. `city` - Ciudad
24. `province` - Provincia
25. `municipality` - Municipio
26. `neighborhood` - Barrio
27. `latitude` - Latitud
28. `longitude` - Longitud
29. `addressVisibilityMode` - Modo visibilidad dirección

#### Módulo: features
30. `hasElevator` - Ascensor
31. `hasGarage` - Garaje
32. `garageType` - Tipo garaje
33. `garageSpaces` - Plazas garaje
34. `garageInBuilding` - Garaje en edificio
35. `garageNumbers` - Números garaje
36. `garageOptionalPrice` - Precio opcional garaje
37. `hasStorageRoom` - Trastero
38. `storageRoomSize` - Tamaño trastero
39. `storageRoomNumber` - Número trastero
40. `storageRoomOptionalPrice` - Precio opcional trastero
41. `isFurnished` - Amueblado
42. `furnishedQuality` - Calidad amueblado
43. `hasHeating` - Calefacción
44. `heatingType` - Tipo calefacción
45. `hotWaterType` - Tipo agua caliente
46. `hasAirConditioning` - Aire acondicionado
47. `airConditioningType` - Tipo aire acondicionado

#### Módulo: contactInfo
48. `contactEmail` - Email contacto
49. `contactPhone` - Teléfono contacto

#### Módulo: orientation
50. `isExterior` - Exterior
51. `isBright` - Luminoso
52. `orientation` - Orientación
53. `hasViews` - Vistas
54. `mountainViews` - Vistas montaña
55. `seaViews` - Vistas mar
56. `beachfront` - Primera línea playa

#### Módulo: additionalCharacteristics
57. `videoIntercom` - Video portero
58. `conciergeService` - Servicio portería
59. `securityGuard` - Vigilante seguridad
60. `alarm` - Alarma
61. `securityDoor` - Puerta blindada
62. `doubleGlazing` - Doble acristalamiento
63. `satelliteDish` - Antena parabólica
64. `disabledAccessible` - Accesible discapacitados
65. `vpo` - VPO

#### Módulo: premiumFeatures
66. `homeAutomation` - Domótica
67. `musicSystem` - Sistema musical
68. `jacuzzi` - Jacuzzi
69. `privatePool` - Piscina privada
70. `communityPool` - Piscina comunitaria
71. `gym` - Gimnasio
72. `sportsArea` - Zona deportiva
73. `childrenArea` - Zona infantil
74. `tennisCourt` - Pista de tenis
75. `privateGarden` - Jardín privado
76. `laundryRoom` - Cuarto lavadero
77. `fireplace` - Chimenea
78. `suiteBathroom` - Baño en suite
79. `solarPanels` - Placas solares

#### Módulo: additionalSpaces
80. `balcony` - Balcón
81. `numberOfBalconies` - Número de balcones
82. `gallery` - Galería
83. `cellar` - Bodega
84. `cellarSize` - Tamaño bodega
85. `builtInWardrobes` - Armarios empotrados

#### Módulo: materials
86. `floorType` - Tipo suelo
87. `parquet` - Parquet (específico)
88. `stoneware` - Gres (específico)
89. `blindType` - Tipo persiana
90. `carpentryType` - Tipo carpintería
91. `windowType` - Tipo ventana

#### Módulo: description (ya cubierto)
- Ya incluido en basicInfo

#### Módulo: rentalProperties
92. `petsAllowed` - Mascotas permitidas
93. `nearbyPublicTransport` - Transporte público cercano
94. `internet` - Internet
95. `appliancesIncluded` - Electrodomésticos incluidos
96. `furnishedKitchen` - Cocina amueblada
97. `microwave` - Microondas
98. `oven` - Horno
99. `washingMachine` - Lavadora
100. `fridge` - Nevera
101. `tv` - TV

**Total: ~101 campos disponibles en el formulario**

---

### ❌ CAMPOS NO DISPONIBLES EN FORMULARIO (Nice-to-Have)

#### Certificación Energética (5 campos) - CRÍTICO
- `energyConsumptionScale` (A-G) → FeatureId: 323
- `emissionsScale` (A-G) → FeatureId: 324
- `energyConsumptionValue` (kWh/m²·año) → FeatureId: 325
- `emissionsValue` (kg CO2/m²·año) → FeatureId: 326
- `energyCertificateStatus` (Disponible/En trámite/No) → FeatureId: 327

#### Cocina Adicionales (3 campos)
- `americanKitchen` - Cocina americana
- `frenchKitchen` - Cocina francesa
- `pantry` - Despensa

#### Electrodomésticos Adicionales (2 campos)
- `dishwasher` - Lavavajillas
- `dryer` - Secadora

#### Espacios Adicionales (4 campos)
- `coveredClothesline` - Tendedero cubierto
- `dressingRoom` - Vestidor
- `office` - Despacho/Office
- `studyRoom` - Sala de estudio

#### Características Especiales (6 campos)
- `heatedPool` - Piscina climatizada
- `automaticIrrigation` - Riego automático
- `gardenLighting` - Iluminación jardín
- `automaticGate` - Portón automático
- `elevatorToGarage` - Ascensor al garaje
- `storageInGarage` - Almacén en garaje

#### Otros (15 campos)
- `numberOfGalleries` - Número galerías
- `numberOfTerraces` - Número terrazas
- `porchSize` - Tamaño porche
- `pergola` - Pérgola
- `bbqArea` - Zona barbacoa
- `swimmingPoolSize` - Tamaño piscina
- `commercialLicense` - Licencia comercial
- `showcaseSize` - Tamaño escaparate
- `warehouseSize` - Tamaño almacén
- `officeSpace` - Espacio oficina
- `loadingDock` - Muelle de carga
- `industrialVoltage` - Voltaje industrial
- `craneCapacity` - Capacidad grúa
- `ceilingHeight` - Altura techo
- `columnSpacing` - Espaciado columnas

**Total: ~35 campos no disponibles pero útiles**

---

### ⚠️ OBSERVACIONES CRÍTICAS

#### 1. Gap de Certificación Energética
Los campos de certificación energética (FeatureIds 323-327) están **completamente ausentes** del formulario, pero son:
- **Obligatorios** en muchos anuncios inmobiliarios en España
- **Soportados** por la API de Fotocasa
- **Implementados** en el código fotocasa.tsx (líneas 853-897)

**Recomendación:** Añadir módulo de certificación energética al formulario.

#### 2. Electrodomésticos Parciales
El formulario incluye algunos electrodomésticos (microwave, oven, washingMachine, fridge, tv) pero falta:
- Lavavajillas (dishwasher)
- Secadora (dryer)

**Recomendación:** Completar la lista de electrodomésticos.

#### 3. Cocina Incompleta
Faltan campos específicos de cocina:
- Cocina americana (americanKitchen)
- Cocina francesa (frenchKitchen)
- Despensa (pantry)

#### 4. Campos Implementados en fotocasa.tsx pero NO en Form
- **FeatureId 277 (Sauna)**: Referenciado en fotocasa.tsx línea 771, pero NO existe en el formulario
- **FeatureId 289 (Office Kitchen)**: Mapeado en fotocasa.tsx, pero NO en formulario

**Recomendación:** Revisar todos los FeatureIds en fotocasa.tsx y asegurar que existen campos correspondientes en el formulario.

---

### 📊 RESUMEN EJECUTIVO

| Categoría | Cantidad |
|-----------|----------|
| ✅ Campos disponibles en formulario | 101 |
| ❌ Campos faltantes (nice-to-have) | 35 |
| ⚠️ Campos críticos faltantes (certificación energética) | 5 |
| 📍 Total campos en base de datos | 136+ |
| 🎯 Cobertura actual del formulario | ~74% |

**Conclusión:** El formulario cubre el 74% de los campos posibles. Los gaps más importantes están en certificación energética (obligatoria legalmente) y algunos electrodomésticos y espacios adicionales.

---

🎯 **OBJETIVO ACTUALIZADO:** Probar TODO lo que está DISPONIBLE en el formulario de Vesta para enviar a Fotocasa.
