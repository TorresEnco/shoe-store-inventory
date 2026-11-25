# Comercial Torres

## Proyecto

- POS móvil e inventario de calzado en un monolito modular. `backend/` usa Java 25, Spring Boot 4.1.1, Maven y PostgreSQL. Los módulos son `product`, `sale`, `analytics`, `user` y `customer`, con configuración compartida en `shared`.
- `frontend/` usa React 19, TypeScript 6, Vite y Tailwind CSS v4. Las reglas por área están en [backend/AGENTS.md](backend/AGENTS.md) y [frontend/AGENTS.md](frontend/AGENTS.md).
- [PLAN.md](PLAN.md) conserva el producto y sus hitos. [AUDIT_REMEDIATION.md](AUDIT_REMEDIATION.md) registra el estado técnico verificado y el orden de corrección. Comprueba el flujo real antes de considerar operativa una pantalla o una ruta.

## Reglas de cambio

- Conserva la arquitectura hexagonal. Mantén el dominio en Java puro, los casos de uso y puertos en aplicación y HTTP y JPA en sus adaptadores. Evita dependencias circulares entre módulos.
- Protege los invariantes de caja. La venta válida descuenta la variante correcta, persiste cabecera y líneas en una transacción y deja stock no negativo. Una anulación restituye una sola vez. Un reintento del mismo cobro conserva una sola venta.
- El servidor determina la identidad y autoriza por rol y por recurso. Reserva empleados y analítica a `ADMIN`. Aplica a `CASHIER` el alcance acordado para ventas, historial y ajustes. Valida permisos aun si la interfaz oculta la acción. Usa OWASP ASVS 5.0.0 V6, V7 y V8 como referencia para autenticación, sesiones y autorización.
- Conserva precios negociados dentro de la política de venta. Define escala y redondeo antes de cambiar importes y comprueba que el total persistido coincide con la suma de subtotales. UI y mensajes para el usuario en español, importes en soles (`S/.`), identificadores de código y columnas en inglés.
- Valida entradas en el límite de la API y protege invariantes en el caso de uso. Envía errores estables y accionables. Mantén secretos, datos de clientes y detalles internos fuera de respuestas, fixtures públicos y registros.
- Antes de crear un componente o clase, revisa los archivos vecinos en `frontend/src/components/` o `backend/src/main/java/`. Sigue sus convenciones de nombres, props y estilo. Mantén los componentes por debajo de 150 líneas y agrega clases abstractas, factories o utilidades compartidas solo si se usan en al menos dos archivos.
- Prueba cada regla de negocio que cambie. Para migraciones, concilia datos, versiona el SQL y verifica instalación y actualización en PostgreSQL aislado antes de autorizar su aplicación.
- Revisa Git antes y después. Preserva cambios locales y limita commits, ramas, merges, pushes y operaciones con datos persistentes a lo autorizado. Mantén la corrección acotada al paquete seleccionado.
- Al cerrar una funcionalidad o corrección coherente y comprobada, sugiere un commit y explica brevemente qué avance guardaría. Sugiere subir la rama a GitHub cuando haya un hito revisable o convenga respaldar el trabajo. Distingue commit local, push y publicación en producción, informa las verificaciones pendientes y aprovecha las autorizaciones ya concedidas. Cuando falte autorización, presenta el alcance concreto antes de pedirla. Evita acumular funcionalidades independientes sin avisar.
- Usa una rama por funcionalidad o corrección con alcance propio, agrupando código, pruebas y documentación relacionados. Evita abrir ramas por archivo o ajuste menor. Antes de crearla, revisa la base y los cambios pendientes. Si depende de una rama aún sin integrar, créala desde esa rama y explica la dependencia. Usa nombres descriptivos como `feature/catalog-persistence` o `fix/sale-validation`. Recomienda la integración cuando el cambio esté comprobado y revisable, respetando la autorización del usuario para merges y pushes.

## Verificación

- Backend en `backend/`: `.\mvnw.cmd -o -B -ntp test-compile` con caché local. Ejecuta `mvnw.cmd test` cuando haya una configuración de prueba aislada. La prueba de contexto actual carga la configuración principal y puede actualizar el esquema y sembrar datos.
- Frontend en `frontend/`: `npm run build` incluye `tsc -b`. Para comprobar tipos por separado con el compilador instalado usa `node node_modules/typescript/bin/tsc -b --force`. Ejecuta `npm run lint`. El repositorio todavía carece de un script de pruebas frontend.
- Usa copias temporales si los checks generan archivos y la tarea requiere solo lectura. Registra comandos, resultados, fallos de línea base y verificaciones pendientes.

## Documentación por disciplinas

- Mantén sincronizada la [documentación de la adaptación de RUP](docs/rup/README.md) en cada cambio importante de código. Actualiza solo los artefactos afectados y reutiliza el dato en su fuente mediante enlaces. Conserva el alcance histórico de `PLAN.md` y el backlog como registro técnico de remediación.
- Si cambia un comportamiento esperado, actualiza el [requisito](docs/rup/requisitos/REQUISITOS.md) y enlázalo con diseño, código y verificación en la [matriz](docs/rup/implementacion/IMPLEMENTACION.md#matriz-de-trazabilidad). Registra las decisiones arquitectónicas significativas en [Diseño](docs/rup/analisis-diseno/DISENO.md) con su motivo y estado.
- Si el cambio corrige un hallazgo, actualiza el identificador y resultado correspondiente en [AUDIT_REMEDIATION.md](AUDIT_REMEDIATION.md). Registra en [Pruebas](docs/rup/pruebas/PRUEBAS.md) el resultado real de las verificaciones del cambio o el motivo por el que quedaron pendientes. Enlaza la evidencia existente cuando ya esté registrada.
- Actualiza [Despliegue](docs/rup/despliegue/DESPLIEGUE.md) al cambiar instrucciones de entorno, configuración o puesta en marcha. Mantén explícitos los puntos pendientes de validación y usa las disciplinas como organización de información, sin seguimiento por iteraciones formales.
