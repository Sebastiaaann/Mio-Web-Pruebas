<!-- src/views/RecursosView.vue -->
<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { pacienteService } from '@/services/pacienteService'
import TarjetaMaterialAudiovisual from '@/components/ui/home-ios/TarjetaMaterialAudiovisual.vue'

const route = useRoute()

const materialAudiovisual = ref([])
const cargando = ref(false)
const error = ref(null)

const obtenerPatientIdActivo = () => {
  const sessionMeta = localStorage.getItem('mio-session-meta')
  if (!sessionMeta) return null

  try {
    const { patient_id } = JSON.parse(sessionMeta)
    return patient_id || null
  } catch (e) {
    return null
  }
}

const leerListaQuery = (valor) => {
  if (!valor) return []
  if (Array.isArray(valor)) return valor
  return String(valor)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

const tituloSeccion = computed(() => route.query.titulo || 'Material Audiovisual')
const incluirCategorias = computed(() => leerListaQuery(route.query.incluye))
const excluirCategorias = computed(() => leerListaQuery(route.query.excluye))

const normalizarMaterial = (item, index) => {
  if (typeof item === 'string') {
    return {
      id: `material-${index}`,
      titulo: item,
      descripcion: 'Revisa el material audiovisual disponible para ti.',
      imagen: '',
      url: '#',
      categoria: ''
    }
  }

  return {
    id: item.id || item.material_id || item.audiovisual_id || item.video_id || `material-${index}`,
    titulo: item.title || item.titulo || item.name || 'Material audiovisual',
    descripcion: item.description || item.descripcion || item.summary || item.main_text || '',
    imagen: item.image || item.imagen || item.thumbnail || item.thumbnail_url || item.url_thumbnail || item.cover || '',
    url: item.url || item.link || item.video_url || item.enlace || '#',
    categoria: item.category || item.categoria || item.tipo || ''
  }
}

const obtenerCategoriasItem = (item) => {
  if (typeof item !== 'object' || item === null) return []

  const candidatos = [
    item.category,
    item.categoria,
    item.tipo,
    item.main_category,
    item.subcategory,
    item.tags,
    item.etiquetas
  ]

  const categorias = []
  for (const valor of candidatos) {
    if (Array.isArray(valor)) {
      categorias.push(...valor)
    } else if (typeof valor === 'string') {
      categorias.push(...valor.split(',').map(v => v.trim()))
    }
  }

  return categorias.filter(Boolean).map(v => v.toLowerCase())
}

const materialNormalizado = computed(() => (
  materialAudiovisual.value.map((item, index) => normalizarMaterial(item, index))
))

const materialFiltrado = computed(() => {
  const incluir = incluirCategorias.value.map(c => c.toLowerCase())
  const excluir = excluirCategorias.value.map(c => c.toLowerCase())

  return materialNormalizado.value.filter(item => {
    const categorias = obtenerCategoriasItem(item)

    if (incluir.length > 0) {
      const tieneIncluida = incluir.some(cat => categorias.includes(cat))
      if (!tieneIncluida) return false
    }

    if (excluir.length > 0) {
      const tieneExcluida = excluir.some(cat => categorias.includes(cat))
      if (tieneExcluida) return false
    }

    return true
  })
})

const cargarMaterial = async () => {
  const patientId = obtenerPatientIdActivo()
  if (!patientId) {
    error.value = 'No hay paciente asociado para cargar el material audiovisual.'
    return
  }

  cargando.value = true
  error.value = null

  try {
    const resultado = await pacienteService.obtenerMaterialAudiovisual(patientId)
    if (resultado.success) {
      materialAudiovisual.value = resultado.items || []
    } else {
      error.value = resultado.error || 'No se pudo cargar el material audiovisual.'
    }
  } catch (e) {
    error.value = 'No se pudo cargar el material audiovisual.'
  } finally {
    cargando.value = false
  }
}

onMounted(async () => {
  await cargarMaterial()
})

watch(() => route.query, async () => {
  if (materialAudiovisual.value.length === 0) {
    await cargarMaterial()
  }
}, { deep: true })
</script>

<template>
  <section class="min-h-full bg-white" aria-labelledby="recursos-titulo">
    <header class="px-6 pt-8 pb-4 max-w-6xl mx-auto">
      <h1 id="recursos-titulo" class="text-2xl font-bold text-gray-900">
        {{ tituloSeccion }}
      </h1>
      <p class="text-gray-500 text-sm">
        Explora el material audiovisual disponible según tu plan.
      </p>
    </header>

    <div class="px-6 pb-10 max-w-6xl mx-auto">
      <div v-if="cargando" class="flex justify-center py-10">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>

      <div v-else-if="materialFiltrado.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        <TarjetaMaterialAudiovisual
          v-for="(item, index) in materialFiltrado"
          :key="item.id"
          :titulo="item.titulo"
          :descripcion="item.descripcion"
          :imagen="item.imagen"
          :url="item.url"
          :categoria="item.categoria"
          :delay="0.05 + index * 0.03"
        />
      </div>

      <div v-else class="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-stone-200 text-center">
        <p v-if="error" class="text-rose-600">{{ error }}</p>
        <p v-else class="text-gray-600">No hay material audiovisual disponible para este filtro.</p>
      </div>
    </div>
  </section>
</template>