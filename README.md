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

La aplicación contiene las 18 pantallas originales, formularios de creación y edición, eliminación confirmada, filtros, detalles, exportación CSV, tablero de ventas, simulaciones y persistencia local. Los datos se guardan en este navegador; la sesión dura hasta cerrar la pestaña o cerrar sesión. No utiliza backend ni autenticación real.

En alojamientos estáticos debe configurarse fallback a `index.html` para abrir rutas directamente.

Las pruebas verifican datos, almacenamiento, operaciones de registros y representación de componentes; no sustituyen pruebas interactivas de navegador ni una comparación visual.

Ver [docs/MIGRACION.md](docs/MIGRACION.md) para el inventario, la arquitectura y las limitaciones de validación visual.
