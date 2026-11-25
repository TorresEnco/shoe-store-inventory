# Backend de Comercial Torres

El código vive en `src/main/java/com/shoestore/inventory/`. Sigue el `pom.xml` para la versión de Java y el BOM de Spring Boot. Consulta las reglas compartidas en [../AGENTS.md](../AGENTS.md).

- Define contratos de entrada y salida en `application/ports/`. Los controladores validan DTOs y traducen resultados. Los servicios de aplicación coordinan los casos de uso y las transacciones. Los modelos de `domain/` utilizan Java puro. Mantén anotaciones JPA, repositorios Spring Data y mapeo de entidades dentro de los adaptadores.
- Mantén autoridades de Spring Security en el límite de entrada. Deriva el actor del principal autenticado y comprueba en la operación el acceso por recurso cuando corresponda. Traduce rechazo de autenticación, permiso, validación y conflicto a respuestas diferenciadas. Usa excepciones de negocio en los casos de uso.
- Conserva una transacción para cada alta o anulación de venta, incluidos stock, cabecera, líneas y cliente. Protege todos los escritores de stock con la misma regla de concurrencia. Un chequeo de saldo en memoria por sí solo carece de esa garantía. Define un orden estable si se modifican varias variantes y prueba los conflictos y el rollback.
- Usa `BigDecimal` de extremo a extremo en dominio y persistencia. Declara precisión y escala de PostgreSQL y valida cantidades, precios y descuentos antes de escribir. Recalcula importes en el servidor.
- Añade pruebas unitarias cuando la regla sea pura y pruebas web para la matriz de permisos y los errores de contrato. Para persistencia, bloqueo, concurrencia y rollback usa PostgreSQL desechable y confirma el estado desde otra transacción. Excluye la siembra de demo de los perfiles de prueba y producción.
- Sigue el backlog para las migraciones de `ddl-auto=update` a un esquema versionado. Prueba migraciones desde una base vacía y una copia representativa anonimizada. Mantén el Maven Wrapper y la caché local como primera opción para verificar.

## Trazabilidad del backend

- Cuando cambien contratos HTTP, permisos, transacciones o garantías de stock, actualiza el requisito o decisión afectados y su referencia en la [matriz](../docs/rup/implementacion/IMPLEMENTACION.md#matriz-de-trazabilidad). Registra la evidencia en [Pruebas](../docs/rup/pruebas/PRUEBAS.md). Si cambia el esquema, el arranque o la configuración operativa, actualiza también [Despliegue](../docs/rup/despliegue/DESPLIEGUE.md).
