# Comercial Torres · Adaptación de RUP

## Alcance metodológico

Comercial Torres utiliza una **adaptación académica del Rational Unified Process (RUP) organizada por disciplinas**. RUP combina disciplinas de ingeniería con un ciclo de vida iterativo. Esta adaptación conserva las disciplinas indicadas abajo y sus artefactos pertinentes. La aplicación íntegra del proceso iterativo queda fuera del alcance. Se omiten la planificación y el seguimiento por iteraciones formales, incluidos sus cronogramas, hitos e informes. [IBM Redbooks, principios y adaptación de RUP, §3.2](https://www.redbooks.ibm.com/redbooks/pdfs/sg247424.pdf)

Por indicación académica se omite **Modelado del Negocio (Business Modeling)**, dado que el autor del proyecto conoce directamente la operación de la tienda. El contexto de uso y los actores del sistema se documentan en Requisitos en la medida en que explican el alcance del POS.

## Artefactos por disciplina

| Disciplina | Artefacto de esta adaptación | Evidencia reutilizada |
| --- | --- | --- |
| Requisitos | [Especificación y criterios observables](requisitos/REQUISITOS.md) | [PLAN.md](../../PLAN.md) aporta el alcance, las reglas de venta y el contrato de datos. La especificación les asigna identificadores y señala decisiones pendientes. |
| Análisis y diseño | [Arquitectura, flujo de venta y decisiones de diseño](analisis-diseno/DISENO.md) | [README.md](../../README.md) aporta la descripción técnica. El contrato de datos del plan y el código permiten contrastar el diseño con la estructura real. |
| Implementación | [Mapa del código y matriz de trazabilidad](implementacion/IMPLEMENTACION.md) | El repositorio es la evidencia principal. [AUDIT_REMEDIATION.md](../../AUDIT_REMEDIATION.md) es la fuente para correcciones y su estado. |
| Pruebas | [Verificación y casos pendientes](pruebas/PRUEBAS.md) | La auditoría conserva la línea base ejecutada. Se usa la prueba Java existente y los scripts del proyecto como evidencia de cobertura y herramientas. |
| Despliegue | [Configuración observada y condiciones para operar](despliegue/DESPLIEGUE.md) | [HELP.md](../../backend/HELP.md) y el [README de frontend](../../frontend/README.md) contienen referencias de herramientas. Los archivos de configuración describen el desarrollo local. El destino de despliegue está pendiente. |

Los [AGENTS.md](../../AGENTS.md) establecen reglas de trabajo, seguridad, arquitectura y verificación. El plan conserva el alcance funcional y sus avances de prototipo. El backlog conserva evidencia técnica, riesgos, estados y criterios por hallazgo. Los artefactos académicos añaden el contexto que falta y enlazan a esas fuentes.

## Cómo conservar la trazabilidad

La [matriz](implementacion/IMPLEMENTACION.md#matriz-de-trazabilidad) conecta un requisito estable (`RF-xx` o `RNF-xx`) con el diseño (`D-xx`), el código y sus casos de verificación (`PV-xx`). Los hallazgos conservan el identificador y estado del backlog. Una fila vinculada a una prueba pendiente expresa cobertura prevista.

Cada cambio importante actualiza únicamente el artefacto afectado en la misma entrega. Se describe el comportamiento esperado en Requisitos, las decisiones transversales en Diseño, la ruta o componente en Implementación y el resultado ejecutado en Pruebas. Las correcciones actualizan su entrada en el backlog. Los cambios de entorno o puesta en marcha actualizan Despliegue. Cuando un dato carezca de evidencia, se registra como **pendiente de validación**.
