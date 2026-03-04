<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useUserStore } from '@/stores/tiendaUsuario';
import { useConfigStore } from '@/stores/tiendaConfig'
import { useHealthStore } from '@/stores/tiendaSalud';
import { storeToRefs } from 'pinia';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { logger } from '@/utils/logger';
import { 
  Bell, 
  ClipboardList, 
  TrendingUp, 
  CalendarClock,
  Filter,
  Calendar,
  Search,
  List,
  Grid3X3,
  Eye,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image,
  CheckCircle,
  AlertTriangle,
  Info,
  Heart,
  Smile,
  FlaskConical,
  Stethoscope,
  Scale,
  Activity,
  Loader2,
  X
} from 'lucide-vue-next';
import HeaderCompleto from "@/components/ui/HeaderCompleto.vue";
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import SkeletonTable from '@/components/ui/SkeletonTable.vue'

const userStore = useUserStore();
const configStore = useConfigStore();
const healthStore = useHealthStore();
const { fullName, user } = storeToRefs(userStore);
const { controlesProximos, historialMediciones, ultimaMedicion, loading: loadingStore } = storeToRefs(healthStore);

const logoMutualHeader = computed(() => {
  if (configStore.planActivo === 'mutual') {
    return configStore.logoMutual || '/assets/logo_mutual.png'
  }
  return null
})

// Estado
const estaCargando = ref(true);
const vistaActual = ref('lista'); // 'lista' o 'grid'
const filtroTipo = ref('Todos');
const filtroEstado = ref('Todos');
const paginaActual = ref(1);
const itemsPorPagina = 8;

// Datos reales de la API
const controlesAPI = ref([]);
const protocolos = ref([]);
const observacionesPorProtocolo = ref({});

// Cargar datos reales de la API
async function cargarDatosReales() {
  estaCargando.value = true;
  
  try {
    // Cargar datos del store (que ya usa la API)
    await healthStore.fetchAllHealthData();
    
    // Obtener protocolos del store
    protocolos.value = controlesProximos.value;
    
    // Cargar observaciones para cada protocolo
    for (const protocolo of protocolos.value) {
      await healthStore.fetchHistorial(protocolo.id);
    }
    
    // Transformar observaciones a formato de historial
    controlesAPI.value = transformarObservacionesAControles();
    
  } catch (error) {
    logger.error('Error al cargar datos:', error);
  } finally {
    estaCargando.value = false;
  }
}

// Transformar observaciones de la API al formato de la vista
function transformarObservacionesAControles() {
  const controles = [];
  
    Object.entries(historialMediciones.value).forEach(([protocolId, mediciones]) => {
    const protocolo = protocolos.value.find(p => p.id === protocolId);
    if (!protocolo) return;
    
    // Agrupar mediciones por fecha (local)
    const gruposPorFecha = {};
    
    mediciones.forEach(medicion => {
      const fechaObj = new Date(medicion.fecha);
      const fechaKey = `${fechaObj.getFullYear()}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}-${String(fechaObj.getDate()).padStart(2, '0')}`;
      if (!gruposPorFecha[fechaKey]) {
        gruposPorFecha[fechaKey] = [];
      }
      gruposPorFecha[fechaKey].push(medicion);
    });
    
    // Crear un control por cada fecha
    Object.entries(gruposPorFecha).forEach(([fechaKey, meds]) => {
      const ordenadas = [...meds].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      const medicionPrincipal = ordenadas.find(m => m.valor !== 'N/A') || ordenadas[0];
      const fechaObj = new Date(medicionPrincipal.fecha);
      
      controles.push({
        id: `${protocolId}-${fechaKey}`,
        fecha: formatearFecha(fechaKey),
        hora: fechaObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        timestamp: fechaObj.getTime(), // Timestamp real para ordenamiento
        tipo: protocolo.nombre,
        tipoIcono: getIconoPorTipo(protocolo.nombre),
        tipoColor: getColorPorTipo(protocolo.nombre),
        tipoBg: getBgColorPorTipo(protocolo.nombre),
        medico: 'Sistema MIO+',
        centro: 'Control Remoto',
        resultado: getResultadoTexto(medicionPrincipal.estado),
        resultadoTipo: getResultadoTipo(medicionPrincipal.estado),
        documentos: [],
        estado: 'Completado',
        estadoTipo: 'success',
        valor: medicionPrincipal.valor,
        unidad: medicionPrincipal.unidad,
        protocolId: protocolId,
        details: meds // Store all measurements for PDF detail
      });
    });
  });
  
  // Ordenar por timestamp descendente (más reciente primero)
  return controles.sort((a, b) => b.timestamp - a.timestamp);
}

// Helpers para formateo
function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${fecha.getDate()} ${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
}

