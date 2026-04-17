const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

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

function normalizeDays(days = []) {
    return Array.isArray(days)
        ? days
            .map((day, index) => ({
                dayLabel: String(day?.dayLabel || `Day ${index + 1}`).trim(),
                title: String(day?.title || '').trim(),
                date: day?.date,
                location: String(day?.location || '').trim(),
                planSummary: String(day?.planSummary || '').trim(),
                stay: String(day?.stay || '').trim(),
                meals: String(day?.meals || '').trim(),
            }))
            .filter((day) => day.dayLabel || day.title || day.planSummary || day.location || day.stay || day.meals)
        : [];
}

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
        .text(label.toUpperCase(), x + 12, y + 10, {
            width: width - 24,
            characterSpacing: 1.1,
        });

    doc
        .font(FONT_BOLD)
        .fontSize(11.5)
        .fillColor('#111827')
        .text(normalizeValue(value), x + 12, y + 27, {
            width: width - 24,
            height: height - 35,
            ellipsis: true,
        });
}

function drawSectionHeading(doc, title, x, y, width) {
    doc
        .font(FONT_BOLD)
        .fontSize(10.5)
        .fillColor('#111827')
        .text(title, x, y);

    doc
        .moveTo(x + 94, y + 8)
        .lineTo(x + width, y + 8)
        .lineWidth(1)
        .strokeColor('#ebe5de')
        .stroke();
}

function drawDetailGrid(doc, x, y, width, fields, columns = 4) {
    const validFields = fields.filter(Boolean);
    const cellWidth = width / columns;
    const rows = Math.ceil(validFields.length / columns);
    const labelHeight = 16;
    const valueHeight = 20;

    validFields.forEach((field, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;
        const cellX = x + (col * cellWidth);
        const cellY = y + (row * (labelHeight + valueHeight));

        doc.save();
        doc.rect(cellX, cellY, cellWidth, labelHeight).fillAndStroke('#fff6ed', '#ecdcca');
        doc.rect(cellX, cellY + labelHeight, cellWidth, valueHeight).fillAndStroke('#ffffff', '#ecdcca');
        doc.restore();

        doc
            .font(FONT_BOLD)
            .fontSize(6.8)
            .fillColor('#8b5e34')
            .text(field.label.toUpperCase(), cellX + 8, cellY + 5, {
                width: cellWidth - 16,
                characterSpacing: 1.05,
                ellipsis: true,
            });

        doc
            .font(FONT_BOLD)
            .fontSize(10)
            .fillColor('#111827')
            .text(normalizeValue(field.value), cellX + 8, cellY + labelHeight + 5, {
                width: cellWidth - 16,
                height: valueHeight - 8,
                ellipsis: true,
            });
    });

    return rows * (labelHeight + valueHeight);
}

function ensureSpace(doc, state, requiredHeight, itinerary) {
    const footerLimit = doc.page.height - 48;
    if (state.y + requiredHeight <= footerLimit) {
        return;
    }

    doc.addPage();
    state.y = drawRepeatHeader(doc, itinerary);
}

function drawRepeatHeader(doc, itinerary) {
    const pageWidth = doc.page.width - 64;
    const x = 32;
    const y = 28;

    doc
        .rect(0, 0, doc.page.width, 12)
        .fill('#fed7aa');

    if (fs.existsSync(LOGO_PATH)) {
        doc.image(LOGO_PATH, x, y, { fit: [120, 34] });
    }

    doc
        .font(FONT_BOLD)
        .fontSize(10)
        .fillColor('#111827')
        .text('Travelative Travel Itinerary', x + 150, y + 4);

    doc
        .font(FONT_REGULAR)
        .fontSize(8.5)
        .fillColor('#6b7280')
        .text(normalizeValue(itinerary.itineraryNumber), x + pageWidth - 140, y + 4, {
            width: 140,
            align: 'right',
        });

    doc
        .moveTo(x, y + 44)
        .lineTo(x + pageWidth, y + 44)
        .lineWidth(1)
        .strokeColor('#ece2d7')
        .stroke();

    return y + 58;
}

