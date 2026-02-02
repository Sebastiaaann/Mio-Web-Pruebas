/**
 * Tipos de API y respuestas de servicios
 * Centraliza contratos para servicios HOMA y auth
 */

// === RESPUESTAS API ===
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// === AUTENTICACION ===
export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthUser {
  uid: string
  patient_id: number
  health_plan_id: number | null
  email: string
  fullName: string
}

export interface LoginResponse {
  success: boolean
  token?: string
  user?: AuthUser
  error?: string
}

export interface SessionMetaAuth {
  uid: string
  patient_id: number
  health_plan_id: number | null
  lastLogin: number
  isLegacy?: boolean
}

// === PACIENTE ===
export interface Paciente {
  id: number
  patient_id?: number
  name?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  document?: string
  birth_date?: string
  gender?: 'M' | 'F' | string
  address?: string
  health_plan_id?: number
  [key: string]: unknown
}

export interface PacienteResponse {
  success: boolean
  paciente?: Paciente
  error?: string
}

// === SERVICIOS ===
export interface ServicioApiRaw {
  id: number
  name?: string
  nombre?: string
  title?: string
  description?: string
  descripcion?: string
  home_position?: string | number
  orden?: number
  active?: boolean
  activo?: boolean
  options?: ServicioOpcionRaw[]
  items?: ServicioOpcionRaw[]
}

export interface ServicioOpcionRaw {
  id?: number
  plan_name?: string
  name?: string
  nombre?: string
  title?: string
  titulo?: string
  description?: string
  descripcion?: string
  plan_description?: string
  type_message?: string
  tipo_mensaje?: string
}

export interface ServicioNormalizado {
  id: number
  nombre: string
  descripcion: string
  orden: number
  activo: boolean
  icono?: string
  color?: string
  ruta?: string
  items: ServicioOpcionNormalizada[]
}

export interface ServicioOpcionNormalizada {
  nombre?: string
  titulo?: string
  descripcion?: string
  tipo_mensaje?: string
  [key: string]: unknown
}

// === CLIENTE API ===
export interface RequestConfig extends RequestInit {
  timeout?: number
}

export interface ClienteApiConfig {
  baseUrl: string
  timeout: number
}
