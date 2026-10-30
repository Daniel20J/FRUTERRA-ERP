# Ampliación funcional según proyecto y MER

Se revisaron completos `Instrucciones de proyecto.txt`, `Mer ERP.txt` y `Fruterra_ERP_Levantamiento_Requerimiento.md` de la carpeta del proyecto.

La primera versión migraba fielmente las 18 vistas de la referencia, pero sus cinco campos por formulario y acciones aisladas no representaban los procesos del MER. La ampliación conserva la identidad y el CSS original y agrega 76 vistas de gestión: **68 entidades del MER y 8 pantallas del levantamiento**, agrupadas dentro del menú existente. No se agregó una pantalla para mostrar el diagrama MER.

El apartado 29 del proyecto exige como mínimo menús de las interfaces principales, sin obligar a implementar el ERP completo. Esta versión va más allá con procesos relacionados de demostración. Los aspectos RUP, UML, factibilidad, Gantt, documentación académica y despliegue de infraestructura siguen siendo entregables de análisis, no pantallas del ERP.

## Cobertura

| Área | Pantallas / entidades | Operaciones implementadas |
|---|---|---|
| Producción | Fincas, parcelas, certificaciones, labores, aplicaciones, planes, cosechas | Catálogos relacionados; cálculo de fin de carencia; bloqueo de cosecha durante carencia; generación de lote y etiqueta; actualización de volumen cosechado; boleta imprimible |
| Campo | Equipo, mantenimiento, costos, destajo, incidencias | Registro de uso y combustible, horas acumuladas; costo por kg; cálculo de planilla y costo de mano de obra; control de cajas ya liquidadas; evidencia por referencia |
| Lotes | Lotes, clasificación, eventos, etiquetas | Identificador único, reclasificación justificada, recepción de cosecha clasificada, consulta por código de etiqueta, historial cronológico y búsqueda inversa por cliente receptor |
| Compras | Solicitud, detalle, cotizaciones, orden, productos de orden, recepción, detalle recibido | Separación de solicitante y aprobador; selección de oferta; orden vinculada; recepción total/parcial; bloqueo de exceso de recepción; entrada de inventario y cuenta por pagar |
| Inventario | Almacenes, existencias, movimientos, mermas | Entradas, salidas, transferencias, ajustes autorizados; reservas protegidas; nunca se descuenta más existencia libre que la disponible; autorización de merma superior a 50 kg o 5 % |
| Frío | Cámaras, rangos por producto, lecturas, alertas | Registro manual; alerta automática fuera de rango; cuarentena al superar el límite de minutos; medidas correctivas; liberación autorizada con lectura dentro de rango |
| Clientes y proveedores | Clientes, visitas, proveedores, productos suministrados | Fichas completas del MER, datos de contacto, país, moneda, crédito, vendedor, listas y seguimiento de visitas |
| Productos | Productos, frutas, insumos, categorías, unidades, monedas, tipos de cambio, Incoterms | Especializaciones de fruta/insumo, autorización de agroquímicos, stock mínimo, vida útil y tipos de cambio ilustrativos |
| Comercial | Listas y precios, promociones, cotizaciones, productos cotizados | Precio vigente por cliente y moneda; validación de promoción por producto/segmento/fechas; conversión única de cotización aprobada a pedido |
| Ventas | Pedidos, líneas, historial, reservas, despachos, lotes despachados, metas | Confirmación con inventario y crédito; reservas FEFO repartidas entre lotes; cancelación que libera reservas; preparación, despacho, entrega; historial; metas y comisiones estimadas |
| Exportación | Embarques, documentos | Expediente de demostración; salida condicionada a documentos y pedidos despachados; packing list obtenido de cantidades y lotes despachados; seguimiento de entrega y cierre |
| Finanzas | Facturas, detalle, cuentas por cobrar/pagar, cobros, pagos, anticipos, notas de crédito | Factura y cuenta desde pedido despachado; protección contra duplicados; cobros/pagos parciales con actualización de saldo; anticipos aplicables a una cuenta en igual moneda; notas de crédito |
| Reclamos | Reclamos, seguimiento, devoluciones | Vínculo válido cliente/pedido/producto/lote, seguimiento, solución y cierre; devolución limitada a lo despachado; reintegro de producto apto; nota de crédito vinculada |
| Reportes | Ventas, demanda, existencias, vencimientos, atrasos, compras, saldos, reclamos, países, cosechas, costos, metas | Filtros de período y cliente; agregados calculados desde registros; monedas separadas en saldos y conversión ilustrativa a GTQ en ventas; CSV de resultados; visibilidad según permisos |
| Seguridad | Usuarios, roles, permisos, asignación por rol, auditoría | Perfiles simulados; restricciones de navegación y acciones; bitácora automática de cambios; bloqueo de edición de registros generados y eliminación de datos referenciados; respaldo JSON |
| Móvil | Dispositivos, cola de sincronización | Persistencia local, cola de cambios, simulación de envío y conflicto, resolución que conserva la versión local; no se comunica con servidores |
| Portal | Solicitudes y vistas de pedidos, líneas, facturas, saldos y reclamos propios | Aislamiento visual por cliente del perfil; bloqueo de solicitudes vinculadas a pedidos ajenos |

