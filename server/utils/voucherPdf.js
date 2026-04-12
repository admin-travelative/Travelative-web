const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

const BUSINESS_DETAILS = {
    companyName: 'Travelative',
    officeLocation: 'Ghaziabad, Uttar Pradesh',
    contacts: ['7088221122', '8373949613'],
    email: 'traveladvisor@travelative.com',
    website: 'www.travelative.com',
    instagram: '@TRAVELATIVEUP14',
};

const LOGO_PATH = path.join(__dirname, '..', '..', 'client', 'public', 'Travelative_logo.png');
const ARIAL_REGULAR_PATH = 'C:\\Windows\\Fonts\\arial.ttf';
const ARIAL_BOLD_PATH = 'C:\\Windows\\Fonts\\arialbd.ttf';
const FONT_REGULAR = fs.existsSync(ARIAL_REGULAR_PATH) ? 'TravelativeSans' : 'Helvetica';
const FONT_BOLD = fs.existsSync(ARIAL_BOLD_PATH) ? 'TravelativeSansBold' : 'Helvetica-Bold';

function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

function formatCurrency(value) {
    if (value === null || value === undefined || value === '') return '-';
    const amount = Number(value);
    if (!Number.isFinite(amount)) return '-';

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
}

function normalizeValue(value, fallback = '-') {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }

    return String(value);
}

function normalizeList(values = []) {
    return Array.isArray(values)
        ? values.map((value) => String(value || '').trim()).filter(Boolean)
        : [];
}

function getBalance(voucher) {
    if (voucher.balanceAmount !== null && voucher.balanceAmount !== undefined && voucher.balanceAmount !== '') {
        return voucher.balanceAmount;
    }

    return Math.max((Number(voucher.totalAmount) || 0) - (Number(voucher.paidAmount) || 0), 0);
}

function fitText(doc, text, x, y, width, height, options = {}) {
    doc.text(normalizeValue(text), x, y, {
        width,
        height,
        ellipsis: true,
        ...options,
    });
}

function drawRoundedPanel(doc, x, y, width, height, radius = 18, fill = '#ffffff', stroke = '#ead7c6') {
    doc.save();
    doc.roundedRect(x, y, width, height, radius).fillAndStroke(fill, stroke);
    doc.restore();
}

function drawInfoCard(doc, x, y, width, height, label, value, accent = '#f97316') {
    drawRoundedPanel(doc, x, y, width, height, 16, '#ffffff', '#eddccf');

    doc
        .font(FONT_BOLD)
        .fontSize(7.2)
        .fillColor(accent)
        .text(label.toUpperCase(), x + 12, y + 10, { width: width - 24, characterSpacing: 1.1 });

    doc
        .font(FONT_BOLD)
        .fontSize(11.5)
        .fillColor('#111827');

    fitText(doc, value, x + 12, y + 27, width - 24, height - 35);
}

function drawSectionHeading(doc, title, x, y, width) {
    doc
        .font(FONT_BOLD)
        .fontSize(10)
        .fillColor('#111827')
        .text(title, x, y);

    doc
        .moveTo(x + 86, y + 8)
        .lineTo(x + width, y + 8)
        .lineWidth(1)
        .strokeColor('#ebe5de')
        .stroke();
}

function drawDetailGrid(doc, x, y, width, fields, columns = 4) {
    const cellWidth = width / columns;
    const rows = Math.ceil(fields.length / columns);
    const labelHeight = 15;
    const valueHeight = 18;
    const rowHeight = labelHeight + valueHeight;

    for (let index = 0; index < fields.length; index += 1) {
        const field = fields[index];
        const row = Math.floor(index / columns);
        const column = index % columns;
        const cellX = x + (column * cellWidth);
        const cellY = y + (row * rowHeight);

        doc.save();
        doc.rect(cellX, cellY, cellWidth, labelHeight).fillAndStroke('#fff4e8', '#eadfd4');
        doc.restore();

        doc
            .font(FONT_BOLD)
            .fontSize(6)
            .fillColor('#75685a')
            .text(field.label.toUpperCase(), cellX + 6, cellY + 5, {
                width: cellWidth - 12,
                characterSpacing: 0.85,
            });

        doc.save();
        doc.rect(cellX, cellY + labelHeight, cellWidth, valueHeight).stroke('#eadfd4');
        doc.restore();

        doc
            .font(FONT_BOLD)
            .fontSize(8.4)
            .fillColor('#111827');

        fitText(doc, field.value, cellX + 6, cellY + labelHeight + 5, cellWidth - 12, valueHeight - 6);
    }

    return rows * rowHeight;
}

