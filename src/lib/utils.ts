import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Obtiene la fecha y hora actual en hora local del cliente (navegador)
 * y la devuelve como string ISO en formato que preserve la fecha local
 * 
 * IMPORTANTE: PostgreSQL almacena timestamps en UTC. Para preservar la fecha local,
 * enviamos el timestamp como si fuera UTC pero con los valores de hora local.
 * Esto evita que PostgreSQL convierta y cambie el día cuando hay diferencia de zona horaria.
 * 
 * @returns String ISO con fecha y hora en formato UTC (pero preservando fecha local)
 */
export function getLocalDateTimeISO(): string {
  const ahora = new Date();
  const año = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  const horas = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  const segundos = String(ahora.getSeconds()).padStart(2, '0');
  const milisegundos = String(ahora.getMilliseconds()).padStart(3, '0');
  
  // Enviar como UTC (offset +00:00) pero con los valores de hora local
  // Esto hace que PostgreSQL almacene exactamente estos valores sin conversión
  // Cuando se lea, se mostrará con la fecha correcta
  return `${año}-${mes}-${dia}T${horas}:${minutos}:${segundos}.${milisegundos}+00:00`;
}

/**
 * Obtiene solo la fecha actual en hora local del cliente (navegador)
 * @returns String en formato YYYY-MM-DD en hora local
 */
export function getLocalDateISO(): string {
  const ahora = new Date();
  const año = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

/**
 * Obtiene solo la hora actual en hora local del cliente (navegador)
 * @returns String en formato HH:mm en hora local
 */
export function getLocalTimeISO(): string {
  const ahora = new Date();
  const horas = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  return `${horas}:${minutos}`;
}

/**
 * Comprime una imagen para que pese máximo entre 2-3 MB
 * @param file - Archivo de imagen a comprimir
 * @param maxSizeMB - Tamaño máximo en MB (por defecto 2.5)
 * @returns Promise con el archivo comprimido como Blob
 */
export async function compressImage(file: File, maxSizeMB: number = 2.5): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxWidth = 1920; // Ancho máximo
        const maxHeight = 1920; // Alto máximo

        // Redimensionar si es necesario manteniendo la proporción
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          } else {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto del canvas'));
          return;
        }

        // Dibujar la imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Intentar comprimir con diferentes calidades
        let quality = 0.9;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        const tryCompress = (q: number): void => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Error al comprimir la imagen'));
                return;
              }

              // Si el tamaño es aceptable o la calidad es muy baja, usar este blob
              if (blob.size <= maxSizeBytes || q <= 0.1) {
                const compressedFile = new File(
                  [blob],
                  file.name,
                  { type: 'image/jpeg', lastModified: Date.now() }
                );
                resolve(compressedFile);
              } else {
                // Reducir calidad y volver a intentar
                tryCompress(q - 0.1);
              }
            },
            'image/jpeg',
            q
          );
        };

        tryCompress(quality);
      };
      img.onerror = () => reject(new Error('Error al cargar la imagen'));
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
  });
}