## Uso

1. Entrar con `admin / admin123`.
2. Seleccionar un módulo del menú y sus subpantallas en las pestañas superiores.
3. Usar «Nuevo registro» para catálogos y documentos de captura. Los registros generados, como existencias, reservas, facturas y recepciones, se obtienen ejecutando sus procesos.
4. Consultar «Ver» para la ficha completa, registros relacionados y vista imprimible. Desde un documento vacío se puede abrir su subpantalla de detalle, crear líneas y conservar la referencia del padre.
5. Ejecutar las acciones de cada fila según su estado: aprobar, recibir, convertir, confirmar, preparar, despachar, facturar, cobrar o resolver.
6. Cambiar «Perfil de demostración» para revisar permisos. La fecha operativa inicia en **2026-10-29**, coherente con los datos de muestra; afecta vigencias, carencias, FEFO y reportes.
7. En una ficha, «Vista imprimible / PDF de demostración» abre un documento generado desde los registros. «Imprimir / Guardar PDF» utiliza el diálogo del navegador. Las fichas y documentos también se descargan en CSV.

### Recorridos comprobados automáticamente

- Compra emitida → recepción parcial → cuenta por pagar → pago parcial → recepción final.
- Cotización aprobada → pedido → líneas → confirmación FEFO → preparación → despacho → factura → cobro parcial → entrega → devolución con nota de crédito.
- Aplicación y carencia → cosecha apta → lote en cuarentena → clasificación → recepción en almacén.
- Lectura fuera de rango → alerta → cuarentena → atención de incidente → lectura normal → liberación autorizada.
- Embarque → documentos → pedido despachado → autorización de salida → documento con cantidades reales del despacho local.

## Datos anteriores

El almacenamiento anterior `fruterra-react-demo-v1` **no se modifica**. El entorno relacional usa `fruterra-erp-relacional-v2` y conserva una copia literal de las tablas anteriores en `migrationArchive`. El administrador puede consultarla y exportarla con «Registros anteriores».

Los identificadores conocidos del prototipo sirven para preparar el entorno de demostración relacionado. Las filas históricas nuevas, eliminadas o sin referencias normalizadas permanecen en el archivo; no se convierten automáticamente en operaciones financieras o de inventario. Se evita inferir movimientos, deudas o relaciones que la tabla de texto no puede acreditar. El respaldo JSON incluye el archivo y las operaciones nuevas.

## Límites explícitos

- Es un frontend de demostración sin servidor, base de datos ni autorización real. El selector de perfiles existe para mostrar el comportamiento por rol.
- FEL, certificados, documentos aduanales, envío de sincronización, sensores, notificaciones externas, firmas y servicios contables son demostraciones. No se envía información a instituciones ni a terceros.
- Los códigos de etiqueta pueden consultarse escribiendo o pegando su identificador. No se implementó cámara/lector ni generación de un símbolo QR escaneable.
- La persistencia local funciona mientras la aplicación está cargada. No se promete una PWA instalable, recarga offline, IndexedDB ni sincronización entre dispositivos.
- Las evidencias se registran como referencias de texto; no se almacenan fotografías ni se suben archivos.
- Los valores de cambio son ilustrativos. No se consultan cotizaciones oficiales. Los impuestos se capturan como importes; no se implementa un motor fiscal.
- La bitácora no se edita desde el prototipo, pero localStorage no ofrece inmutabilidad ni retención garantizada de cinco años.
- El documento del levantamiento menciona otras frutas y declara seis roles, aunque el contenido disponible desarrolla cinco entrevistas. Se conserva la identidad vigente: fresa, mora y cereza.
- Las pruebas de datos, procesos, renderizado, TypeScript y ESLint se ejecutan localmente. La comparación de capturas, impresión efectiva y pruebas de interacción/responsive en navegador no se certifican en esta sesión.

## Validación

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run lint
npm.cmd run dev
```

La suite incluye 24 grupos de comprobaciones, todas las entidades y sus formularios, flujos de negocio, permisos, saldos, atomicidad, recuperación de almacenamiento y conservación del archivo anterior.
