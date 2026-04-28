// modules/estimate/estimatePDF.js
(function() {
  async function generateEstimatePDF(estimateItems) {
    if (!estimateItems || estimateItems.length === 0) {
      alert('Нет данных для печати. Добавьте работы.');
      return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    doc.setFont("DejaVuSans", "normal");
    
    const pageWidth = 210;
    const leftMargin = 20;
    const rightMargin = 20;
    const contentWidth = pageWidth - leftMargin - rightMargin;
    let y = 25;
    
    // Заголовок
    doc.setFontSize(16);
    doc.text('СМЕТА РАБОТ', pageWidth / 2, y, { align: 'center' });
    y += 10;
    
    // Дата
    doc.setFontSize(10);
    const today = new Date();
    const dateStr = today.toLocaleDateString('ru-RU');
    doc.text(`Дата: ${dateStr}`, leftMargin, y);
    y += 12;
    
    const columns = ['№', 'Наименование работ', 'Кол-во', 'Ед.', 'Цена', 'Сумма'];
    const colWidths = [12, 80, 18, 15, 25, 30];
    let startX = leftMargin;
    let currentX = startX;
    const rowHeight = 8;
    
    function drawRow(yPos, data, isHeader = false) {
      currentX = startX;
      const cells = isHeader ? columns : data;
      for (let i = 0; i < cells.length; i++) {
        doc.rect(currentX, yPos, colWidths[i], rowHeight);
        doc.text(cells[i], currentX + 2, yPos + 5);
        currentX += colWidths[i];
      }
      return yPos + rowHeight;
    }
    
    doc.setFillColor(240, 240, 240);
    doc.rect(startX, y, contentWidth, rowHeight, 'F');
    doc.setFontSize(10);
    y = drawRow(y, null, true);
    doc.setFontSize(9);
    
    let grandTotal = 0;
    for (let i = 0; i < estimateItems.length; i++) {
      const item = estimateItems[i];
      grandTotal += item.total;
      if (y + rowHeight > 280) {
        doc.addPage();
        y = 25;
        doc.setFillColor(240, 240, 240);
        doc.rect(startX, y, contentWidth, rowHeight, 'F');
        doc.setFontSize(10);
        y = drawRow(y, null, true);
        doc.setFontSize(9);
      }
      let name = item.name.length > 45 ? item.name.substring(0, 42) + '...' : item.name;
      y = drawRow(y, [
        (i + 1).toString(), name, item.quantity.toString(), item.unit,
        `${item.price.toLocaleString()} ₽`, `${item.total.toLocaleString()} ₽`
      ]);
    }
    
    y += 6;
    doc.setFontSize(11);
    doc.text(`ИТОГО: ${grandTotal.toLocaleString()} ₽`, pageWidth - rightMargin - 50, y);
    doc.save(`Смета_${Date.now()}.pdf`);
  }

  window.EstimatePDF = { generateEstimatePDF };
})();