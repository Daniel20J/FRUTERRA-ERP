export interface ModuleConfig { title: string; sub: string; noun: string; cols: string[]; fields: string[]; rows: string[][] }
export type NavigationItem = [key: string, icon: string, label: string]
export interface DrawerState { module: import("../data/demoData").ModuleKey; index: number | null; view: "form" | "detail" }
