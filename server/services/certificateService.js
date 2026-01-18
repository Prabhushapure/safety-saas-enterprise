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
  console.log('🔥 certificateService.js IS EXECUTING 🔥');

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 0
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    /* =======================
       BACKGROUND IMAGE
    ======================= */

    const templatePath = path.join(
      process.cwd(),
      'server',
      'certificates',
      'templates',
      'format_New.jpg'
    );

    doc.image(templatePath, 0, 0, {
      width: pageWidth,
      height: pageHeight
    });

    /* =======================
       CENTER CONTENT
    ======================= */

    doc
      .font('Helvetica-Bold')
      .fontSize(36)
      .fillColor('#0b2c3d')
      .text(userName, 0, 270, {
        width: pageWidth,
        align: 'center',
        lineBreak: false
      });

    doc
      .font('Helvetica')
      .fontSize(20)
      .fillColor('#0b2c3d')
      .text(gameTitle, 0, 340, {
        width: pageWidth,
        align: 'center',
        lineBreak: false
      });

    /* =======================
       LEFT FOOTER – TEXT ON UNDERLINES
    ======================= */

    const LEFT_X = 80;
    const FONT_SIZE = 12;

    // UNDERLINE positions from the IMAGE (THIS IS THE KEY)
    const EMAIL_UNDERLINE_Y = 450;
    const TOKEN_UNDERLINE_Y = 500;
    const DATE_UNDERLINE_Y  = 540;

    doc
      .font('Helvetica')
      .fontSize(FONT_SIZE)
      .fillColor('#000')
      .text(userEmail, LEFT_X, EMAIL_UNDERLINE_Y - FONT_SIZE, {
        lineBreak: false
      });

    doc.text(tokenCode, LEFT_X, TOKEN_UNDERLINE_Y - FONT_SIZE, {
      lineBreak: false
    });

    doc.text(
      new Date().toLocaleDateString('en-GB'),
      LEFT_X,
      DATE_UNDERLINE_Y - FONT_SIZE,
      { lineBreak: false }
    );

    /* =======================
       RIGHT FOOTER – SPONSOR
    ======================= */

    let sponsorPerson = sponsorName || 'Authorized Signatory';
    let sponsorCompany = '';

    if (sponsorName) {
      const parts = sponsorName.split(/[,|-]/).map(p => p.trim());
      sponsorPerson = parts[0] || sponsorPerson;
      sponsorCompany = parts[1] || '';
    }

    const sponsorWidth = 260;
    const sponsorX = pageWidth - sponsorWidth - 50;

    const SPONSOR_UNDERLINE_Y = 450;

    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor('#000')
      .text(
        sponsorPerson,
        sponsorX,
        SPONSOR_UNDERLINE_Y - 12,
        {
          width: sponsorWidth,
          align: 'center',
          lineBreak: false
        }
      );

    if (sponsorCompany) {
      doc
        .font('Helvetica')
        .fontSize(11)
        .text(
          sponsorCompany,
          sponsorX,
          SPONSOR_UNDERLINE_Y - 12 + 16,
          {
            width: sponsorWidth,
            align: 'center',
            lineBreak: false
          }
        );
    }

    doc.end();

    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}
