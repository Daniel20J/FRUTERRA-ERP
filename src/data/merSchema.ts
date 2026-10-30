import type { EntityDefinition } from '../types/erp'
// Catálogos y relaciones transcritos del MER del proyecto.
export const MER_ENTITIES: EntityDefinition[] = [
  {
    "key": "rol",
    "title": "Roles",
    "group": "seguridad",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "nombre",
        "label": "Nombre",
        "type": "text",
        "required": true,
        "unique": true
      },
      {
        "name": "descripcion",
        "label": "Descripcion",
        "type": "textarea",
        "required": false,
        "unique": false
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "activo",
          "inactivo"
        ],
        "defaultValue": "activo"
      }
    ],
    "columns": [
      "nombre",
      "descripcion",
      "estado"
    ]
  },
  {
    "key": "permiso",
    "title": "Permisos",
    "group": "seguridad",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "modulo",
        "label": "Modulo",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "operacion",
        "label": "Operacion",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "consultar",
          "crear",
          "editar",
          "aprobar",
          "anular"
        ]
      },
      {
        "name": "descripcion",
        "label": "Descripcion",
        "type": "textarea",
        "required": false,
        "unique": false
      }
    ],
    "columns": [
      "modulo",
      "operacion",
      "descripcion"
    ],
    "uniqueGroups": [
      [
        "modulo",
        "operacion"
      ]
    ]
  },
  {
    "key": "rol_permiso",
    "title": "Permisos por rol",
    "group": "seguridad",
    "fields": [
      {
        "name": "rol_id",
        "label": "Rol",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "rol",
        "referenceField": "id"
      },
      {
        "name": "permiso_id",
        "label": "Permiso",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "permiso",
        "referenceField": "id"
      }
    ],
    "columns": [
      "rol_id",
      "permiso_id"
    ],
    "uniqueGroups": [
      [
        "rol_id",
        "permiso_id"
      ]
    ]
  },
  {
    "key": "usuario",
    "title": "Usuarios y perfiles",
    "group": "seguridad",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "username",
        "label": "Username",
        "type": "text",
        "required": true,
        "unique": true
      },
      {
        "name": "nombre_completo",
        "label": "Nombre completo",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "correo",
        "label": "Correo electrónico",
        "type": "email",
        "required": true,
        "unique": true
      },
      {
        "name": "telefono",
        "label": "Telefono",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "rol_id",
        "label": "Rol",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "rol",
        "referenceField": "id"
      },
      {
        "name": "cliente_id",
        "label": "Cliente",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "cliente",
        "referenceField": "id"
      },
      {
        "name": "mfa_habilitado",
        "label": "Mfa habilitado",
        "type": "checkbox",
        "required": true,
        "unique": false,
        "defaultValue": false
      },
      {
        "name": "intentos_fallidos",
        "label": "Intentos fallidos",
        "type": "number",
        "required": true,
        "unique": false,
        "defaultValue": 0
      },
      {
        "name": "bloqueado_hasta",
        "label": "Bloqueado hasta",
        "type": "datetime-local",
        "required": false,
        "unique": false
      },
      {
        "name": "ultimo_acceso",
        "label": "Ultimo acceso",
        "type": "datetime-local",
        "required": false,
        "unique": false
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "activo",
          "inactivo"
        ],
        "defaultValue": "activo"
      },
      {
        "name": "creado_en",
        "label": "Creado en",
        "type": "datetime-local",
        "required": true,
        "unique": false,
        "generated": true
      }
    ],
    "columns": [
      "username",
      "nombre_completo",
      "correo",
      "telefono",
      "rol_id"
    ]
  },
  {
    "key": "bitacora_auditoria",
    "title": "Bitácora de auditoría",
    "group": "seguridad",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "usuario_id",
        "label": "Usuario",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "fecha_hora",
        "label": "Fecha y hora",
        "type": "datetime-local",
        "required": true,
        "unique": false
      },
      {
        "name": "modulo",
        "label": "Modulo",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "accion",
        "label": "Accion",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "entidad",
        "label": "Entidad",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "entidad_id",
        "label": "Entidad",
        "type": "number",
        "required": false,
        "unique": false
      },
      {
        "name": "valor_anterior",
        "label": "Valor anterior",
        "type": "textarea",
        "required": false,
        "unique": false
      },
      {
        "name": "valor_nuevo",
        "label": "Valor nuevo",
        "type": "textarea",
        "required": false,
        "unique": false
      },
      {
        "name": "ip",
        "label": "Ip",
        "type": "text",
        "required": false,
        "unique": false
      }
    ],
    "columns": [
      "usuario_id",
      "fecha_hora",
      "modulo",
      "accion",
      "entidad"
    ],
    "readOnly": true
  },
  {
    "key": "moneda",
    "title": "Monedas",
    "group": "productos",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "codigo",
        "label": "Codigo",
        "type": "text",
        "required": true,
        "unique": true
      },
      {
        "name": "nombre",
        "label": "Nombre",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "simbolo",
        "label": "Simbolo",
        "type": "text",
        "required": false,
        "unique": false
      }
    ],
    "columns": [
      "codigo",
      "nombre",
      "simbolo"
    ]
  },
  {
    "key": "tipo_cambio",
    "title": "Tipos de cambio",
    "group": "productos",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "moneda_id",
        "label": "Moneda",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "moneda",
        "referenceField": "id"
      },
      {
        "name": "fecha",
        "label": "Fecha",
        "type": "date",
        "required": true,
        "unique": false
      },
      {
        "name": "valor",
        "label": "Valor",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "fuente",
        "label": "Fuente",
        "type": "text",
        "required": false,
        "unique": false,
        "defaultValue": "Banguat"
      }
    ],
    "columns": [
      "moneda_id",
      "fecha",
      "valor",
      "fuente"
    ],
    "uniqueGroups": [
      [
        "moneda_id",
        "fecha"
      ]
    ]
  },
  {
    "key": "incoterm",
    "title": "Incoterms",
    "group": "productos",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "codigo",
        "label": "Codigo",
        "type": "text",
        "required": true,
        "unique": true
      },
      {
        "name": "descripcion",
        "label": "Descripcion",
        "type": "textarea",
        "required": false,
        "unique": false
      }
    ],
    "columns": [
      "codigo",
      "descripcion"
    ]
  },
  {
    "key": "lista_precio",
    "title": "Listas de precios",
    "group": "cotizaciones",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "nombre",
        "label": "Nombre",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "tipo_cliente",
        "label": "Tipo cliente",
        "type": "text",
        "required": false,
        "unique": false,
        "options": [
          "nacional",
          "internacional"
        ]
      },
      {
        "name": "moneda_id",
        "label": "Moneda",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "moneda",
        "referenceField": "id"
      },
      {
        "name": "vigente_desde",
        "label": "Vigente desde",
        "type": "date",
        "required": true,
        "unique": false
      },
      {
        "name": "vigente_hasta",
        "label": "Vigente hasta",
        "type": "date",
        "required": false,
        "unique": false
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "activo",
          "inactivo"
        ],
        "defaultValue": "activo"
      }
    ],
    "columns": [
      "nombre",
      "tipo_cliente",
      "moneda_id",
      "vigente_desde",
      "vigente_hasta"
    ]
  },
  {
    "key": "cliente",
    "title": "Clientes",
    "group": "clientes",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "codigo",
        "label": "Codigo",
        "type": "text",
        "required": true,
        "unique": true
      },
      {
        "name": "razon_social",
        "label": "Razón social",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "tipo",
        "label": "Tipo",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "nacional",
          "internacional"
        ]
      },
      {
        "name": "nit",
        "label": "Nit",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "direccion",
        "label": "Direccion",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "pais",
        "label": "Pais",
        "type": "text",
        "required": true,
        "unique": false,
        "defaultValue": "Guatemala"
      },
      {
        "name": "ciudad",
        "label": "Ciudad",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "contacto",
        "label": "Contacto",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "telefono",
        "label": "Telefono",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "correo",
        "label": "Correo electrónico",
        "type": "email",
        "required": false,
        "unique": false
      },
      {
        "name": "condiciones_pago_dias",
        "label": "Crédito (días)",
        "type": "number",
        "required": true,
        "unique": false,
        "defaultValue": 0
      },
      {
        "name": "moneda_id",
        "label": "Moneda",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "moneda",
        "referenceField": "id"
      },
      {
        "name": "limite_credito",
        "label": "Limite credito",
        "type": "number",
        "required": true,
        "unique": false,
        "defaultValue": 0
      },
      {
        "name": "lista_precio_id",
        "label": "Lista precio",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "lista_precio",
        "referenceField": "id"
      },
      {
        "name": "vendedor_id",
        "label": "Vendedor",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "activo",
          "inactivo"
        ],
        "defaultValue": "activo"
      }
    ],
    "columns": [
      "codigo",
      "razon_social",
      "tipo",
      "nit",
      "direccion"
    ]
  },
  {
    "key": "proveedor",
    "title": "Proveedores",
    "group": "proveedores",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "codigo",
        "label": "Codigo",
        "type": "text",
        "required": true,
        "unique": true
      },
      {
        "name": "razon_social",
        "label": "Razón social",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "nit",
        "label": "Nit",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "direccion",
        "label": "Direccion",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "pais",
        "label": "Pais",
        "type": "text",
        "required": true,
        "unique": false,
        "defaultValue": "Guatemala"
      },
      {
        "name": "contacto",
        "label": "Contacto",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "telefono",
        "label": "Telefono",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "correo",
        "label": "Correo electrónico",
        "type": "email",
        "required": false,
        "unique": false
      },
      {
        "name": "condiciones_pago_dias",
        "label": "Crédito (días)",
        "type": "number",
        "required": true,
        "unique": false,
        "defaultValue": 0
      },
      {
        "name": "moneda_id",
        "label": "Moneda",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "moneda",
        "referenceField": "id"
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "activo",
          "inactivo"
        ],
        "defaultValue": "activo"
      }
    ],
    "columns": [
      "codigo",
      "razon_social",
      "nit",
      "direccion",
      "pais"
    ]
  },
  {
    "key": "categoria_producto",
    "title": "Categorías",
    "group": "productos",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "nombre",
        "label": "Nombre",
        "type": "text",
        "required": true,
        "unique": true
      },
      {
        "name": "tipo",
        "label": "Tipo",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "producto_terminado",
          "insumo"
        ]
      }
    ],
    "columns": [
      "nombre",
      "tipo"
    ]
  },
  {
    "key": "unidad_medida",
    "title": "Unidades de medida",
    "group": "productos",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "codigo",
        "label": "Codigo",
        "type": "text",
        "required": true,
        "unique": true
      },
      {
        "name": "nombre",
        "label": "Nombre",
        "type": "text",
        "required": true,
        "unique": false
      }
    ],
    "columns": [
      "codigo",
      "nombre"
    ]
  },
  {
    "key": "producto",
    "title": "Productos e insumos",
    "group": "productos",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "codigo",
        "label": "Codigo",
        "type": "text",
        "required": true,
        "unique": true
      },
      {
        "name": "nombre",
        "label": "Nombre",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "descripcion",
        "label": "Descripcion",
        "type": "textarea",
        "required": false,
        "unique": false
      },
      {
        "name": "tipo",
        "label": "Tipo",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "producto_terminado",
          "insumo"
        ]
      },
      {
        "name": "categoria_id",
        "label": "Categoria",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "categoria_producto",
        "referenceField": "id"
      },
      {
        "name": "unidad_medida_id",
        "label": "Unidad medida",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "unidad_medida",
        "referenceField": "id"
      },
      {
        "name": "presentacion",
        "label": "Presentacion",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "precio_referencia",
        "label": "Precio referencia",
        "type": "number",
        "required": false,
        "unique": false
      },
      {
        "name": "stock_minimo",
        "label": "Stock minimo",
        "type": "number",
        "required": true,
        "unique": false,
        "defaultValue": 0
      },
      {
        "name": "vida_util_dias",
        "label": "Vida util dias",
        "type": "number",
        "required": false,
        "unique": false
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "activo",
          "inactivo"
        ],
        "defaultValue": "activo"
      }
    ],
    "columns": [
      "codigo",
      "nombre",
      "descripcion",
      "tipo",
      "categoria_id"
    ]
  },
  {
    "key": "producto_terminado",
    "title": "Frutas y variedades",
    "group": "productos",
    "fields": [
      {
        "name": "producto_id",
        "label": "Producto",
        "type": "number",
        "required": true,
        "unique": true,
        "reference": "producto",
        "referenceField": "id"
      },
      {
        "name": "fruta",
        "label": "Fruta",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "variedad",
        "label": "Variedad",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "peso_promedio_g",
        "label": "Peso promedio g",
        "type": "number",
        "required": false,
        "unique": false
      },
      {
        "name": "requiere_cadena_frio",
        "label": "Requiere cadena frio",
        "type": "checkbox",
        "required": true,
        "unique": false,
        "defaultValue": true
      }
    ],
    "columns": [
      "producto_id",
      "fruta",
      "variedad",
      "peso_promedio_g",
      "requiere_cadena_frio"
    ]
  },
  {
    "key": "insumo",
    "title": "Insumos agrícolas",
    "group": "productos",
    "fields": [
      {
        "name": "producto_id",
        "label": "Producto",
        "type": "number",
        "required": true,
        "unique": true,
        "reference": "producto",
        "referenceField": "id"
      },
      {
        "name": "es_agroquimico",
        "label": "Es agroquimico",
        "type": "checkbox",
        "required": true,
        "unique": false,
        "defaultValue": false
      },
      {
        "name": "autorizado",
        "label": "Autorizado",
        "type": "checkbox",
        "required": true,
        "unique": false,
        "defaultValue": true
      },
      {
        "name": "dias_carencia",
        "label": "Dias carencia",
        "type": "number",
        "required": false,
        "unique": false
      },
      {
        "name": "proveedor_id",
        "label": "Proveedor",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "proveedor",
        "referenceField": "id"
      }
    ],
    "columns": [
      "producto_id",
      "es_agroquimico",
      "autorizado",
      "dias_carencia",
      "proveedor_id"
    ]
  },
  {
    "key": "proveedor_producto",
    "title": "Productos por proveedor",
    "group": "proveedores",
    "fields": [
      {
        "name": "proveedor_id",
        "label": "Proveedor",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "proveedor",
        "referenceField": "id"
      },
      {
        "name": "producto_id",
        "label": "Producto",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "producto",
        "referenceField": "id"
      },
      {
        "name": "precio_acordado",
        "label": "Precio acordado",
        "type": "number",
        "required": false,
        "unique": false
      }
    ],
    "columns": [
      "proveedor_id",
      "producto_id",
      "precio_acordado"
    ],
    "uniqueGroups": [
      [
        "proveedor_id",
        "producto_id"
      ]
    ]
  },
  {
    "key": "detalle_lista_precio",
    "title": "Precios por producto",
    "group": "cotizaciones",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "lista_precio_id",
        "label": "Lista precio",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "lista_precio",
        "referenceField": "id"
      },
      {
        "name": "producto_id",
        "label": "Producto",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "producto",
        "referenceField": "id"
      },
      {
        "name": "precio",
        "label": "Precio",
        "type": "number",
        "required": true,
        "unique": false
      }
    ],
    "columns": [
      "lista_precio_id",
      "producto_id",
      "precio"
    ],
    "uniqueGroups": [
      [
        "lista_precio_id",
        "producto_id"
      ]
    ]
  },
  {
    "key": "promocion",
    "title": "Promociones",
    "group": "cotizaciones",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "nombre",
        "label": "Nombre",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "tipo",
        "label": "Tipo",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "porcentaje",
          "monto_fijo"
        ]
      },
      {
        "name": "valor",
        "label": "Valor",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "producto_id",
        "label": "Producto",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "producto",
        "referenceField": "id"
      },
      {
        "name": "cliente_id",
        "label": "Cliente",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "cliente",
        "referenceField": "id"
      },
      {
        "name": "segmento",
        "label": "Segmento",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "fecha_inicio",
        "label": "Fecha inicio",
        "type": "date",
        "required": true,
        "unique": false
      },
      {
        "name": "fecha_fin",
        "label": "Fecha fin",
        "type": "date",
        "required": true,
        "unique": false
      },
      {
        "name": "condiciones",
        "label": "Condiciones",
        "type": "textarea",
        "required": false,
        "unique": false
      },
      {
        "name": "autorizada_por",
        "label": "Autorizada por",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "activo",
          "inactivo"
        ],
        "defaultValue": "activo"
      }
    ],
    "columns": [
      "nombre",
      "tipo",
      "valor",
      "producto_id",
      "cliente_id"
    ]
  },
  {
    "key": "finca",
    "title": "Fincas",
    "group": "produccion",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "nombre",
        "label": "Nombre",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "ubicacion",
        "label": "Ubicacion",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "area_ha",
        "label": "Área (ha)",
        "type": "number",
        "required": false,
        "unique": false
      },
      {
        "name": "responsable_id",
        "label": "Responsable",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "activo",
          "inactivo"
        ],
        "defaultValue": "activo"
      }
    ],
    "columns": [
      "nombre",
      "ubicacion",
      "area_ha",
      "responsable_id",
      "estado"
    ]
  },
  {
    "key": "lote_terreno",
    "title": "Parcelas y variedades",
    "group": "produccion",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "finca_id",
        "label": "Finca",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "finca",
        "referenceField": "id"
      },
      {
        "name": "codigo",
        "label": "Codigo",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "producto_id",
        "label": "Producto",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "producto_terminado",
        "referenceField": "producto_id"
      },
      {
        "name": "variedad",
        "label": "Variedad",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "area_ha",
        "label": "Área (ha)",
        "type": "number",
        "required": false,
        "unique": false
      },
      {
        "name": "fecha_plantacion",
        "label": "Fecha plantacion",
        "type": "date",
        "required": false,
        "unique": false
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "activo",
          "inactivo"
        ],
        "defaultValue": "activo"
      }
    ],
    "columns": [
      "finca_id",
      "codigo",
      "producto_id",
      "variedad",
      "area_ha"
    ],
    "uniqueGroups": [
      [
        "finca_id",
        "codigo"
      ]
    ]
  },
  {
    "key": "certificacion",
    "title": "Certificaciones",
    "group": "produccion",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "finca_id",
        "label": "Finca",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "finca",
        "referenceField": "id"
      },
      {
        "name": "nombre",
        "label": "Nombre",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "ente_certificador",
        "label": "Ente certificador",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "numero",
        "label": "Numero",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "fecha_emision",
        "label": "Fecha emision",
        "type": "date",
        "required": false,
        "unique": false
      },
      {
        "name": "fecha_vencimiento",
        "label": "Vencimiento",
        "type": "date",
        "required": true,
        "unique": false
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "vigente",
          "por_vencer",
          "vencida"
        ],
        "defaultValue": "vigente"
      }
    ],
    "columns": [
      "finca_id",
      "nombre",
      "ente_certificador",
      "numero",
      "fecha_emision"
    ]
  },
  {
    "key": "labor_agricola",
    "title": "Labores agrícolas",
    "group": "produccion",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "lote_terreno_id",
        "label": "Parcela",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "lote_terreno",
        "referenceField": "id"
      },
      {
        "name": "tipo",
        "label": "Tipo",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "riego",
          "fertilizacion",
          "control_plagas",
          "aplicacion_agroquimica",
          "poda",
          "otra"
        ]
      },
      {
        "name": "fecha",
        "label": "Fecha",
        "type": "date",
        "required": true,
        "unique": false
      },
      {
        "name": "responsable_id",
        "label": "Responsable",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "descripcion",
        "label": "Descripcion",
        "type": "textarea",
        "required": false,
        "unique": false
      },
      {
        "name": "foto_url",
        "label": "Foto url",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "uuid_cliente",
        "label": "Referencia de dispositivo",
        "type": "text",
        "required": false,
        "unique": true,
        "generated": true
      }
    ],
    "columns": [
      "lote_terreno_id",
      "tipo",
      "fecha",
      "responsable_id",
      "descripcion"
    ]
  },
  {
    "key": "aplicacion_agroquimica",
    "title": "Aplicaciones y carencias",
    "group": "produccion",
    "fields": [
      {
        "name": "labor_id",
        "label": "Labor",
        "type": "number",
        "required": true,
        "unique": true,
        "reference": "labor_agricola",
        "referenceField": "id"
      },
      {
        "name": "insumo_id",
        "label": "Insumo",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "insumo",
        "referenceField": "producto_id"
      },
      {
        "name": "dosis",
        "label": "Dosis",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "unidad_dosis",
        "label": "Unidad dosis",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "dias_carencia",
        "label": "Dias carencia",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "fecha_fin_carencia",
        "label": "Fin de carencia",
        "type": "date",
        "required": true,
        "unique": false
      }
    ],
    "columns": [
      "labor_id",
      "insumo_id",
      "dosis",
      "unidad_dosis",
      "dias_carencia"
    ]
  },
  {
    "key": "plan_cosecha",
    "title": "Planificación de cosecha",
    "group": "produccion",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "lote_terreno_id",
        "label": "Parcela",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "lote_terreno",
        "referenceField": "id"
      },
      {
        "name": "producto_id",
        "label": "Producto",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "producto_terminado",
        "referenceField": "producto_id"
      },
      {
        "name": "semana_inicio",
        "label": "Semana inicio",
        "type": "date",
        "required": true,
        "unique": false
      },
      {
        "name": "volumen_estimado_kg",
        "label": "Volumen estimado kg",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "volumen_real_kg",
        "label": "Volumen real kg",
        "type": "number",
        "required": false,
        "unique": false
      }
    ],
    "columns": [
      "lote_terreno_id",
      "producto_id",
      "semana_inicio",
      "volumen_estimado_kg",
      "volumen_real_kg"
    ]
  },
  {
    "key": "cosecha",
    "title": "Cosechas y boletas",
    "group": "produccion",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "lote_terreno_id",
        "label": "Parcela",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "lote_terreno",
        "referenceField": "id"
      },
      {
        "name": "fecha",
        "label": "Fecha",
        "type": "date",
        "required": true,
        "unique": false
      },
      {
        "name": "hora_inicio",
        "label": "Hora inicio",
        "type": "time",
        "required": false,
        "unique": false
      },
      {
        "name": "cuadrilla",
        "label": "Cuadrilla",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "cajas",
        "label": "Cajas",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "peso_kg",
        "label": "Peso (kg)",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "responsable_id",
        "label": "Responsable",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "uuid_cliente",
        "label": "Referencia de dispositivo",
        "type": "text",
        "required": false,
        "unique": true,
        "generated": true
      }
    ],
    "columns": [
      "lote_terreno_id",
      "fecha",
      "hora_inicio",
      "cuadrilla",
      "cajas"
    ]
  },
  {
    "key": "lote",
    "title": "Lotes de fruta",
    "group": "lotes",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "codigo",
        "label": "Codigo",
        "type": "text",
        "required": true,
        "unique": true
      },
      {
        "name": "producto_id",
        "label": "Producto",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "producto_terminado",
        "referenceField": "producto_id"
      },
      {
        "name": "finca_id",
        "label": "Finca",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "finca",
        "referenceField": "id"
      },
      {
        "name": "lote_terreno_id",
        "label": "Parcela",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "lote_terreno",
        "referenceField": "id"
      },
      {
        "name": "cosecha_id",
        "label": "Cosecha",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "cosecha",
        "referenceField": "id"
      },
      {
        "name": "fecha_cosecha",
        "label": "Fecha cosecha",
        "type": "date",
        "required": true,
        "unique": false
      },
      {
        "name": "fecha_vencimiento",
        "label": "Vencimiento",
        "type": "date",
        "required": false,
        "unique": false
      },
      {
        "name": "peso_kg",
        "label": "Peso (kg)",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "disponible",
          "reservado",
          "cuarentena",
          "vencido",
          "descartado"
        ],
        "defaultValue": "disponible"
      },
      {
        "name": "creado_en",
        "label": "Creado en",
        "type": "datetime-local",
        "required": true,
        "unique": false,
        "generated": true
      }
    ],
    "columns": [
      "codigo",
      "producto_id",
      "finca_id",
      "lote_terreno_id",
      "cosecha_id"
    ]
  },
  {
    "key": "clasificacion_calidad",
    "title": "Clasificación de calidad",
    "group": "lotes",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "lote_id",
        "label": "Lote",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "lote",
        "referenceField": "id"
      },
      {
        "name": "categoria",
        "label": "Categoria",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "extra",
          "primera",
          "segunda",
          "descarte"
        ]
      },
      {
        "name": "peso_promedio_g",
        "label": "Peso promedio g",
        "type": "number",
        "required": false,
        "unique": false
      },
      {
        "name": "porcentaje_color",
        "label": "Porcentaje color",
        "type": "number",
        "required": false,
        "unique": false
      },
      {
        "name": "porcentaje_defectos",
        "label": "Porcentaje defectos",
        "type": "number",
        "required": false,
        "unique": false
      },
      {
        "name": "vigente",
        "label": "Vigente",
        "type": "checkbox",
        "required": true,
        "unique": false,
        "defaultValue": true
      },
      {
        "name": "responsable_id",
        "label": "Responsable",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "fecha",
        "label": "Fecha",
        "type": "datetime-local",
        "required": true,
        "unique": false
      },
      {
        "name": "justificacion_reclasificacion",
        "label": "Justificacion reclasificacion",
        "type": "text",
        "required": false,
        "unique": false
      }
    ],
    "columns": [
      "lote_id",
      "categoria",
      "peso_promedio_g",
      "porcentaje_color",
      "porcentaje_defectos"
    ]
  },
  {
    "key": "solicitud_compra",
    "title": "Solicitudes de compra",
    "group": "compras",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "numero",
        "label": "Numero",
        "type": "text",
        "required": true,
        "unique": true
      },
      {
        "name": "solicitante_id",
        "label": "Solicitante",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "departamento",
        "label": "Departamento",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "fecha",
        "label": "Fecha",
        "type": "date",
        "required": true,
        "unique": false
      },
      {
        "name": "prioridad",
        "label": "Prioridad",
        "type": "text",
        "required": true,
        "unique": false,
        "defaultValue": "media"
      },
      {
        "name": "justificacion",
        "label": "Justificacion",
        "type": "textarea",
        "required": false,
        "unique": false
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "pendiente",
          "aprobada",
          "rechazada",
          "atendida"
        ],
        "defaultValue": "pendiente"
      },
      {
        "name": "aprobador_id",
        "label": "Aprobador",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      }
    ],
    "columns": [
      "numero",
      "solicitante_id",
      "departamento",
      "fecha",
      "prioridad"
    ]
  },
  {
    "key": "detalle_solicitud",
    "title": "Productos solicitados",
    "group": "compras",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "solicitud_id",
        "label": "Solicitud",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "solicitud_compra",
        "referenceField": "id"
      },
      {
        "name": "producto_id",
        "label": "Producto",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "producto",
        "referenceField": "id"
      },
      {
        "name": "cantidad",
        "label": "Cantidad",
        "type": "number",
        "required": true,
        "unique": false
      }
    ],
    "columns": [
      "solicitud_id",
      "producto_id",
      "cantidad"
    ]
  },
  {
    "key": "cotizacion_compra",
    "title": "Comparación de cotizaciones",
    "group": "compras",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "solicitud_id",
        "label": "Solicitud",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "solicitud_compra",
        "referenceField": "id"
      },
      {
        "name": "proveedor_id",
        "label": "Proveedor",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "proveedor",
        "referenceField": "id"
      },
      {
        "name": "fecha",
        "label": "Fecha",
        "type": "date",
        "required": true,
        "unique": false
      },
      {
        "name": "moneda_id",
        "label": "Moneda",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "moneda",
        "referenceField": "id"
      },
      {
        "name": "total",
        "label": "Total",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "seleccionada",
        "label": "Seleccionada",
        "type": "checkbox",
        "required": true,
        "unique": false,
        "defaultValue": false
      }
    ],
    "columns": [
      "solicitud_id",
      "proveedor_id",
      "fecha",
      "moneda_id",
      "total"
    ]
  },
  {
    "key": "orden_compra",
    "title": "Órdenes de compra",
    "group": "compras",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "numero",
        "label": "Numero",
        "type": "text",
        "required": true,
        "unique": true
      },
      {
        "name": "proveedor_id",
        "label": "Proveedor",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "proveedor",
        "referenceField": "id"
      },
      {
        "name": "solicitud_id",
        "label": "Solicitud",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "solicitud_compra",
        "referenceField": "id"
      },
      {
        "name": "cotizacion_id",
        "label": "Cotizacion",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "cotizacion_compra",
        "referenceField": "id"
      },
      {
        "name": "fecha",
        "label": "Fecha",
        "type": "date",
        "required": true,
        "unique": false
      },
      {
        "name": "fecha_entrega",
        "label": "Fecha entrega",
        "type": "date",
        "required": false,
        "unique": false
      },
      {
        "name": "lugar_entrega",
        "label": "Lugar entrega",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "moneda_id",
        "label": "Moneda",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "moneda",
        "referenceField": "id"
      },
      {
        "name": "subtotal",
        "label": "Subtotal",
        "type": "number",
        "required": true,
        "unique": false,
        "defaultValue": 0
      },
      {
        "name": "descuentos",
        "label": "Descuentos",
        "type": "number",
        "required": true,
        "unique": false,
        "defaultValue": 0
      },
      {
        "name": "impuestos",
        "label": "Impuestos",
        "type": "number",
        "required": true,
        "unique": false,
        "defaultValue": 0
      },
      {
        "name": "total",
        "label": "Total",
        "type": "number",
        "required": true,
        "unique": false,
        "defaultValue": 0
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "borrador",
          "emitida",
          "parcial",
          "recibida",
          "cancelada"
        ],
        "defaultValue": "borrador"
      },
      {
        "name": "aprobador_id",
        "label": "Aprobador",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      }
    ],
    "columns": [
      "numero",
      "proveedor_id",
      "solicitud_id",
      "cotizacion_id",
      "fecha"
    ]
  },
  {
    "key": "detalle_orden_compra",
    "title": "Productos de la orden",
    "group": "compras",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "orden_id",
        "label": "Orden de compra",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "orden_compra",
        "referenceField": "id"
      },
      {
        "name": "producto_id",
        "label": "Producto",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "producto",
        "referenceField": "id"
      },
      {
        "name": "cantidad",
        "label": "Cantidad",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "precio_unitario",
        "label": "Precio unitario",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "cantidad_recibida",
        "label": "Cantidad recibida",
        "type": "number",
        "required": true,
        "unique": false,
        "defaultValue": 0
      }
    ],
    "columns": [
      "orden_id",
      "producto_id",
      "cantidad",
      "precio_unitario",
      "cantidad_recibida"
    ]
  },
  {
    "key": "almacen",
    "title": "Almacenes",
    "group": "inventario",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "nombre",
        "label": "Nombre",
        "type": "text",
        "required": true,
        "unique": true
      },
      {
        "name": "tipo",
        "label": "Tipo",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "finca",
          "bodega_principal",
          "centro_empaque",
          "punto_distribucion"
        ]
      },
      {
        "name": "ubicacion",
        "label": "Ubicacion",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "finca_id",
        "label": "Finca",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "finca",
        "referenceField": "id"
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "activo",
          "inactivo"
        ],
        "defaultValue": "activo"
      }
    ],
    "columns": [
      "nombre",
      "tipo",
      "ubicacion",
      "finca_id",
      "estado"
    ]
  },
  {
    "key": "recepcion_compra",
    "title": "Recepciones",
    "group": "compras",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "orden_id",
        "label": "Orden de compra",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "orden_compra",
        "referenceField": "id"
      },
      {
        "name": "almacen_id",
        "label": "Almacén",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "almacen",
        "referenceField": "id"
      },
      {
        "name": "fecha",
        "label": "Fecha",
        "type": "datetime-local",
        "required": true,
        "unique": false
      },
      {
        "name": "responsable_id",
        "label": "Responsable",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "observaciones",
        "label": "Observaciones",
        "type": "textarea",
        "required": false,
        "unique": false
      }
    ],
    "columns": [
      "orden_id",
      "almacen_id",
      "fecha",
      "responsable_id",
      "observaciones"
    ],
    "readOnly": true
  },
  {
    "key": "detalle_recepcion",
    "title": "Detalle recibido",
    "group": "compras",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "recepcion_id",
        "label": "Recepcion",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "recepcion_compra",
        "referenceField": "id"
      },
      {
        "name": "detalle_orden_id",
        "label": "Detalle orden",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "detalle_orden_compra",
        "referenceField": "id"
      },
      {
        "name": "cantidad_recibida",
        "label": "Cantidad recibida",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "lote_insumo",
        "label": "Lote insumo",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "fecha_vencimiento",
        "label": "Vencimiento",
        "type": "date",
        "required": false,
        "unique": false
      }
    ],
    "columns": [
      "recepcion_id",
      "detalle_orden_id",
      "cantidad_recibida",
      "lote_insumo",
      "fecha_vencimiento"
    ],
    "readOnly": true
  },
  {
    "key": "camara_fria",
    "title": "Cámaras de refrigeración",
    "group": "frio",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "almacen_id",
        "label": "Almacén",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "almacen",
        "referenceField": "id"
      },
      {
        "name": "nombre",
        "label": "Nombre",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "capacidad_kg",
        "label": "Capacidad kg",
        "type": "number",
        "required": false,
        "unique": false
      },
      {
        "name": "sensor_id",
        "label": "Sensor",
        "type": "text",
        "required": false,
        "unique": true
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "activo",
          "inactivo"
        ],
        "defaultValue": "activo"
      }
    ],
    "columns": [
      "almacen_id",
      "nombre",
      "capacidad_kg",
      "sensor_id",
      "estado"
    ],
    "uniqueGroups": [
      [
        "almacen_id",
        "nombre"
      ]
    ]
  },
  {
    "key": "rango_temperatura_producto",
    "title": "Rangos por producto",
    "group": "frio",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "producto_id",
        "label": "Producto",
        "type": "number",
        "required": true,
        "unique": true,
        "reference": "producto_terminado",
        "referenceField": "producto_id"
      },
      {
        "name": "temp_min",
        "label": "Temperatura mínima °C",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "temp_max",
        "label": "Temperatura máxima °C",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "humedad_min",
        "label": "Humedad min",
        "type": "number",
        "required": false,
        "unique": false
      },
      {
        "name": "humedad_max",
        "label": "Humedad max",
        "type": "number",
        "required": false,
        "unique": false
      },
      {
        "name": "minutos_para_cuarentena",
        "label": "Minutos para cuarentena",
        "type": "number",
        "required": true,
        "unique": false,
        "defaultValue": 30
      }
    ],
    "columns": [
      "producto_id",
      "temp_min",
      "temp_max",
      "humedad_min",
      "humedad_max"
    ]
  },
  {
    "key": "existencia",
    "title": "Existencias por ubicación",
    "group": "inventario",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "producto_id",
        "label": "Producto",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "producto",
        "referenceField": "id"
      },
      {
        "name": "lote_id",
        "label": "Lote",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "lote",
        "referenceField": "id"
      },
      {
        "name": "lote_insumo",
        "label": "Lote insumo",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "fecha_vencimiento",
        "label": "Vencimiento",
        "type": "date",
        "required": false,
        "unique": false
      },
      {
        "name": "almacen_id",
        "label": "Almacén",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "almacen",
        "referenceField": "id"
      },
      {
        "name": "camara_id",
        "label": "Cámara",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "camara_fria",
        "referenceField": "id"
      },
      {
        "name": "cantidad",
        "label": "Cantidad",
        "type": "number",
        "required": true,
        "unique": false,
        "defaultValue": 0
      },
      {
        "name": "cantidad_reservada",
        "label": "Cantidad reservada",
        "type": "number",
        "required": true,
        "unique": false,
        "defaultValue": 0
      },
      {
        "name": "actualizado_en",
        "label": "Actualizado en",
        "type": "datetime-local",
        "required": true,
        "unique": false,
        "generated": true
      }
    ],
    "columns": [
      "producto_id",
      "lote_id",
      "lote_insumo",
      "fecha_vencimiento",
      "almacen_id"
    ],
    "uniqueGroups": [
      [
        "producto_id",
        "lote_id",
        "almacen_id",
        "camara_id"
      ]
    ]
  },
  {
    "key": "movimiento_inventario",
    "title": "Movimientos de inventario",
    "group": "inventario",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "tipo",
        "label": "Tipo",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "entrada",
          "salida",
          "transferencia",
          "ajuste",
          "merma"
        ]
      },
      {
        "name": "producto_id",
        "label": "Producto",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "producto",
        "referenceField": "id"
      },
      {
        "name": "lote_id",
        "label": "Lote",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "lote",
        "referenceField": "id"
      },
      {
        "name": "almacen_origen_id",
        "label": "Almacen origen",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "almacen",
        "referenceField": "id"
      },
      {
        "name": "almacen_destino_id",
        "label": "Almacen destino",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "almacen",
        "referenceField": "id"
      },
      {
        "name": "cantidad",
        "label": "Cantidad",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "usuario_id",
        "label": "Usuario",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "fecha_hora",
        "label": "Fecha y hora",
        "type": "datetime-local",
        "required": true,
        "unique": false
      },
      {
        "name": "documento_tipo",
        "label": "Documento tipo",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "documento_id",
        "label": "Documento",
        "type": "number",
        "required": false,
        "unique": false
      },
      {
        "name": "motivo",
        "label": "Motivo",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "autorizado_por",
        "label": "Autorizado por",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "uuid_cliente",
        "label": "Referencia de dispositivo",
        "type": "text",
        "required": false,
        "unique": true,
        "generated": true
      }
    ],
    "columns": [
      "tipo",
      "producto_id",
      "lote_id",
      "almacen_origen_id",
      "almacen_destino_id"
    ],
    "readOnly": true
  },
  {
    "key": "merma",
    "title": "Mermas",
    "group": "inventario",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "lote_id",
        "label": "Lote",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "lote",
        "referenceField": "id"
      },
      {
        "name": "almacen_id",
        "label": "Almacén",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "almacen",
        "referenceField": "id"
      },
      {
        "name": "movimiento_id",
        "label": "Movimiento",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "movimiento_inventario",
        "referenceField": "id"
      },
      {
        "name": "cantidad_kg",
        "label": "Cantidad kg",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "motivo",
        "label": "Motivo",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "maduracion",
          "golpe",
          "plaga",
          "rechazo_cliente",
          "otro"
        ]
      },
      {
        "name": "evidencia_url",
        "label": "Evidencia url",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "registrado_por",
        "label": "Registrado por",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "aprobado_por",
        "label": "Aprobado por",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "fecha",
        "label": "Fecha",
        "type": "datetime-local",
        "required": true,
        "unique": false
      }
    ],
    "columns": [
      "lote_id",
      "almacen_id",
      "movimiento_id",
      "cantidad_kg",
      "motivo"
    ]
  },
  {
    "key": "registro_temperatura",
    "title": "Lecturas de temperatura",
    "group": "frio",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "camara_id",
        "label": "Cámara",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "camara_fria",
        "referenceField": "id"
      },
      {
        "name": "lote_id",
        "label": "Lote",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "lote",
        "referenceField": "id"
      },
      {
        "name": "temperatura",
        "label": "Temperatura °C",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "humedad",
        "label": "Humedad",
        "type": "number",
        "required": false,
        "unique": false
      },
      {
        "name": "origen",
        "label": "Origen",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "manual",
          "sensor"
        ]
      },
      {
        "name": "usuario_id",
        "label": "Usuario",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "fecha_hora",
        "label": "Fecha y hora",
        "type": "datetime-local",
        "required": true,
        "unique": false
      }
    ],
    "columns": [
      "camara_id",
      "lote_id",
      "temperatura",
      "humedad",
      "origen"
    ]
  },
  {
    "key": "alerta_temperatura",
    "title": "Alertas e incidentes",
    "group": "frio",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "registro_id",
        "label": "Registro",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "registro_temperatura",
        "referenceField": "id"
      },
      {
        "name": "camara_id",
        "label": "Cámara",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "camara_fria",
        "referenceField": "id"
      },
      {
        "name": "fecha_inicio",
        "label": "Fecha inicio",
        "type": "datetime-local",
        "required": true,
        "unique": false
      },
      {
        "name": "fecha_fin",
        "label": "Fecha fin",
        "type": "datetime-local",
        "required": false,
        "unique": false
      },
      {
        "name": "minutos_fuera_rango",
        "label": "Minutos fuera rango",
        "type": "number",
        "required": true,
        "unique": false,
        "defaultValue": 0
      },
      {
        "name": "lote_retenido",
        "label": "Lote retenido",
        "type": "checkbox",
        "required": true,
        "unique": false,
        "defaultValue": false
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "abierta",
          "atendida",
          "cerrada"
        ],
        "defaultValue": "abierta"
      },
      {
        "name": "atendida_por",
        "label": "Atendida por",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "accion_tomada",
        "label": "Accion tomada",
        "type": "text",
        "required": false,
        "unique": false
      }
    ],
    "columns": [
      "registro_id",
      "camara_id",
      "fecha_inicio",
      "fecha_fin",
      "minutos_fuera_rango"
    ]
  },
  {
    "key": "etiqueta_lote",
    "title": "Etiquetas de lote",
    "group": "lotes",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "lote_id",
        "label": "Lote",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "lote",
        "referenceField": "id"
      },
      {
        "name": "codigo_qr",
        "label": "Codigo qr",
        "type": "text",
        "required": true,
        "unique": true
      },
      {
        "name": "tipo",
        "label": "Tipo",
        "type": "text",
        "required": true,
        "unique": false,
        "defaultValue": "lote"
      },
      {
        "name": "impresa",
        "label": "Impresa",
        "type": "checkbox",
        "required": true,
        "unique": false,
        "defaultValue": false
      },
      {
        "name": "generada_en",
        "label": "Generada en",
        "type": "datetime-local",
        "required": true,
        "unique": false,
        "generated": true
      }
    ],
    "columns": [
      "lote_id",
      "codigo_qr",
      "tipo",
      "impresa"
    ]
  },
  {
    "key": "evento_trazabilidad",
    "title": "Historial de trazabilidad",
    "group": "lotes",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "lote_id",
        "label": "Lote",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "lote",
        "referenceField": "id"
      },
      {
        "name": "tipo_evento",
        "label": "Tipo evento",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "cosecha",
          "recepcion",
          "clasificacion",
          "traslado",
          "temperatura",
          "reserva",
          "despacho",
          "entrega",
          "reclamo",
          "devolucion"
        ]
      },
      {
        "name": "entidad_origen",
        "label": "Entidad origen",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "entidad_origen_id",
        "label": "Entidad origen",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "fecha_hora",
        "label": "Fecha y hora",
        "type": "datetime-local",
        "required": true,
        "unique": false
      },
      {
        "name": "usuario_id",
        "label": "Usuario",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "descripcion",
        "label": "Descripcion",
        "type": "textarea",
        "required": false,
        "unique": false
      }
    ],
    "columns": [
      "lote_id",
      "tipo_evento",
      "entidad_origen",
      "entidad_origen_id",
      "fecha_hora"
    ],
    "readOnly": true
  },
  {
    "key": "cotizacion_venta",
    "title": "Cotizaciones comerciales",
    "group": "cotizaciones",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "numero",
        "label": "Numero",
        "type": "text",
        "required": true,
        "unique": true
      },
      {
        "name": "cliente_id",
        "label": "Cliente",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "cliente",
        "referenceField": "id"
      },
      {
        "name": "vendedor_id",
        "label": "Vendedor",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "fecha",
        "label": "Fecha",
        "type": "date",
        "required": true,
        "unique": false
      },
      {
        "name": "vigente_hasta",
        "label": "Vigente hasta",
        "type": "date",
        "required": true,
        "unique": false
      },
      {
        "name": "moneda_id",
        "label": "Moneda",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "moneda",
        "referenceField": "id"
      },
      {
        "name": "total",
        "label": "Total",
        "type": "number",
        "required": true,
        "unique": false,
        "defaultValue": 0
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "borrador",
          "enviada",
          "aprobada",
          "vencida",
          "rechazada",
          "convertida"
        ],
        "defaultValue": "borrador"
      }
    ],
    "columns": [
      "numero",
      "cliente_id",
      "vendedor_id",
      "fecha",
      "vigente_hasta"
    ]
  },
  {
    "key": "detalle_cotizacion_venta",
    "title": "Productos cotizados",
    "group": "cotizaciones",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "cotizacion_id",
        "label": "Cotizacion",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "cotizacion_venta",
        "referenceField": "id"
      },
      {
        "name": "producto_id",
        "label": "Producto",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "producto",
        "referenceField": "id"
      },
      {
        "name": "cantidad",
        "label": "Cantidad",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "precio_unitario",
        "label": "Precio unitario",
        "type": "number",
        "required": true,
        "unique": false
      }
    ],
    "columns": [
      "cotizacion_id",
      "producto_id",
      "cantidad",
      "precio_unitario"
    ]
  },
  {
    "key": "embarque",
    "title": "Embarques",
    "group": "exportaciones",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "codigo",
        "label": "Codigo",
        "type": "text",
        "required": true,
        "unique": true
      },
      {
        "name": "cliente_id",
        "label": "Cliente",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "cliente",
        "referenceField": "id"
      },
      {
        "name": "pais_destino",
        "label": "Pais destino",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "puerto_destino",
        "label": "Puerto destino",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "incoterm_id",
        "label": "Incoterm",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "incoterm",
        "referenceField": "id"
      },
      {
        "name": "medio_transporte",
        "label": "Medio transporte",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "naviera",
        "label": "Naviera",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "contenedor",
        "label": "Contenedor",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "fecha_salida",
        "label": "Fecha salida",
        "type": "date",
        "required": false,
        "unique": false
      },
      {
        "name": "fecha_limite_documentos",
        "label": "Límite de documentos",
        "type": "date",
        "required": false,
        "unique": false
      },
      {
        "name": "responsable_id",
        "label": "Responsable",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "planificado",
          "en_preparacion",
          "despachado",
          "en_transito",
          "entregado",
          "cerrado"
        ],
        "defaultValue": "planificado"
      }
    ],
    "columns": [
      "codigo",
      "cliente_id",
      "pais_destino",
      "puerto_destino",
      "incoterm_id"
    ]
  },
  {
    "key": "pedido",
    "title": "Pedidos",
    "group": "ventas",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "numero",
        "label": "Numero",
        "type": "text",
        "required": true,
        "unique": true
      },
      {
        "name": "cliente_id",
        "label": "Cliente",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "cliente",
        "referenceField": "id"
      },
      {
        "name": "vendedor_id",
        "label": "Vendedor",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "cotizacion_id",
        "label": "Cotizacion",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "cotizacion_venta",
        "referenceField": "id"
      },
      {
        "name": "embarque_id",
        "label": "Embarque",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "embarque",
        "referenceField": "id"
      },
      {
        "name": "es_exportacion",
        "label": "Es exportacion",
        "type": "checkbox",
        "required": true,
        "unique": false,
        "defaultValue": false
      },
      {
        "name": "fecha_pedido",
        "label": "Fecha pedido",
        "type": "datetime-local",
        "required": true,
        "unique": false
      },
      {
        "name": "fecha_entrega_prometida",
        "label": "Entrega prometida",
        "type": "date",
        "required": false,
        "unique": false
      },
      {
        "name": "moneda_id",
        "label": "Moneda",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "moneda",
        "referenceField": "id"
      },
      {
        "name": "tipo_cambio",
        "label": "Tipo de cambio",
        "type": "number",
        "required": true,
        "unique": false,
        "defaultValue": 1
      },
      {
        "name": "subtotal",
        "label": "Subtotal",
        "type": "number",
        "required": true,
        "unique": false,
        "defaultValue": 0
      },
      {
        "name": "descuento",
        "label": "Descuento",
        "type": "number",
        "required": true,
        "unique": false,
        "defaultValue": 0
      },
      {
        "name": "impuesto",
        "label": "Impuesto",
        "type": "number",
        "required": true,
        "unique": false,
        "defaultValue": 0
      },
      {
        "name": "total",
        "label": "Total",
        "type": "number",
        "required": true,
        "unique": false,
        "defaultValue": 0
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "registrado",
          "en_revision",
          "confirmado",
          "en_preparacion",
          "despachado",
          "en_transito",
          "entregado",
          "cancelado",
          "rechazado"
        ],
        "defaultValue": "registrado"
      },
      {
        "name": "aprobado_por",
        "label": "Aprobado por",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "uuid_cliente",
        "label": "Referencia de dispositivo",
        "type": "text",
        "required": false,
        "unique": true,
        "generated": true
      }
    ],
    "columns": [
      "numero",
      "cliente_id",
      "vendedor_id",
      "cotizacion_id",
      "embarque_id"
    ]
  },
  {
    "key": "detalle_pedido",
    "title": "Productos del pedido",
    "group": "ventas",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "pedido_id",
        "label": "Pedido",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "pedido",
        "referenceField": "id"
      },
      {
        "name": "producto_id",
        "label": "Producto",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "producto",
        "referenceField": "id"
      },
      {
        "name": "cantidad",
        "label": "Cantidad",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "precio_unitario",
        "label": "Precio unitario",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "promocion_id",
        "label": "Promocion",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "promocion",
        "referenceField": "id"
      },
      {
        "name": "descuento",
        "label": "Descuento",
        "type": "number",
        "required": true,
        "unique": false,
        "defaultValue": 0
      },
      {
        "name": "subtotal",
        "label": "Subtotal",
        "type": "number",
        "required": true,
        "unique": false
      }
    ],
    "columns": [
      "pedido_id",
      "producto_id",
      "cantidad",
      "precio_unitario",
      "promocion_id"
    ]
  },
  {
    "key": "historial_estado_pedido",
    "title": "Historial de pedidos",
    "group": "ventas",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "pedido_id",
        "label": "Pedido",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "pedido",
        "referenceField": "id"
      },
      {
        "name": "estado_anterior",
        "label": "Estado anterior",
        "type": "text",
        "required": false,
        "unique": false,
        "options": [
          "registrado",
          "en_revision",
          "confirmado",
          "en_preparacion",
          "despachado",
          "en_transito",
          "entregado",
          "cancelado",
          "rechazado"
        ]
      },
      {
        "name": "estado_nuevo",
        "label": "Estado nuevo",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "registrado",
          "en_revision",
          "confirmado",
          "en_preparacion",
          "despachado",
          "en_transito",
          "entregado",
          "cancelado",
          "rechazado"
        ]
      },
      {
        "name": "usuario_id",
        "label": "Usuario",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "fecha_hora",
        "label": "Fecha y hora",
        "type": "datetime-local",
        "required": true,
        "unique": false
      },
      {
        "name": "comentario",
        "label": "Comentario",
        "type": "textarea",
        "required": false,
        "unique": false
      }
    ],
    "columns": [
      "pedido_id",
      "estado_anterior",
      "estado_nuevo",
      "usuario_id",
      "fecha_hora"
    ],
    "readOnly": true
  },
  {
    "key": "reserva",
    "title": "Reservas FEFO",
    "group": "ventas",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "detalle_pedido_id",
        "label": "Detalle pedido",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "detalle_pedido",
        "referenceField": "id"
      },
      {
        "name": "existencia_id",
        "label": "Existencia",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "existencia",
        "referenceField": "id"
      },
      {
        "name": "lote_id",
        "label": "Lote",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "lote",
        "referenceField": "id"
      },
      {
        "name": "cantidad",
        "label": "Cantidad",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "activa",
          "liberada",
          "consumida"
        ],
        "defaultValue": "activa"
      },
      {
        "name": "creada_en",
        "label": "Creada en",
        "type": "datetime-local",
        "required": true,
        "unique": false
      }
    ],
    "columns": [
      "detalle_pedido_id",
      "existencia_id",
      "lote_id",
      "cantidad",
      "estado"
    ],
    "readOnly": true
  },
  {
    "key": "despacho",
    "title": "Despachos y entregas",
    "group": "ventas",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "numero",
        "label": "Numero",
        "type": "text",
        "required": true,
        "unique": true
      },
      {
        "name": "pedido_id",
        "label": "Pedido",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "pedido",
        "referenceField": "id"
      },
      {
        "name": "almacen_id",
        "label": "Almacén",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "almacen",
        "referenceField": "id"
      },
      {
        "name": "responsable_id",
        "label": "Responsable",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "fecha",
        "label": "Fecha",
        "type": "datetime-local",
        "required": true,
        "unique": false
      },
      {
        "name": "packing_list_url",
        "label": "Packing list url",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "preparando",
          "despachado",
          "entregado"
        ],
        "defaultValue": "preparando"
      }
    ],
    "columns": [
      "numero",
      "pedido_id",
      "almacen_id",
      "responsable_id",
      "fecha"
    ],
    "readOnly": true
  },
  {
    "key": "detalle_despacho",
    "title": "Lotes despachados",
    "group": "ventas",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "despacho_id",
        "label": "Despacho",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "despacho",
        "referenceField": "id"
      },
      {
        "name": "detalle_pedido_id",
        "label": "Detalle pedido",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "detalle_pedido",
        "referenceField": "id"
      },
      {
        "name": "lote_id",
        "label": "Lote",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "lote",
        "referenceField": "id"
      },
      {
        "name": "cantidad_kg",
        "label": "Cantidad kg",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "cajas",
        "label": "Cajas",
        "type": "number",
        "required": false,
        "unique": false
      }
    ],
    "columns": [
      "despacho_id",
      "detalle_pedido_id",
      "lote_id",
      "cantidad_kg",
      "cajas"
    ],
    "readOnly": true
  },
  {
    "key": "documento_exportacion",
    "title": "Expedientes y documentos",
    "group": "exportaciones",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "embarque_id",
        "label": "Embarque",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "embarque",
        "referenceField": "id"
      },
      {
        "name": "tipo",
        "label": "Tipo",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "packing_list",
          "factura_comercial",
          "certificado_fitosanitario",
          "certificado_origen",
          "otro"
        ]
      },
      {
        "name": "numero",
        "label": "Numero",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "archivo_url",
        "label": "Archivo url",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "generado_automaticamente",
        "label": "Generado automaticamente",
        "type": "checkbox",
        "required": true,
        "unique": false,
        "defaultValue": false
      },
      {
        "name": "responsable_id",
        "label": "Responsable",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "fecha",
        "label": "Fecha",
        "type": "datetime-local",
        "required": true,
        "unique": false
      },
      {
        "name": "completo",
        "label": "Completo",
        "type": "checkbox",
        "required": true,
        "unique": false,
        "defaultValue": false
      }
    ],
    "columns": [
      "embarque_id",
      "tipo",
      "numero",
      "archivo_url",
      "generado_automaticamente"
    ]
  },
  {
    "key": "factura",
    "title": "Facturas de venta",
    "group": "finanzas",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "serie",
        "label": "Serie",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "numero",
        "label": "Numero",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "uuid_fel",
        "label": "Uuid fel",
        "type": "text",
        "required": false,
        "unique": true
      },
      {
        "name": "pedido_id",
        "label": "Pedido",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "pedido",
        "referenceField": "id"
      },
      {
        "name": "despacho_id",
        "label": "Despacho",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "despacho",
        "referenceField": "id"
      },
      {
        "name": "cliente_id",
        "label": "Cliente",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "cliente",
        "referenceField": "id"
      },
      {
        "name": "fecha_emision",
        "label": "Fecha emision",
        "type": "datetime-local",
        "required": true,
        "unique": false
      },
      {
        "name": "moneda_id",
        "label": "Moneda",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "moneda",
        "referenceField": "id"
      },
      {
        "name": "tipo_cambio",
        "label": "Tipo de cambio",
        "type": "number",
        "required": true,
        "unique": false,
        "defaultValue": 1
      },
      {
        "name": "subtotal",
        "label": "Subtotal",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "iva",
        "label": "Iva",
        "type": "number",
        "required": true,
        "unique": false,
        "defaultValue": 0
      },
      {
        "name": "total",
        "label": "Total",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "emitida",
          "anulada"
        ],
        "defaultValue": "emitida"
      }
    ],
    "columns": [
      "serie",
      "numero",
      "uuid_fel",
      "pedido_id",
      "despacho_id"
    ],
    "readOnly": true,
    "uniqueGroups": [
      [
        "serie",
        "numero"
      ]
    ]
  },
  {
    "key": "detalle_factura",
    "title": "Detalle facturado",
    "group": "finanzas",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "factura_id",
        "label": "Factura",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "factura",
        "referenceField": "id"
      },
      {
        "name": "producto_id",
        "label": "Producto",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "producto",
        "referenceField": "id"
      },
      {
        "name": "lote_id",
        "label": "Lote",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "lote",
        "referenceField": "id"
      },
      {
        "name": "cantidad",
        "label": "Cantidad",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "precio_unitario",
        "label": "Precio unitario",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "subtotal",
        "label": "Subtotal",
        "type": "number",
        "required": true,
        "unique": false
      }
    ],
    "columns": [
      "factura_id",
      "producto_id",
      "lote_id",
      "cantidad",
      "precio_unitario"
    ],
    "readOnly": true
  },
  {
    "key": "cuenta_por_cobrar",
    "title": "Cuentas por cobrar",
    "group": "finanzas",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "factura_id",
        "label": "Factura",
        "type": "number",
        "required": true,
        "unique": true,
        "reference": "factura",
        "referenceField": "id"
      },
      {
        "name": "cliente_id",
        "label": "Cliente",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "cliente",
        "referenceField": "id"
      },
      {
        "name": "monto_original",
        "label": "Monto original",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "saldo",
        "label": "Saldo",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "fecha_vencimiento",
        "label": "Vencimiento",
        "type": "date",
        "required": true,
        "unique": false
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "pendiente",
          "parcial",
          "pagada",
          "vencida"
        ],
        "defaultValue": "pendiente"
      }
    ],
    "columns": [
      "factura_id",
      "cliente_id",
      "monto_original",
      "saldo",
      "fecha_vencimiento"
    ],
    "readOnly": true
  },
  {
    "key": "cobro",
    "title": "Cobros",
    "group": "finanzas",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "cuenta_cobrar_id",
        "label": "Cuenta cobrar",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "cuenta_por_cobrar",
        "referenceField": "id"
      },
      {
        "name": "fecha",
        "label": "Fecha",
        "type": "date",
        "required": true,
        "unique": false
      },
      {
        "name": "monto",
        "label": "Monto",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "metodo",
        "label": "Metodo",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "referencia",
        "label": "Referencia",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "usuario_id",
        "label": "Usuario",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      }
    ],
    "columns": [
      "cuenta_cobrar_id",
      "fecha",
      "monto",
      "metodo",
      "referencia"
    ]
  },
  {
    "key": "anticipo",
    "title": "Anticipos",
    "group": "finanzas",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "cliente_id",
        "label": "Cliente",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "cliente",
        "referenceField": "id"
      },
      {
        "name": "pedido_id",
        "label": "Pedido",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "pedido",
        "referenceField": "id"
      },
      {
        "name": "fecha",
        "label": "Fecha",
        "type": "date",
        "required": true,
        "unique": false
      },
      {
        "name": "monto",
        "label": "Monto",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "moneda_id",
        "label": "Moneda",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "moneda",
        "referenceField": "id"
      },
      {
        "name": "aplicado",
        "label": "Aplicado",
        "type": "checkbox",
        "required": true,
        "unique": false,
        "defaultValue": false
      }
    ],
    "columns": [
      "cliente_id",
      "pedido_id",
      "fecha",
      "monto",
      "moneda_id"
    ]
  },
  {
    "key": "cuenta_por_pagar",
    "title": "Cuentas por pagar",
    "group": "finanzas",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "proveedor_id",
        "label": "Proveedor",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "proveedor",
        "referenceField": "id"
      },
      {
        "name": "recepcion_id",
        "label": "Recepcion",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "recepcion_compra",
        "referenceField": "id"
      },
      {
        "name": "numero_factura",
        "label": "Numero factura",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "monto_original",
        "label": "Monto original",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "saldo",
        "label": "Saldo",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "moneda_id",
        "label": "Moneda",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "moneda",
        "referenceField": "id"
      },
      {
        "name": "fecha_vencimiento",
        "label": "Vencimiento",
        "type": "date",
        "required": true,
        "unique": false
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "pendiente",
          "parcial",
          "pagada",
          "vencida"
        ],
        "defaultValue": "pendiente"
      }
    ],
    "columns": [
      "proveedor_id",
      "recepcion_id",
      "numero_factura",
      "monto_original",
      "saldo"
    ],
    "readOnly": true
  },
  {
    "key": "pago",
    "title": "Pagos",
    "group": "finanzas",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "cuenta_pagar_id",
        "label": "Cuenta pagar",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "cuenta_por_pagar",
        "referenceField": "id"
      },
      {
        "name": "fecha",
        "label": "Fecha",
        "type": "date",
        "required": true,
        "unique": false
      },
      {
        "name": "monto",
        "label": "Monto",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "metodo",
        "label": "Metodo",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "referencia",
        "label": "Referencia",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "usuario_id",
        "label": "Usuario",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      }
    ],
    "columns": [
      "cuenta_pagar_id",
      "fecha",
      "monto",
      "metodo",
      "referencia"
    ]
  },
  {
    "key": "reclamo",
    "title": "Reclamos",
    "group": "reclamos",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "numero",
        "label": "Numero",
        "type": "text",
        "required": true,
        "unique": true
      },
      {
        "name": "cliente_id",
        "label": "Cliente",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "cliente",
        "referenceField": "id"
      },
      {
        "name": "pedido_id",
        "label": "Pedido",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "pedido",
        "referenceField": "id"
      },
      {
        "name": "lote_id",
        "label": "Lote",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "lote",
        "referenceField": "id"
      },
      {
        "name": "fecha",
        "label": "Fecha",
        "type": "datetime-local",
        "required": true,
        "unique": false
      },
      {
        "name": "tipo",
        "label": "Tipo",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "calidad",
          "cantidad",
          "temperatura",
          "documentos",
          "retraso",
          "otro"
        ]
      },
      {
        "name": "descripcion",
        "label": "Descripcion",
        "type": "textarea",
        "required": true,
        "unique": false
      },
      {
        "name": "evidencia_url",
        "label": "Evidencia url",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "responsable_id",
        "label": "Responsable",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "abierto",
          "en_proceso",
          "resuelto",
          "cerrado",
          "rechazado"
        ],
        "defaultValue": "abierto"
      },
      {
        "name": "solucion",
        "label": "Solucion",
        "type": "textarea",
        "required": false,
        "unique": false
      },
      {
        "name": "fecha_cierre",
        "label": "Fecha cierre",
        "type": "datetime-local",
        "required": false,
        "unique": false
      }
    ],
    "columns": [
      "numero",
      "cliente_id",
      "pedido_id",
      "lote_id",
      "fecha"
    ]
  },
  {
    "key": "seguimiento_reclamo",
    "title": "Seguimiento de reclamos",
    "group": "reclamos",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "reclamo_id",
        "label": "Reclamo",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "reclamo",
        "referenceField": "id"
      },
      {
        "name": "fecha",
        "label": "Fecha",
        "type": "datetime-local",
        "required": true,
        "unique": false
      },
      {
        "name": "usuario_id",
        "label": "Usuario",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "comentario",
        "label": "Comentario",
        "type": "textarea",
        "required": true,
        "unique": false
      },
      {
        "name": "estado_resultante",
        "label": "Estado resultante",
        "type": "text",
        "required": false,
        "unique": false,
        "options": [
          "abierto",
          "en_proceso",
          "resuelto",
          "cerrado",
          "rechazado"
        ]
      }
    ],
    "columns": [
      "reclamo_id",
      "fecha",
      "usuario_id",
      "comentario",
      "estado_resultante"
    ]
  },
  {
    "key": "nota_credito",
    "title": "Notas de crédito",
    "group": "finanzas",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "factura_id",
        "label": "Factura",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "factura",
        "referenceField": "id"
      },
      {
        "name": "uuid_fel",
        "label": "Uuid fel",
        "type": "text",
        "required": false,
        "unique": true
      },
      {
        "name": "fecha",
        "label": "Fecha",
        "type": "datetime-local",
        "required": true,
        "unique": false
      },
      {
        "name": "motivo",
        "label": "Motivo",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "monto",
        "label": "Monto",
        "type": "number",
        "required": true,
        "unique": false
      }
    ],
    "columns": [
      "factura_id",
      "uuid_fel",
      "fecha",
      "motivo",
      "monto"
    ],
    "uniqueGroups": [
      [
        "60"
      ]
    ]
  },
  {
    "key": "devolucion",
    "title": "Devoluciones",
    "group": "reclamos",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "reclamo_id",
        "label": "Reclamo",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "reclamo",
        "referenceField": "id"
      },
      {
        "name": "pedido_id",
        "label": "Pedido",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "pedido",
        "referenceField": "id"
      },
      {
        "name": "lote_id",
        "label": "Lote",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "lote",
        "referenceField": "id"
      },
      {
        "name": "cantidad_kg",
        "label": "Cantidad kg",
        "type": "number",
        "required": true,
        "unique": false
      },
      {
        "name": "destino",
        "label": "Destino",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "reintegro_inventario",
          "merma",
          "descarte"
        ]
      },
      {
        "name": "movimiento_id",
        "label": "Movimiento",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "movimiento_inventario",
        "referenceField": "id"
      },
      {
        "name": "nota_credito_id",
        "label": "Nota credito",
        "type": "number",
        "required": false,
        "unique": false,
        "reference": "nota_credito",
        "referenceField": "id"
      },
      {
        "name": "fecha",
        "label": "Fecha",
        "type": "datetime-local",
        "required": true,
        "unique": false
      }
    ],
    "columns": [
      "reclamo_id",
      "pedido_id",
      "lote_id",
      "cantidad_kg",
      "destino"
    ]
  },
  {
    "key": "dispositivo_registrado",
    "title": "Dispositivos",
    "group": "sincronizacion",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "usuario_id",
        "label": "Usuario",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "identificador",
        "label": "Identificador",
        "type": "text",
        "required": true,
        "unique": true
      },
      {
        "name": "tipo",
        "label": "Tipo",
        "type": "text",
        "required": false,
        "unique": false
      },
      {
        "name": "ultimo_sync",
        "label": "Ultimo sync",
        "type": "datetime-local",
        "required": false,
        "unique": false
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "activo",
          "inactivo"
        ],
        "defaultValue": "activo"
      }
    ],
    "columns": [
      "usuario_id",
      "identificador",
      "tipo",
      "ultimo_sync",
      "estado"
    ]
  },
  {
    "key": "cola_sincronizacion",
    "title": "Cola y conflictos",
    "group": "sincronizacion",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "type": "number",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "dispositivo_id",
        "label": "Dispositivo",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "dispositivo_registrado",
        "referenceField": "id"
      },
      {
        "name": "usuario_id",
        "label": "Usuario",
        "type": "number",
        "required": true,
        "unique": false,
        "reference": "usuario",
        "referenceField": "id"
      },
      {
        "name": "entidad",
        "label": "Entidad",
        "type": "text",
        "required": true,
        "unique": false
      },
      {
        "name": "operacion",
        "label": "Operacion",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "crear",
          "actualizar",
          "eliminar"
        ]
      },
      {
        "name": "uuid_cliente",
        "label": "Referencia de dispositivo",
        "type": "text",
        "required": true,
        "unique": true,
        "generated": true
      },
      {
        "name": "payload",
        "label": "Payload",
        "type": "textarea",
        "required": true,
        "unique": false
      },
      {
        "name": "creado_en",
        "label": "Creado en",
        "type": "datetime-local",
        "required": true,
        "unique": false,
        "generated": true
      },
      {
        "name": "sincronizado_en",
        "label": "Sincronizado en",
        "type": "datetime-local",
        "required": false,
        "unique": false
      },
      {
        "name": "estado",
        "label": "Estado",
        "type": "text",
        "required": true,
        "unique": false,
        "options": [
          "pendiente",
          "sincronizado",
          "conflicto",
          "error"
        ],
        "defaultValue": "pendiente"
      },
      {
        "name": "detalle_conflicto",
        "label": "Detalle conflicto",
        "type": "text",
        "required": false,
        "unique": false
      }
    ],
    "columns": [
      "dispositivo_id",
      "usuario_id",
      "entidad",
      "operacion",
      "payload"
    ]
  }
]