function getIconoPorTipo(nombre) {
  const normalizedName = nombre?.toUpperCase() || '';
  if (normalizedName.includes('PRESIÓN') || normalizedName.includes('ARTERIAL')) {
    return Heart;
  }
  if (normalizedName.includes('PESO')) {
    return Scale;
  }
  if (normalizedName.includes('GLICEMIA') || normalizedName.includes('GLUCOSA')) {
    return FlaskConical;
  }
  return Activity;
}

function getColorPorTipo(nombre) {
  const normalizedName = nombre?.toUpperCase() || '';
  if (normalizedName.includes('PRESIÓN') || normalizedName.includes('ARTERIAL')) {
    return 'text-red-500';
  }
  if (normalizedName.includes('PESO')) {
    return 'text-blue-500';
  }
  if (normalizedName.includes('GLICEMIA') || normalizedName.includes('GLUCOSA')) {
    return 'text-green-500';
  }
  return 'text-gray-500';
}

function getBgColorPorTipo(nombre) {
  const normalizedName = nombre?.toUpperCase() || '';
  if (normalizedName.includes('PRESIÓN') || normalizedName.includes('ARTERIAL')) {
    return 'bg-red-50';
  }
  if (normalizedName.includes('PESO')) {
    return 'bg-blue-50';
  }
  if (normalizedName.includes('GLICEMIA') || normalizedName.includes('GLUCOSA')) {
    return 'bg-green-50';
  }
  return 'bg-gray-50';
}

function getResultadoTexto(estado) {
  const estados = {
    'normal': 'Normal',
    'green': 'Normal',
    'success': 'Normal',
    'warning': 'Observación',
    'orange': 'Observación',
    'alerta': 'Observación',
    'red': 'Revisar',
    'critico': 'Revisar',
    'danger': 'Revisar',
    'none': 'Pendiente',
    'na': 'Sin evaluación'
  };
  return estados[estado] || 'Normal';
}

function getResultadoTipo(estado) {
  const tipos = {
    'normal': 'success',
    'green': 'success',
    'success': 'success',
    'warning': 'warning',
    'orange': 'warning',
    'alerta': 'warning',
    'red': 'danger',
    'critico': 'danger',
    'danger': 'danger',
    'none': 'info',
    'na': 'info'
  };
  return tipos[estado] || 'success';
}

// Computed
const estadisticas = computed(() => {
  const total = controlesAPI.value.length;
  const completados = controlesAPI.value.filter(c => c.estado === 'Completado').length;
  const cumplimiento = total > 0 ? Math.round((completados / total) * 100) : 0;
  
  return {
    total,
    cumplimiento,
    promedioMeses: total > 0 ? (12 / total).toFixed(1) : '0.0'
  };
});

// Controles filtrados
const controlesFiltrados = computed(() => {
  let filtrados = controlesAPI.value;
  
  if (filtroTipo.value !== 'Todos') {
    filtrados = filtrados.filter(c => c.tipo === filtroTipo.value);
  }
  
  if (filtroEstado.value !== 'Todos') {
    filtrados = filtrados.filter(c => c.estado === filtroEstado.value);
  }
  
  return filtrados;
});

// Paginación
const totalPaginas = computed(() => Math.ceil(controlesFiltrados.value.length / itemsPorPagina));

const controlesPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  return controlesFiltrados.value.slice(inicio, fin);
});

// Helpers para clases de estado
const getResultadoClases = (tipo) => {
  const clases = {
    success: 'bg-green-50 text-green-700',
    warning: 'bg-yellow-50 text-yellow-700',
    info: 'bg-orange-50 text-orange-700',
    danger: 'bg-red-50 text-red-700'
  };
  return clases[tipo] || clases.info;
};

const getEstadoClases = (tipo) => {
  const clases = {
    success: 'bg-green-50 text-green-700 border border-green-200',
    warning: 'bg-orange-50 text-orange-600 border border-orange-200',
    danger: 'bg-red-50 text-red-700 border border-red-200'
  };
  return clases[tipo] || clases.warning;
};

const getIconoResultado = (tipo) => {
  const iconos = {
    success: CheckCircle,
    warning: AlertTriangle,
    info: Info,
    danger: AlertTriangle
  };
  return iconos[tipo] || Info;
};

// Métodos
const cambiarVista = (vista) => {
  vistaActual.value = vista;
};

const cambiarPagina = (pagina) => {
  if (pagina >= 1 && pagina <= totalPaginas.value) {
    paginaActual.value = pagina;
  }
};

const verDetalle = (control) => {
  logger.info('Ver detalle:', control);
};

const descargarDocumento = (control) => {
  logger.info('Descargar:', control);
};

const compartirControl = (control) => {
  logger.info('Compartir:', control);
};

