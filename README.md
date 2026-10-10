# test-manager-library-3413974-tool

> **Prueba técnica · Ficha ADSO 3413974 · SENA**  
> Utilidad de sembrado y pruebas de demostración para **Manager Library**.  
> Cumple la tarea **T-21** de la especificación SDD: sembrado masivo exclusivamente a través de los endpoints HTTP de la API.

---

## 1. Características del Sembrador (`seed.js`)

- **Autenticación completa**: Inicia sesión como `admin`, aprovisiona un usuario con rol `librarian` e inicia sesión con dicho rol.
- **Categorías**: Valida las 5 categorías oficiales sembradas por la migración.
- **Catálogo de Libros**: Registra **42 libros reales** con títulos, autores, ISBN-13 válidos y ejemplares clasificados en las 5 categorías.
- **Socios**: Da de alta **10 socios** con nombres reales y documentos de identidad únicos.
- **Préstamos y Devoluciones**: Registra **15 préstamos**, devolviendo algunos para generar histórico cerrado y dejando otros abiertos.
- **Líneas Vencidas**: Registra exactamente **3 préstamos con fecha anterior a 14 días**, de modo que `/api/v1/loans/overdue` entrega líneas vencidas con cálculo de `days_late`.
- **Reporte**: Genera actividad demostrable para que `/api/v1/reports/most-borrowed` contenga filas agrupadas por metadatos congelados.

---

## 2. Requisitos y Ejecución

### Prerrequisitos
- Node.js v18+ (utiliza la API nativa de `fetch`, sin dependencias externas).
- El backend de Laravel (`test-manager-library-3413974-api`) corriendo en `http://localhost:8000`.

### Ejecución

```bash
# Con variables por defecto (localhost:8000, admin / admin12345)
node seed.js

# O mediante npm
npm run seed
```

### Variables de Entorno Opcionales
- `API_URL`: URL base de la API (por defecto `http://localhost:8000/api/v1`).
- `ADMIN_USER`: Nombre de usuario del admin (por defecto `admin`).
- `ADMIN_PASS`: Contraseña del admin (por defecto `admin12345`).

---

## 3. Evidencia Real de Ejecución

```text
🚀 Iniciando sembrador de demostración de Manager Library...
📡 Conectando a http://localhost:8000/api/v1
✅ Salud del backend: ok
🔑 Sesión admin iniciada con éxito (rol: admin)
👤 Bibliotecario 'bibliotecario_demo' creado exitosamente.
🔑 Sesión de bibliotecario iniciada con éxito.
📚 5 categorías disponibles en el sistema.
📖 Sembrando 42 libros en catálogo...
✅ 42 libros listos en catálogo.
👥 Sembrando 10 socios...
✅ 10 socios listos.
🔄 Registrando préstamos de prueba...
⏳ Registrando exactamente 3 préstamos vencidos...

📊 Verificación de /loans/overdue:
   Líneas vencidas: 3
   - «Romancero Gitano» (Felipe Vargas Navarro), venció hace 6 días
   - «Poeta en Nueva York» (Camila Rojas Mendoza), venció hace 6 días
   - «Los heraldos negros» (Andrés Felipe Vega), venció hace 6 días

📈 Verificación de /reports/most-borrowed:
   Filas en reporte: 36
   Libro más prestado: «Los heraldos negros» (2 veces)

✨ ¡Sembrado de datos completado exitosamente!
```
