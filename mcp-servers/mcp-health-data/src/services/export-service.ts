import { format } from '@fast-csv/format';
import { parse } from '@fast-csv/parse';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export interface PatientData {
  patientId: string;
  measurements: any[];
  controls: any[];
  history: any[];
}

export function exportToJSON(data: PatientData): string {
  return JSON.stringify(data, null, 2);
}

export function exportToCSV(data: PatientData): string {
  const records: any[] = [];

  // Agregar mediciones
  data.measurements.forEach((m) => {
    records.push({
      tipo: 'medicion',
      id: m.id,
      nombre: m.nombre,
      valor: m.valor,
      unidad: m.unidad,
      fecha: m.fecha,
      estado: m.estado,
    });
  });

  // Agregar controles
  data.controls.forEach((c) => {
    records.push({
      tipo: 'control',
      id: c.id,
      nombre: c.nombre,
      descripcion: c.descripcion,
      estado: c.estado,
      fechaProgramada: c.fechaProgramada,
    });
  });

  if (records.length === 0) {
    return '';
  }

  const csvStream = format({ headers: true });
  let csvData = '';

  csvStream.on('data', (chunk) => {
    csvData += chunk;
  });

  records.forEach((record) => {
    csvStream.write(record);
  });

  csvStream.end();

  return csvData;
}

export function exportToPDF(data: PatientData): Buffer {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(18);
  doc.text(`Reporte de Salud - Paciente ${data.patientId}`, 14, 22);

  // Fecha
  doc.setFontSize(11);
  doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 30);

  // Tabla de mediciones
  if (data.measurements.length > 0) {
    doc.text('Mediciones', 14, 40);
    (doc as any).autoTable({
      startY: 45,
      head: [['Nombre', 'Valor', 'Unidad', 'Fecha', 'Estado']],
      body: data.measurements.map((m) => [m.nombre, m.valor, m.unidad, m.fecha, m.estado]),
    });
  }

  // Tabla de controles
  if (data.controls.length > 0) {
    const startY = data.measurements.length > 0 ? (doc as any).lastAutoTable.finalY + 10 : 40;
    doc.text('Controles', 14, startY);
    (doc as any).autoTable({
      startY: startY + 5,
      head: [['Nombre', 'Descripción', 'Estado', 'Fecha Programada']],
      body: data.controls.map((c) => [
        c.nombre,
        c.descripcion,
        c.estado,
        c.fechaProgramada || 'N/A',
      ]),
    });
  }

  return Buffer.from(doc.output('arraybuffer'));
}

export function parseCSV(csvContent: string): any[] {
  const records: any[] = [];
  
  const parser = parse({ headers: true })
    .on('data', (record: any) => {
      records.push(record);
    })
    .on('end', () => {
      // CSV parseado completamente
    });

  parser.write(csvContent);
  parser.end();

  return records;
}
