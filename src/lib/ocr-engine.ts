import { createWorker, PSM } from 'tesseract.js';

export async function recognizeImageText(imageDataUrl: string): Promise<string> {
  const worker = await createWorker('eng');
  
  // Set parameters to optimize for document scanning
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.AUTO_OSD, // Automatic page segmentation with OSD
    preserve_interword_spaces: '1',
  });
  
  const { data: { text } } = await worker.recognize(imageDataUrl);
  await worker.terminate();
  
  return text;
}