function hasNotesSection(voucher) {
    return normalizeList(voucher.specialRequests).length > 0
        || normalizeList(voucher.inclusions).length > 0
        || Boolean(String(voucher.notes || '').trim());
}

function buildNotesSections(voucher) {
    const sections = [];
    const requests = normalizeList(voucher.specialRequests);
    const inclusions = normalizeList(voucher.inclusions);
    const note = String(voucher.notes || '').trim();

    if (requests.length) {
        sections.push({
            title: 'Special Requests',
            lines: requests.slice(0, 5).map((item) => `- ${item}`),
        });
    }

    if (inclusions.length) {
        sections.push({
            title: 'Inclusions / Notes',
            lines: inclusions.slice(0, 5).map((item) => `- ${item}`),
        });
    }

    if (note) {
        sections.push({
            title: 'Guest Note',
            lines: [note],
        });
    }

    return sections;
}

function getVoucherPayloadForQr(voucher) {
    return {
        voucherNumber: voucher.voucherNumber || '',
        issueDate: voucher.issueDate || '',
        packageTitle: voucher.packageTitle || '',
        customerName: voucher.customerName || '',
        customerPhone: voucher.customerPhone || '',
        customerEmail: voucher.customerEmail || '',
        alternateContact: voucher.alternateContact || '',
        destination: voucher.destination || '',
        hotelName: voucher.hotelName || '',
        hotelAddress: voucher.hotelAddress || '',
        checkInDate: voucher.checkInDate || '',
        checkOutDate: voucher.checkOutDate || '',
        numberOfNights: voucher.numberOfNights ?? '',
        roomType: voucher.roomType || '',
        mealPlan: voucher.mealPlan || '',
        numberOfRooms: voucher.numberOfRooms ?? '',
        travelerCount: voucher.travelerCount ?? '',
        totalAmount: voucher.totalAmount ?? '',
        paymentStatus: voucher.paymentStatus || '',
        paidAmount: voucher.paidAmount ?? '',
        balanceAmount: getBalance(voucher),
        specialRequests: normalizeList(voucher.specialRequests),
        inclusions: normalizeList(voucher.inclusions),
        terms: normalizeList(voucher.terms),
        notes: String(voucher.notes || '').trim(),
        authorizedBy: voucher.authorizedBy || '',
        customerSupport: voucher.customerSupport || '',
    };
}

