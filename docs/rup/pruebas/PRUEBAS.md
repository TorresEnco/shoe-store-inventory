# Pruebas y evidencia de verificación

## Evidencia disponible

La [línea base de la auditoría](../../../AUDIT_REMEDIATION.md#línea-base-del-18-de-noviembre-de-2026) registra que Maven compiló código de aplicación y prueba, que el build y la comprobación de tipos del frontend pasaron y que ESLint reportó seis errores. Es evidencia histórica de compilación y análisis estático. La única prueba Java identificada es `contextLoads`, que quedó sin ejecutar porque carga el contexto con la configuración principal. El frontend tiene scripts de build y lint, y carece de suite de pruebas declarada. Esta preparación documental no añadió una ejecución de aplicación. [InventoryApplicationTests](../../../backend/src/test/java/com/shoestore/inventory/InventoryApplicationTests.java#L6) · [package.json](../../../frontend/package.json#L6)

## Casos de verificación propuestos

Los casos siguientes describen la aceptación prevista. Su cobertura completa está pendiente y las verificaciones parciales ejecutadas figuran en el registro de resultados. Los datos de prueba deben ser ficticios y PostgreSQL debe estar aislado. Para cada corrección, los casos específicos y sus criterios adicionales se mantienen en [AUDIT_REMEDIATION.md](../../../AUDIT_REMEDIATION.md).

### PV-01 Venta y pago

Confirma para RF-01 que las líneas de variantes, cantidades y precios negociados coinciden con la venta devuelta y persistida. Comprueba cliente opcional y medio de pago. La comprobación de Yape/Plin necesita configuración de prueba y la regla de confirmación acordada.

Mientras Yape/Plin esté pendiente de habilitar, comprueba que el QR esté marcado como muestra y que el POS envíe `CASH` al confirmar el cobro.

### PV-02 Inventario y catálogo

Confirma para RF-02 y RF-03 que los cambios por color y talla se mantienen después de recargar. Incluye un ajuste compensado entre tallas, el alta y la edición persistentes cuando sus contratos estén disponibles.

### PV-03 Rotación de inventario

Confirma para RF-04 una clasificación coherente para un grupo dominante, los cruces de umbral y un período sin ventas. La regla de corte y liquidación debe estar validada antes de fijar las aserciones.

### PV-04 Acceso y permisos

Verificar login válido e inválido, 401 para identidad ausente, 403 por permisos o CSRF, rotación e invalidación de sesión, renovación CSRF, desactivación, identidad y rol derivados del servidor. Comprobar con dos cajeros y un administrador el aislamiento de ventas, las operaciones permitidas de inventario y clientes, y las rutas administrativas. [Matriz de permisos](../requisitos/REQUISITOS.md#rnf-03-autorización-del-servidor)

### PV-05 Uso móvil

Confirma para RNF-01 que selección, cobro, errores y regreso al carrito funcionan en un viewport móvil, con importes en soles, interfaz en español y navegación por teclado. Los dispositivos de aceptación están pendientes.

### PV-06 Consistencia de venta

Confirma para RNF-02 que dos ventas concurrentes del último par no pueden completarse ambas, que un fallo tardío revierte la operación, que una anulación restituye una sola vez y que un reintento conserva el mismo registro. Releer stock y venta desde otra transacción y comprobar la igualdad entre total y suma de subtotales.

## Registro de resultados

Anotar por cambio el caso ejecutado, comando o procedimiento, entorno, resultado observado y referencia al cambio o evidencia. Registrar por separado cada prueba **no ejecutada** con su motivo. Si el detalle ya vive en una entrada del backlog, guardar aquí el enlace y el identificador del caso. Mantener secretos y datos personales fuera de los registros.

### SEC-01 · PV-04 y venta autenticada

- Maven 3.10.0, Java 25, Spring Boot 4.1.1 y Spring Security 7.1.1. Con Maven offline y la selección `-Dtest=SessionSecurityTests test` pasaron cinco pruebas, sin errores, fallos ni omisiones. MockMvc carga la cadena real, el caso de login BCrypt y los servicios de productos y ventas. Los repositorios son dobles en memoria. Se comprobó login, rotación, recarga del perfil, invalidación, desactivación, CSRF, 401/403, denegación por defecto, permisos administrativos y de caja, consulta por propietario y registro de venta con cliente, precio negociado e identidad derivada del servidor. [Suite](../../../backend/src/test/java/com/shoestore/inventory/SessionSecurityTests.java)
- React 19.3.1 y TypeScript 6.0.3. `npm run build` pasó. `npm run lint` devolvió seis errores correspondientes a los patrones ya registrados en la línea base. El de carga de catálogo aparece ahora en AuthenticatedPos. [Línea base](../../../AUDIT_REMEDIATION.md)
- Edge headless, viewport de 390 × 844, bundle de producción y API sintética en loopback. Pasaron login incorrecto y correcto, recuperación tras recarga, historial de caja sin anulación y cierre de sesión. La página del POS comprobada cabía en el ancho del viewport.
- El 21 de noviembre de 2026 pasó el recorrido integrado desde Edge headless (390 × 844) con el bundle del frontend, un proxy HTTPS en loopback, Spring con perfil `prod` y un clúster PostgreSQL 18.1 desechable. Se reutilizó el bundle de producción y se arrancó Spring con las clases y dependencias locales. El lanzador Maven offline tenía dependencias propias ausentes de la caché.
- Dos cajeros y un administrador usaron cuentas ficticias. La venta desde la interfaz devolvió `201` y PostgreSQL confirmó una línea de S/ 49,90 atribuida al primer cajero y stock de 8 a 7. El segundo cajero recibió historial vacío, `404` al consultar esa venta y `403` en administración. El administrador pudo consultar la venta y la lista de empleados.
- Se comprobó la recuperación del perfil al recargar y la cookie de sesión `Secure`, `HttpOnly`, `SameSite=Lax`. El logout devolvió `204` y la consulta posterior de perfil devolvió `401`. Con un timeout de un minuto configurado para la prueba, la sesión inactiva devolvió `401` y React presentó el login.
- El primer intento de login vía proxy devolvió `403` porque Spring recibía un origen diferente al del navegador. El recorrido pasó al conservar el host público y configurar Spring para reconocer el esquema HTTPS de las cabeceras reenviadas. [Despliegue](../despliegue/DESPLIEGUE.md)
- Tras añadir el límite de autenticación, Maven offline ejecutó `SessionSecurityTests` y `LoginAttemptLimiterTests`. Pasaron las ocho pruebas, sin fallos, errores ni omisiones. Se verificaron el límite antes de consultar credenciales, `429` con `Retry-After`, el límite por dirección, la reserva concurrente por cuenta y la recuperación al vencer la ventana. `node node_modules/typescript/bin/tsc -b --force` también pasó.
- Pasó la prueba aislada de Spring con `ForwardedHeaderFilter` y dos direcciones ficticias reenviadas por el mismo proxy simulado. El primer cliente recibió `429` al intentar superar su presupuesto. El segundo todavía pudo llegar a la validación de credenciales, que devolvió `401` para la cuenta ficticia. [Prueba de la dirección de cliente](../../../backend/src/test/java/com/shoestore/inventory/SessionSecurityTests.java)
- Pendientes la comprobación del proxy real y la prueba desde el teléfono objetivo. La prueba general de arranque apunta a la configuración principal y quedó excluida.

### TX-01 · PV-06 y concurrencia de stock

La prueba inicial con PostgreSQL 18.1 desechable confirmó dos ventas del último par y dejó stock cero. Con la corrección, `StockConcurrencyTests` confirmó una sola venta del último par, una sola restitución al anular dos veces en paralelo y un solo descuento al competir una venta con un ajuste manual. Una consulta posterior verificó el stock y los registros. También pasó el rollback tras falta de stock en una segunda variante y ante el fallo de persistencia de la segunda línea, que revirtió stock, cliente, cabecera y líneas.

Maven offline ejecutó diez pruebas dirigidas de concurrencia y seguridad, con cero fallos, errores u omisiones. La repetición de `StockConcurrencyTests` con el caso adicional de fallo de escritura también pasó. El build del frontend pasó y los clústeres quedaron detenidos. Para ejecutar la prueba de persistencia, usar `-Dtest=StockConcurrencyTests test` con `TX01_TEST_JDBC_URL` apuntando al clúster desechable y vacío en loopback, creado con el rol de prueba `tx01_fixture`. [Suite de concurrencia](../../../backend/src/test/java/com/shoestore/inventory/StockConcurrencyTests.java)

### TX-02 · Reintento de cobro

- Maven offline ejecutó diez pruebas dirigidas sin fallos, errores ni omisiones. En PostgreSQL desechable, tras aplicar la migración a un esquema con ventas de prueba existentes, se verificaron la repetición en paralelo y secuencial, el rechazo de contenido distinto, el aislamiento por empleado y el rollback de la reserva al fallar el cobro.
- El build del frontend pasó. En Edge headless con API sintética y viewport de 390 × 844, el doble clic y el reintento manual tras truncarse una respuesta confirmaron que el POS mantiene el carrito y repite la misma clave y el mismo cuerpo.
- También pasó el recorrido integrado de React, Spring y PostgreSQL 18.1 desechable en loopback. El proxy truncó el cuerpo de la primera respuesta tras recibir el `201` de Spring. El reintento manual obtuvo otro `201` con la misma clave e identificador de venta. PostgreSQL confirmó una venta, una línea, una clave asociada y stock de 2 a 1.

### FIN-01 · Cálculo de importes

Maven offline ejecutó diez pruebas dirigidas en PostgreSQL desechable y MockMvc sin fallos, errores ni omisiones. Una venta negociada de dos pares a S/ 19,95 y uno a S/ 8,35 se persistió con total S/ 48,25, igual a la suma de subtotales releída de PostgreSQL. También se comprobó que los ceros finales redundantes se aceptan y que una fracción de céntimo devuelve `400` sin cambiar stock ni guardar la venta o el cliente. Pasaron el build de React y una prueba en Edge con API sintética, donde el formulario bloqueó S/ 19,951, conservó el texto y permitió agregar el par al corregirlo a S/ 19,95. [Prueba de persistencia](../../../backend/src/test/java/com/shoestore/inventory/StockConcurrencyTests.java)

- El 25 de noviembre de 2026, `StockConcurrencyTests` pasó en PostgreSQL 18.1 desechable. El caso de uso rechazó S/ 0,00 y la lectura posterior confirmó el mismo stock y los mismos registros de venta, sin guardar el cliente de la solicitud rechazada. [Suite de persistencia](../../../backend/src/test/java/com/shoestore/inventory/StockConcurrencyTests.java)
- `SessionSecurityTests` y `LoginAttemptLimiterTests` pasaron diez pruebas en Maven offline. Una solicitud con una línea válida y otra a S/ 0,00 devolvió `400` en MockMvc antes de acceder a los repositorios de la venta. [Suite web](../../../backend/src/test/java/com/shoestore/inventory/SessionSecurityTests.java)
- Pasó `npm run build` y una comprobación en Node de ocho entradas contra el validador del formulario, incluidos el rechazo de S/ 0,00 y la aceptación de S/ 0,01. Quedó pendiente comprobar visualmente el nuevo mensaje en navegador. `npm run lint` volvió a reportar los seis errores de la línea base. [Formulario de caja](../../../frontend/src/components/QuantityDrawer.tsx)

### DB-01 · Esquema versionado

- En PostgreSQL 18.1 desechable, `psql` aplicó `000`, `001` y `002` desde una base vacía. Spring arrancó con el perfil `prod` y `ddl-auto=validate`. En otra base, una venta con empleado inexistente abortó `002`. Se conservó esa fila de prueba y la restricción de stock aplicada antes del error se revirtió. [Migraciones](../../../backend/db/migrations)
- La consulta de conciliación devolvió todos los conteos en cero en la base limpia y detectó el empleado inexistente en la base incompatible. [Consulta de solo lectura](../../../backend/db/checks/002-preflight.sql)
- `mvnw.cmd -o -B -ntp test` pasó las 12 pruebas, sin fallos, errores ni omisiones. La actualización con dos ventas históricas sintéticas conservó sus propietarios nulos y sus líneas. La prueba comprobó la visibilidad por propietario y anuló una venta histórica por el servicio, restituyendo stock y conservando el propietario nulo. También verificó el rechazo de ventas nuevas sin empleado válido, variantes duplicadas, stock negativo, referencias de variante inexistentes, importes inválidos y subtotales inconsistentes. [Suite de integración](../../../backend/src/test/java/com/shoestore/inventory/StockConcurrencyTests.java)
- El 25 de noviembre de 2026, la consulta ampliada en la base de trabajo devolvió dos ventas sin empleado y cero inconsistencias en los demás conteos. Se exportó el esquema y se transformaron nombres, teléfonos, fechas y claves de reintento antes de extraer las filas. Las cuentas de la copia quedaron inactivas y sus credenciales se sustituyeron. Se restauró la copia en otro clúster PostgreSQL 18.1 de loopback y se repitió la conciliación con el mismo resultado.
- La copia aceptó `002`. La comparación antes y después confirmó las mismas ventas, líneas, variantes y reservas de reintento, incluidas las dos ventas sin empleado. Se verificaron las siete restricciones declaradas y el disparador habilitado. `mvnw.cmd -o -B -ntp -Dtest=InventoryApplicationTests test` pasó con el perfil `prod` y `ddl-auto=validate` sobre la copia. Se detuvo y retiró el entorno temporal.
- El 25 de noviembre de 2026 se restauró un respaldo de formato personalizado de `pg_dump` en PostgreSQL aislado y se cotejaron las filas de las diez tablas con la base de trabajo. Con autorización y sin otras conexiones de cliente, se aplicó `002` en una transacción con bloqueo exclusivo. Se compararon las filas con el respaldo antes y después de ejecutar el SQL. Una consulta posterior de solo lectura confirmó las siete restricciones validadas, nueve columnas obligatorias, el disparador habilitado, dos ventas históricas sin empleado y cero inconsistencias en la conciliación. [Procedimiento](../despliegue/DESPLIEGUE.md#instalación-y-actualización-del-esquema)

### SEC-02 · Configuración y aprovisionamiento

- El 25 de noviembre de 2026, `mvnw.cmd -o -B -ntp test` pasó las 12 pruebas del backend en PostgreSQL 18.1 aislado con variables de conexión externas. Una base migrada vacía arrancó con `prod,demo` y conservó cero cuentas y productos. Se comprobó que al omitir cada variable obligatoria de PostgreSQL el arranque identifica la variable faltante. [Validación de configuración](../../../backend/src/main/java/com/shoestore/inventory/shared/config/DatabaseSettings.java)
- Un arranque separado con `demo` y credenciales de prueba generadas para ese proceso creó dos cuentas de demostración y cuatro productos. En otra base vacía, `prod,bootstrap-admin` creó un administrador activo con BCrypt sin abrir un servidor HTTP. El segundo intento con otro usuario falló y la base conservó un solo administrador. [Aprovisionamiento](../../../backend/src/main/java/com/shoestore/inventory/user/infrastructure/adapters/in/cli/BootstrapAdmin.java)
- La auditoría de solo lectura en la base de trabajo confirmó dos cuentas activas que aún coinciden con las contraseñas de demostración anteriores y un administrador activo fuera de ese par. Quedan pendientes la desactivación autorizada y la rotación de la credencial de PostgreSQL. [Procedimiento](../despliegue/DESPLIEGUE.md#aprovisionamiento-y-cuentas-de-demostración)

### POS-02 · QR de muestra y cobro en efectivo

- En Edge headless con API sintética y viewport de 390 × 844 se seleccionó una talla, se abrió el QR de muestra con la tecla Espacio y se revisó la captura. Abrir la muestra no envió solicitudes de venta. A 320 px y con ampliación al 200 %, se comprobó que el documento no desbordaba horizontalmente.
- La API sintética recibió `CASH` y la variante, cantidad y precio esperados. Tras un `400`, el cobro conservó el carrito y el siguiente intento generó una clave nueva. Ante una respuesta truncada, el reintento manual reaprovechó la clave y el contenido y mostró la confirmación tras recibir `201`.
- Pasaron `npm run build` y ESLint sobre los dos componentes modificados. `npm run lint` reportó los seis errores de la línea base. Queda pendiente verificar el QR y la recepción de pagos con el destino real del comercio.

### UX-01 · Foco y diálogos

- Edge headless con API sintética a 390 × 844 comprobó los cuatro diálogos. Se recorrieron Tab y Mayús+Tab, incluidos los extremos de la lista de controles, y se intentó enfocar el perfil del fondo. El foco permaneció dentro del diálogo. Escape devolvió el foco al disparador de talla, al botón COBRAR, al historial y al alta de calzado. El documento declaró `es-PE` y el árbol de accesibilidad expuso el nombre de cobro con rol de diálogo.
- La prueba detectó que las sugerencias de color se desmontaban al perder foco el campo, dejando sin foco el botón de sugerencia. Tras trasladar el control de salida de foco a la sección completa, pasó el recorrido con teclado.
- Escape durante una solicitud de cobro demorada conservó el diálogo. También pasaron rechazo de venta, truncamiento de respuesta y reintento con la misma clave y contenido. Se revisó la captura del cobro con dos variantes. El panel de QR de muestra siguió accesible con teclado.
- Pasaron `npm run build`, las cinco pruebas `node --test tests/api.test.cjs` y ESLint dirigido de los componentes modificados salvo el error preexistente de inicialización del drawer. Lint general conserva cinco errores previos. Pendientes la revisión con lector de pantalla y la validación en teléfono físico.

### POS-04 · Comunicación y lecturas vigentes

- `node --test tests/api.test.cjs`, desde `frontend/`, pasó cinco pruebas sin dependencias nuevas. Cubren mismo origen, credenciales y presupuesto de 15 segundos, conexión perdida, JSON o estructura inválida, timeout durante la lectura del cuerpo y separación entre rechazo de venta y resultado desconocido. [Pruebas de cliente](../../../frontend/tests/api.test.cjs)
- Edge headless a 390 × 844 con API sintética comprobó selección de variantes, rechazo de cobro, respuesta truncada y reintento con la misma clave y cuerpo. Tras una recarga fallida, dos reintentos concurrentes devolvieron el resultado reciente antes del antiguo. Se conservó el catálogo reciente. Dos consultas de historial comprobaron que un error antiguo no sustituye el resultado actual.
- Pasó `npm run build`. Lint conserva cinco errores previos. La revisión dirigida mantiene el error preexistente de `react-hooks/set-state-in-effect` en la raíz autenticada. El navegador utilizó la ampliación y el viewport estrecho del recorrido previo de caja. La comprobación del proxy y el teléfono de destino conserva su seguimiento en SEC-01.

### POS-01 · Persistencia del catálogo

- Backend offline ejecutó 13 pruebas dirigidas de variantes, seguridad y límite de login. Se verificó `403` para CASHIER en alta y edición, `201` para ADMIN y `400` para precio cero sin invocar persistencia. El fixture renueva su contraseña antes del segundo login, ya que el servicio la retira del objeto autenticado.
- `StockConcurrencyTests` pasó en PostgreSQL 18.1 desechable con `000`, `001` y `002`. El alta guardó producto, descripción y variante. Tras un ajuste de stock de 3 a 2, una edición con saldo obsoleto 999 guardó nombre y precio S/. 55,25 manteniendo stock 2 e identificador de variante. Añadió otro color de la misma talla y rechazó retirar variantes y precio cero. La suite también comprobó las carreras y rollback existentes.
- Edge headless a 390 × 844 con API sintética comprobó alta, rechazo sin tallas, preservación del formulario tras `400`, edición y recarga. El precio S/. 45,25 se mantuvo al reabrir y se editó a S/. 55,50. El stock registrado quedó deshabilitado y la respuesta actualizó su saldo. Se inspeccionó la captura del formulario.
- Pasó `npm run build`. `npm run lint` conserva cinco errores previos en archivos ajenos a la inicialización corregida. Queda pendiente la validación en teléfono físico. La preservación de variantes existentes es una decisión de esta entrega.
- Pasó el recorrido completo React–HTTP–Spring–PostgreSQL en una segunda base vacía del clúster temporal, con administrador ficticio, sesión y CSRF. Tras crear a S/. 45,25 y recargar, se abrió la edición, se aplicó un ajuste de stock desde otra solicitud y se guardó a S/. 55,50. La respuesta y otra recarga conservaron producto, variante y saldo actualizado de 2. La comprobación utilizó HTTP en loopback y la cookie sin `Secure` solo en ese proceso de prueba.
- El empaquetado offline quedó bloqueado por dependencias ausentes de `maven-jar-plugin`. El recorrido integrado arrancó las clases compiladas con el classpath de pruebas disponible.
- La repetición final de las cuatro suites pasó 14 pruebas, sin fallos, errores ni omisiones. Incluye una carrera dirigida que pausa la edición después de leer las variantes, confirma un ajuste desde otra transacción y permite continuar el guardado del precio. El saldo y la respuesta conservaron el valor actualizado. Pasaron `git diff --check` y ESLint dirigido sobre el formulario, sus componentes de variantes, inventario, cliente HTTP y mapper. El clúster temporal quedó detenido al finalizar.

### POS-03 · Variantes en caja

- Antes de versionar los avances acumulados se repitieron el build de frontend y las 12 pruebas dirigidas `SaleVariantTests`, `SessionSecurityTests` y `LoginAttemptLimiterTests`. Pasaron. Se retiró un token suelto del inicializador que impedía compilar. La ejecución aislada de PostgreSQL registrada más abajo corresponde a la verificación previa de persistencia.
- Pasó el build de frontend. Lint general conserva los seis errores previos.
- Edge headless con API sintética, viewport 390 × 844 y comprobación de desbordamiento a 320 px con ampliación al 200 %. Un producto con talla 40 en negro a S/. 45 y blanco a S/. 60 generó dos líneas y un total de S/. 105. El drawer precargó S/. 60 al cambiar de color. Tras rechazo y respuesta truncada, el reintento mantuvo las dos variantes y la clave correspondiente. Se inspeccionó la captura del checkout.
- Maven offline pasó 12 pruebas dirigidas, sin fallos, errores ni omisiones. Cubren rechazo de producto inactivo antes de escrituras, movimientos independientes de stock y conservación de precios negociados. Se actualizó el fixture de venta autenticada para declarar el producto activo.
- El tratamiento de estado nulo conserva la compatibilidad del catálogo existente, que solo considera inactivo el valor explícito falso.
- El 25 de noviembre de 2026, Maven offline ejecutó `StockConcurrencyTests`, `SaleVariantTests`, `SessionSecurityTests` y `LoginAttemptLimiterTests` con PostgreSQL 18.1 desechable en loopback. Pasaron 13 pruebas, sin fallos, errores ni omisiones. La suite aplicó las migraciones `000`, `001` y `002` a una base vacía y arrancó Spring con `prod` y validación del esquema.
- La lectura posterior a la transacción confirmó dos variantes de talla 46 y colores distintos, precios S/. 45 y S/. 60, total S/. 105 y saldos de 3 a 2 y de 4 a 3. Tras desactivar el producto, una venta nueva fue rechazada sin crear cliente ni venta y conservó el saldo. La anulación de la venta previa restituyó ambos saldos aun con el producto inactivo. También pasaron las carreras y los casos de rollback existentes. [Suite de persistencia](../../../backend/src/test/java/com/shoestore/inventory/StockConcurrencyTests.java)
