// cabinet/contract.js
(function() {
  const contractForm = document.getElementById('contract-form');
  if (!contractForm) return;

  // --- Установка текущей даты ---
  const dateField = document.getElementById('contract-date');
  if (dateField) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    dateField.value = `${yyyy}-${mm}-${dd}`;
  }

  // --- Валидация дат: начало и окончание работ ---
  const startDateField = document.getElementById('contract-start-date');
  const endDateField = document.getElementById('contract-end-date');
  const contractDateField = document.getElementById('contract-date');

  function updateDates() {
    const contractDate = contractDateField.value;
    if (contractDate) {
      if (!startDateField.value || startDateField.value < contractDate) {
        startDateField.value = contractDate;
      }
      if (!endDateField.value || endDateField.value < startDateField.value) {
        const endDate = new Date(startDateField.value);
        endDate.setDate(endDate.getDate() + 7);
        endDateField.value = endDate.toISOString().split('T')[0];
      }
    }
  }

  contractDateField.addEventListener('change', updateDates);
  startDateField.addEventListener('change', function() {
    const contractDate = contractDateField.value;
    if (this.value < contractDate) {
      alert('Дата начала работ не может быть раньше даты договора');
      this.value = contractDate;
      updateDates();
    }
  });
  endDateField.addEventListener('change', function() {
    if (this.value < startDateField.value) {
      alert('Дата окончания не может быть раньше даты начала работ');
      this.value = startDateField.value;
      updateDates();
    }
  });
  updateDates();

  // --- Работа с номером договора ---
  function getCurrentContractNumber() {
    let num = localStorage.getItem('current_contract_number');
    if (!num) num = 1;
    else num = parseInt(num);
    return num;
  }

  window.incrementContractNumber = function() {
    let num = getCurrentContractNumber();
    localStorage.setItem('current_contract_number', num + 1);
  };

  // --- Утилиты ---
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
  }

  function formatContractDate(value) {
    if (!value) {
        return '';
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-');
        return `${day}.${month}.${year}`;
    }
    return value;
  }

  // --- Перевод суммы в пропись ---
  function numberToWords(amount) {
    const num = Math.floor(amount);
    
    const units = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
    const unitsFemale = ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
    const teens = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
    const tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
    const hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];
    
    function convertThreeDigits(n, isFemale = false) {
      let result = [];
      const h = Math.floor(n / 100);
      const t = Math.floor((n % 100) / 10);
      const u = n % 10;
      
      if (h > 0) result.push(hundreds[h]);
      if (t === 1) {
        result.push(teens[u]);
      } else {
        if (t > 1) result.push(tens[t]);
        if (u > 0) result.push(isFemale ? unitsFemale[u] : units[u]);
      }
      return result.join(' ');
    }
    
    const billions = Math.floor(num / 1000000000);
    const millions = Math.floor((num % 1000000000) / 1000000);
    const thousands = Math.floor((num % 1000000) / 1000);
    const rest = num % 1000;
    
    let words = [];
    
    if (billions > 0) {
      const lastDigit = billions % 10;
      const lastTwo = billions % 100;
      let unitWord = '';
      if (lastTwo >= 11 && lastTwo <= 19) unitWord = 'миллиардов';
      else if (lastDigit === 1) unitWord = 'миллиард';
      else if (lastDigit >= 2 && lastDigit <= 4) unitWord = 'миллиарда';
      else unitWord = 'миллиардов';
      words.push(convertThreeDigits(billions));
      words.push(unitWord);
    }
    
    if (millions > 0) {
      const lastDigit = millions % 10;
      const lastTwo = millions % 100;
      let unitWord = '';
      if (lastTwo >= 11 && lastTwo <= 19) unitWord = 'миллионов';
      else if (lastDigit === 1) unitWord = 'миллион';
      else if (lastDigit >= 2 && lastDigit <= 4) unitWord = 'миллиона';
      else unitWord = 'миллионов';
      words.push(convertThreeDigits(millions));
      words.push(unitWord);
    }
    
    if (thousands > 0) {
      const lastDigit = thousands % 10;
      const lastTwo = thousands % 100;
      let unitWord = '';
      if (lastTwo >= 11 && lastTwo <= 19) unitWord = 'тысяч';
      else if (lastDigit === 1) unitWord = 'тысяча';
      else if (lastDigit >= 2 && lastDigit <= 4) unitWord = 'тысячи';
      else unitWord = 'тысяч';
      words.push(convertThreeDigits(thousands, true));
      words.push(unitWord);
    }
    
    if (rest > 0) {
      const lastDigit = rest % 10;
      const lastTwo = rest % 100;
      let unitWord = '';
      if (lastTwo >= 11 && lastTwo <= 19) unitWord = 'рублей';
      else if (lastDigit === 1) unitWord = 'рубль';
      else if (lastDigit >= 2 && lastDigit <= 4) unitWord = 'рубля';
      else unitWord = 'рублей';
      words.push(convertThreeDigits(rest));
      words.push(unitWord);
    } else if (words.length === 0) {
      words.push('ноль рублей');
    }
    
    let result = words.join(' ');
    result = result.charAt(0).toUpperCase() + result.slice(1);
    return result;
  }

  // --- Валидация ---
  function showError(input, message) {
    input.classList.add('border-red-500');
    const parent = input.parentElement;
    const errorDiv = parent.querySelector('.error-message');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove('hidden');
    }
  }

  function clearError(input) {
    input.classList.remove('border-red-500');
    const parent = input.parentElement;
    const errorDiv = parent.querySelector('.error-message');
    if (errorDiv) errorDiv.classList.add('hidden');
  }

  function validateContractForm() {
    let isValid = true;
    const required = [
      'contract-customer-fullname', 'contract-customer-passport-series',
      'contract-customer-passport-number', 'contract-customer-passport-issued-by',
      'contract-customer-address', 'contract-work-address',
      'contract-date', 'contract-start-date', 'contract-end-date', 'contract-price'
    ];
    required.forEach(id => {
      const el = document.getElementById(id);
      if (!el || !el.value.trim()) {
        showError(el, 'Заполните это поле');
        isValid = false;
      } else {
        clearError(el);
      }
    });

    const series = document.getElementById('contract-customer-passport-series');
    if (series && !/^\d{4}$/.test(series.value.trim())) {
      showError(series, 'Введите 4 цифры');
      isValid = false;
    }

    const number = document.getElementById('contract-customer-passport-number');
    if (number && !/^\d{6}$/.test(number.value.trim())) {
      showError(number, 'Введите 6 цифр');
      isValid = false;
    }

    const price = document.getElementById('contract-price');
    if (price && parseFloat(price.value) <= 0) {
      showError(price, 'Введите положительную сумму');
      isValid = false;
    }

    return isValid;
  }

  // --- Профиль мастера ---
  function getMasterProfile() {
    const saved = localStorage.getItem('master_profile');
    if (saved) return JSON.parse(saved);
    return {
      city: 'Новосибирск',
      fullname: '',
      passport_series: '',
      passport_number: '',
      passport_issued_by: '',
      phone: ''
    };
  }

  // --- Генерация PDF через jsPDF с поддержкой кириллицы ---
  async function generateContractPDF(contractData) {
  const { jsPDF } = window.jspdf;
  
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait'
  });
  
  // Используем шрифт ArialUnicode (уже зарегистрирован через подключённый ArialUnicode.js)
  doc.setFont("DejaVuSans");
  
  const pageWidth = 210;
  const leftMargin = 20;
  const maxTextWidth = pageWidth - leftMargin - leftMargin;
  let y = 25;
  
  function addWrappedText(text, fontSize, x, y, maxWidth = maxTextWidth) {
    doc.setFontSize(fontSize);
    doc.setFont('DejaVuSans');
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * (fontSize * 0.4));
  }
  
  function addTitle(text, y) {
    doc.setFontSize(14);
    doc.setFont('DejaVuSans', 'normal');
    const textWidth = doc.getTextWidth(text);
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, y);
    return y + 8;
  }
  
  function addParagraph(text, y, indent = 0) {
    return addWrappedText(text, 11, leftMargin + indent, y);
  }
  
  // Заголовок
  y = addTitle(`ДОГОВОР ВОЗМЕЗДНОГО ОКАЗАНИЯ УСЛУГ № ${contractData.contractNumber}`, y);
  y += 5;
  
  // Город и дата
  y = addParagraph(`г. ${contractData.city} «${formatDate(contractData.contractDate)}» 2026 г.`, y);
  y += 5;
  
  // Стороны
  y = addParagraph(`${contractData.customerFullname}, именуемый в дальнейшем "Заказчик", и ${contractData.executorFullname}, именуемый в дальнейшем "Исполнитель", заключили настоящий договор о нижеследующем.`, y);
  y += 10;
  
  // Пункт 1
  y = addTitle('1. ПРЕДМЕТ ДОГОВОРА', y);
  y += 3;
  y = addParagraph(`1.1. На условиях, в порядке и в сроки, которые определены Сторонами в Договоре возмездного оказания услуг, Исполнитель обязуется оказать Заказчику услуги, указанные в п. 1.2 настоящего договора, а Заказчик обязуется оплатить заказанные услуги.`, y);
  y = addParagraph(`1.2. Исполнитель обязуется оказать следующие услуги, именуемые в дальнейшем "Услуги": ремонтные работы по адресу: ${contractData.workAddress} в соответствии со сметой (приложение №1 к договору), которая является неотъемлемой частью данного договора.`, y);
  y = addParagraph(`1.3. Срок выполнения работ: с ${formatDate(contractData.startDate)} г. до ${formatDate(contractData.endDate)} г. Исполнитель имеет право выполнить работы досрочно.`, y);
  y = addParagraph(`1.4. Услуги считаются оказанными после подписания акта приема-сдачи Услуг Заказчиком или его уполномоченным представителем.`, y);
  y += 8;
  
  // Пункт 2
  y = addTitle('2. ПРАВА И ОБЯЗАННОСТИ СТОРОН', y);
  y += 3;
  y = addParagraph(`2.1. Исполнитель обязуется:`, y);
  y = addParagraph(`2.1.1. Оказать Услуги надлежащего качества.`, y, 5);
  y = addParagraph(`2.1.2. Оказать Услуги в полном объеме и в срок, указанный в п. 1.3. настоящего договора.`, y, 5);
  y = addParagraph(`2.1.3. По требованию Заказчика безвозмездно исправить все выявленные недостатки, в течение 10 дней.`, y, 5);
  y = addParagraph(`2.1.4. Исполнитель обязан выполнить работу лично или нанимая других специалистов.`, y, 5);
  y = addParagraph(`2.2. Заказчик обязан:`, y);
  y = addParagraph(`2.2.1. Заказчик обязан оплатить работу по цене, указанной в п. 3 настоящего договора, в течение 1 (один) дня с момента подписания акта приема-сдачи Услуг.`, y, 5);
  y = addParagraph(`2.3. Заказчик имеет право:`, y);
  y = addParagraph(`2.3.1. Во всякое время проверять ход и качество работы, выполняемой Исполнителем, не вмешиваясь в его деятельность.`, y, 5);
  y = addParagraph(`2.3.2. Отказаться от исполнения договора в любое время (но известив заранее не менее чем за 24 часа) до подписания акта, уплатив Исполнителю часть установленной цены пропорционально части оказанных Услуг.`, y, 5);
  y += 8;
  
  // Пункт 3
  y = addTitle('3. ЦЕНА ДОГОВОРА И ПОРЯДОК РАСЧЁТОВ', y);
  y += 3;
  const priceText = `${Number(contractData.price).toLocaleString('ru-RU')} (${numberToWords(contractData.price)})`;
  y = addParagraph(`3.1. Цена настоящего договора составляет ${priceText}, согласно сметы (Приложение 1 к договору). Стоимость материалов в вознаграждение Исполнителю не входит.`, y);
  
  if (contractData.materialsIncluded) {
    y = addParagraph(`3.1.2. В Смету включены также материалы согласно Приложению №1. Стоимость материалов указывается отдельной строкой.`, y);
    y = addParagraph(`3.2.1. Закупка материалов осуществляется Исполнителем, стоимость материалов возмещается Заказчиком на основании чеков.`, y);
  } else {
    y = addParagraph(`3.1.2. Материалы в стоимость работ НЕ включены. Закупка материалов производится Заказчиком самостоятельно или по согласованию Сторон.`, y);
  }
  
  y = addParagraph(`3.3. Уплата Заказчиком Исполнителю цены договора осуществляется путем перечисления средств на расчетный счет Исполнителя, указанный в настоящем договоре, или наличными, а Исполнитель выдает чек на полученные денежные суммы.`, y);
  y = addParagraph(`3.4. Оплата производится этапами:`, y);
  y = addParagraph(`3.4.1. В течение первых двух дней и далее за каждый выполненный пункт сметы с момента начала работ Заказчик оплачивает наличными или на указанный в реквизитах счет.`, y, 5);
  y = addParagraph(`3.4.2. Дальнейшая оплата работ производится по ходу работ поэтапно по согласованию, после подписания Сторонами акта приема-сдачи Услуг.`, y, 5);
  y += 8;
  
  // Пункт 4
  y = addTitle('4. ОТВЕТСТВЕННОСТЬ СТОРОН', y);
  y += 3;
  y = addParagraph(`4.1. За нарушение срока оказания Услуг, указанного в п. 1.3 настоящего договора, Исполнитель уплачивает Заказчику штраф в размере 0,03% от суммы договора за каждый день просрочки.`, y);
  y = addParagraph(`4.2. Меры ответственности сторон, не предусмотренные в настоящем договоре, применяются в соответствии с нормами гражданского законодательства, действующего на территории России.`, y);
  y = addParagraph(`4.3. Уплата неустойки не освобождает Исполнителя от выполнения лежащих на нем обязательств или устранения нарушений.`, y);
  y += 8;
  
  // Пункт 5
  y = addTitle('5. ПОРЯДОК РАЗРЕШЕНИЯ СПОРОВ', y);
  y += 3;
  y = addParagraph(`5.1. Споры и разногласия, которые могут возникнуть при исполнении настоящего договора, будут по возможности разрешаться путем переговоров между сторонами.`, y);
  y = addParagraph(`5.2. В случае невозможности разрешения споров путем переговоров стороны после реализации предусмотренной законодательством процедуры досудебного урегулирования разногласий передают их на рассмотрение в суде.`, y);
  y += 8;
  
  // Пункт 6
  y = addTitle('6. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ', y);
  y += 3;
  y = addParagraph(`6.1. Любые изменения и дополнения к настоящему договору действительны лишь при условии, что они совершены в письменной форме и подписаны уполномоченными на то представителями сторон. Приложения к настоящему договору составляют его неотъемлемую часть.`, y);
  y = addParagraph(`6.2. Настоящий договор составлен в двух экземплярах на русском языке. Оба экземпляра идентичны и имеют одинаковую силу. У каждой из сторон находится один экземпляр настоящего договора.`, y);
  y += 8;
  
  // Пункт 7
  y = addTitle('7. ГАРАНТИЙНЫЕ ОБЯЗАТЕЛЬСТВА', y);
  y += 3;
  y = addParagraph(`7.1. Исполнитель дает гарантию на свою работу 1 год (12 месяцев) после подписания акта приема выполненных работ.`, y);
  y += 8;
  
  // Пункт 8
  y = addTitle('8. ПРИЛОЖЕНИЯ', y);
  y += 3;
  y = addParagraph(`8.1. Приложение №1 к договору №${contractData.contractNumber}: смета работ.`, y);
  y += 12;
  
  // Подписи
  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  
  doc.setFontSize(11);
  doc.setFont("DejaVuSans");
  doc.text('9. АДРЕСА, РЕКВИЗИТЫ И ПОДПИСИ СТОРОН', leftMargin, y);
  y += 8;
  
  doc.text('ЗАКАЗЧИК:', leftMargin, y);
  doc.text(`${contractData.customerFullname}`, leftMargin + 40, y);
  y += 7;
  doc.text(`Паспорт: ${contractData.customerPassportSeries} ${contractData.customerPassportNumber}`, leftMargin + 40, y);
  y += 7;
  doc.text(`Выдан: ${contractData.customerPassportIssuedBy}`, leftMargin + 40, y);
  y += 7;
  doc.text(`Адрес: ${contractData.customerAddress}`, leftMargin + 40, y);
  y += 7;
  doc.text(`Телефон: ${contractData.customerPhone}`, leftMargin + 40, y);
  y += 20;
  
  doc.text('ИСПОЛНИТЕЛЬ:', leftMargin, y);
  doc.text(`${contractData.executorFullname}`, leftMargin + 40, y);
  y += 7;
  doc.text(`Паспорт: ${contractData.executorPassportSeries} ${contractData.executorPassportNumber}`, leftMargin + 40, y);
  y += 7;
  doc.text(`Выдан: ${contractData.executorPassportIssuedBy}`, leftMargin + 40, y);
  y += 7;
  doc.text(`Телефон: ${contractData.executorPhone}`, leftMargin + 40, y);
  y += 20;
  
  doc.text('______________/______________', leftMargin, y);
  doc.text('______________/______________', leftMargin + 100, y);
  
  doc.save(`Договор_${contractData.contractNumber}.pdf`);
}

  // --- Обработка отправки формы ---
  contractForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateContractForm()) {
      alert('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    const master = getMasterProfile();
    const contractNumber = getCurrentContractNumber().toString().padStart(4, '0');

    const contractData = {
      contractNumber: contractNumber,
      city: master.city || 'Новосибирск',
      contractDate: document.getElementById('contract-date').value,
      customerFullname: document.getElementById('contract-customer-fullname').value,
      customerPassportSeries: document.getElementById('contract-customer-passport-series').value,
      customerPassportNumber: document.getElementById('contract-customer-passport-number').value,
      customerPassportIssuedBy: document.getElementById('contract-customer-passport-issued-by').value,
      customerAddress: document.getElementById('contract-customer-address').value,
      customerPhone: document.getElementById('contract-customer-phone').value,
      workAddress: document.getElementById('contract-work-address').value,
      startDate: document.getElementById('contract-start-date').value,
      endDate: document.getElementById('contract-end-date').value,
      price: parseFloat(document.getElementById('contract-price').value),
      materialsIncluded: document.getElementById('contract-materials-included')?.checked || false,
      executorFullname: master.fullname || 'Исполнитель',
      executorPassportSeries: master.passport_series || '',
      executorPassportNumber: master.passport_number || '',
      executorPassportIssuedBy: master.passport_issued_by || '',
      executorPhone: master.phone || ''
    };

    generateContractPDF(contractData);
  });
})();