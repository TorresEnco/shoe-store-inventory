# Requisitos del sistema

## Alcance y actores

Comercial Torres necesita un POS móvil para vender calzado, gestionar existencias y mantener el catálogo, así como un informe Pareto para la rotación de inventario. Los roles previstos son `ADMIN` y `CASHIER`. El cliente puede asociarse a una venta de forma opcional. La fuente es el alcance funcional y el contrato de datos del [plan maestro](../../../PLAN.md).

Los identificadores de este documento se asignan a requisitos ya descritos en el plan o a controles técnicos documentados en las reglas y la auditoría. Los criterios indican resultados esperados. El [mapa de implementación](../implementacion/IMPLEMENTACION.md) distingue lo conectado al backend de lo simulado.

### RF-01 Venta en caja

Cada línea identifica una variante por color y talla, conserva su precio negociado y descuenta sus existencias. Dos colores de la misma talla permanecen como líneas independientes. Los productos inactivos quedan excluidos de ventas nuevas.

Registrar una venta desde el POS móvil seleccionando la variante y la cantidad. Conservar el precio negociado por línea y el medio de pago admitido, efectivo o Yape/Plin. Mostrar «Público General» cuando falta el cliente. **Criterio:** la venta guardada contiene las líneas, precios, cantidades y medio seleccionados, con el total correspondiente. [PLAN.md, operaciones y contrato de venta](../../../PLAN.md)

