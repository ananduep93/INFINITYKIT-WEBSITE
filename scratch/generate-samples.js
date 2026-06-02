const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const JSZip = require('jszip');

async function createSamples() {
  const dir = path.join(__dirname, '../public/samples');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log('Created samples directory:', dir);
  }

  // 1. Generate sample.txt
  const txtPath = path.join(dir, 'sample.txt');
  fs.writeFileSync(txtPath, `InfinityKit Testing Text File
================================

This is a simple text file generated to test the TXT to PDF converter.
It contains multiple lines of plain text:
- Line 1: Welcome to the plain text file.
- Line 2: The conversion process should layout these lines cleanly.
- Line 3: Ensure margins and fonts are properly formatted in the resulting PDF.

Thank you for using InfinityKit!
`);
  console.log('Generated sample.txt');

  // 2. Generate sample.csv
  const csvPath = path.join(dir, 'sample.csv');
  fs.writeFileSync(csvPath, `Name,Age,Country,Occupation,Salary
John Doe,28,USA,Software Engineer,95000
Jane Smith,34,UK,Data Scientist,105000
Akira Tanaka,41,Japan,Product Manager,120000
Carlos Gomez,29,Spain,UI Designer,65000
Aisha Rahman,31,India,DevOps Specialist,80000
`);
  console.log('Generated sample.csv');

  // 3. Generate sample.pdf using pdf-lib
  const pdfPath = path.join(dir, 'sample.pdf');
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Page 1
  const page1 = pdfDoc.addPage([600, 400]);
  page1.drawText("InfinityKit Sample PDF Document", { x: 50, y: 340, size: 24, font, color: rgb(0, 0.6, 0.6) });
  page1.drawText("This PDF is designed for testing the InfinityKit PDF Suite.", { x: 50, y: 300, size: 14, font });
  page1.drawText("It contains 2 pages. Use it for merge, split, rotation, watermark, OCR, etc.", { x: 50, y: 260, size: 12, font });
  page1.drawText("This is Page 1.", { x: 50, y: 220, size: 12, font });
  page1.drawText("Sample Text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.", { x: 50, y: 180, size: 10, font });
  
  // Page 2
  const page2 = pdfDoc.addPage([600, 400]);
  page2.drawText("InfinityKit Sample PDF - Page 2", { x: 50, y: 340, size: 20, font });
  page2.drawText("This is page 2 content. We can split this file into individual pages,", { x: 50, y: 300, size: 12, font });
  page2.drawText("rearrange it, delete this page, or rotate it as needed.", { x: 50, y: 280, size: 12, font });
  page2.drawText("End of Document.", { x: 50, y: 100, size: 10, font });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(pdfPath, pdfBytes);
  console.log('Generated sample.pdf');

  // 4. Generate sample.docx using docx npm package
  const docxPath = path.join(dir, 'sample.docx');
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: "InfinityKit Sample Word Document",
              bold: true,
              size: 32,
              color: "00A19B"
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "\nThis is a sample Word document (.docx) designed to test the Word-to-PDF conversion.",
              size: 24
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "It was generated programmatically in the local workspace.",
              size: 24
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "\nBelow is a list of features:",
              bold: true,
              size: 24
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "- Client-side DOCX reading via mammoth\n- Formatting extraction\n- Text structure validation",
              size: 20
            })
          ]
        })
      ]
    }]
  });
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(docxPath, buffer);
  console.log('Generated sample.docx');

  // 5. Generate sample.epub using jszip
  const epubPath = path.join(dir, 'sample.epub');
  const zip = new JSZip();
  
  // Minimal EPUB structure
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  
  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  zip.file("META-INF/container.xml", containerXml);

  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>Sample Ebook</dc:title>
    <dc:creator>InfinityKit</dc:creator>
    <dc:language>en</dc:language>
  </metadata>
  <manifest>
    <item id="chapter1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
    <item id="chapter2" href="chapter2.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine toc="ncx">
    <itemref idref="chapter1"/>
    <itemref idref="chapter2"/>
  </spine>
</package>`;
  zip.file("OEBPS/content.opf", contentOpf);

  const chapter1Xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
  <title>Chapter 1: Welcome</title>
</head>
<body>
  <h1>Chapter 1: Ebook Welcome</h1>
  <p>Welcome to this sample EPUB file! This content will be extracted and converted to a PDF document client-side.</p>
  <p>EPUB files are zip packages containing XHTML contents. Our parser unzips and converts them locally.</p>
</body>
</html>`;
  zip.file("OEBPS/chapter1.xhtml", chapter1Xhtml);

  const chapter2Xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
  <title>Chapter 2: Conclusion</title>
</head>
<body>
  <h1>Chapter 2: Ebook Conclusion</h1>
  <p>This is the second chapter of the ebook. By compiling multiple xhtml pages, we reconstruct the complete text stream.</p>
  <p>All styling and elements are processed in order. Ready for conversion!</p>
</body>
</html>`;
  zip.file("OEBPS/chapter2.xhtml", chapter2Xhtml);

  const epubBuffer = await zip.generateAsync({ type: "nodebuffer" });
  fs.writeFileSync(epubPath, epubBuffer);
  console.log('Generated sample.epub');

  console.log('All sample files successfully generated in public/samples/');
}

createSamples().catch(console.error);
