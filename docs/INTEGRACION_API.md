# 🔗 Guía de Integración API HOMA + Firebase

Esta documentación describe cómo integrar la autenticación Firebase y la API HOMA en el proyecto Mio-Web.

---

## Arquitectura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Usuario   │────▶│  Firebase   │────▶│  API HOMA   │
└─────────────┘     │   Auth      │     │  :7200      │
                    └─────────────┘     └─────────────┘
                          │                    │
                          ▼                    ▼
                      UID + Email         token + patient_id
```

---

## Configuración

### Variables de Entorno (`.env`)

```bash
# Firebase
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=homa-prod-fbb80.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=homa-prod-fbb80

# API HOMA
VITE_API_HOMA_URL=https://apihoma.homa.cl:7200
VITE_API_TIMEOUT=10000
```

### Archivos Clave

| Archivo                            | Propósito                   |
| ---------------------------------- | --------------------------- |
| `src/config/firebaseConfig.js`     | Inicializa Firebase         |
| `src/services/authService.js`      | Maneja login/logout         |
| `src/services/serviciosService.js` | Obtiene servicios dinámicos |
| `src/stores/tiendaUsuario.js`      | Estado del usuario          |
| `src/stores/tiendaServicios.js`    | Estado de servicios         |

---

## Flujo de Autenticación

### 1. Login

```javascript
// authService.js
async login(email, password) {
  // 1. Firebase Auth
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;

  // 2. API HOMA Authorization
  const response = await fetch(`${API_HOMA_URL}/api/v1/authorizations`, {
    method: 'POST',
    body: JSON.stringify({ email, UID: uid })
  });

  // 3. Extraer token y patient_id
  const { token, patient_id } = await response.json();

  return { success: true, token, user: { uid, patient_id, email } };
}
```

### 2. Guardar Sesión

```javascript
// Datos guardados en localStorage
localStorage.setItem("mio-token", token); // Token de HOMA
localStorage.setItem(
  "mio-user",
  JSON.stringify({
    uid: "ZptrTFb5HMcRyu7Tq92WOP2uZoP2",
    patient_id: 75863,
    email: "sebastian.almo9@gmail.com",
  }),
);
```

### 3. Restaurar Sesión

```javascript
// tiendaUsuario.js
function restaurarSesion() {
  const token = localStorage.getItem("mio-token");
  const user = JSON.parse(localStorage.getItem("mio-user"));
  if (token && user) {
    this.token = token;
    this.usuario = user;
    return true;
  }
  return false;
}
```

---

## Servicios Dinámicos

### Obtener Servicios del Usuario

```javascript
// serviciosService.js
async obtenerServicios() {
  const user = authService.getUser();

  const response = await fetch(
    `${API_HOMA_URL}/api/v1/patients/${user.patient_id}/services`,
    {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`
      }
    }
  );

  return await response.json();
}
```

### Uso en Componentes

```vue
<script setup>
import { onMounted } from "vue";
import { useTiendaServicios } from "@/stores/tiendaServicios";

const serviciosStore = useTiendaServicios();

onMounted(async () => {
  await serviciosStore.cargarServicios();
});
</script>
```

---

## Endpoints API HOMA

### Autenticación

| Método | Endpoint                 | Descripción           |
| ------ | ------------------------ | --------------------- |
| POST   | `/api/v1/authorizations` | Login con email + UID |

### Pacientes

| Método | Endpoint                          | Descripción           |
| ------ | --------------------------------- | --------------------- |
| GET    | `/api/v1/patients/{id}`           | Datos del paciente    |
| GET    | `/api/v1/patients/{id}/services`  | Servicios disponibles |
| GET    | `/api/v1/patients/{id}/campaigns` | Campañas asignadas    |
| GET    | `/api/v1/patients/plans/{id}`     | Plan actual           |

### Servicios

| Método | Endpoint                         | Descripción               |
| ------ | -------------------------------- | ------------------------- |
| POST   | `/api/v1/services/setuseservice` | Registrar uso de servicio |

---

## Manejo de Errores

### Errores de Firebase

```javascript
switch (error.code) {
  case "auth/invalid-email":
    return "Email inválido";
  case "auth/user-not-found":
    return "Usuario no encontrado";
  case "auth/wrong-password":
    return "Contraseña incorrecta";
  case "auth/invalid-credential":
    return "Credenciales inválidas";
}
```

### Errores de HOMA

```javascript
if (!homaData.success) {
  throw new Error(homaData.error || "Error en autorización HOMA");
}
```

---

## Seguridad

> ⚠️ **Importante**

- El archivo `homa-prod-fbb80-firebase-adminsdk-*.json` es para **backend-to-backend**
- Está en `.gitignore` para no subirlo al repositorio
- Las credenciales del cliente web van en `.env` (también en `.gitignore`)
- El `token` de HOMA debe enviarse en cada request autenticado
