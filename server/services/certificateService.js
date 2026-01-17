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

    const pageWidth = doc.page.width;

    // Background template
    const templatePath = path.join(
      process.cwd(),
      'server/certificates/templates/format_New.jpg'
    );

    doc.image(templatePath, 0, 0, {
      width: pageWidth,
      height: doc.page.height
    });

    /* =======================
       CENTER CONTENT
    ======================= */

    // USER NAME (main focus)
    doc
      .font('Helvetica-Bold')
      .fontSize(36)
      .fillColor('#0b2c3d')
      .text(userName, 0, 285, {
        width: pageWidth,
        align: 'center'
      });

    // GAME TITLE (below name)
    doc
      .font('Helvetica')
      .fontSize(20)
      .fillColor('#0b2c3d')
      .text(gameTitle, 0, 335, {
        width: pageWidth,
        align: 'center'
      });

    /* =======================
       LEFT DETAILS
    ======================= */

    const leftX = 120;

    doc
      .fontSize(12)
      .fillColor('#000')
      .text(userEmail, leftX, 450);

    doc.text(tokenCode, leftX, 485);

    doc.text(new Date().toLocaleDateString('en-GB'), leftX, 520);

    /* =======================
       RIGHT – SPONSOR
    ======================= */

const sponsorX = 560;
const sponsorY = 470;
const sponsorWidth = 260;

// Split sponsor name safely
let sponsorPerson = sponsorName || 'Authorized Signatory';
let sponsorCompany = '';

if (sponsorName) {
  const parts = sponsorName.split(/[,|-]/).map(p => p.trim());
  sponsorPerson = parts[0] || sponsorPerson;
  sponsorCompany = parts[1] || '';
}

// Sponsor Person Name (top)
doc
  .font('Helvetica-Bold')
  .fontSize(12)
  .fillColor('#000')
  .text(sponsorPerson, sponsorX, sponsorY, {
    width: sponsorWidth,
    align: 'center'
  });

// Sponsor Company Name (below, only if exists)
if (sponsorCompany) {
  doc
    .font('Helvetica')
    .fontSize(11)
    .fillColor('#000')
    .text(sponsorCompany, sponsorX, sponsorY + 18, {
      width: sponsorWidth,
      align: 'center'
    });
}

doc.end();

stream.on('finish', resolve);
stream.on('error', reject);
