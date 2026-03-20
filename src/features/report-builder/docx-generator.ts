import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';

// Replace [[key]] placeholders using docxtemplater (handles Word's split XML runs)
export async function generateDocx(
  base64Template: string,
  values: Record<string, string>
): Promise<Blob> {
  const binaryStr = atob(base64Template);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

  const zip = new PizZip(bytes.buffer);

  const doc = new Docxtemplater(zip, {
    // Use [[key]] delimiters instead of default {key}
    delimiters: { start: '[[', end: ']]' },
    // Don't throw on missing keys — leave blank
    nullGetter: () => '',
  });

  doc.render(values);

  const output = doc.getZip().generate({ type: 'arraybuffer', compression: 'DEFLATE' });
  return new Blob([output], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
