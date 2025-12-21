import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export interface ExportColumn {
  header: string;
  dataKey: string;
  width?: number;
}

export interface ExportOptions {
  title: string;
  filename?: string;
  columns: ExportColumn[];
  data: any[];
  dateRange?: {
    desde?: string;
    hasta?: string;
  };
  summary?: {
    totalVentas?: number;
    cantidadVentas?: number;
    ticketPromedio?: number;
  };
}

export const exportService = {
  /**
   * Exporta datos a PDF
   */
  async exportToPDF(options: ExportOptions): Promise<void> {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - 2 * margin;

    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(options.title, margin, 15);

    // Información adicional
    let yPos = 25;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const fecha = format(new Date(), 'dd/MM/yyyy HH:mm');
    doc.text(`Generado el: ${fecha}`, margin, yPos);
    yPos += 5;

    if (options.dateRange?.desde || options.dateRange?.hasta) {
      let rangeText = 'Período: ';
      if (options.dateRange.desde && options.dateRange.hasta) {
        // Formatear fechas para mejor legibilidad
        const desdeFormatted = options.dateRange.desde.includes('/') 
          ? options.dateRange.desde 
          : format(new Date(options.dateRange.desde + 'T00:00:00'), 'dd/MM/yyyy');
        const hastaFormatted = options.dateRange.hasta.includes('/') 
          ? options.dateRange.hasta 
          : format(new Date(options.dateRange.hasta + 'T00:00:00'), 'dd/MM/yyyy');
        rangeText += `${desdeFormatted} - ${hastaFormatted}`;
      } else if (options.dateRange.desde) {
        const desdeFormatted = options.dateRange.desde.includes('/') 
          ? options.dateRange.desde 
          : format(new Date(options.dateRange.desde + 'T00:00:00'), 'dd/MM/yyyy');
        rangeText += `Desde ${desdeFormatted}`;
      } else if (options.dateRange.hasta) {
        const hastaFormatted = options.dateRange.hasta.includes('/') 
          ? options.dateRange.hasta 
          : format(new Date(options.dateRange.hasta + 'T00:00:00'), 'dd/MM/yyyy');
        rangeText += `Hasta ${hastaFormatted}`;
      }
      doc.text(rangeText, margin, yPos);
      yPos += 5;
    }

    // Resumen estadístico si está disponible
    if (options.summary) {
      yPos += 2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Resumen', margin, yPos);
      yPos += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      if (options.summary.cantidadVentas !== undefined) {
        doc.text(`Total de Ventas: ${options.summary.cantidadVentas}`, margin, yPos);
        yPos += 5;
      }
      if (options.summary.totalVentas !== undefined) {
        doc.text(`Total Vendido: Bs. ${options.summary.totalVentas.toFixed(2)}`, margin, yPos);
        yPos += 5;
      }
      if (options.summary.ticketPromedio !== undefined) {
        doc.text(`Promedio de Ventas: Bs. ${options.summary.ticketPromedio.toFixed(2)}`, margin, yPos);
        yPos += 5;
      }
    }

    // Preparar datos para la tabla
    const headers = options.columns.map(col => col.header);
    const rows = options.data.map(item =>
      options.columns.map(col => {
        const value = this.getNestedValue(item, col.dataKey);
        return value !== null && value !== undefined ? String(value) : '-';
      })
    );

    // Crear tabla
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: yPos + 5,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: options.columns.reduce((acc, col, index) => {
        if (col.width) {
          acc[index] = { cellWidth: col.width };
        }
        return acc;
      }, {} as Record<number, { cellWidth: number }>),
    });

    // Guardar PDF
    const filename = options.filename || `${options.title.toLowerCase().replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
    doc.save(filename);
  },

  /**
   * Exporta datos a Excel
   */
  async exportToExcel(options: ExportOptions): Promise<void> {
    // Crear workbook
    const wb = XLSX.utils.book_new();

    // Preparar datos
    const headers = options.columns.map(col => col.header);
    const rows = options.data.map(item =>
      options.columns.map(col => {
        const value = this.getNestedValue(item, col.dataKey);
        return value !== null && value !== undefined ? value : '';
      })
    );

    // Crear worksheet
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Ajustar ancho de columnas
    const colWidths = options.columns.map(col => ({
      wch: col.width ? col.width / 5 : 15, // Convertir de mm a caracteres aproximados
    }));
    ws['!cols'] = colWidths;

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');

    // Crear hoja de información
    const infoData = [
      ['Información del Reporte'],
      [''],
      ['Título:', options.title],
      ['Fecha de Generación:', format(new Date(), 'dd/MM/yyyy HH:mm')],
    ];

    if (options.dateRange?.desde || options.dateRange?.hasta) {
      if (options.dateRange.desde && options.dateRange.hasta) {
        const desdeFormatted = options.dateRange.desde.includes('/') 
          ? options.dateRange.desde 
          : format(new Date(options.dateRange.desde + 'T00:00:00'), 'dd/MM/yyyy');
        const hastaFormatted = options.dateRange.hasta.includes('/') 
          ? options.dateRange.hasta 
          : format(new Date(options.dateRange.hasta + 'T00:00:00'), 'dd/MM/yyyy');
        infoData.push(['Período:', `${desdeFormatted} - ${hastaFormatted}`]);
      } else if (options.dateRange.desde) {
        const desdeFormatted = options.dateRange.desde.includes('/') 
          ? options.dateRange.desde 
          : format(new Date(options.dateRange.desde + 'T00:00:00'), 'dd/MM/yyyy');
        infoData.push(['Desde:', desdeFormatted]);
      } else if (options.dateRange.hasta) {
        const hastaFormatted = options.dateRange.hasta.includes('/') 
          ? options.dateRange.hasta 
          : format(new Date(options.dateRange.hasta + 'T00:00:00'), 'dd/MM/yyyy');
        infoData.push(['Hasta:', hastaFormatted]);
      }
    }

    // Agregar resumen estadístico si está disponible
    if (options.summary) {
      infoData.push(['']);
      infoData.push(['Resumen Estadístico']);
      if (options.summary.cantidadVentas !== undefined) {
        infoData.push(['Total de Ventas:', options.summary.cantidadVentas]);
      }
      if (options.summary.totalVentas !== undefined) {
        infoData.push(['Total Vendido:', `Bs. ${options.summary.totalVentas.toFixed(2)}`]);
      }
      if (options.summary.ticketPromedio !== undefined) {
        infoData.push(['Promedio de Ventas:', `Bs. ${options.summary.ticketPromedio.toFixed(2)}`]);
      }
    }

    const infoWs = XLSX.utils.aoa_to_sheet(infoData);
    XLSX.utils.book_append_sheet(wb, infoWs, 'Información', 0); // Insertar al inicio

    // Guardar archivo
    const filename = options.filename || `${options.title.toLowerCase().replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
    XLSX.writeFile(wb, filename);
  },

  /**
   * Obtiene un valor anidado de un objeto usando una ruta de claves
   */
  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  },
};

