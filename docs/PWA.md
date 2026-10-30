# Instalación de FRUTERRA ERP en el teléfono

La aplicación incluye manifiesto, iconos propios de 192/512 px, icono Apple de 180 px, modo independiente y un service worker generado durante el build. No se descarga un APK ni se necesita publicar en Play Store.

Dirección del proyecto: **https://fruterra-erp.vercel.app/login**.

## Publicar esta versión

Los cambios de esta tarea están en el proyecto local. Para que aparezcan en el teléfono deben llegar al repositorio y desplegarse de nuevo en Vercel. Esta sesión no pudo conectarse al dominio ni a GitHub para publicarlos o verificarlos; el estado de autenticación de GitHub CLI tampoco permitió autenticar.

1. Desde el repositorio `ERP-FRUTERRA`, revisar los cambios, crear un commit y subirlo a la rama vinculada a Vercel. Se conserva la organización del `App.tsx` que ya estaba modificada localmente.
2. Si Vercel está conectado al repositorio, esperar a que termine el nuevo deployment. Usar build command `npm run build` y output directory `dist`.
3. Si el despliegue no es automático, desplegar el nuevo commit desde el proyecto existente de Vercel.
4. Comprobar que `/manifest.webmanifest` devuelve JSON y `/sw.js` devuelve JavaScript, sin redirigir al login ni devolver HTML. Los iconos deben abrirse en `/images/pwa/icon-192.png` y `/images/pwa/icon-512.png`.
5. Abrir `/login` en el teléfono conectado a internet e ingresar. El botón «Instalar aplicación» aparece en la esquina superior derecha del ERP, junto a «Demostración» y «Cerrar sesión». La preparación sin conexión se realiza en segundo plano, sin mostrar un mensaje permanente de confirmación.

La configuración adjunta incluye el fallback de React Router y las cabeceras de manifiesto y service worker. Está preparada para servir la aplicación en la raíz del dominio.

## Android

1. Abrir el enlace de FRUTERRA en Chrome o Edge.
2. Tocar **Instalar aplicación** dentro del ERP. Si el navegador ya habilitó la instalación, se abrirá su confirmación nativa.
3. Si se muestran instrucciones, usar el menú del navegador → **Instalar aplicación** o **Agregar a pantalla de inicio**. La disponibilidad y el texto dependen del navegador.
4. Abrir FRUTERRA desde el icono del teléfono.

El botón no fuerza una instalación ni afirma que ya se instaló: espera el evento del navegador o la ejecución en modo independiente.

## iPhone / iPad

1. Abrir el enlace en Safari.
2. Tocar **Compartir → Agregar a pantalla de inicio**.
3. Si aparece la opción, activar **Abrir como app web** y tocar **Agregar**.
4. Abrir FRUTERRA desde su icono.

El botón de la aplicación muestra estas instrucciones cuando el navegador no ofrece una confirmación automática.

## Uso sin conexión

- La primera carga necesita internet. Mantener la aplicación abierta mientras descarga la interfaz antes de cerrar o activar modo avión.
- El build guarda la interfaz completa, JavaScript, CSS, manifiesto, iconos y fotografía del login. Las rutas internas regresan al mismo shell de React aunque se abran sin conexión.
- Las capturas y ediciones siguen usando el almacenamiento local del teléfono. La sesión de demostración continúa usando sessionStorage; si ya no hay sesión, el login también funciona sin internet con `admin / admin123`.
- No hay sincronización real entre teléfonos o con la computadora. La cola de sincronización del ERP sigue siendo una demostración local.
- Las fuentes externas pueden usar las alternativas del sistema si no se descargaron. Los recursos de terceros no forman parte de la caché de la PWA.
- La disponibilidad puede perderse si el navegador elimina la caché por falta de espacio. Borrar datos del sitio o desinstalar la aplicación puede eliminar registros locales. El respaldo del ERP permite descargar una copia de los datos.

## Actualizaciones

Cada build genera una huella de sus archivos. Una nueva versión descarga su shell completo antes de ofrecer **Actualizar**. La aplicación no recarga automáticamente un formulario abierto.

Al pulsar «Actualizar» se pide guardar los formularios pendientes y confirmar la recarga. Los registros que ya están guardados en localStorage se conservan. Solo se limpian cachés antiguas que pertenezcan a FRUTERRA; no se borra localStorage ni sessionStorage.

## Prueba local de producción

```powershell
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1
```

Abrir la dirección de preview (normalmente http://127.0.0.1:4173). El service worker se registra solo en producción/preview; se evita activar una caché de producción durante el desarrollo con Vite.

`localhost` es una excepción válida para el equipo local. Una dirección HTTP de la computadora como `http://192.168...` no es suficiente para instalar la PWA desde el teléfono. Para el teléfono utilizar la publicación HTTPS de Vercel.

## Verificación

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run test:pwa
```

Las pruebas PWA ejecutan el worker generado con una caché y red simuladas: verifican los archivos reales del build, tamaños PNG, caché completa, apertura de rutas sin red, aislamiento de peticiones, actualizaciones explícitas, descarga interrumpida, detección de recursos faltantes y configuración de Vercel.

No se ha certificado desde esta sesión la instalación nativa en un teléfono ni el nuevo deployment público. Después de publicar conviene verificar instalación, inicio desde el icono, modo avión, edición de un registro, cierre y reapertura, y actualización desde una versión anterior.

Referencias oficiales: [Requisitos de instalación](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable), [instalación y pantalla de inicio](https://web.dev/learn/pwa/installation), [manifiesto](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest).