// PDF State
const showPdfModal = ref(false);
const pdfPreviewUrl = ref(null);
const currentDoc = ref(null);
const selectedControlForPdf = ref(null);

const abrirModalPDF = (control) => {
  selectedControlForPdf.value = control;
  const doc = generarDocPDF(control);
  currentDoc.value = doc;
  // Create Blob URL for iframe
  const blob = doc.output('blob');
  pdfPreviewUrl.value = URL.createObjectURL(blob);
  showPdfModal.value = true;
};

const cerrarModalPDF = () => {
  showPdfModal.value = false;
  if (pdfPreviewUrl.value) {
    URL.revokeObjectURL(pdfPreviewUrl.value);
    pdfPreviewUrl.value = null;
  }
  selectedControlForPdf.value = null;
  currentDoc.value = null;
};

const descargarPDFFinal = () => {
  if (currentDoc.value && selectedControlForPdf.value) {
    currentDoc.value.save(`${selectedControlForPdf.value.id}_reporte.pdf`);
  }
};

// ─── Colores de la marca ───────────────────────────────────────────────────
const COLOR_PRIMARY   = [125, 88, 233]   // violeta mio+
const COLOR_SUCCESS   = [16, 185, 129]   // verde  normal
const COLOR_WARNING   = [249, 115, 22]   // naranja alerta
const COLOR_DANGER    = [239, 68, 68]    // rojo   crítico
const COLOR_LIGHT     = [245, 243, 255]  // fondo violeta suave
const COLOR_GRAY_TEXT = [100, 100, 115]
const COLOR_DARK_TEXT = [30, 30, 45]

// ─── Helper: colores de estado ─────────────────────────────────────────────

function etiquetaEstadoPDF(tipo) {
  if (tipo === 'success') return 'Normal'
  if (tipo === 'warning') return 'Alerta'
  if (tipo === 'danger')  return 'Crítico'
  return 'Pendiente'
}

