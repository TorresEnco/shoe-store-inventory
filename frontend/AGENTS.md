# Frontend de Comercial Torres

Las pantallas están en `src/views/`, los componentes en `src/components/` y los contratos HTTP y mapeos en `src/services/`. Usa React 19, TypeScript estricto y los tokens de Tailwind CSS v4 de `src/index.css`. Consulta las reglas compartidas en [../AGENTS.md](../AGENTS.md).

- Diseña primero para teléfono. Conserva controles táctiles cómodos, etiquetas visibles y nombres accesibles. En diálogos, gestiona la entrada y devolución de foco, la navegación por teclado y el anuncio de estados y errores. Verifica viewport estrecho y ampliación de texto cuando cambie la caja.
- Modela el estado de sesión desde el servidor. Usa el rol para presentar acciones y maneja `401` y `403` explícitamente. La API es la fuente de permisos, precios efectivos, stock y resultados del cobro.
- Tipifica el contrato HTTP y valida datos externos donde condicionen el flujo. Representa estados de carga, vacío, éxito y error. Cancela lecturas obsoletas o descarta respuestas que lleguen fuera de orden. Separa fallos de red de errores de negocio y de renderizado.
- Usa un `variantId` válido para las líneas de venta. Valida cantidades y precios en el formulario y conserva el carrito cuando la API rechace la operación. Bloquea el doble envío, conserva la clave de la operación durante reintentos y distingue el resultado desconocido de un rechazo confirmado.
- Presenta confirmaciones a partir del resultado persistido y muestra explícitamente cualquier flujo de demostración. Formatea los importes en soles y escribe las etiquetas y errores en español. Aplica Impeccable a cambios de interfaz con validación en pantalla cuando esté disponible.
- Ejecuta build y lint con las dependencias instaladas. Los cambios de caja requieren cubrir selección de variante, envío, rechazo, reintento y teclado en la prueba apropiada. Documenta las comprobaciones manuales cuando falte una suite automatizada.

## Trazabilidad del frontend

- Cuando cambien el flujo de caja, el comportamiento visible o su integración HTTP, actualiza el [requisito relacionado](../docs/rup/requisitos/REQUISITOS.md) y el punto de implementación en la [matriz](../docs/rup/implementacion/IMPLEMENTACION.md#matriz-de-trazabilidad). Distingue simulación de integración real y registra en [Pruebas](../docs/rup/pruebas/PRUEBAS.md) la evidencia observada de interfaz o integración.