function encryptVoucherPayload(voucher) {
    const secret = process.env.VOUCHER_QR_SECRET || process.env.JWT_SECRET || 'travelative_qr_secret_key';
    const key = crypto.createHash('sha256').update(secret).digest();
    const iv = crypto.randomBytes(12);

    const payload = JSON.stringify({
        version: 1,
        issuedAt: new Date().toISOString(),
        voucher: getVoucherPayloadForQr(voucher),
    });

    const compressed = zlib.deflateRawSync(Buffer.from(payload, 'utf8'));
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()]);
    const tag = cipher.getAuthTag();

    return `TVQR1.${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

async function createQrBuffer(voucher) {
    let qrPayload = encryptVoucherPayload(voucher);

    if (qrPayload.length > 1800) {
        const summaryHash = crypto
            .createHash('sha256')
            .update(JSON.stringify(getVoucherPayloadForQr(voucher)))
            .digest('hex');

        qrPayload = `TVQR1-SHORT.${voucher.voucherNumber || ''}.${summaryHash}`;
    }

    const dataUrl = await QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: 'M',
        margin: 0,
        width: 110,
        color: {
            dark: '#111827',
            light: '#FFFFFF',
        },
    });

    return Buffer.from(dataUrl.split(',')[1], 'base64');
}

function drawHeader(doc, x, y, width) {
    drawRoundedPanel(doc, x, y, width, 126, 24, '#fff5ea', '#ead7c6');

    if (fs.existsSync(LOGO_PATH)) {
        doc.image(LOGO_PATH, x + 18, y + 16, { fit: [210, 52], align: 'left', valign: 'center' });
    } else {
        doc
            .font(FONT_BOLD)
            .fontSize(30)
            .fillColor('#111827')
            .text('Travelative', x + 18, y + 25);
    }

    doc
        .font(FONT_BOLD)
        .fontSize(8.5)
        .fillColor('#f97316')
        .text('TRAVEL VOUCHER', x + 20, y + 62, {
            characterSpacing: 2.3,
        });

    doc
        .font(FONT_BOLD)
        .fontSize(17)
        .fillColor('#111827')
        .text('Travelative Booking Confirmation', x + 20, y + 79, {
            width: width - 210,
        });

    doc
        .font(FONT_REGULAR)
        .fontSize(7.6)
        .fillColor('#5b6472')
        .text(
            'Standardized booking voucher for customer sharing, hotel check-in coordination, and payment clarity.',
            x + 20,
            y + 102,
            { width: width - 210, lineGap: 1 }
        );

    drawRoundedPanel(doc, x + width - 188, y + 14, 168, 96, 18, '#ffffff', '#e7ddd2');

    doc
        .font(FONT_BOLD)
        .fontSize(7)
        .fillColor('#2563eb')
        .text(BUSINESS_DETAILS.companyName.toUpperCase(), x + width - 174, y + 24, { width: 142 });

    doc
        .font(FONT_BOLD)
        .fontSize(8.6)
        .fillColor('#111827')
        .text(BUSINESS_DETAILS.officeLocation, x + width - 174, y + 38, {
            width: 142,
            height: 18,
            ellipsis: true,
        });

    doc
        .font(FONT_REGULAR)
        .fontSize(6.6)
        .fillColor('#4b5563')
        .text(`Contact: ${BUSINESS_DETAILS.contacts.join(' | ')}`, x + width - 174, y + 55, {
            width: 142,
            height: 14,
            ellipsis: true,
        })
        .text(`Email: ${BUSINESS_DETAILS.email}`, x + width - 174, y + 67, {
            width: 142,
            height: 16,
            ellipsis: false,
        })
        .text(`Website: ${BUSINESS_DETAILS.website}`, x + width - 174, y + 81, {
            width: 142,
            height: 14,
            ellipsis: true,
        })
        .text(`Instagram: ${BUSINESS_DETAILS.instagram}`, x + width - 174, y + 93, {
            width: 142,
            height: 12,
            ellipsis: true,
        });
}

function drawTextSectionsBlock(doc, x, y, width, title, sections, availableHeight, accent = '#f97316') {
    const headerHeight = 32;
    const bodyPadding = 14;
    const minHeight = 74;
    let contentHeight = headerHeight + bodyPadding;

    doc.font(FONT_BOLD).fontSize(9.5);

    sections.forEach((section) => {
        contentHeight += 14;
        doc.font(FONT_REGULAR).fontSize(7.3);
        contentHeight += doc.heightOfString(section.lines.join('\n'), {
            width: width - 28,
            lineGap: 2,
        });
        contentHeight += 10;
    });

    const height = Math.max(minHeight, Math.min(contentHeight, availableHeight));
    drawRoundedPanel(doc, x, y, width, height, 18, '#ffffff', '#eadfd4');

    doc
        .font(FONT_BOLD)
        .fontSize(10)
        .fillColor('#111827')
        .text(title, x + 14, y + 12, { width: width - 28 });

    doc
        .roundedRect(x + width - 18, y + 14, 4, 24, 2)
        .fill(accent);

    let cursorY = y + 34;

    sections.forEach((section) => {
        if (cursorY > y + height - 16) {
            return;
        }

        doc
            .font(FONT_BOLD)
            .fontSize(8.2)
            .fillColor('#334155')
            .text(section.title, x + 14, cursorY, { width: width - 28 });

        cursorY += 13;

        doc
            .font(FONT_REGULAR)
            .fontSize(7.3)
            .fillColor('#4b5563')
            .text(section.lines.join('\n'), x + 14, cursorY, {
                width: width - 28,
                height: y + height - cursorY - 12,
                ellipsis: true,
                lineGap: 2,
            });

        cursorY = doc.y + 8;
    });

    return height;
}

function drawTermsBlock(doc, x, y, width, height, terms) {
    drawRoundedPanel(doc, x, y, width, height, 18, '#ffffff', '#eadfd4');

    doc
        .font(FONT_BOLD)
        .fontSize(10)
        .fillColor('#111827')
        .text('Terms & Conditions', x + 14, y + 12, { width: width - 28 });

    doc
        .roundedRect(x + width - 18, y + 14, 4, 24, 2)
        .fill('#2563eb');

    const entries = normalizeList(terms);
    let fontSize = 7.3;
    let lineGap = 2;
    let renderedHeight = Infinity;

    while (fontSize >= 6.1) {
        doc.font(FONT_REGULAR).fontSize(fontSize);
        renderedHeight = doc.heightOfString(
            entries.length
                ? entries.map((item, index) => `${index + 1}. ${item}`).join('\n')
                : '1. Standard Travelative terms apply to this voucher.',
            { width: width - 28, lineGap }
        );

        if (renderedHeight <= height - 40) {
            break;
        }

        fontSize -= 0.3;
        lineGap = Math.max(1, lineGap - 0.2);
    }

    doc
        .font(FONT_REGULAR)
        .fontSize(fontSize)
        .fillColor('#4b5563')
        .text(
            entries.length
                ? entries.map((item, index) => `${index + 1}. ${item}`).join('\n')
                : '1. Standard Travelative terms apply to this voucher.',
            x + 14,
            y + 32,
            {
                width: width - 28,
                height: height - 44,
                ellipsis: true,
                lineGap,
            }
        );
}

function drawFooter(doc, x, y, width, qrBuffer, voucher) {
    const qrSize = 70;
    const gap = 10;
    const boxHeight = 52;
    const rightX = x + qrSize + 14;
    const boxWidth = (width - qrSize - 14 - gap) / 2;

    drawRoundedPanel(doc, x, y, qrSize, qrSize, 12, '#ffffff', '#eadfd4');
    doc.image(qrBuffer, x + 7, y + 7, { fit: [56, 56] });

    drawRoundedPanel(doc, rightX, y, boxWidth, boxHeight, 16, '#ffffff', '#eadfd4');
    drawRoundedPanel(doc, rightX + boxWidth + gap, y, boxWidth, boxHeight, 16, '#ffffff', '#eadfd4');

    doc
        .font(FONT_BOLD)
        .fontSize(6.5)
        .fillColor('#6b7280')
        .text('AUTHORIZED BY', rightX + 10, y + 9, {
            width: boxWidth - 20,
            characterSpacing: 1.1,
        })
        .text('CUSTOMER SUPPORT', rightX + boxWidth + gap + 10, y + 9, {
            width: boxWidth - 20,
            characterSpacing: 1.1,
        });

    doc
        .font(FONT_BOLD)
        .fontSize(9.5)
        .fillColor('#111827');

    fitText(doc, voucher.authorizedBy || '-', rightX + 10, y + 24, boxWidth - 20, 18);
    fitText(doc, voucher.customerSupport || '-', rightX + boxWidth + gap + 10, y + 24, boxWidth - 20, 18);
}

async function streamVoucherPdf(res, voucher) {
    const fileName = `${voucher.voucherNumber || 'travelative-voucher'}.pdf`;
    const qrBuffer = await createQrBuffer(voucher);

    const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 20, left: 20, right: 20, bottom: 20 },
        bufferPages: false,
    });

    if (FONT_REGULAR === 'TravelativeSans') {
        doc.registerFont(FONT_REGULAR, ARIAL_REGULAR_PATH);
    }

    if (FONT_BOLD === 'TravelativeSansBold') {
        doc.registerFont(FONT_BOLD, ARIAL_BOLD_PATH);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    doc.pipe(res);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const startX = doc.page.margins.left;
    const startY = doc.page.margins.top;
    const contentWidth = pageWidth;
    const bottomY = startY + 802;

    drawRoundedPanel(doc, startX, startY, contentWidth, 802, 28, '#fffdfa', '#eedfce');
    drawHeader(doc, startX + 14, startY + 14, contentWidth - 28);

    const summaryY = startY + 154;
    const summaryGap = 10;
    const summaryWidth = (contentWidth - 28 - (summaryGap * 2)) / 3;

    drawInfoCard(doc, startX + 14, summaryY, summaryWidth, 52, 'Voucher No.', normalizeValue(voucher.voucherNumber), '#f97316');
    drawInfoCard(doc, startX + 14 + summaryWidth + summaryGap, summaryY, summaryWidth, 52, 'Date Of Issue', formatDate(voucher.issueDate), '#2563eb');
    drawInfoCard(doc, startX + 14 + ((summaryWidth + summaryGap) * 2), summaryY, summaryWidth, 52, 'Package / Tag', normalizeValue(voucher.packageTitle || voucher.destination), '#ea580c');

    const guestY = summaryY + 66;
    drawSectionHeading(doc, 'Guest Details', startX + 14, guestY, contentWidth - 28);
    drawDetailGrid(doc, startX + 14, guestY + 14, contentWidth - 28, [
        { label: 'Guest Name', value: normalizeValue(voucher.customerName) },
        { label: 'Primary Contact', value: normalizeValue(voucher.customerPhone) },
        { label: 'Email', value: normalizeValue(voucher.customerEmail) },
        { label: 'Alternate Contact', value: normalizeValue(voucher.alternateContact) },
    ]);

    const bookingY = guestY + 84;
    drawSectionHeading(doc, 'Booking Information', startX + 14, bookingY, contentWidth - 28);
    drawDetailGrid(doc, startX + 14, bookingY + 14, contentWidth - 28, [
        { label: 'Hotel / Property', value: normalizeValue(voucher.hotelName) },
        { label: 'Destination', value: normalizeValue(voucher.destination) },
        { label: 'Check-in', value: formatDate(voucher.checkInDate) },
        { label: 'Check-out', value: formatDate(voucher.checkOutDate) },
        { label: 'Hotel Address', value: normalizeValue(voucher.hotelAddress) },
        { label: 'No. Of Nights', value: normalizeValue(voucher.numberOfNights) },
        { label: 'Room Type', value: normalizeValue(voucher.roomType) },
        { label: 'Meal Plan', value: normalizeValue(voucher.mealPlan) },
        { label: 'No. Of Rooms', value: normalizeValue(voucher.numberOfRooms) },
        { label: 'Travellers', value: normalizeValue(voucher.travelerCount) },
    ], 4);

    const paymentY = bookingY + 116;
    drawSectionHeading(doc, 'Payment Summary', startX + 14, paymentY, contentWidth - 28);
    drawDetailGrid(doc, startX + 14, paymentY + 14, contentWidth - 28, [
        { label: 'Total Amount', value: formatCurrency(voucher.totalAmount) },
        { label: 'Payment Status', value: normalizeValue(voucher.paymentStatus) },
        { label: 'Paid Amount', value: formatCurrency(voucher.paidAmount) },
        { label: 'Balance Amount', value: formatCurrency(getBalance(voucher)) },
    ]);

    const footerY = bottomY - 76;
    const notesSections = buildNotesSections(voucher);
    const showNotes = notesSections.length > 0;
    const contentBottom = footerY - 12;
    let cursorY = paymentY + 80;

    if (showNotes) {
        const availableForNotes = Math.min(82, contentBottom - cursorY - 104);
        const notesHeight = drawTextSectionsBlock(
            doc,
            startX + 14,
            cursorY,
            contentWidth - 28,
            'Special Requests / Notes',
            notesSections,
            Math.max(68, availableForNotes),
            '#f97316'
        );
        cursorY += notesHeight + 12;
    }

    const termsHeight = Math.max(104, contentBottom - cursorY);
    drawTermsBlock(doc, startX + 14, cursorY, contentWidth - 28, termsHeight, voucher.terms);
    drawFooter(doc, startX + 14, footerY, contentWidth - 28, qrBuffer, voucher);

    doc.end();
}

module.exports = {
    streamVoucherPdf,
};
