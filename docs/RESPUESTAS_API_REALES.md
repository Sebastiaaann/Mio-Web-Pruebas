# 📊 Respuestas Reales de la API HOMA

**Fecha de captura:** 21 de Enero, 2026
**Patient ID de prueba:** 75863
**Email:** sebastian.almo9@gmail.com

---

## 1. POST /api/v1/authorizations (Login)

**Request:**

```json
{
  "email": "sebastian.almo9@gmail.com",
  "UID": "ZptrTFb5HMcRyu7Tq92WOP2uZoP2"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400,
  "patient_id": "75863"
}
```

> [!IMPORTANT]
> El token expira en **24 horas** (`expiresIn: 86400` segundos).

---

## 2. GET /api/v1/patients/{patient_id} (Perfil)

**Header requerido:** `X-API-KEY: <token>`

**Response (200 OK):**

```json
{
  "patient_id": 75863,
  "name": "Sebastián",
  "last_name": "Almonacid",
  "email": "sebastian.almo9@gmail.com",
  "rut": "20656816-K",
  "current_plan": {
    "id": 10,
    "name": "Mutual",
    "color": "#595A5C"
  },
  "clients": ["Mutual", "Homa"]
}
```

> [!NOTE]
>
> - **Nombre completo:** Se debe concatenar `name` + `last_name`.
> - El campo `current_plan.color` puede usarse para personalizar la UI.

---

## 3. GET /api/v1/patients/{patient_id}/services (Home Dinámico)

**Response (200 OK):**

```json
[
  { "service_id": 1, "name": "BIENVENIDA", "home_position": 0 },
  { "service_id": 2, "name": "OPERATIVOS", "home_position": 1 },
  {
    "service_id": 3,
    "name": "BANNERS",
    "home_position": 1,
    "items": ["Beneficios Mutual", "Clases en vivo"]
  },
  { "service_id": 4, "name": "CHATBOT", "home_position": 2 },
  {
    "service_id": 5,
    "name": "MATERIAL AUDIOVISUAL",
    "home_position": 3,
    "items": ["Biblioteca Virtual", "Campaña Anual"]
  },
  { "service_id": 6, "name": "TELECONSULTA", "home_position": 4 },
  { "service_id": 7, "name": "VIDA SANA", "home_position": 5 },
  { "service_id": 8, "name": "ÚLTIMA MEDICIÓN", "home_position": 6 },
  { "service_id": 9, "name": "PRÓXIMOS CONTROLES", "home_position": 7 }
]
```

> [!TIP]
> El campo `home_position` determina el orden de las tarjetas en el Bento Grid.

---

## 4. GET /api/v1/patients/plans/{patient_id} (Planes y Branding)

**Response (200 OK):**

```json
{
  "plans": [
    {
      "plan_id": 1,
      "name": "Homa",
      "logo_base64": "data:image/png;base64,...",
      "primary_color": "#7D58E9"
    },
    {
      "plan_id": 10,
      "name": "Mutual",
      "logo_base64": "data:image/png;base64,...",
      "primary_color": "#C4D600"
    }
  ]
}
```

> [!IMPORTANT]
> El color primario de cada plan (`primary_color`) puede usarse para aplicar temas dinámicos en la UI.

---

## 🔧 Cambio Técnico Detectado

> [!CAUTION]
> La API **NO usa** `Authorization: Bearer <token>`.
> En su lugar, requiere el header: **`X-API-KEY: <token>`**.

### Acción Requerida:

Actualizar `clienteApi.js` para usar el header correcto:

```diff
- config.headers["Authorization"] = `Bearer ${token}`;
+ config.headers["X-API-KEY"] = token;
```
