# FRUTERRA ERP

Migración del prototipo original a React + Vite + TypeScript estricto y CSS tradicional.

Desde PowerShell:

```powershell
cd "C:\Users\Usuario\Desktop\Proyecto de analisis\frontend\ERP-FRUTERRA"
npm.cmd install
npm.cmd run dev
```

Abrir la dirección que muestre Vite (normalmente http://localhost:5173).

Credenciales de demostración: **admin / admin123**.

```powershell
npm.cmd run build
npm.cmd run lint
npm.cmd test
npm.cmd run preview
```

La aplicación conserva los 18 módulos de navegación y amplía su gestión con 76 subpantallas: las 68 entidades del MER y 8 pantallas del levantamiento. Incluye procesos relacionados de compras, producción, inventario, frío, ventas, exportaciones, finanzas, reclamos, permisos y reportes calculados.

Consulta [docs/COBERTURA.md](docs/COBERTURA.md) para ver las funcionalidades, recorridos de prueba y límites de las simulaciones. Las pestañas superiores de cada módulo permiten navegar por sus subpantallas. Las acciones de las filas ejecutan los procesos y generan sus registros relacionados. Las fichas permiten abrir documentos imprimibles y guardarlos en PDF mediante el navegador.

Los datos se guardan en este navegador; la sesión dura hasta cerrar la pestaña o cerrar sesión. No utiliza backend ni autenticación real. La fecha operativa inicial es 2026-10-29. El selector de perfil permite probar las restricciones de la demostración.

El almacenamiento anterior permanece intacto y se conserva un archivo consultable mediante «Registros anteriores». Los nuevos datos relacionados usan una clave independiente. Las filas históricas sin relaciones normalizadas se conservan como archivo y no generan movimientos automáticamente.

En alojamientos estáticos debe configurarse fallback a `index.html` para abrir rutas directamente.

Las pruebas verifican datos, almacenamiento, operaciones de registros y representación de componentes; no sustituyen pruebas interactivas de navegador ni una comparación visual.

Ver [docs/MIGRACION.md](docs/MIGRACION.md) para el inventario, la arquitectura y las limitaciones de validación visual.
