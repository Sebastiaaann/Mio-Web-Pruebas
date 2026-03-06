<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ALCANCE_COOKIE_SESION,
  CLAVE_AVISO_COOKIES_VISTO,
  DESCRIPCION_ATRIBUTOS_COOKIE_SESION,
  DESCRIPCION_AVISO_LOCAL,
  DESCRIPCION_DURACION_COOKIE_CORTA,
  DESCRIPCION_DURACION_COOKIE_DETALLE,
  FECHAS_ACTUALIZACION_LEGAL,
  NOMBRE_COOKIE_SESION
} from '@/config/legal'

const router = useRouter()

function volver() {
  if (typeof window !== 'undefined' && document.referrer) {
    try {
      const urlReferencia = new URL(document.referrer)
      if (urlReferencia.origin === window.location.origin) {
        router.back()
        return
      }
    } catch {
      // Si el referrer no es válido, usar fallback interno.
    }
  }

  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <Button variant="ghost" @click="volver" class="mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="mr-2"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Volver
        </Button>

        <h1 class="text-4xl font-bold mb-2">Política de Cookies</h1>
        <p class="text-muted-foreground">
          Última actualización: {{ FECHAS_ACTUALIZACION_LEGAL.cookies }}
        </p>
      </div>

      <!-- Contenido -->
      <div class="space-y-6">
        <!-- Introducción -->
        <Card>
          <CardHeader>
            <CardTitle>¿Qué son las cookies?</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo
              cuando los visitas. Se utilizan ampliamente para hacer que los sitios web funcionen de
              manera más eficiente, así como para proporcionar información a los propietarios del sitio.
            </p>
          </CardContent>
        </Card>

        <!-- Cookies que usamos -->
        <Card>
          <CardHeader>
            <CardTitle>Cookies que utiliza Mio+</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <p class="text-sm text-muted-foreground">
              Mio+ utiliza una cookie de sesión esencial para autenticación y una preferencia local
              funcional para recordar que ya viste este aviso.
              <strong>No utilizamos cookies de seguimiento, analíticas o publicitarias.</strong>
            </p>

            <div class="border rounded-lg p-4 bg-muted/50">
              <h3 class="font-semibold mb-2 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Cookie de sesión: <code class="text-xs">{{ NOMBRE_COOKIE_SESION }}</code>
              </h3>

              <dl class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
                <div>
                  <dt class="font-medium text-muted-foreground">Propósito:</dt>
                  <dd>Mantener tu sesión de usuario activa y segura</dd>
                </div>

                <div>
                  <dt class="font-medium text-muted-foreground">Tipo:</dt>
                  <dd>Cookie esencial ({{ DESCRIPCION_ATRIBUTOS_COOKIE_SESION }})</dd>
                </div>

                <div>
                  <dt class="font-medium text-muted-foreground">Duración:</dt>
                  <dd>{{ DESCRIPCION_DURACION_COOKIE_CORTA }}</dd>
                </div>

                <div>
                  <dt class="font-medium text-muted-foreground">Alcance:</dt>
                  <dd>{{ ALCANCE_COOKIE_SESION }}</dd>
                </div>
              </dl>

              <div class="mt-4 p-3 bg-background/60 rounded border border-border/50">
                <p class="text-xs text-muted-foreground">
                  <strong>Seguridad:</strong> Esta cookie está protegida con cifrado AES-256-GCM y
                  configurada como HttpOnly (no accesible desde JavaScript), SameSite=Strict y
                  Secure fuera de entornos de desarrollo. Esto previene ataques XSS y reduce el
                  riesgo de envío de sesión en contextos no esperados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferencia local del aviso</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <p class="text-sm text-muted-foreground">
              Además de la cookie de sesión, guardamos una preferencia local funcional para recordar
              que ya viste el aviso de cookies. No contiene datos de salud ni se utiliza para
              seguimiento.
            </p>

            <div class="border rounded-lg p-4 bg-muted/50">
              <h3 class="font-semibold mb-2">
                Preferencia local: <code class="text-xs">{{ CLAVE_AVISO_COOKIES_VISTO }}</code>
              </h3>

              <dl class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
                <div>
                  <dt class="font-medium text-muted-foreground">Propósito:</dt>
                  <dd>{{ DESCRIPCION_AVISO_LOCAL }}</dd>
                </div>

                <div>
                  <dt class="font-medium text-muted-foreground">Tecnología:</dt>
                  <dd>localStorage del navegador</dd>
                </div>

                <div>
                  <dt class="font-medium text-muted-foreground">Duración:</dt>
                  <dd>Hasta que borres los datos del navegador o restablezcas esta preferencia.</dd>
                </div>

                <div>
                  <dt class="font-medium text-muted-foreground">Uso:</dt>
                  <dd>Solo evita mostrar el mismo aviso en visitas posteriores.</dd>
                </div>
              </dl>
            </div>
          </CardContent>
        </Card>

        <!-- ¿Por qué es necesaria? -->
        <Card>
          <CardHeader>
            <CardTitle>¿Por qué es necesaria esta cookie?</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>
              La cookie <code>{{ NOMBRE_COOKIE_SESION }}</code> es <strong>estrictamente necesaria</strong> para que
              puedas utilizar Mio+. Sin ella, no sería posible:
            </p>
            <ul>
              <li>Iniciar sesión y mantener tu sesión activa</li>
              <li>Acceder a tus datos de salud de forma segura</li>
              <li>Proteger tu información contra accesos no autorizados</li>
              <li>Navegar por la aplicación sin tener que re-autenticarte constantemente</li>
            </ul>
            <p>
              De acuerdo con la regulación GDPR y ePrivacy, las cookies esenciales
              <strong>no requieren consentimiento previo</strong> del usuario, ya que son indispensables
              para el funcionamiento del servicio que has solicitado.
            </p>
          </CardContent>
        </Card>

        <!-- Gestión de cookies -->
        <Card>
          <CardHeader>
            <CardTitle>Gestión de cookies</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <h3 class="text-base font-semibold mt-0">En tu navegador</h3>
            <p>
              Puedes configurar tu navegador para rechazar cookies, pero esto impedirá que puedas
              utilizar Mio+. Si eliminas la cookie de sesión, tendrás que iniciar sesión nuevamente.
            </p>

            <h3 class="text-base font-semibold">Al cerrar sesión</h3>
            <p>
              Cuando cierras sesión en Mio+, la cookie <code>{{ NOMBRE_COOKIE_SESION }}</code> se elimina automáticamente
              de tu dispositivo.
            </p>

            <h3 class="text-base font-semibold">Caducidad automática</h3>
            <p>
              {{ DESCRIPCION_DURACION_COOKIE_DETALLE }} Cuando la sesión vence, deberás iniciar
              sesión nuevamente para continuar usando la aplicación.
            </p>
          </CardContent>
        </Card>

        <!-- Privacidad -->
        <Card>
          <CardHeader>
            <CardTitle>Tu privacidad es importante</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>
              En Mio+ nos tomamos muy en serio la protección de tus datos. Por eso:
            </p>
            <ul>
              <li>
                <strong>No compartimos</strong> información de tu sesión con terceros
              </li>
              <li>
                <strong>No usamos</strong> cookies de seguimiento o publicidad
              </li>
              <li>
                <strong>No vendemos</strong> tus datos a nadie
              </li>
              <li>
                <strong>Ciframos</strong> toda la información sensible
              </li>
            </ul>
            <p>
              Para más información sobre cómo protegemos tus datos, consulta nuestra
              <router-link to="/privacidad" class="text-primary hover:underline">
                Política de Privacidad
              </router-link>.
            </p>
          </CardContent>
        </Card>

        <!-- Contacto -->
        <Card>
          <CardHeader>
            <CardTitle>¿Tienes dudas?</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Si tienes alguna pregunta sobre nuestra política de cookies, puedes contactarnos en:
            </p>
            <ul class="list-none pl-0">
              <li>
                <strong>Email:</strong>
                <a href="mailto:privacidad@mio.cl" class="text-primary hover:underline">
                  privacidad@mio.cl
                </a>
              </li>
              <li>
                <strong>Atención al cliente:</strong>
                <a href="mailto:soporte@mio.cl" class="text-primary hover:underline">
                  soporte@mio.cl
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <!-- Footer -->
      <div class="mt-12 text-center text-sm text-muted-foreground">
        <p>
          Esta política puede actualizarse periódicamente. Te notificaremos de cualquier cambio
          significativo.
        </p>
      </div>
    </div>
  </div>
</template>
