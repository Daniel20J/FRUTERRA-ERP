export type Cell = string | number | boolean
export interface EntityRecord { id: number; [field: string]: Cell }
export interface FieldDefinition { name: string; label: string; type: 'text' | 'number' | 'date' | 'datetime-local' | 'time' | 'checkbox' | 'email' | 'textarea'; required: boolean; unique?: boolean; options?: string[]; reference?: string; referenceField?: string; defaultValue?: Cell; generated?: boolean }
export interface EntityDefinition { key: string; title: string; group: string; fields: FieldDefinition[]; columns: string[]; readOnly?: boolean; description?: string; uniqueGroups?: string[][] }
export interface ErpState { version: 2; tables: Record<string, EntityRecord[]>; clock: string; counters: Record<string, number>; migrationArchive?: import('../data/demoData').Database }
export interface Actor { id: number; role: string; clientId?: number }
export type BusinessAction = 'aprobar' | 'ordenar' | 'recibir' | 'convertir' | 'confirmar' | 'preparar' | 'despachar' | 'entregar' | 'cancelar' | 'facturar' | 'documentos' | 'cerrar' | 'sincronizar' | 'resolver' | 'aplicar' | 'liberar'
