# Despliegue y operación

## Configuración observada

| Componente | Evidencia del repositorio |
| --- | --- |
| Frontend | React usa rutas relativas /api. En desarrollo Vite las reenvía a localhost:8080. En producción, servir el bundle y enrutar /api al backend bajo el mismo origen HTTPS. [Vite](../../../frontend/vite.config.ts) · [Cliente HTTP](../../../frontend/src/services/api.ts) |
| Backend | El POM utiliza Java 25, Spring Boot y Maven. La configuración principal fija el puerto `8080` y CORS admite el origen local de desarrollo. [pom.xml](../../../backend/pom.xml#L29) · [application.properties](../../../backend/src/main/resources/application.properties#L3) · [WebCorsConfig](../../../backend/src/main/java/com/shoestore/inventory/shared/config/WebCorsConfig.java#L11) |
| Datos | PostgreSQL con `ddl-auto=validate`. El arranque requiere `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` y `SPRING_DATASOURCE_PASSWORD`. Entregar los valores por configuración externa del proceso o un gestor de secretos. [Validación de configuración](../../../backend/src/main/java/com/shoestore/inventory/shared/config/DatabaseSettings.java) |

## Evidencia y condiciones para operar

### Instalación y actualización del esquema

- **Base vacía.** Ejecutar con `psql -X -v ON_ERROR_STOP=1` los archivos [000](../../../backend/db/migrations/000-initial-schema.sql), [001](../../../backend/db/migrations/001-sale-idempotency.sql) y [002](../../../backend/db/migrations/002-sale-and-stock-integrity.sql), en ese orden, antes de arrancar Spring.
- **Base existente.** En una copia representativa, ejecutar primero la [consulta de conciliación](../../../backend/db/checks/002-preflight.sql). Resolver cualquier conteo distinto de cero salvo el de ventas históricas sin propietario, que se conserva. Con el esquema base ya presente, ejecutar `001` si falta y aplicar `002` una sola vez. Verificar que Hibernate arranque con `validate`, que el conteo de ventas históricas se conserve y que las restricciones estén presentes. Para aplicar en la base de trabajo, coordinar la parada de escrituras, contar con un respaldo restaurable y obtener autorización.

`002` aplica sus cambios en una transacción. Si falla una restricción sobre datos existentes, PostgreSQL conserva el estado anterior. Las ventas sin empleado siguen visibles solo para ADMIN. En la base de trabajo están aplicadas `001` y `002`. Antes de aplicar `002` allí se restauró y cotejó un respaldo en un PostgreSQL temporal. El respaldo se conserva en el directorio privado de copias locales. Actualizar juntos la API y el frontend, porque la API exige `Idempotency-Key` para cobrar. [Pruebas de esquema](../pruebas/PRUEBAS.md#db-01--esquema-versionado)

El trabajo actual se realiza en local. El recorrido HTTPS en loopback y la prueba de direcciones reenviadas sirven como evidencia local. La comprobación del proxy de destino y del teléfono se retomará cuando se defina el entorno de publicación. [Registro de pruebas](../pruebas/PRUEBAS.md#registro-de-resultados)

El límite de login por dirección usa la dirección de cliente que Spring expone al controlador. Comprobar en el destino que el proxy de confianza sustituye también las cabeceras de dirección del cliente y que Spring distingue clientes detrás del proxy. El contador es local a una instancia. Si se despliegan varias réplicas, aplicar un límite común antes de publicar el servicio. [Diseño de identidad](../analisis-diseno/DISENO.md#d-03-identidad-y-permisos)

Si un proxy termina TLS, configurar el backend para reconocer el esquema y host públicos. En la prueba aislada funcionó `SERVER_FORWARD_HEADERS_STRATEGY=framework` con el proxy reenviando el host público y `X-Forwarded-Proto: https`. En el entorno de destino, restringir el acceso directo al backend y configurar el proxy de confianza para sustituir las cabeceras de reenvío recibidas del cliente. [Prueba integrada](../pruebas/PRUEBAS.md#sec-01--pv-04-y-venta-autenticada)

La sesión Servlet vive en una instancia del backend. Un reinicio requiere volver a iniciar sesión. El perfil prod fuerza la cookie Secure. Verificar en el navegador de destino HTTPS, HttpOnly, Secure, SameSite=Lax y el enrutamiento del mismo origen. Alojamiento y operación con múltiples instancias quedan pendientes. [Perfil de producción](../../../backend/src/main/resources/application-prod.properties) · [Pruebas](../pruebas/PRUEBAS.md)

Antes de documentar comandos de instalación o puesta en marcha, confirmar el destino, la topología y los orígenes de frontend y API, el acceso desde el teléfono y el mecanismo de custodia de credenciales. Para la base, confirmar la instancia y versión de PostgreSQL, el entorno desechable de pruebas y quién gestiona copias de seguridad, restauración y migraciones. Los valores secretos se gestionan fuera de esta documentación.

La validación operativa deberá cubrir dominios y HTTPS según el entorno, configuración de sesión y CORS, ausencia de datos de demostración, comportamiento del POS desde un teléfono y aceptación de los controles de permisos e integridad en aislamiento. En el proxy real, verificar con dos conexiones autorizadas que el backend recibe direcciones distintas. Comprobar desde el teléfono el login, la recuperación de sesión al recargar y el logout sobre HTTPS. Registrar cada resultado en [Pruebas](../pruebas/PRUEBAS.md).

### Aprovisionamiento y cuentas de demostración

- En una base migrada sin administrador activo, inyectar `TORRES_BOOTSTRAP_ADMIN_USERNAME`, `TORRES_BOOTSTRAP_ADMIN_FULL_NAME` y `TORRES_BOOTSTRAP_ADMIN_PASSWORD` en el proceso de aprovisionamiento junto con las variables de PostgreSQL. Ejecutar el JAR una vez con `SPRING_PROFILES_ACTIVE=prod,bootstrap-admin`. La contraseña se guarda con BCrypt y admite hasta 72 bytes. El proceso termina sin abrir el servidor HTTP y falla si encuentra otro administrador activo o el nombre de usuario ya existe. Después, retirar las variables de aprovisionamiento y usar el perfil `prod` para el arranque habitual. [Aprovisionamiento](../../../backend/src/main/java/com/shoestore/inventory/user/infrastructure/adapters/in/cli/BootstrapAdmin.java)
- Usar `demo` con una base desechable. Inyectar `TORRES_DEMO_ADMIN_PASSWORD` y `TORRES_DEMO_CASHIER_PASSWORD` para crear `demo-admin` y `demo-cashier`. Los perfiles `prod`, `test` y `bootstrap-admin` excluyen esa siembra. La configuración principal deja desactivado el SQL detallado. [Inicializador](../../../backend/src/main/java/com/shoestore/inventory/shared/config/DataInitializer.java)
- Antes de publicar con una base existente, confirmar que otro administrador real puede iniciar sesión y desactivar las cuentas de demostración identificadas mediante un procedimiento autorizado que preserve su historial. La cuenta de nombre `admin` tiene protección de desactivación en la API. Coordinar también la rotación de la credencial de PostgreSQL y la actualización de sus consumidores. [Auditoría SEC-02](../../../AUDIT_REMEDIATION.md)
