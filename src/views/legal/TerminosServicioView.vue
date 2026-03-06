<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const router = useRouter()

function volver() {
  router.back()
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

        <h1 class="text-4xl font-bold mb-2">Términos de Servicio</h1>
        <p class="text-muted-foreground">
          Última actualización: {{ new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) }}
        </p>
      </div>

      <!-- Contenido -->
      <div class="space-y-6">
        <!-- Introducción -->
        <Card>
          <CardHeader>
            <CardTitle>Acuerdo de uso</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Bienvenido a <strong>Mio+</strong>. Estos Términos de Servicio ("Términos") rigen tu
              acceso y uso de nuestra plataforma de gestión de salud. Al crear una cuenta y utilizar
              Mio+, aceptas estos términos en su totalidad.
            </p>
            <p>
              Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestros
              servicios.
            </p>
          </CardContent>
        </Card>

        <!-- Definiciones -->
        <Card>
          <CardHeader>
            <CardTitle>Definiciones</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <ul>
              <li>
                <strong>"Mio+", "nosotros", "nuestro":</strong> Se refiere a la plataforma Mio+ y
                sus operadores
              </li>
              <li>
                <strong>"Usuario", "tú", "tu":</strong> Se refiere a cualquier persona que acceda o
                utilice la plataforma
              </li>
              <li>
                <strong>"Servicios":</strong> Se refiere a todas las funcionalidades, herramientas
                y contenidos proporcionados por Mio+
              </li>
              <li>
                <strong>"Contenido":</strong> Incluye datos, texto, información de salud, imágenes
                y otros materiales en la plataforma
              </li>
            </ul>
          </CardContent>
        </Card>

        <!-- Elegibilidad -->
        <Card>
          <CardHeader>
            <CardTitle>Elegibilidad y registro</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>Para utilizar Mio+, debes:</p>
            <ul>
              <li>Ser mayor de 18 años, o menor con consentimiento de padre/tutor</li>
              <li>Tener capacidad legal para celebrar contratos vinculantes</li>
              <li>Proporcionar información precisa y completa al registrarte</li>
              <li>Mantener la confidencialidad de tu cuenta y contraseña</li>
              <li>Notificarnos inmediatamente de cualquier uso no autorizado de tu cuenta</li>
            </ul>
            <p>
              Nos reservamos el derecho de rechazar el servicio, cerrar cuentas o limitar acceso a
              nuestra discreción, especialmente si se violan estos términos.
            </p>
          </CardContent>
        </Card>

        <!-- Descripción del servicio -->
        <Card>
          <CardHeader>
            <CardTitle>Descripción del servicio</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>Mio+ proporciona una plataforma digital para:</p>
            <ul>
              <li>Gestionar y visualizar información de salud personal</li>
              <li>Registrar mediciones de salud (presión arterial, glucosa, peso, etc.)</li>
              <li>Acceder a planes de salud personalizados</li>
              <li>Comunicarte con profesionales de salud autorizados</li>
              <li>Recibir recordatorios y notificaciones relacionadas con tu salud</li>
            </ul>
            <p>
              <strong>Importante:</strong> Mio+ es una herramienta de gestión de información de
              salud y <strong>no sustituye</strong> el consejo, diagnóstico o tratamiento médico
              profesional. Siempre consulta con un profesional de salud calificado para decisiones
              médicas.
            </p>
          </CardContent>
        </Card>

        <!-- Responsabilidades del usuario -->
        <Card>
          <CardHeader>
            <CardTitle>Tus responsabilidades</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>Como usuario de Mio+, te comprometes a:</p>
            <ul>
              <li>
                <strong>Uso legítimo:</strong> Utilizar la plataforma solo para fines legales y de
                acuerdo con estos términos
              </li>
              <li>
                <strong>Información precisa:</strong> Proporcionar información de salud precisa y
                actualizada
              </li>
              <li>
                <strong>Seguridad:</strong> Mantener la confidencialidad de tus credenciales de
                acceso
              </li>
              <li>
                <strong>Respeto:</strong> No utilizar la plataforma de manera que pueda dañar,
                deshabilitar o sobrecargar nuestros sistemas
              </li>
              <li>
                <strong>No compartir cuenta:</strong> Tu cuenta es personal e intransferible
              </li>
            </ul>
            <p>
              <strong>Está prohibido:</strong>
            </p>
            <ul>
              <li>Intentar acceder a cuentas de otros usuarios</li>
              <li>Realizar ingeniería inversa de la plataforma</li>
              <li>Usar bots, scripts o herramientas automatizadas no autorizadas</li>
              <li>Cargar contenido malicioso o virus</li>
              <li>Violar la privacidad de otros usuarios</li>
              <li>Hacerse pasar por otra persona o entidad</li>
            </ul>
          </CardContent>
        </Card>

        <!-- Propiedad intelectual -->
        <Card>
          <CardHeader>
            <CardTitle>Propiedad intelectual</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Todos los contenidos de Mio+ (diseño, software, texto, gráficos, logos, interfaces)
              son propiedad de Mio+ o sus licenciantes y están protegidos por leyes de propiedad
              intelectual de Chile e internacionales.
            </p>
            <p>Te otorgamos una licencia limitada, no exclusiva y revocable para:</p>
            <ul>
              <li>Acceder y usar la plataforma para tu uso personal</li>
              <li>Visualizar y descargar contenido relacionado con tu información de salud</li>
            </ul>
            <p>
              <strong>No puedes:</strong>
            </p>
            <ul>
              <li>Copiar, modificar o distribuir nuestro software o contenido</li>
              <li>Crear trabajos derivados de la plataforma</li>
              <li>Usar nuestras marcas comerciales sin autorización escrita</li>
            </ul>
          </CardContent>
        </Card>

        <!-- Privacidad y datos -->
        <Card>
          <CardHeader>
            <CardTitle>Privacidad y protección de datos</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Tu privacidad es fundamental para nosotros. El manejo de tus datos personales y de
              salud está regido por nuestra
              <router-link to="/privacidad" class="text-primary hover:underline">
                Política de Privacidad
              </router-link>,
              que forma parte integral de estos términos.
            </p>
            <p>Al utilizar Mio+, consientes que:</p>
            <ul>
              <li>Recopilemos y procesemos tu información de salud según nuestra Política de Privacidad</li>
              <li>Utilicemos cookies esenciales para el funcionamiento de la plataforma (ver
                <router-link to="/politica-cookies" class="text-primary hover:underline">
                  Política de Cookies
                </router-link>)
              </li>
              <li>Compartamos tu información con profesionales de salud autorizados cuando sea necesario</li>
            </ul>
          </CardContent>
        </Card>

        <!-- Servicios de terceros -->
        <Card>
          <CardHeader>
            <CardTitle>Servicios de terceros</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Mio+ puede integrar servicios de terceros (ej: Firebase Authentication, proveedores
              de infraestructura). Estos servicios están sujetos a sus propios términos y políticas
              de privacidad.
            </p>
            <p>
              No somos responsables por el contenido, políticas o prácticas de servicios de
              terceros. Te recomendamos revisar sus términos antes de usarlos.
            </p>
          </CardContent>
        </Card>

        <!-- Disponibilidad del servicio -->
        <Card>
          <CardHeader>
            <CardTitle>Disponibilidad y mantenimiento</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Nos esforzamos por mantener Mio+ disponible 24/7, pero no garantizamos acceso
              ininterrumpido. La plataforma puede no estar disponible debido a:
            </p>
            <ul>
              <li>Mantenimiento programado</li>
              <li>Actualizaciones de seguridad</li>
              <li>Fallas técnicas</li>
              <li>Casos de fuerza mayor</li>
            </ul>
            <p>
              Intentaremos notificarte con anticipación sobre mantenimientos programados. En caso
              de emergencias médicas, <strong>no dependas exclusivamente de Mio+</strong> y contacta
              servicios de emergencia (131, 132, SAMU).
            </p>
          </CardContent>
        </Card>

        <!-- Limitación de responsabilidad -->
        <Card>
          <CardHeader>
            <CardTitle>Limitación de responsabilidad</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>
              <strong>Mio+ se proporciona "tal cual" sin garantías de ningún tipo.</strong> En la
              medida máxima permitida por la ley:
            </p>
            <ul>
              <li>
                No garantizamos que la plataforma sea libre de errores, segura o esté disponible en
                todo momento
              </li>
              <li>
                No somos responsables de decisiones médicas tomadas en base a información en la
                plataforma
              </li>
              <li>
                No somos responsables por pérdida de datos debido a fallas técnicas (recomendamos
                mantener copias de información crítica)
              </li>
              <li>
                Nuestra responsabilidad total está limitada al monto pagado por el servicio en los
                últimos 12 meses
              </li>
            </ul>
            <p>
              <strong>Descargo de responsabilidad médica:</strong> Mio+ no proporciona consejo
              médico. La información en la plataforma es solo informativa. Consulta siempre con
              profesionales de salud calificados.
            </p>
          </CardContent>
        </Card>

        <!-- Terminación -->
        <Card>
          <CardHeader>
            <CardTitle>Terminación del servicio</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>
              <strong>Puedes:</strong>
            </p>
            <ul>
              <li>Cerrar tu cuenta en cualquier momento desde la configuración</li>
              <li>Solicitar la eliminación de tus datos (sujeto a obligaciones legales de retención)</li>
            </ul>
            <p>
              <strong>Podemos:</strong>
            </p>
            <ul>
              <li>Suspender o cancelar tu cuenta si violas estos términos</li>
              <li>Modificar o discontinuar el servicio con 30 días de aviso previo</li>
              <li>Cancelar cuentas inactivas después de 2 años sin uso</li>
            </ul>
            <p>
              Al terminar tu cuenta, se eliminarán tus datos personales excepto aquellos que debemos
              conservar por ley (registros médicos pueden requerir retención de 15 años).
            </p>
          </CardContent>
        </Card>

        <!-- Modificaciones -->
        <Card>
          <CardHeader>
            <CardTitle>Modificaciones a los términos</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Te
              notificaremos de cambios significativos mediante:
            </p>
            <ul>
              <li>Aviso destacado en la plataforma</li>
              <li>Correo electrónico a tu dirección registrada</li>
              <li>Actualización de la fecha "Última actualización" en la parte superior</li>
            </ul>
            <p>
              El uso continuado de Mio+ después de cambios en los términos constituye tu aceptación
              de dichos cambios. Si no estás de acuerdo, debes dejar de usar la plataforma.
            </p>
          </CardContent>
        </Card>

        <!-- Ley aplicable -->
        <Card>
          <CardHeader>
            <CardTitle>Ley aplicable y jurisdicción</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Estos términos se rigen por las leyes de la República de Chile. Cualquier disputa
              relacionada con estos términos o el uso de Mio+ será sometida a la jurisdicción
              exclusiva de los tribunales de Santiago, Chile.
            </p>
            <p>
              Si alguna disposición de estos términos se considera inválida o inaplicable, las
              disposiciones restantes continuarán en pleno vigor y efecto.
            </p>
          </CardContent>
        </Card>

        <!-- Contacto -->
        <Card>
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Si tienes preguntas sobre estos Términos de Servicio, contáctanos:
            </p>
            <ul class="list-none pl-0">
              <li>
                <strong>Soporte:</strong>
                <a href="mailto:soporte@mio.cl" class="text-primary hover:underline">
                  soporte@mio.cl
                </a>
              </li>
              <li>
                <strong>Legal:</strong>
                <a href="mailto:legal@mio.cl" class="text-primary hover:underline">
                  legal@mio.cl
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>

        <!-- Aceptación -->
        <Card>
          <CardHeader>
            <CardTitle>Aceptación de los términos</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Al crear una cuenta en Mio+ o utilizar nuestros servicios, reconoces que has leído,
              comprendido y aceptado estos Términos de Servicio en su totalidad, así como nuestra
              <router-link to="/privacidad" class="text-primary hover:underline">
                Política de Privacidad
              </router-link>
              y
              <router-link to="/politica-cookies" class="text-primary hover:underline">
                Política de Cookies
              </router-link>.
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Footer -->
      <div class="mt-12 text-center text-sm text-muted-foreground">
        <p>
          Estos términos forman parte del acuerdo legal entre tú y Mio+.
        </p>
      </div>
    </div>
  </div>
</template>