// ─── Helper: dibujar cabecera en cada página ──────────────────────────────
function dibujarCabecera(doc, pageWidth, nombrePaciente, ahora = new Date()) {
  // Bloque violeta izquierdo
  doc.setFillColor(...COLOR_PRIMARY)
  doc.rect(0, 0, 45, 20, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('mio+', 8, 13)

  // Título derecho
  doc.setTextColor(...COLOR_DARK_TEXT)
  doc.setFontSize(15)
  doc.text('Historial de Controles de Salud', pageWidth - 20, 10, { align: 'right' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLOR_GRAY_TEXT)
  doc.text(
    `Generado el ${ahora.toLocaleDateString('es-CL')} a las ${ahora.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`,
    pageWidth - 20, 16, { align: 'right' }
  )

  // Línea separadora
  doc.setDrawColor(...COLOR_PRIMARY)
  doc.setLineWidth(0.8)
  doc.line(0, 21, pageWidth, 21)
}

// ─── Helper: dibujar pie de página ────────────────────────────────────────
function dibujarPie(doc, pageWidth, pageHeight, pagina, totalPaginas, nombrePaciente) {
  doc.setDrawColor(220, 220, 230)
  doc.setLineWidth(0.4)
  doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14)
  doc.setFontSize(7.5)
  doc.setTextColor(...COLOR_GRAY_TEXT)
  doc.setFont('helvetica', 'normal')
  doc.text(nombrePaciente, 14, pageHeight - 8)
  doc.text(`Página ${pagina} de ${totalPaginas}`, pageWidth - 14, pageHeight - 8, { align: 'right' })
  doc.text('Plataforma MIO+ · Salud Digital', pageWidth / 2, pageHeight - 8, { align: 'center' })
}

// ─── PDF de un único control (modal de vista previa) ──────────────────────
const generarDocPDF = (control) => {
  const doc = new jsPDF()
  const pageWidth  = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const nombre = fullName.value || 'Paciente'

  dibujarCabecera(doc, pageWidth, nombre)

  let y = 32

  // ── Caja de información del control ─────────────────────────────────
  doc.setFillColor(...COLOR_LIGHT)
  doc.setDrawColor(...COLOR_PRIMARY)
  doc.setLineWidth(0.4)
  doc.roundedRect(14, y, pageWidth - 28, 32, 3, 3, 'FD')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLOR_PRIMARY)
  doc.text('Información del Control', 20, y + 9)

  doc.setFontSize(9)
  doc.setTextColor(...COLOR_DARK_TEXT)
  doc.setFont('helvetica', 'bold')
  doc.text('Protocolo:', 20,  y + 18)
  doc.text('Fecha:',     90,  y + 18)
  doc.text('Hora:',      150, y + 18)
  doc.setFont('helvetica', 'normal')
  doc.text(control.tipo,  20,  y + 24)
  doc.text(control.fecha, 90,  y + 24)
  doc.text(control.hora,  150, y + 24)

  doc.setFontSize(7.5)
  doc.setTextColor(...COLOR_GRAY_TEXT)
  doc.text('Fuente: control registrado en la aplicación MIO+', 20, y + 30)

  y += 42

  // ── Tarjetas de estadísticas ─────────────────────────────────────────
  const total   = control.details?.length ?? 1
  const normales = control.details?.filter(d => getResultadoTipo(d.estado) === 'success').length ?? (control.resultadoTipo === 'success' ? 1 : 0)
  const alertas  = control.details?.filter(d => getResultadoTipo(d.estado) === 'warning').length ?? (control.resultadoTipo === 'warning' ? 1 : 0)
  const criticos = control.details?.filter(d => getResultadoTipo(d.estado) === 'danger').length  ?? (control.resultadoTipo === 'danger'  ? 1 : 0)

  const cardW  = (pageWidth - 28 - 9) / 4
  const cardH  = 22
  const cards  = [
    { label: 'Total',    valor: total,    color: COLOR_PRIMARY  },
    { label: 'Normal',   valor: normales, color: COLOR_SUCCESS  },
    { label: 'Alerta',   valor: alertas,  color: COLOR_WARNING  },
    { label: 'Crítico',  valor: criticos, color: COLOR_DANGER   },
  ]

  cards.forEach((c, i) => {
    const x = 14 + i * (cardW + 3)
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(220, 220, 230)
    doc.setLineWidth(0.3)
    doc.roundedRect(x, y, cardW, cardH, 2, 2, 'FD')
    // borde color izquierdo
    doc.setFillColor(...c.color)
    doc.roundedRect(x, y, 3, cardH, 1, 1, 'F')

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...c.color)
    doc.text(String(c.valor), x + cardW / 2, y + 12, { align: 'center' })
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLOR_GRAY_TEXT)
    doc.text(c.label, x + cardW / 2, y + 19, { align: 'center' })
  })

  y += cardH + 10

  // ── Tabla de mediciones ──────────────────────────────────────────────
  const filas = []
  if (control.details && control.details.length > 0) {
    control.details.forEach(d => {
      const fechaD = new Date(d.fecha)
      filas.push([
        fechaD.toLocaleDateString('es-CL'),
        fechaD.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        String(d.valor),
        d.unidad || '',
        etiquetaEstadoPDF(getResultadoTipo(d.estado))
      ])
    })
  } else {
    filas.push([control.fecha, control.hora, String(control.valor), control.unidad || '', etiquetaEstadoPDF(control.resultadoTipo)])
  }

  autoTable(doc, {
    startY: y,
    head: [['Fecha', 'Hora', 'Valor', 'Unidad', 'Estado']],
    body: filas,
    theme: 'grid',
    headStyles: {
      fillColor: COLOR_PRIMARY,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9, textColor: COLOR_DARK_TEXT },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 22 },
      2: { cellWidth: 28, fontStyle: 'bold', halign: 'right' },
      3: { cellWidth: 24 },
      4: { cellWidth: 28, halign: 'center' },
    },
    alternateRowStyles: { fillColor: [248, 246, 255] },
    didParseCell(data) {
      if (data.section === 'body' && data.column.index === 4) {
        const txt = data.cell.text[0]
        if (txt === 'Normal')   data.cell.styles.textColor = COLOR_SUCCESS
        if (txt === 'Alerta')   data.cell.styles.textColor = COLOR_WARNING
        if (txt === 'Crítico')  data.cell.styles.textColor = COLOR_DANGER
      }
    },
    margin: { left: 14, right: 14 },
  })

  // ── Pie de página ────────────────────────────────────────────────────
  dibujarPie(doc, pageWidth, pageHeight, 1, 1, nombre)

  return doc
}

