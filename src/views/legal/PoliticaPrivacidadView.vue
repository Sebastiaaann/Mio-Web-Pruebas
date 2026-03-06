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

        <h1 class="text-4xl font-bold mb-2">Política de Privacidad</h1>
        <p class="text-muted-foreground">
          Última actualización: {{ new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) }}
        </p>
      </div>

      <!-- Contenido -->
      <div class="space-y-6">
        <!-- Introducción -->
        <Card>
          <CardHeader>
            <CardTitle>Nuestro compromiso con tu privacidad</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>
              En <strong>Mio+</strong>, la protección de tus datos personales y de salud es nuestra
              máxima prioridad. Esta Política de Privacidad describe cómo recopilamos, usamos,
              almacenamos y protegemos tu información cuando utilizas nuestra plataforma.
            </p>
            <p>
              Al utilizar Mio+, aceptas las prácticas descritas en esta política. Si no estás de
              acuerdo con algún aspecto de esta política, por favor no utilices nuestros servicios.
            </p>
          </CardContent>
        </Card>

        <!-- Información que recopilamos -->
        <Card>
          <CardHeader>
            <CardTitle>Información que recopilamos</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <h3 class="font-semibold mb-2">Datos de identificación personal</h3>
              <ul class="text-sm space-y-1 text-muted-foreground">
                <li>• Nombre completo</li>
                <li>• RUT (Rol Único Tributario)</li>
                <li>• Correo electrónico</li>
                <li>• Fecha de nacimiento</li>
                <li>• Información de contacto</li>
              </ul>
            </div>

            <div>
              <h3 class="font-semibold mb-2">Datos de salud</h3>
              <ul class="text-sm space-y-1 text-muted-foreground">
                <li>• Mediciones de salud (presión arterial, glucosa, peso, etc.)</li>
                <li>• Historial de controles médicos</li>
                <li>• Planes de salud asignados</li>
                <li>• Protocolos y observaciones médicas</li>
                <li>• Servicios de salud utilizados</li>
              </ul>
            </div>

            <div>
              <h3 class="font-semibold mb-2">Datos técnicos</h3>
              <ul class="text-sm space-y-1 text-muted-foreground">
                <li>• Dirección IP (únicamente para seguridad y prevención de fraude)</li>
                <li>• Tipo de navegador y dispositivo</li>
                <li>• Sistema operativo</li>
                <li>• Logs de acceso (fecha y hora de uso)</li>
              </ul>
            </div>

            <div class="p-4 bg-muted/50 rounded-lg border">
              <p class="text-sm">
                <strong>Importante:</strong> Toda la información de salud que recopilamos está
                protegida bajo las leyes de protección de datos de salud (HIPAA equivalente en Chile:
                Ley 20.584 sobre Derechos y Deberes de los Pacientes).
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- Cómo usamos tu información -->
        <Card>
          <CardHeader>
            <CardTitle>Cómo usamos tu información</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>Utilizamos tu información personal y de salud exclusivamente para:</p>
            <ul>
              <li>
                <strong>Proporcionar el servicio:</strong> Gestionar tu cuenta, procesar tus datos de
                salud y mostrarte tu información médica
              </li>
              <li>
                <strong>Comunicación:</strong> Enviarte notificaciones importantes relacionadas con
                tu salud, recordatorios de controles y actualizaciones del servicio
              </li>
              <li>
                <strong>Seguridad:</strong> Proteger tu cuenta contra accesos no autorizados y
                prevenir fraude
              </li>
              <li>
                <strong>Mejora del servicio:</strong> Analizar el uso de la plataforma para mejorar
                la experiencia del usuario (de forma anonimizada)
              </li>
              <li>
                <strong>Cumplimiento legal:</strong> Cumplir con obligaciones legales y regulatorias
              </li>
            </ul>
            <p>
              <strong>No vendemos</strong> ni compartimos tu información con terceros con fines
              comerciales o publicitarios.
            </p>
          </CardContent>
        </Card>

        <!-- Cómo protegemos tu información -->
        <Card>
          <CardHeader>
            <CardTitle>Cómo protegemos tu información</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Implementamos múltiples capas de seguridad para proteger tus datos:
            </p>
            <ul>
              <li>
                <strong>Cifrado en tránsito:</strong> Todas las comunicaciones entre tu dispositivo
                y nuestros servidores están protegidas con HTTPS/TLS
              </li>
              <li>
                <strong>Cifrado de sesiones:</strong> Tu sesión está protegida con cifrado
                AES-256-GCM de grado militar
              </li>
              <li>
                <strong>Cookies seguras:</strong> Utilizamos cookies HttpOnly y Secure que no son
                accesibles desde JavaScript
              </li>
              <li>
                <strong>Autenticación robusta:</strong> Integración con Firebase Authentication para
                gestión segura de identidades
              </li>
              <li>
                <strong>Control de acceso:</strong> Validación server-side para asegurar que solo
                puedas acceder a tu propia información
              </li>
              <li>
                <strong>Rate limiting:</strong> Protección contra ataques de fuerza bruta y abuso
              </li>
              <li>
                <strong>Auditoría:</strong> Registramos accesos y cambios para detectar actividad
                sospechosa
              </li>
            </ul>
          </CardContent>
        </Card>

        <!-- Compartir información -->
        <Card>
          <CardHeader>
            <CardTitle>Compartir tu información</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Solo compartimos tu información en las siguientes circunstancias limitadas:
            </p>
            <ul>
              <li>
                <strong>Profesionales de salud autorizados:</strong> Con tu consentimiento explícito,
                compartimos información con médicos y profesionales de salud que te atienden
              </li>
              <li>
                <strong>Proveedores de servicios:</strong> Con empresas que nos ayudan a operar la
                plataforma (hosting, infraestructura) bajo estrictos acuerdos de confidencialidad
              </li>
              <li>
                <strong>Requerimientos legales:</strong> Cuando sea requerido por ley, orden judicial
                o autoridades competentes
              </li>
              <li>
                <strong>Protección de derechos:</strong> Para proteger nuestros derechos legales o
                los de nuestros usuarios
              </li>
            </ul>
            <p>
              En todos los casos, nos aseguramos de que los terceros cumplan con estándares de
              seguridad equivalentes a los nuestros.
            </p>
          </CardContent>
        </Card>

        <!-- Tus derechos -->
        <Card>
          <CardHeader>
            <CardTitle>Tus derechos sobre tus datos</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>De acuerdo con la Ley 19.628 de Protección de Datos Personales, tienes derecho a:</p>
            <ul>
              <li>
                <strong>Acceder:</strong> Solicitar una copia de toda la información que tenemos
                sobre ti
              </li>
              <li>
                <strong>Rectificar:</strong> Corregir información inexacta o incompleta
              </li>
              <li>
                <strong>Eliminar:</strong> Solicitar la eliminación de tu cuenta y todos tus datos
                (sujeto a obligaciones legales de retención)
              </li>
              <li>
                <strong>Oponerte:</strong> Oponerte al procesamiento de tus datos en ciertas
                circunstancias
              </li>
              <li>
                <strong>Portabilidad:</strong> Recibir tus datos en un formato estructurado y
                legible por máquina
              </li>
              <li>
                <strong>Revocar consentimiento:</strong> Retirar tu consentimiento en cualquier
                momento (puede afectar el uso del servicio)
              </li>
            </ul>
            <p>
              Para ejercer cualquiera de estos derechos, contáctanos en
              <a href="mailto:privacidad@mio.cl" class="text-primary hover:underline">
                privacidad@mio.cl
              </a>.
              Responderemos a tu solicitud dentro de 30 días.
            </p>
          </CardContent>
        </Card>

        <!-- Retención de datos -->
        <Card>
          <CardHeader>
            <CardTitle>Retención de datos</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Conservamos tu información mientras tu cuenta esté activa y durante el tiempo
              necesario para:
            </p>
            <ul>
              <li>Proporcionar nuestros servicios</li>
              <li>Cumplir con obligaciones legales (ej: retención de registros médicos)</li>
              <li>Resolver disputas</li>
              <li>Hacer cumplir nuestros acuerdos</li>
            </ul>
            <p>
              Cuando eliminas tu cuenta, anonimizamos o eliminamos tus datos personales, excepto
              aquellos que debemos conservar por ley (registros médicos pueden requerir retención
              de 15 años según normativa chilena).
            </p>
          </CardContent>
        </Card>

        <!-- Menores de edad -->
        <Card>
          <CardHeader>
            <CardTitle>Privacidad de menores</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Mio+ puede ser utilizado por menores de edad bajo la supervisión y consentimiento de
              sus padres o tutores legales. Si eres menor de 18 años, necesitas el permiso de tu
              padre, madre o tutor para usar nuestros servicios.
            </p>
            <p>
              Los padres o tutores son responsables de supervisar el uso de la plataforma por parte
              de menores y tienen derecho a acceder, rectificar o eliminar la información de sus
              hijos/pupilos.
            </p>
          </CardContent>
        </Card>

        <!-- Cambios a la política -->
        <Card>
          <CardHeader>
            <CardTitle>Cambios a esta política</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en
              nuestras prácticas o por razones legales. Te notificaremos de cualquier cambio
              significativo mediante:
            </p>
            <ul>
              <li>Un aviso destacado en la plataforma</li>
              <li>Un correo electrónico a tu dirección registrada</li>
            </ul>
            <p>
              Te recomendamos revisar esta política regularmente. El uso continuado de Mio+ después
              de cambios en la política constituye tu aceptación de dichos cambios.
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
              Si tienes preguntas, inquietudes o solicitudes relacionadas con esta Política de
              Privacidad o el manejo de tus datos, contáctanos:
            </p>
            <ul class="list-none pl-0">
              <li>
                <strong>Privacidad y Protección de Datos:</strong>
                <a href="mailto:privacidad@mio.cl" class="text-primary hover:underline">
                  privacidad@mio.cl
                </a>
              </li>
              <li>
                <strong>Soporte general:</strong>
                <a href="mailto:soporte@mio.cl" class="text-primary hover:underline">
                  soporte@mio.cl
                </a>
              </li>
            </ul>
            <p class="mt-4 text-muted-foreground text-xs">
              <strong>Responsable del tratamiento de datos:</strong><br />
              Mio+ Chile<br />
              Santiago, Chile
            </p>
          </CardContent>
        </Card>

        <!-- Referencias legales -->
        <Card>
          <CardHeader>
            <CardTitle>Marco legal aplicable</CardTitle>
          </CardHeader>
          <CardContent class="prose prose-sm max-w-none dark:prose-invert">
            <p class="text-sm">
              Esta política se basa en y cumple con:
            </p>
            <ul class="text-sm">
              <li>Ley 19.628 sobre Protección de la Vida Privada (Chile)</li>
              <li>Ley 20.584 sobre Derechos y Deberes de los Pacientes (Chile)</li>
              <li>GDPR (General Data Protection Regulation) - Aplicable para usuarios en la UE</li>
              <li>Estándares HIPAA (Health Insurance Portability and Accountability Act)</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <!-- Footer -->
      <div class="mt-12 text-center text-sm text-muted-foreground">
        <p>
          Esta política forma parte de nuestros
          <router-link to="/terminos" class="text-primary hover:underline">
            Términos de Servicio
          </router-link>
          y
          <router-link to="/politica-cookies" class="text-primary hover:underline">
            Política de Cookies
          </router-link>.
        </p>
      </div>
    </div>
  </div>
</template>