function drawBulletsBlock(doc, x, y, width, title, values, emptyLabel) {
    const items = normalizeList(values);
    const bulletGap = 16;
    let currentY = y;

    doc
        .font(FONT_BOLD)
        .fontSize(10)
        .fillColor('#111827')
        .text(title, x, currentY, { width });
    currentY += 18;

    if (!items.length) {
        doc
            .font(FONT_REGULAR)
            .fontSize(9)
            .fillColor('#6b7280')
            .text(emptyLabel, x, currentY, { width });
        return currentY + 14;
    }

    items.forEach((item, index) => {
        doc
            .font(FONT_BOLD)
            .fontSize(8.5)
            .fillColor('#f97316')
            .text(`${index + 1}.`, x, currentY, { width: 12 });

        doc
            .font(FONT_REGULAR)
            .fontSize(9)
            .fillColor('#334155')
            .text(item, x + 16, currentY, { width: width - 16, lineGap: 2 });

        currentY += Math.max(bulletGap, doc.heightOfString(item, { width: width - 16, lineGap: 2, fontSize: 9 }) + 4);
    });

    return currentY;
}

function drawDayCard(doc, x, y, width, day) {
    const titleText = [normalizeValue(day.dayLabel, ''), normalizeValue(day.title, '')]
        .filter(Boolean)
        .join(' • ');
    const planText = normalizeValue(day.planSummary, 'Detailed activity flow will be shared here.');
    const planHeight = doc.heightOfString(planText, { width: width - 28, lineGap: 2 });
    const metadataHeight = 26;
    const extrasHeight = 28;
    const height = 66 + planHeight + metadataHeight + extrasHeight;

    drawRoundedPanel(doc, x, y, width, height, 20, '#ffffff', '#ead7c6');

    doc
        .font(FONT_BOLD)
        .fontSize(8)
        .fillColor('#f97316')
        .text(titleText || 'Day Plan', x + 14, y + 14, {
            width: width - 28,
            characterSpacing: 1.1,
        });

    doc
        .font(FONT_REGULAR)
        .fontSize(8.5)
        .fillColor('#64748b')
        .text(
            [normalizeValue(formatDate(day.date), ''), normalizeValue(day.location, '')]
                .filter((value) => value && value !== '-')
                .join(' • ') || 'Date and location can be added here.',
            x + 14,
            y + 28,
            { width: width - 28 }
        );

    doc
        .font(FONT_REGULAR)
        .fontSize(9.4)
        .fillColor('#1f2937')
        .text(planText, x + 14, y + 46, {
            width: width - 28,
            lineGap: 2,
        });

    const dividerY = y + 54 + planHeight;
    doc
        .moveTo(x + 14, dividerY)
        .lineTo(x + width - 14, dividerY)
        .lineWidth(1)
        .strokeColor('#f2e6d9')
        .stroke();

    doc
        .font(FONT_BOLD)
        .fontSize(7)
        .fillColor('#8b5e34')
        .text('Stay'.toUpperCase(), x + 14, dividerY + 10, { width: (width / 2) - 24, characterSpacing: 1 });

    doc
        .font(FONT_REGULAR)
        .fontSize(8.6)
        .fillColor('#111827')
        .text(normalizeValue(day.stay), x + 14, dividerY + 21, { width: (width / 2) - 24, height: 18, ellipsis: true });

    doc
        .font(FONT_BOLD)
        .fontSize(7)
        .fillColor('#8b5e34')
        .text('Meals'.toUpperCase(), x + (width / 2), dividerY + 10, { width: (width / 2) - 24, characterSpacing: 1 });

    doc
        .font(FONT_REGULAR)
        .fontSize(8.6)
        .fillColor('#111827')
        .text(normalizeValue(day.meals), x + (width / 2), dividerY + 21, { width: (width / 2) - 24, height: 18, ellipsis: true });

    return height;
}