// ─── PDF de historial completo ─────────────────────────────────────────────
const descargarHistorialCompleto = () => {
  const doc      = new jsPDF()
  const pageWidth  = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const nombre   = fullName.value || 'Paciente'
  const plan     = configStore.planActivo || 'MIO+'
  const ahora    = new Date()

  // ── PÁGINA 1: Portada / resumen ──────────────────────────────────────
  dibujarCabecera(doc, pageWidth, nombre, ahora)

  let y = 32

  // Caja de datos del paciente
  doc.setFillColor(...COLOR_LIGHT)
  doc.setDrawColor(...COLOR_PRIMARY)
  doc.setLineWidth(0.4)
  doc.roundedRect(14, y, pageWidth - 28, 28, 3, 3, 'FD')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLOR_PRIMARY)
  doc.text('Datos del Paciente', 20, y + 9)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLOR_DARK_TEXT)
  doc.text('Nombre:',        20,  y + 18)
  doc.text('Plan:',          100, y + 18)
  doc.text('Fecha reporte:', 150, y + 18)
  doc.setFont('helvetica', 'normal')
  doc.text(nombre,                                     20,  y + 24)
  doc.text(String(plan),                              100, y + 24)
  doc.text(ahora.toLocaleDateString('es-CL'),         150, y + 24)

  y += 38

  // Tarjetas resumen global
  const todos      = controlesAPI.value
  const totalCtrl  = todos.length
  const normalesG  = todos.filter(c => c.resultadoTipo === 'success').length
  const alertasG   = todos.filter(c => c.resultadoTipo === 'warning').length
  const criticosG  = todos.filter(c => c.resultadoTipo === 'danger').length

  const cardW  = (pageWidth - 28 - 9) / 4
  const cardH  = 26
  const resumen = [
    { label: 'Total controles', valor: totalCtrl,  color: COLOR_PRIMARY },
    { label: 'Normal',          valor: normalesG,  color: COLOR_SUCCESS },
    { label: 'Alerta',          valor: alertasG,   color: COLOR_WARNING },
    { label: 'Crítico',         valor: criticosG,  color: COLOR_DANGER  },
  ]

  resumen.forEach((c, i) => {
    const x = 14 + i * (cardW + 3)
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(220, 220, 230)
    doc.setLineWidth(0.3)
    doc.roundedRect(x, y, cardW, cardH, 2, 2, 'FD')
    doc.setFillColor(...c.color)
    doc.roundedRect(x, y, 3, cardH, 1, 1, 'F')

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...c.color)
    doc.text(String(c.valor), x + cardW / 2, y + 14, { align: 'center' })
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLOR_GRAY_TEXT)
    doc.text(c.label, x + cardW / 2, y + 22, { align: 'center' })
  })

  y += cardH + 8

  // Tabla índice (lista de controles en pág 1)
  const indiceData = todos.map(c => [
    c.tipo,
    c.fecha,
    c.hora,
    `${c.valor} ${c.unidad}`,
    etiquetaEstadoPDF(c.resultadoTipo),
  ])

  autoTable(doc, {
    startY: y,
    head: [['Protocolo', 'Fecha', 'Hora', 'Valor', 'Estado']],
    body: indiceData,
    theme: 'grid',
    headStyles: { fillColor: COLOR_PRIMARY, textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: COLOR_DARK_TEXT },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 30 },
      2: { cellWidth: 22 },
      3: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 28, halign: 'center' },
    },
    alternateRowStyles: { fillColor: [248, 246, 255] },
    didParseCell(data) {
      if (data.section === 'body' && data.column.index === 4) {
        const txt = data.cell.text[0]
        if (txt === 'Normal')  data.cell.styles.textColor = COLOR_SUCCESS
        if (txt === 'Alerta')  data.cell.styles.textColor = COLOR_WARNING
        if (txt === 'Crítico') data.cell.styles.textColor = COLOR_DANGER
      }
    },
    margin: { left: 14, right: 14 },
  })

  // ── PÁGINAS DE DETALLE: una sección por tipo de protocolo ────────────
  // Agrupar controles por tipo
  const porTipo = {}
  todos.forEach(c => {
    if (!porTipo[c.tipo]) porTipo[c.tipo] = []
    porTipo[c.tipo].push(c)
  })

  Object.entries(porTipo).forEach(([tipo, controles]) => {
    doc.addPage()
    dibujarCabecera(doc, pageWidth, nombre, ahora)

    let yD = 30

    // Título de sección
    doc.setFillColor(...COLOR_PRIMARY)
    doc.roundedRect(14, yD, pageWidth - 28, 12, 2, 2, 'F')
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(tipo, 20, yD + 8.5)

    yD += 18

    // Tabla detalle de este tipo
    const filas = []
    controles.forEach(c => {
      if (c.details && c.details.length > 0) {
        c.details.forEach(d => {
          const fd = new Date(d.fecha)
          filas.push([
            fd.toLocaleDateString('es-CL'),
            fd.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
            String(d.valor),
            d.unidad || '',
            etiquetaEstadoPDF(getResultadoTipo(d.estado))
          ])
        })
      } else {
        filas.push([c.fecha, c.hora, String(c.valor), c.unidad, etiquetaEstadoPDF(c.resultadoTipo)])
      }
    })

    autoTable(doc, {
      startY: yD,
      head: [['Fecha', 'Hora', 'Valor', 'Unidad', 'Estado']],
      body: filas,
      theme: 'grid',
      headStyles: { fillColor: COLOR_PRIMARY, textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: COLOR_DARK_TEXT },
      columnStyles: {
        0: { cellWidth: 32 },
        1: { cellWidth: 22 },
        2: { cellWidth: 28, fontStyle: 'bold', halign: 'right' },
        3: { cellWidth: 24 },
        4: { cellWidth: 28, halign: 'center' },
      },
      alternateRowStyles: { fillColor: [248, 246, 255] },
      didParseCell(data) {
        if (data.section === 'body' && data.column.index === 4) {
          const txt = data.cell.text[0]
          if (txt === 'Normal')  data.cell.styles.textColor = COLOR_SUCCESS
          if (txt === 'Alerta')  data.cell.styles.textColor = COLOR_WARNING
          if (txt === 'Crítico') data.cell.styles.textColor = COLOR_DANGER
        }
      },
      margin: { left: 14, right: 14 },
    })
  })

  // ── Pie en todas las páginas ─────────────────────────────────────────
  const totalPags = doc.getNumberOfPages()
  for (let p = 1; p <= totalPags; p++) {
    doc.setPage(p)
    dibujarPie(doc, pageWidth, pageHeight, p, totalPags, nombre)
  }

  const fechaArchivo = ahora.toISOString().slice(0, 10)
  doc.save(`historial-controles-${fechaArchivo}.pdf`)
}

