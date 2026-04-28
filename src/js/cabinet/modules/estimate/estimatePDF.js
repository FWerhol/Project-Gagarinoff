// modules/estimate/estimatePDF.js
(function() {
  function generateEstimatePDF(estimateItems) {
    if (!estimateItems || estimateItems.length === 0) {
      alert('Нет данных для печати. Добавьте работы.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    doc.setFont('DejaVuSans', 'normal');

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const leftMargin = 15;
    const rightMargin = 15;
    const topMargin = 16;
    const bottomMargin = 14;
    const contentWidth = pageWidth - leftMargin - rightMargin;
    const rowBaseHeight = 6;

    const columns = ['№', 'Наименование работ', 'Кол-во', 'Ед.', 'Цена (₽)', 'Сумма (₽)'];
    const colWidths = [12, 72, 18, 12, 26, 30];
    const numberCols = { 0: true, 2: true, 4: true, 5: true };

    let currentY = topMargin;
    let grandTotal = 0;
    let groupCounter = 0;
    let workCounter = 0;
    let workRowsCount = 0;

    function drawHeader() {
      const now = new Date();
      const dateStr = now.toLocaleDateString('ru-RU');
      const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

      doc.setFontSize(14);
      doc.text('СМЕТА РАБОТ', pageWidth / 2, topMargin + 7, { align: 'center' });
      doc.setFontSize(8.8);
      doc.text(`Дата формирования: ${dateStr} ${timeStr}`, leftMargin, topMargin + 13);
      doc.text(`Статус: черновой расчет`, pageWidth - rightMargin, topMargin + 13, { align: 'right' });

      currentY = topMargin + 22;
    }

    function drawTableHeader() {
      let x = leftMargin;
      const height = 7;

      doc.setFillColor(242, 242, 242);
      doc.rect(leftMargin, currentY, contentWidth, height, 'F');
      doc.setFontSize(8.8);

      for (let i = 0; i < columns.length; i++) {
        const textX = numberCols[i] ? x + colWidths[i] - 2 : x + 2;
        doc.text(columns[i], textX, currentY + 4.5, { align: numberCols[i] ? 'right' : 'left' });
        x += colWidths[i];
      }

      currentY += height;
    }

    function rowHeightByCells(cells, fontSize) {
      doc.setFontSize(fontSize);
      let maxHeight = rowBaseHeight;
      for (let i = 0; i < cells.length; i++) {
        const lines = doc.splitTextToSize(String(cells[i]), colWidths[i] - 4);
        const h = Math.max(rowBaseHeight, lines.length * 4.5 + 1.5);
        if (h > maxHeight) maxHeight = h;
      }
      return maxHeight;
    }

    function ensurePageSpace(requiredHeight) {
      if (currentY + requiredHeight <= pageHeight - bottomMargin) return;
      doc.addPage();
      currentY = topMargin;
      drawHeader();
      drawTableHeader();
    }

    function drawCellsRow(cells, options) {
      const { fontSize, fillColor } = options;
      const rowHeight = rowHeightByCells(cells, fontSize);
      ensurePageSpace(rowHeight);

      let x = leftMargin;
      doc.setFontSize(fontSize);
      if (fillColor) {
        doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
        doc.rect(leftMargin, currentY, contentWidth, rowHeight, 'F');
      }

      for (let i = 0; i < cells.length; i++) {
        const cellText = String(cells[i]);
        const lines = doc.splitTextToSize(cellText, colWidths[i] - 4);

        const totalTextHeight = lines.length * 4.5;
        let textY = currentY + (rowHeight - totalTextHeight) / 2 + 3.6;
        for (let j = 0; j < lines.length; j++) {
          const textX = numberCols[i] ? x + colWidths[i] - 2 : x + 2;
          doc.text(lines[j], textX, textY, { align: numberCols[i] ? 'right' : 'left' });
          textY += 4.5;
        }

        x += colWidths[i];
      }

      currentY += rowHeight;
    }

    function drawGroupRow(groupName) {
      const cells = ['', `Раздел: ${groupName}`, '', '', '', ''];
      drawCellsRow(cells, { fontSize: 8.8, fillColor: [247, 247, 247] });
    }

    function drawWorkRow(item) {
      workCounter++;
      workRowsCount++;
      grandTotal += item.total;
      const workNumber = groupCounter > 0 ? `${groupCounter}.${workCounter}` : `${workCounter}`;
      const cells = [
        workNumber,
        item.name,
        item.quantity.toLocaleString('ru-RU'),
        item.unit,
        item.price.toLocaleString('ru-RU'),
        item.total.toLocaleString('ru-RU')
      ];

      const zebra = workRowsCount % 2 === 0 ? [250, 250, 250] : null;
      drawCellsRow(cells, { fontSize: 8.6, fillColor: zebra });
    }

    function drawTotalBlock() {
      const blockHeight = 16;
      ensurePageSpace(blockHeight + 2);

      const blockWidth = 72;
      const x = pageWidth - rightMargin - blockWidth;

      doc.setFillColor(255, 255, 255);
      doc.rect(x, currentY + 2, blockWidth, blockHeight, 'F');

      doc.setFontSize(8.8);
      doc.text(`Позиции: ${workRowsCount}`, x + 3, currentY + 8);
      doc.setFontSize(11);
      doc.text('ИТОГО:', x + 3, currentY + 15);
      doc.text(`${grandTotal.toLocaleString('ru-RU')} ₽`, x + blockWidth - 3, currentY + 15, { align: 'right' });

      currentY += blockHeight + 4;
    }

    function drawFooters() {
      const pages = doc.getNumberOfPages();
      doc.setFontSize(8);
      for (let p = 1; p <= pages; p++) {
        doc.setPage(p);
        doc.setTextColor(110, 110, 110);
        doc.text(`Стр. ${p} из ${pages}`, pageWidth - rightMargin, pageHeight - 6, { align: 'right' });
        doc.text('Сформировано в личном кабинете', leftMargin, pageHeight - 6);
      }
      doc.setTextColor(0, 0, 0);
    }

    drawHeader();
    drawTableHeader();

    for (let i = 0; i < estimateItems.length; i++) {
      const item = estimateItems[i];
      if (item.type === 'group') {
        groupCounter++;
        workCounter = 0;
        drawGroupRow(item.name);
      } else if (item.type === 'work') {
        drawWorkRow(item);
      }
    }

    drawTotalBlock();
    drawFooters();

    doc.save(`Смета_${Date.now()}.pdf`);
  }

  window.EstimatePDF = {
    generateEstimatePDF
  };
})();