# Модуль "Смета работ" (estimate)

## Назначение
Позволяет мастеру создавать смету:
- выбирать работы из базы знаний
- добавлять свои работы и свои разделы
- создавать группы работ внутри сметы
- указывать количество, корректировать цену и единицы измерения
- сохранять/загружать смету в `localStorage`
- распечатывать смету в PDF
- удалять позиции и группы

## Зависимости
- **`base-knowledge.js`** — глобальная база знаний (категории и виды работ) из `src/js/data/base-knowledge.js`
- **`localStorage`** — хранение текущей и всех смет
- **`jspdf.umd.min.js`**, **`DejaVuSans_normal.js`** — для генерации PDF (шрифт DejaVuSans, обычное начертание)
- **`html2pdf` НЕ используется** — PDF генерируется через `jsPDF` + `jspdf-autotable` (или ручная отрисовка)

## Структура папок после рефакторинга

src/js/cabinet/modules/estimate/
├── estimate.js # Точка входа, инициализация
├── estimateUI.js # Отрисовка таблицы в браузере
├── estimateForm.js # Логика формы добавления работ
├── estimateStorage.js # Работа с localStorage
└── estimatePDF.js # Генерация PDF  


## Файлы модуля

### `estimateStorage.js`
| Функция | Описание |
|---------|----------|
| `saveCurrentEstimate(estimateItems)` | Сохраняет текущую смету как «последнюю» и добавляет в архив |
| `loadCurrentEstimate()` | Возвращает последнюю смету из `localStorage` |
| `clearCurrentEstimate()` | Удаляет текущую смету |
| `getAllEstimates()` | Возвращает массив всех сохранённых смет (история) |

### `estimateUI.js`
| Функция | Описание |
|---------|----------|
| `renderEstimateTable(items)` | Отрисовывает таблицу сметы в браузере, добавляет кнопки удаления, поля редактирования цены и количества |
| `updateTotalDisplay(total)` | Обновляет отображение итоговой суммы |
| `setCallbacks(callbacks)` | Устанавливает колбэк `onPriceChange` (вызывается при изменении цены или количества) |

**Колбэки:**
- `onPriceChange(operation, index, value)` — `operation` может быть `'remove'`, `'quantity'`, `'price'`

### `estimateForm.js`
| Функция | Описание |
|---------|----------|
| `init()` | Находит DOM-элементы, навешивает обработчики событий |
| `setBaseKnowledge(knowledge)` | Передаёт базу знаний и загружает категории |
| `setCallbacks(callbacks)` | Устанавливает колбэки |
| `loadCategories()` | Загружает список категорий (разделов) в выпадающий список |
| `loadWorksByCategory(categoryId)` | Загружает работы для выбранной категории |
| `updatePreviewTotal()` | Пересчитывает предварительную сумму перед добавлением работы |
| `addUserCategory(name)` | Добавляет новый раздел (категорию) мастера (с проверкой на дубликаты) |
| `addUserWork(name, unit, price, categoryId)` | Добавляет новую работу мастера |

**Колбэки (setCallbacks):**
- `onAddWork(newWork)` — вызывается при добавлении работы в смету
- `onClear()` — вызывается при очистке всей сметы
- `onSave()` — вызывается при сохранении сметы
- `onPDF()` — вызывается при генерации PDF

**DOM-элементы, используемые в форме:**
| ID | Тип | Назначение |
|----|-----|------------|
| `estimate-category-select` | select | Выбор раздела (категории) работ |
| `estimate-work-select` | select | Выбор вида работ |
| `estimate-unit-select` | select | Единица измерения (м², м.п., шт, м³, компл, мешок, уп) |
| `estimate-price-input` | input | Цена за единицу |
| `estimate-quantity` | input | Количество |
| `estimate-preview-total` | span | Предварительная сумма перед добавлением |
| `estimate-add-btn` | button | Добавить работу в смету |
| `estimate-add-group-btn` | button | Добавить группу работ |
| `estimate-target-group-select` | select | Выбор группы для добавления работы |
| `estimate-save-btn` | button | Сохранить смету |
| `estimate-clear-btn` | button | Очистить все позиции |
| `estimate-pdf-btn` | button | Скачать PDF |
| `estimate-show-user-works` | checkbox | Показывать мои добавленные работы (устарел, теперь всегда true) |
| `estimate-new-category-name` | input | Название нового раздела (для добавления) |
| `estimate-add-category-btn` | button | Добавить новый раздел |
| `estimate-delete-category-btn` | button | Удалить выбранный пользовательский раздел |
| `estimate-new-work-name` | input | Название новой работы (для добавления) |
| `estimate-new-work-unit` | select | Единица измерения для новой работы |
| `estimate-new-work-price` | input | Цена для новой работы |
| `estimate-new-work-category` | select | Выбор раздела для новой работы |
| `estimate-add-work-btn` | button | Добавить свою работу |

### `estimatePDF.js`
| Функция | Описание |
|---------|----------|
| `generateEstimatePDF(estimateItems)` | Создаёт и скачивает PDF-файл сметы (таблица, рамки, перенос текста, подсветка групп) |

**Особенности текущей версии PDF:**
- Используется шрифт `DejaVuSans` (только обычное начертание, `bold` не используется)
- Заголовки групп выделяются фоном и центрируются
- Текст в ячейках центрируется по вертикали и горизонтали
- Колонки: № (10 мм), Наименование работ (68 мм), Кол-во (18 мм), Ед. (12 мм), Цена (25 мм), Сумма (30 мм)
- При нехватке места текст переносится на новую строку, высота строки увеличивается

### `estimate.js` (точка входа)
| Функция | Описание |
|---------|----------|
| `init()` | Ожидает загрузки `window.BASE_KNOWLEDGE` и всех модулей, затем инициализирует систему |

**Локальные переменные:**
- `estimateItems` — массив элементов сметы (группы и работы)
- `currentCategoryId` — текущая выбранная категория
- `currentSelectedWork` — текущая выбранная работа

**Функции, связывающие модули:**
- `updateItem(operation, index, value)` — обновляет цену/количество или удаляет позицию
- `addWork(item)` — добавляет работу в `estimateItems`
- `clearAll()` — очищает смету
- `saveEstimate()` — вызывает `EstimateStorage.saveCurrentEstimate`
- `generatePDF()` — вызывает `EstimatePDF.generateEstimatePDF`
- `loadEstimate()` — загружает смету из `localStorage`

## Порядок инициализации
1. `base-knowledge.js` создаёт `window.BASE_KNOWLEDGE`
2. `estimate.js` ожидает появления `BASE_KNOWLEDGE` и всех модулей (с `setInterval`)
3. Вызывается `EstimateForm.setBaseKnowledge()`, загружаются категории
4. Настраиваются колбэки между модулями
5. Вызывается `EstimateForm.init()` — подключаются обработчики событий
6. Загружается последняя сохранённая смета из `localStorage`

## Хранилище (localStorage)
- `current_estimate` — последняя открытая/сохранённая смета
- `all_estimates` — массив последних 50 смет (история)
- `user_categories` — пользовательские разделы (категории) мастера
- `user_works` — пользовательские работы мастера

## Порядок подключения в `cabinet.pug` (ПОСЛЕ рефакторинга!)
```pug
script(src="/js/data/base-knowledge.js")
script(src="/js/cabinet/modules/estimate/estimateStorage.js")
script(src="/js/cabinet/modules/estimate/estimateUI.js")
script(src="/js/cabinet/modules/estimate/estimateForm.js")
script(src="/js/cabinet/modules/estimate/estimatePDF.js")
script(src="/js/cabinet/modules/estimate/estimate.js")