async function streamItineraryPdf(res, itineraryInput) {
    const itinerary = {
        ...itineraryInput,
        inclusions: normalizeList(itineraryInput.inclusions),
        exclusions: normalizeList(itineraryInput.exclusions),
        importantNotes: normalizeList(itineraryInput.importantNotes),
        dayPlans: normalizeDays(itineraryInput.dayPlans),
    };

    const fileName = `${normalizeValue(itinerary.itineraryNumber, 'travelative-itinerary')
        .replace(/[^\w\-]+/g, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 32, right: 32, bottom: 32, left: 32 },
        autoFirstPage: true,
        bufferPages: false,
    });

    if (fs.existsSync(ARIAL_REGULAR_PATH)) {
        doc.registerFont(FONT_REGULAR, ARIAL_REGULAR_PATH);
    }
    if (fs.existsSync(ARIAL_BOLD_PATH)) {
        doc.registerFont(FONT_BOLD, ARIAL_BOLD_PATH);
    }

    doc.pipe(res);

    const state = { y: 32 };
    const pageWidth = doc.page.width - 64;
    const startX = 32;

    doc
        .rect(0, 0, doc.page.width, 12)
        .fill('#fed7aa');

    drawRoundedPanel(doc, startX, state.y, pageWidth, 126, 28, '#fffaf2', '#ecdac8');

    if (fs.existsSync(LOGO_PATH)) {
        doc.image(LOGO_PATH, startX + 20, state.y + 20, { fit: [230, 72] });
    }

    doc
        .font(FONT_BOLD)
        .fontSize(11)
        .fillColor('#f97316')
        .text('TRAVEL ITINERARY', startX + 20, state.y + 70, {
            width: 280,
            characterSpacing: 2.2,
        });

    doc
        .font(FONT_BOLD)
        .fontSize(24)
        .fillColor('#0f172a')
        .text(normalizeValue(itinerary.packageTitle, 'Travelative Journey Plan'), startX + 20, state.y + 88, {
            width: pageWidth - 300,
            height: 30,
            ellipsis: true,
        });

    drawRoundedPanel(doc, startX + pageWidth - 220, state.y + 18, 190, 86, 22, '#ffffff', '#ead7c6');

    doc
        .font(FONT_BOLD)
        .fontSize(9)
        .fillColor('#2563eb')
        .text(BUSINESS_DETAILS.companyName.toUpperCase(), startX + pageWidth - 202, state.y + 30, { width: 150 });

    doc
        .font(FONT_BOLD)
        .fontSize(8.5)
        .fillColor('#111827')
        .text(BUSINESS_DETAILS.officeLocation, startX + pageWidth - 202, state.y + 48, { width: 150, ellipsis: true });

    doc
        .font(FONT_REGULAR)
        .fontSize(7.6)
        .fillColor('#374151')
        .text(`Contact: ${BUSINESS_DETAILS.contacts.join(' | ')}`, startX + pageWidth - 202, state.y + 62, {
            width: 160,
            ellipsis: true,
        })
        .text(`Email: ${BUSINESS_DETAILS.email}`, startX + pageWidth - 202, state.y + 74, {
            width: 160,
            ellipsis: true,
        })
        .text(`Website: ${BUSINESS_DETAILS.website}`, startX + pageWidth - 202, state.y + 86, {
            width: 160,
            ellipsis: true,
        });

    state.y += 144;

    const summaryWidth = (pageWidth - 24) / 4;
    drawInfoCard(doc, startX, state.y, summaryWidth, 52, 'Itinerary No.', itinerary.itineraryNumber, '#f97316');
    drawInfoCard(doc, startX + summaryWidth + 8, state.y, summaryWidth, 52, 'Issue Date', formatDate(itinerary.issueDate), '#2563eb');
    drawInfoCard(doc, startX + (summaryWidth * 2) + 16, state.y, summaryWidth, 52, 'Destination', itinerary.destination, '#f97316');
    drawInfoCard(doc, startX + (summaryWidth * 3) + 24, state.y, summaryWidth, 52, 'Duration', itinerary.durationLabel, '#2563eb');
    state.y += 70;

    drawSectionHeading(doc, 'Traveler Details', startX, state.y, pageWidth);
    state.y += 18;
    state.y += drawDetailGrid(doc, startX, state.y, pageWidth, [
        { label: 'Traveler Name', value: itinerary.travelerName },
        { label: 'Primary Contact', value: itinerary.travelerPhone },
        { label: 'Email', value: itinerary.travelerEmail },
        { label: 'Alternate Contact', value: itinerary.alternateContact },
    ], 4);
    state.y += 18;

    drawSectionHeading(doc, 'Trip Essentials', startX, state.y, pageWidth);
    state.y += 18;
    state.y += drawDetailGrid(doc, startX, state.y, pageWidth, [
        { label: 'Start Date', value: formatDate(itinerary.travelStartDate) },
        { label: 'End Date', value: formatDate(itinerary.travelEndDate) },
        { label: 'Traveler Count', value: itinerary.travelerCount },
        { label: 'Pickup Point', value: itinerary.pickupPoint },
        { label: 'Drop Point', value: itinerary.dropPoint },
        { label: 'Hotel Summary', value: itinerary.hotelSummary },
        { label: 'Transport', value: itinerary.transportSummary },
        { label: 'Tour Focus', value: itinerary.destination },
    ], 4);
    state.y += 18;

    if (itinerary.overview) {
        const overviewHeight = doc.heightOfString(itinerary.overview, { width: pageWidth - 28, lineGap: 3, fontSize: 10 }) + 34;
        ensureSpace(doc, state, overviewHeight + 14, itinerary);
        drawRoundedPanel(doc, startX, state.y, pageWidth, overviewHeight, 22, '#ffffff', '#ead7c6');
        doc
            .font(FONT_BOLD)
            .fontSize(10)
            .fillColor('#111827')
            .text('Trip Overview', startX + 16, state.y + 14, { width: pageWidth - 32 });
        doc
            .font(FONT_REGULAR)
            .fontSize(9.5)
            .fillColor('#334155')
            .text(itinerary.overview, startX + 16, state.y + 32, { width: pageWidth - 32, lineGap: 3 });
        state.y += overviewHeight + 14;
    }

    ensureSpace(doc, state, 36, itinerary);
    drawSectionHeading(doc, 'Day Wise Itinerary', startX, state.y, pageWidth);
    state.y += 22;

    const days = itinerary.dayPlans.length ? itinerary.dayPlans : [{ dayLabel: 'Day 1', planSummary: 'Detailed plan will be added here.' }];
    days.forEach((day) => {
        const planHeight = doc.heightOfString(normalizeValue(day.planSummary, 'Detailed activity flow will be shared here.'), { width: pageWidth - 60, lineGap: 2, fontSize: 9.4 });
        const estimatedHeight = 120 + planHeight;
        ensureSpace(doc, state, estimatedHeight + 12, itinerary);
        state.y += drawDayCard(doc, startX, state.y, pageWidth, day) + 12;
    });

    const blocks = [
        { title: 'Inclusions', values: itinerary.inclusions, emptyLabel: 'No inclusions added.' },
        { title: 'Exclusions', values: itinerary.exclusions, emptyLabel: 'No exclusions added.' },
        { title: 'Important Notes', values: itinerary.importantNotes, emptyLabel: 'No additional notes added.' },
    ];

    blocks.forEach((block) => {
        const values = normalizeList(block.values);
        const contentText = values.length ? values.map((value, index) => `${index + 1}. ${value}`).join('\n') : block.emptyLabel;
        const estimatedHeight = doc.heightOfString(contentText, { width: pageWidth - 16, lineGap: 3, fontSize: 9 }) + 32;
        ensureSpace(doc, state, estimatedHeight + 12, itinerary);
        drawRoundedPanel(doc, startX, state.y, pageWidth, estimatedHeight, 20, '#ffffff', '#ead7c6');
        state.y = drawBulletsBlock(doc, startX + 16, state.y + 14, pageWidth - 32, block.title, values, block.emptyLabel) + 14;
    });

    ensureSpace(doc, state, 54, itinerary);
    doc
        .moveTo(startX, state.y + 6)
        .lineTo(startX + pageWidth, state.y + 6)
        .lineWidth(1)
        .strokeColor('#eadfd2')
        .stroke();

    doc
        .font(FONT_BOLD)
        .fontSize(8)
        .fillColor('#8b5e34')
        .text('Authorized By'.toUpperCase(), startX, state.y + 16, { width: 160, characterSpacing: 1.1 })
        .text('Support'.toUpperCase(), startX + 220, state.y + 16, { width: 160, characterSpacing: 1.1 });

    doc
        .font(FONT_BOLD)
        .fontSize(10.5)
        .fillColor('#111827')
        .text(normalizeValue(itinerary.authorizedBy), startX, state.y + 30, { width: 180, ellipsis: true })
        .text(normalizeValue(itinerary.customerSupport || BUSINESS_DETAILS.contacts[0]), startX + 220, state.y + 30, {
            width: 180,
            ellipsis: true,
        });

    doc.end();
}

module.exports = {
    streamItineraryPdf,
};
