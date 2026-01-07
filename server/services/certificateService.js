import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export async function generateCertificatePDF({
  userName,
  userEmail,
  gameTitle,
  tokenCode,
  sponsorName,
  outputPath
}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 0
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Background image (JPG)
    const templatePath = path.join(
      process.cwd(),
      'server/certificates/templates/format_New.jpg'
    );

    doc.image(templatePath, 0, 0, {
      width: doc.page.width,
      height: doc.page.height
    });

    // USER NAME
    doc
      .font('Helvetica-Bold')
      .fontSize(34)
      .fillColor('#0b2c3d')
      .text(userName, 0, 260, { width: doc.page.width, align: 'center' });

    // GAME TITLE
    doc
      .fontSize(20)
      .font('Helvetica')
      .text(gameTitle, 0, 315, { width: doc.page.width, align: 'center' });

    // USER EMAIL
    doc.fontSize(12).fillColor('#000').text(userEmail, 120, 430);

    // TOKEN
    doc.text(tokenCode, 120, 465);

    // DATE
    doc.text(new Date().toLocaleDateString('en-GB'), 120, 500);

    // SPONSOR
    doc.text(sponsorName || 'Workplace Safety', 580, 465, {
      width: 200,
      align: 'center'
    });

    doc.end();

    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}