// Watch para resetear página cuando cambian filtros
watch([filtroTipo, filtroEstado], () => {
  paginaActual.value = 1;
});

onMounted(() => {
  cargarDatosReales();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans" style="font-family: 'Cabinet Grotesk', sans-serif;">
<!-- Indicador de carga -->
    <div v-if="estaCargando" class="min-h-screen bg-slate-50 p-4 sm:p-8">
      <!-- Header skeleton -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 animate-pulse">
        <div class="flex items-center justify-between">
          <div class="space-y-2">
            <div class="h-8 w-48 bg-slate-200 rounded"></div>
            <div class="h-4 w-64 bg-slate-200 rounded"></div>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-slate-200 rounded-full"></div>
            <div class="w-10 h-10 bg-slate-200 rounded-full"></div>
          </div>
        </div>
      </div>

      <!-- Stats skeletons -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <SkeletonCard v-for="i in 3" :key="`stat-skeleton-${i}`" :show-chart="false" />
      </div>

      <!-- Filters skeleton -->
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6 animate-pulse">
        <div class="flex flex-wrap items-center gap-4">
          <div class="h-10 w-32 bg-slate-200 rounded-xl"></div>
          <div class="h-10 w-48 bg-slate-200 rounded-xl"></div>
          <div class="h-10 w-40 bg-slate-200 rounded-xl"></div>
          <div class="ml-auto h-10 w-28 bg-slate-200 rounded-xl"></div>
        </div>
      </div>

      <!-- Table skeleton -->
      <SkeletonTable :rows="7" />
    </div>

    <!-- Contenido principal -->
    <template v-else>
      <!-- Header -->
       <HeaderCompleto
          titulo="Historial de Controles"
          :subtitulo="`Revisa tu historial médico completo • ${controlesAPI.length} controles registrados`"
          :mostrar-saludo="false"
          :show-notification-badge="true"
          notification-badge-color="#10B981"
          @click-notification="logger.info('Notificaciones clicked')"
          @click-profile="logger.info('Perfil clicked')"
        />

      <!-- Content -->
      <div class="p-4 sm:p-8 space-y-6 flex-1 flex flex-col min-h-0">
        
        <!-- Main Content Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1 h-full">
          
          <!-- Toolbar -->
          <div class="p-5 border-b border-slate-100 flex flex-col xl:flex-row items-center justify-between gap-4 bg-white">
            
            <!-- Filters Group -->
            <div class="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <!-- Search -->
              <div class="relative group w-full sm:w-auto">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  class="pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-200 w-full sm:w-64 transition-all placeholder:text-slate-400 text-slate-700"
                >
              </div>

              <div class="h-8 w-px bg-slate-200 hidden sm:block mx-1"></div>

              <!-- Date Filter -->
              <div class="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 hover:border-slate-300 transition-colors w-full sm:w-auto">
                <Calendar class="w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Desde" class="bg-transparent text-sm w-16 outline-none text-slate-600 placeholder:text-slate-400">
                <span class="text-slate-300">-</span>
                <input type="text" placeholder="Hasta" class="bg-transparent text-sm w-16 outline-none text-slate-600 placeholder:text-slate-400">
              </div>

              <!-- Selects -->
              <div class="flex items-center gap-2 w-full sm:w-auto">
                <select v-model="filtroTipo" class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-orange-100 cursor-pointer hover:border-slate-300 transition-colors flex-1 sm:flex-none">
                  <option>Todos</option>
                  <option v-for="protocolo in protocolos" :key="protocolo.id" :value="protocolo.nombre">
                    {{ protocolo.nombre }}
                  </option>
                </select>
                
                <select v-model="filtroEstado" class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-orange-100 cursor-pointer hover:border-slate-300 transition-colors flex-1 sm:flex-none">
                  <option>Todos</option>
                  <option>Completado</option>
                  <option>Programado</option>
                  <option>Cancelado</option>
                </select>
              </div>
            </div>

            <!-- View Toggle & Count -->
            <div class="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-end">
              <p class="text-slate-500 text-xs font-medium">
                <span class="text-slate-900 font-bold">{{ controlesFiltrados.length }}</span> resultados
              </p>

              <!-- Descargar historial completo -->
              <button
                @click="descargarHistorialCompleto"
                :disabled="controlesAPI.length === 0"
                class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                :style="{ backgroundColor: 'var(--theme-primary)' }"
                title="Descargar historial completo en PDF"
              >
                <Download class="w-4 h-4" />
                <span class="hidden sm:inline">Descargar PDF</span>
              </button>
              
              <div class="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
                <button 
                  @click="cambiarVista('lista')"
                  class="p-2 rounded-lg transition-all duration-200"
                  :class="vistaActual === 'lista' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'"
                  title="Vista de lista"
                >
                  <List class="w-4 h-4" />
                </button>
                <button 
                  @click="cambiarVista('grid')"
                  class="p-2 rounded-lg transition-all duration-200"
                  :class="vistaActual === 'grid' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'"
                  title="Vista de cuadrícula"
                >
                  <Grid3X3 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="controlesFiltrados.length === 0" class="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <ClipboardList class="w-10 h-10 text-slate-300" />
            </div>
            <h3 class="font-display font-semibold text-lg text-slate-900 mb-2">No se encontraron controles</h3>
            <p class="text-slate-500 mb-6 max-w-md mx-auto">Intenta ajustar los filtros de búsqueda o registra un nuevo control para comenzar.</p>
            <router-link 
              to="/nueva-medicion/tipo"
              class="inline-flex items-center gap-2 text-white px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition-all shadow-sm shadow-orange-200"
              :style="{ backgroundColor: 'var(--theme-primary)' }"
            >
              <Activity class="w-4 h-4" />
              Registrar Control
            </router-link>
          </div>

          <!-- Table View -->
          <div v-else-if="vistaActual === 'lista'" class="overflow-x-auto flex-1">
            <table class="w-full">
              <thead class="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th class="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wide w-1/3">Control</th>
                  <th class="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                  <th class="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wide">Valor</th>
                  <th class="text-center py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                  <th class="text-right py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="control in controlesPaginados" :key="control.id" class="hover:bg-slate-50/80 transition-colors group">
                  <!-- Columna Control -->
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-shadow group-hover:shadow-md bg-white border border-slate-100">
                        <component :is="control.tipoIcono" class="w-5 h-5" :class="control.tipoColor" />
                      </div>
                      <div class="min-w-0">
                        <p class="text-sm font-bold text-slate-900 truncate">{{ control.tipo }}</p>
                        <p class="text-xs text-slate-500 truncate flex items-center gap-1">
                          <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          {{ control.centro }}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <!-- Columna Fecha -->
                  <td class="py-4 px-6">
                    <div class="flex flex-col">
                      <span class="text-sm font-semibold text-slate-700">{{ control.fecha }}</span>
                      <span class="text-xs text-slate-400 font-medium">{{ control.hora }}</span>
                    </div>
                  </td>
                  
                  <!-- Columna Valor -->
                  <td class="py-4 px-6">
                    <span class="text-sm font-bold text-slate-900 font-mono bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                      {{ control.valor }} <span class="text-slate-500 text-xs font-sans font-normal">{{ control.unidad }}</span>
                    </span>
                  </td>
                  
                  <!-- Columna Estado -->
                  <td class="py-4 px-6 text-center">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm" 
                      :class="[
                        getResultadoClases(control.resultadoTipo).replace('text-', 'text-').replace('bg-', 'bg-'),
                        control.resultadoTipo === 'success' ? 'border-green-200' : 
                        control.resultadoTipo === 'warning' ? 'border-orange-200' : 'border-red-200'
                      ]"
                    >
                      <component :is="getIconoResultado(control.resultadoTipo)" class="w-3 h-3 mr-1.5" />
                      {{ control.resultado }}
                    </span>
                  </td>
                  
                  <!-- Columna Acciones -->
                  <td class="py-4 px-6 text-right">
                    <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                      <button 
                        @click="verDetalle(control)"
                        class="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye class="w-4 h-4" />
                      </button>
                      <button 
                        @click="compartirControl(control)"
                        class="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Compartir"
                      >
                        <Share2 class="w-4 h-4" />
                      </button>
                      <button 
                        @click="abrirModalPDF(control)"
                        class="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Ver Reporte PDF"
                      >
                        <FileText class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Grid View -->
          <div v-else class="flex-1 p-6 bg-slate-50/50">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                v-for="control in controlesPaginados" 
                :key="control.id"
                class="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md hover:border-orange-200 transition-all group"
              >
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                      <component :is="control.tipoIcono" class="w-5 h-5" :class="control.tipoColor" />
                    </div>
                    <div>
                      <p class="text-sm font-bold text-slate-900 line-clamp-1">{{ control.tipo }}</p>
                      <p class="text-xs text-slate-500">{{ control.fecha }}</p>
                    </div>
                  </div>
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold border" 
                    :class="[
                      getResultadoClases(control.resultadoTipo),
                      control.resultadoTipo === 'success' ? 'border-green-200' : 'border-slate-200'
                    ]"
                  >
                    {{ control.estado }}
                  </span>
                </div>
                
                <div class="mb-4 bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <p class="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">Valor medido</p>
                  <p class="text-lg font-bold text-slate-900 font-mono">
                    {{ control.valor }} <span class="text-sm text-slate-500 font-normal font-sans">{{ control.unidad }}</span>
                  </p>
                </div>
                
                <div class="flex items-center gap-2 pt-2">
                  <button 
                    @click="verDetalle(control)"
                    class="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                  >
                    <Eye class="w-4 h-4" />
                    Ver
                  </button>
                  <div class="w-px h-4 bg-slate-200"></div>
                  <button 
                    @click="abrirModalPDF(control)"
                    class="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                  >
                    <FileText class="w-4 h-4" />
                    Reporte
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Pagination -->
          <div v-if="totalPaginas > 1" class="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 bg-white gap-4">
            <p class="text-slate-500 text-sm font-medium">
              Mostrando <span class="text-slate-900 font-bold">{{ (paginaActual - 1) * itemsPorPagina + 1 }}-{{ Math.min(paginaActual * itemsPorPagina, controlesFiltrados.length) }}</span> de <span class="text-slate-900 font-bold">{{ controlesFiltrados.length }}</span>
            </p>
            <div class="flex items-center gap-2">
              <button 
                @click="cambiarPagina(paginaActual - 1)"
                :disabled="paginaActual === 1"
                class="w-9 h-9 flex items-center justify-center rounded-lg transition-colors disabled:opacity-50 border border-slate-200"
                :class="paginaActual === 1 ? 'text-slate-300 bg-slate-50' : 'text-slate-600 hover:bg-slate-50 hover:border-slate-300'"
              >
                <ChevronLeft class="w-4 h-4" />
              </button>
              <div class="flex items-center gap-1">
                <button 
                  v-for="pagina in totalPaginas" 
                  :key="pagina"
                  @click="cambiarPagina(pagina)"
                  class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all"
                  :class="paginaActual === pagina ? 'text-white shadow-md shadow-orange-100' : 'text-slate-600 hover:bg-slate-50'"
                  :style="paginaActual === pagina ? { backgroundColor: 'var(--theme-primary)' } : {}"
                >
                  {{ pagina }}
                </button>
              </div>
              <button 
                @click="cambiarPagina(paginaActual + 1)"
                :disabled="paginaActual === totalPaginas"
                class="w-9 h-9 flex items-center justify-center rounded-lg transition-colors disabled:opacity-50 border border-slate-200"
                :class="paginaActual === totalPaginas ? 'text-slate-300 bg-slate-50' : 'text-slate-600 hover:bg-slate-50 hover:border-slate-300'"
              >
                <ChevronRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- PDF Modal -->
    <div v-if="showPdfModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="cerrarModalPDF">
      <div class="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <FileText class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-gray-900">Vista Previa del Reporte</h3>
              <p class="text-xs text-gray-500">
                {{ selectedControlForPdf?.tipo }} - {{ selectedControlForPdf?.fecha }}
              </p>
            </div>
          </div>
          <button 
            @click="cerrarModalPDF"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <!-- Preview Content -->
        <div class="flex-1 bg-gray-100 p-4 overflow-hidden relative">
          <iframe 
            v-if="pdfPreviewUrl" 
            :src="pdfPreviewUrl" 
            class="w-full h-full rounded-lg shadow-sm border border-gray-200"
            title="PDF Preview"
          ></iframe>
          <div v-else class="absolute inset-0 flex items-center justify-center">
            <Loader2 class="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        </div>
        
        <!-- Footer Actions -->
        <div class="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3">
          <button 
            @click="cerrarModalPDF"
            class="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cerrar
          </button>
          <button 
            @click="descargarPDFFinal"
            class="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 flex items-center gap-2"
          >
            <Download class="w-4 h-4" />
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-display {
  font-family: 'Cabinet Grotesk', sans-serif;
}
.font-mono {
  font-family: 'Space Grotesk', monospace;
}
</style>
