```markdown
# Модуль "Договор" (contract)

## Назначение
Генерация договора возмездного оказания услуг на основе данных, введённых мастером (заказчик, паспортные данные, адрес, сроки, стоимость). Формирует PDF и сохраняет номер договора в `localStorage`.

## Зависимости
- **`jspdf.umd.min.js`**, **`DejaVuSans_normal.js`** — для создания PDF.
- **`localStorage`** — для номера договора и профиля мастера.

## Файлы модуля
| Файл | Ответственность |
|------|----------------|
| `contract.js` | Содержит **всю логику договора**: формы, валидацию, генерацию PDF, работу с `localStorage`. (Модуль пока не разбит на части.) |

## Основные функции

### `getCurrentContractNumber()`
Возвращает последний использованный номер договора из `localStorage`. Если номера нет — начинает с 1.

### `incrementContractNumber()`
Увеличивает номер договора на 1. Вызывается после подписания акта.

### `generateContractPDF(contractData)`
Генерирует и скачивает PDF с полным текстом договора, подставляя данные заказчика, мастера, адрес, сроки и стоимость.

### Валидация формы (встроена в `contract.js`)
Проверяет ФИО, паспортные данные, телефон, даты, цену. Обязательные поля подсвечиваются.

## Хранилище (localStorage)
- `current_contract_number` — последний использованный номер договора.
- `master_profile` — профиль мастера (ФИО, паспорт, телефон, город, налоговый статус).

## Структура данных `contractData`
```javascript
{
  contractNumber: "0001",
  city: "Новосибирск",
  contractDate: "2026-04-27",
  customerFullname: "Иванов Иван Иванович",
  customerPassportSeries: "1234",
  customerPassportNumber: "567890",
  customerPassportIssuedBy: "ОВД Ленинского района",
  customerAddress: "г. Новосибирск, ул. Ленина, д. 1",
  customerPhone: "+7 (999) 123-45-67",
  workAddress: "г. Новосибирск, ул. Пушкина, д. 10",
  startDate: "2026-05-01",
  endDate: "2026-05-30",
  price: 50000,
  materialsIncluded: false,
  executorFullname: "Петров Петр Петрович",
  executorPassportSeries: "4321",
  executorPassportNumber: "098765",
  executorPassportIssuedBy: "ОВД Кировского района",
  executorPhone: "+7 (888) 123-45-67"
}