Hasta verificar el destino de Yape/Plin y definir la confirmación de recepción, el POS solo permite cobrar en efectivo. El QR de Yape/Plin queda identificado como muestra visual. [POS-02](../../../AUDIT_REMEDIATION.md#pos-02--high--in_progress--p5b--media)

### RF-02 Ajuste de existencias

Recibir o ajustar stock por modelo, color y talla. Presentar los cambios y un resumen antes de confirmar. **Criterio:** los cambios confirmados quedan reflejados en el saldo de las variantes correspondientes al volver a consultar. [PLAN.md, ajuste de existencias](../../../PLAN.md)

### RF-03 Alta y edición de catálogo

Registrar calzado y sus variantes por color y talla. Editar los datos de catálogo previstos, incluidos nombre, precios y colores. **Criterio:** los datos confirmados se reflejan en una consulta posterior del catálogo. [PLAN.md, alta y edición de calzado](../../../PLAN.md)

El alta y la edición requieren ADMIN. Admiten nombre, descripción, marca, categoría, estado y precios positivos de hasta dos decimales, además de nuevas variantes. Las variantes registradas conservan su identificador, color y talla para preservar el historial. Sus existencias se cambian en el ajuste dedicado. Una edición conserva el stock actual aunque el formulario tenga un saldo antiguo. Los errores mantienen el formulario disponible para corregirlo.

### RF-04 Rotación de inventario

Presentar al administrador un análisis ABC por modelo y color con reparto de ingresos 80/15/5, velocidad en pares por día y datos de ventas completadas. El grupo que alcanza o supera el 80 % completa A; el que alcanza o supera el 95 % completa B. Se clasifica con el acumulado previo, sin redondear los umbrales. Los empates se ordenan por identificador de producto y color (sin color primero); los ingresos cero corresponden a C. El período admite entre 1 y 365 días y la interfaz ofrece 7, 30 y 90 días. **Criterio:** un único grupo con todos los ingresos es A y los totales excluyen ventas anuladas. Riesgo y liquidación suman las existencias positivas de variantes con más de 45 días de antigüedad y ninguna venta completada en los últimos 45 días, independientemente del período del ABC. Los límites de consulta son inicio incluido y fin excluido. La pantalla presenta carga, vacío, error y reintento, descarta respuestas obsoletas y permite consultar liquidación aunque no haya ventas en el período. [PLAN.md, rotación ABC](../../../PLAN.md) · [AUDIT_REMEDIATION.md, ANA-01 y ANA-02](../../../AUDIT_REMEDIATION.md)

### RF-05 Acceso del personal

Proporcionar acceso por usuario y contraseña y distinguir los roles de administrador y cajero. **Criterio:** las credenciales válidas de una cuenta activa permiten acceder al sistema con el rol asignado. [PLAN.md, usuarios y acceso](../../../PLAN.md)

### RNF-01 Uso móvil y localización

Los diálogos de cantidad, cobro, catálogo e historial tienen nombre accesible, reciben el foco al abrirse y contienen Tab y Mayús+Tab. Al cerrar devuelven el foco al disparador disponible. Escape permite salir cuando la operación lo admite. Durante el guardado o un cobro de resultado pendiente, el diálogo conserva el bloqueo de salida. El documento declara español de Perú y anuncia los errores de formulario.

Las consultas de catálogo e historial muestran únicamente el resultado de la solicitud vigente. Una respuesta antigua conserva su carácter obsoleto tras una escritura confirmada. El cliente distingue demora, pérdida de conexión y respuesta inválida. Un cobro de resultado desconocido conserva su clave y carrito para consultar el resultado mediante el mismo reintento.

El flujo de caja se orienta a teléfono. La interfaz usa español y muestra los importes en soles (`S/.`). **Criterio:** el flujo puede recorrerse en un viewport móvil, con etiquetas, importes y errores legibles en español. [PLAN.md, idioma y POS móvil](../../../PLAN.md) · [frontend/AGENTS.md](../../../frontend/AGENTS.md)

### RNF-02 Integridad de venta y stock

Un reintento del mismo cobro con la misma clave y el mismo contenido conserva una sola venta y un solo descuento de stock. Reutilizar la clave con datos distintos se rechaza. El cajero puede confirmar el resultado reenviando el cobro pendiente desde la pantalla de pago.

La venta procesa stock, cabecera y líneas como una unidad. El stock se mantiene no negativo, el total coincide con la suma de subtotales y un reintento del mismo cobro conserva una venta. Se permiten descuentos manuales. Cada línea de venta exige un precio unitario mayor que cero y admite hasta dos decimales. La API rechaza la venta completa si alguna línea tiene precio cero, negativo o con fracciones de céntimo. **Criterio:** la concurrencia respeta el stock disponible y los fallos y reintentos preservan esos invariantes. [PLAN.md, transacción de venta](../../../PLAN.md) · [AGENTS.md, invariantes](../../../AGENTS.md) · [AUDIT_REMEDIATION.md, TX-01, TX-02 y FIN-01](../../../AUDIT_REMEDIATION.md)

### RNF-03 Autorización del servidor

El servidor deriva identidad y rol de la sesión. CASHIER puede consultar productos, precios y stock, ajustar existencias, registrar clientes y consultarlos, aplicar descuentos manuales, registrar ventas y consultar solo las propias. ADMIN puede además administrar empleados y roles, consultar ventas ajenas, anular ventas y acceder a analíticas y reportes. Las ventas históricas sin empleado conservan ese estado y solo ADMIN puede consultarlas o anularlas. Toda operación sin clasificación se deniega. La propiedad se comprueba también al consultar una venta individual. [SEC-01 y DB-01](../../../AUDIT_REMEDIATION.md)

El arranque de producción exige configuración externa de PostgreSQL y excluye la siembra de demostración. El aprovisionamiento inicial crea un administrador mediante una ejecución local sin servidor HTTP y se rechaza cuando ya hay un administrador activo. [SEC-02](../../../AUDIT_REMEDIATION.md)

## Caso de uso principal · Registrar venta

La secuencia prevista para **RF-01** es que el cajero seleccione variante y cantidad, confirme el precio negociado, identifique al cliente si corresponde y registre el medio de pago. El servidor valida los datos y las existencias, guarda la operación y devuelve el resultado. Si el stock resulta insuficiente, se rechaza la operación sin persistir una venta parcial. La autorización y la consistencia de este caso están vinculadas a RNF-03 y RNF-02. [PLAN.md, POS y contrato de venta](../../../PLAN.md) · [Diseño de venta y stock](../analisis-diseno/DISENO.md#d-02-venta-y-stock)

## Pendiente de validación

- Para la trazabilidad persistente de ajustes manuales, validar cómo conservar responsable, saldo anterior, saldo nuevo y motivo opcional. Cualquier ampliación de esquema requiere aprobación.
- Queda por definir la confirmación de transferencias Yape/Plin. [POS-02](../../../AUDIT_REMEDIATION.md)
Las reglas de ABC y liquidación de RF-04 fueron confirmadas el 26 de noviembre de 2026.
