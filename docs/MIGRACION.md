# Inventario de la referencia

Fuente: `../../referencia/index.html` y `cultivo_login_berries.png`.

La referencia tiene 18 pantallas: Panorama, Producción y fincas, Lotes y trazabilidad, Inventario y almacenes, Cadena de frío, Ventas y pedidos, Cotizaciones, Clientes, Compras, Proveedores, Productos e insumos, Exportaciones, Facturación y finanzas, Reclamos y devoluciones, Reportes, Usuarios y seguridad, Sincronización móvil y Portal de clientes.

Los 16 módulos de registros comparten seis columnas originales, cinco campos editables, búsqueda libre, filtro de estado, limpieza, alta, edición, detalle, eliminación confirmada y exportación CSV. Los registros originales se conservan íntegros en `src/data/demoData.ts`.

Panorama conserva cuatro indicadores calculados, pedidos recientes, pendientes, cuatro accesos rápidos, la gráfica ilustrativa original y enlaces a áreas. Reportes conserva cuatro indicadores, siete áreas y el resumen CSV.

Ventas conserva el tablero de preparación y la secuencia En revisión → Confirmado → Preparación → Despachado → Entregado. Lotes conserva el recorrido ilustrativo. Cadena de frío conserva los rangos y controles. Exportaciones conserva cinco documentos simulados. Finanzas conserva la simulación FEL, nota de crédito y salida CSV. Seguridad conserva la matriz ilustrativa de roles. Sincronización permite vaciar la cola de eventos mediante simulación.

El login conserva fotografía, composición, textos, errores y visibilidad de contraseña. Las rutas operativas requieren sesión de demostración. Cerrar sesión regresa a `/login`.

## Arquitectura

- React controla el árbol, formularios, navegación y cambios de estado; no se ejecuta el JavaScript de la referencia ni se inyecta HTML.
- React Router publica una ruta por pantalla. `MainLayout` comparte navegación y cabecera; `ModulePage` representa los módulos configurables sin duplicar 16 páginas equivalentes.
- `FormDrawer`, `StatusBadge`, `MetricCard` y `Footer` son componentes compartidos.
- TypeScript estricto; datos originales tipados sin `any`.
- `fruterra-react-demo-v1` conserva datos en localStorage. La validación recupera los módulos dañados o ausentes sin borrar los válidos. Arreglos vacíos son válidos.
- `fruterra-react-demo-session` conserva exclusivamente la sesión simulada en sessionStorage.
- El CSS original se mantiene en su orden de cascada en `src/styles/original.css`, incluidas sus fuentes y reglas responsive. Solo se ajustó la URL de la fotografía.
- No hay backend, autenticación real ni servicios externos de negocio.

## Verificación visual pendiente

La compilación y ESLint se ejecutaron correctamente. `npm.cmd test` verifica las rutas configuradas, integridad de datos, creación, edición, eliminación, persistencia y recuperación en los 16 módulos, estados de pedidos, sincronización, almacenamiento bloqueado y renderizado de las 18 pantallas y 48 variantes de formularios/fichas. Cuando la referencia está disponible, también compara exactamente sus datos, CSS e imagen con los migrados.

El acceso al navegador por herramientas no estuvo disponible; el intento de control nativo de Chrome agotó el tiempo de autorización. No se certifica igualdad visual por capturas ni comparación a 1366 × 768 y 1920 × 1080. Las interacciones reales en navegador, descargas y responsive quedan pendientes de verificación manual. El CSS y la imagen se copiaron directamente del original para conservar su apariencia.
