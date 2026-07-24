# Аудит покрытия исследований Brittany 2026

Дата проверки: **24 июля 2026 года**.

## Краткий вывод

Информация из папки Google Drive **далеко не полностью присутствует в проекте**.
Главный пробел — не ещё одна достопримечательность Бретани, а полноценное
пребывание в Нанте с 6 по 9 августа 2026 года. Сейчас Нант представлен в
приложении почти исключительно как аэропорт и пересадочный пункт
(`evidence:nantes-primary-gateway-from-portugal`,
`content/plan/getting-there.md`), тогда как новый корпус даёт готовую основу для
трёхдневного семейного маршрута, отдельных мест, событий, питания и
дождевых альтернатив.

Из 25 документов:

- **18 — частично покрыты**: основная тема уже есть, но важные места,
  практические детали или точная последовательность отсутствуют;
- **4 — фактически не покрыты**: это `Lunch-Guide-Nantes.md` и три новых
  исследования о трёх днях и еде в Нанте;
- **3 — требуют свежей проверки как единое целое**: события, фестивали и
  автомобильная логистика содержат быстро меняющиеся даты, цены и ограничения.

Это классификация по доминирующему результату документа. Внутри одного файла
отдельные утверждения дополнительно помечены как **есть**, **дубликат**,
**противоречие** или **нужна свежая проверка**.

Четыре файла от 18 июля являются новыми относительно предыдущей
инвентаризации из 21 документа:

1. `Nante2-Perplexity.md`;
2. `Nante-Food-Perplexity.md`;
3. `Nante-3-days-ChatGPT.md`;
4. `Events-Nantes-Perplexity.md`.

Новой вложенной папки в локально синхронизированном `Holidays 2026` нет:
эти файлы добавлены непосредственно в его корень.

## Объём и методика

Проверен корень синхронизированной папки Google Drive `+Trips/Holidays 2026`
(локальный путь не приводится: репозиторий публичный).

Исключены `.DS_Store` и подпапка `Italy North`. Состояние проекта сравнивалось
с чистым `main` до создания этого отчёта.

Сопоставление выполнялось на трёх уровнях:

1. **Source** — зарегистрирован ли исходный документ в
   `research/source-manifest.json`;
2. **Evidence** — представлена ли его содержательная тема в
   `research/evidence/*.json`;
3. **Content** — дошло ли утверждение до пользовательских файлов в `content/`.

Важное ограничение: существующая страница `/sources/coverage` сообщает 100%
покрытие только для четырёх уже зарегистрированных исходных документов. Она
ничего не говорит о 25 файлах Drive, потому что их нет в manifest.

Контрольные числа на момент аудита:

| Показатель | Значение |
|---|---:|
| Markdown-файлы в Drive-корпусе | 25 |
| Зарегистрированные источники проекта | 4 |
| Drive-файлы, зарегистрированные в manifest | 0 |
| Точные совпадения Drive-файлов с `research/raw` по SHA-256 | 0 |
| Существующие English evidence records | 152 |
| Существующие coverage outcomes | 194 |
| Пользовательские Markdown-страницы в `content/` | 49 |

Статусы трактуются так:

- **есть** — конкретное утверждение уже выражено в evidence и пользовательском
  content без существенной потери;
- **частично** — тема есть, но отсутствует уникальная практическая или
  маршрутная часть;
- **нет** — пользовательского покрытия по основной ценности документа нет;
- **дубликат** — утверждение повторяет уже покрытый факт или другое исследование;
- **противоречие** — источники или текущий проект дают несовместимые варианты;
- **нужна свежая проверка** — факт зависит от даты, цены, слота, ремонта,
  расписания или фактической доступности.

## Матрица 25 файлов

Во всех строках столбец Source равен **нет**: ни один файл не присутствует в
`research/source-manifest.json`. Ссылки в последнем столбце показывают
репрезентативное, а не исчерпывающее совпадение с текущим проектом.

| № | Файл | Новый | Основная тема | Evidence / content | Итог и главный пробел |
|---:|---|:---:|---|---|---|
| 1 | `Accommodation-Bases-Claude.md` | — | Рейтинг баз и 14 ночей от Нанта | Есть шесть баз, `research/evidence/rankings.json`, `content/rankings/bases.json` и три route pages | **Частично.** Нант как 2–3-дневный bookend и предложенная 14-дневная последовательность отсутствуют. Рейтинг Vannes-first конфликтует с текущим Saint-Malo-first; это нужно сохранить как расхождение, а не заменить молча. |
| 2 | `Beaches-Claude.md` | — | 14 семейных пляжей, удобство и логистика | Есть `content/swimming/locations.json`, Bon-Secours, Carnac и Morgat; Côte de Granit Rose описана на уровне базы | **Частично.** Нет La Baule, Pornichet, Kervillen, Conleau, Plage du Trez, Sables Blancs, Trestraou и других конкретных профилей. |
| 3 | `Brittany-with-kid-Claude.md` | — | Спокойный 16-дневный loop | Базы Dinan, Granit Rose, Crozon/Quimper и Vannes покрыты; близкие идеи есть в `content/routes/*.md` | **Частично.** Нет единого маршрута на фактические 6–23 августа; сам файл использует устаревшее окно 3–21 августа. |
| 4 | `Castles - Claude.md` | — | Семейный рейтинг 13 замков по внутреннему содержанию | Есть `content/things-to-do/suscinio.md`, `cap-frehel-fort-la-latte.md`, `dinan.md`, `chateau-de-brest.md` | **Частично.** Нет Château des ducs de Bretagne, Kerjean, Fougères, Josselin, Trévarez, Vitré, Largoët, Bienassis, Combourg и Tonquédec. Большая часть списка дублирует два других castle reports. |
| 5 | `Castles-Brittany-ChatGPT.md` | — | Museum-castles и сравнительный рейтинг | Совпадает с существующими Suscinio, Dinan, Fort La Latte и Brest castle | **Частично.** Уникальные indoor-профили отсутствуют; основные объекты частично дублируют `Castles - Claude.md` и `best and largest castles…`. |
| 6 | `Events-Nantes-Perplexity.md` | **да** | Le Voyage à Nantes и события 7–9 августа | В проекте есть только `evidence:western-concarneau-filets-bleus`; Nantes events отсутствуют | **Нужна свежая проверка.** Основная программа VAN уже опубликована, но файл содержит устаревшие ожидания публикации и ошибочно допускает посещение закрытого Natural History Museum. Результат проверки — ниже. |
| 7 | `Family-activities-Claude.md` | — | Активности без пляжей и музеев | Есть `lac-de-tremelin.md`, `branfere.md`, Brocéliande и `evidence:northern-saint-malo-cobac-labyrinthe` | **Частично.** Нет страниц Forêt Adrénaline, Cobac Parc, Récré des 3 Curés, canoe/kayak и семейных voies vertes. |
| 8 | `Food-Brittany.md` | — | Недорогие заведения по городам | Региональные блюда покрыты в `content/plan/food.md` и food evidence каждой базы | **Частично.** Конкретные рестораны и практический выбор по Nantes, Rennes, Saint-Malo, Dinan, Vannes и Quimper отсутствуют и требуют свежей проверки. |
| 9 | `Historical Cities-ChatGPT.md` | — | Рейтинг восьми исторических городов | Saint-Malo, Dinan, Vannes, Quimper и Concarneau имеют страницы | **Частично.** Нет самостоятельного Nantes city stay, Rennes, Fougères и Vitré; текущий проект использует города прежде всего как базы и day trips. |
| 10 | `Logistics-Guide-Claude.md` | — | Парковки, дороги, ZFE, толпы, цены 6–23 августа | Общий выбор машины есть в `content/plan/getting-around.md`, transfer facts — в `content/facts/transport.json` | **Нужна свежая проверка.** Town-by-town parking, августовские ремонты, ZFE, часы и цены объектов не перенесены и быстро меняются. |
| 11 | `Lunch-Guide-Nantes.md` | — | Обеды вдоль green line в четырёх районах | В content нет Nantes food или green-line itinerary | **Нет.** Маршрут Jardin des Plantes → Château/Bouffay → Île de Nantes → Jardin Extraordinaire и связанные lunch stops полностью отсутствуют. |
| 12 | `Milk-food-Claude.md` | — | Рынки, фермы, сыр и молочные продукты | Есть только общий food layer и рынки, кратко упомянутые на base pages | **Частично.** Детальный dairy/market маршрут, фермы и сыроварни отсутствуют; заведения и часы требуют свежей проверки. |
| 13 | `Mont-Saint-Michel-guide.md` | — | MSM + Saint-Malo + Cancale + Dinan | Есть `mont-saint-michel.md`, `cancale.md`, `dinan.md` и дни 4–7 в `content/routes/cultural.md` | **Частично.** Базовая связка уже есть; точная стратегия времени, парковки, очередей и peak-season warnings отражена не полностью. |
| 14 | `Museums-Brittany-Perplexity.md` | — | Семейный рейтинг музеев | Есть Océanopolis, Brest maritime museum, Quimper museums, Carnac и Parc du Radôme | **Частично.** Нет Les Champs Libres/Espace des Sciences, Musée des Thoniers и Manoir de l’Automobile; часы и цены нужно датировать. |
| 15 | `Must-try-Brittany.md` | — | Главные блюда и продукты Бретани | Galettes, crêpes, seafood, cider, kouign-amann и biscuits уже есть в `content/plan/food.md` | **Частично.** Основное — **дубликат** существующего food evidence; не представлены kig ha farz, cotriade, Plougastel strawberries и более глубокий продуктовый слой. |
| 16 | `Nante-3-days-ChatGPT.md` | **да** | Три дня 6–9 августа с ребёнком | Есть лишь Nantes gateway/transfer evidence | **Нет.** Реалистичная последовательность Machines → Château/Jardin → Jules Verne/Jardin Extraordinaire, rainy-day reserve и Pass calculation отсутствуют. Практические факты частично подтверждены ниже. |
| 17 | `Nante-Food-Perplexity.md` | **да** | Завтраки, обеды и ужины 6–9 августа | Есть только общебретонская food page | **Нет.** Talensac и весь shortlist заведений отсутствуют. Ресторанные цены, часы и существование заведений должны проверяться непосредственно перед использованием. |
| 18 | `Nante2-Perplexity.md` | **да** | Детальный трёхдневный Nantes itinerary | Есть только airport gateway и общие transport facts | **Нет.** Нет ни маршрута, ни Nantes places, ни booking/fallback логики. Внутри файла есть конфликты с другим новым отчётом по ценам и часам. |
| 19 | `Nantes-Claude.md` | — | Nantes и окрестности как начало/конец поездки | Нант присутствует как gateway; отдельные дальние темы частично пересекаются с Brittany pages | **Частично.** Machines, Château, Jardin des Plantes, Planète Sauvage и городской маршрут не представлены; предложенные даты старта/финиша устарели. |
| 20 | `Nantes-Perplexity.md` | — | Nantes + Clisson, Guérande, Pornic, Puy du Fou | Gateway есть; Mont-Saint-Michel покрыт отдельно | **Частично.** Сам Нант и четыре окружающих направления отсутствуют. Значительная часть Nantes core дублирует `Nantes-Claude.md` и новые 3-day reports. |
| 21 | `beaches in Brittany-Perplexity.md` | — | Короткий top-10 пляжей | Bon-Secours, Sillon, Carnac и общий Granit Rose beach evidence есть | **Частично.** Базовые выводы в основном **дублируют** `Beaches-Claude.md` и current swimming layer; Kervillen, Trestraou/Saint-Guirec, Binic и другие профили не добавлены. |
| 22 | `best and largest castles of Brittany, France - Perplexity.md` | — | Замки по доступной indoor area | Suscinio, Dinan, Fort La Latte и Brest castle есть | **Частично.** Nantes, Kerjean, Josselin, Fougères и Vitré отсутствуют; список существенно дублирует два других castle reports. |
| 23 | `family-attractions-Claude.md` | — | 15 семейных развлечений | Есть Océanopolis, Ploumanac’h, Sept-Îles, Bréhat, Branféré, Morgat, Brocéliande, Morbihan islands и Parc du Radôme | **Частично.** Это наиболее покрытый старый файл, но Machines de l’Île, Cobac Parc, Récré des 3 Curés, Vapeur du Trieux и Forêt Adrénaline отсутствуют. |
| 24 | `festivals-Claude.md` | — | Фестивали 3–21 августа 2026 | Подтверждён и опубликован только Filets Bleus в `concarneau.md` / `evidence:western-concarneau-filets-bleus` | **Нужна свежая проверка.** Suscinio show, Festival d’Arvor, Vieux Gréements, Bon-Repos, Trécesson, Lorient и другие даты/программы не вошли в проект. |
| 25 | `Исторические города Бретани - Claude.md` | — | Top-10 исторических городов и 10 дней от Нанта | Пять основных городов и Locronan уже представлены | **Частично.** Nantes, Josselin, Fougères, Rennes и Vitré отсутствуют; основные рейтинговые тезисы дублируют `Historical Cities-ChatGPT.md`. |

Контроль матрицы: **25 строк = 18 “частично” + 4 “нет” + 3 “нужна свежая проверка”**.

## Что уже есть в проекте

Хорошо покрыты и не требуют повторного импорта только ради количества:

- шесть сравниваемых баз и семь ranking dimensions;
- три общих route styles;
- климат, температура воды, общий выбор машины и трансферы из Нанта;
- Saint-Malo/Dinan, Côte de Granit Rose, Brest, Quimper, Crozon и Morbihan
  на уровне баз;
- большинство главных Brittany anchors: Mont-Saint-Michel, Océanopolis,
  Ploumanac’h, Sept-Îles, Dinan, Suscinio, Carnac, Branféré, Brocéliande,
  Concarneau, Locronan и другие существующие `things-to-do`;
- базовые блюда Бретани;
- Festival des Filets Bleus 12–16 августа 2026.

Эти совпадения следует оформлять как `duplicate` или как дополнительные
sourceBlockRefs к существующему evidence только тогда, когда документ
действительно принимается в source pipeline.

## Значимые пробелы и противоречия

### 1. Нант ошибочно сведён к аэропорту

Поиск по `content/` находит Нант в gateway, transfer и origin полях, но не
находит ни одной страницы Nantes city, Machines de l’Île, Château des ducs de
Bretagne, Musée Jules Verne, Jardin des Plantes, Jardin Extraordinaire,
Talensac или Le Voyage à Nantes. Простое упоминание аэропорта поэтому не
считается покрытием городского пребывания.

### 2. Точные даты поездки не совпадают с конфигурацией

Исследования `Logistics-Guide-Claude.md`, `Nante2-Perplexity.md` и
`Nante-3-days-ChatGPT.md` используют фактический приезд **6 августа 2026 в
20:05**, пребывание в Нанте до **9 августа** и общую поездку до **23 августа**.
Но `src/config/guide.ts` всё ещё задаёт два абстрактных окна
**8–17** и **22–31 августа**. Это **противоречие P0**: будущий маршрут нельзя
строить поверх текущих date windows.

### 3. Старые маршруты нельзя переносить буквально

В корпусе одновременно встречаются 14 ночей, 16 дней, 3–21 августа и
6–23 августа. Их полезно использовать для сравнения баз и темпа, но итоговую
последовательность следует пересобрать под подтверждённое окно 6–23 августа,
а не выбирать один старый itinerary целиком.

### 4. Рейтинг баз содержит полезное несогласие

`Accommodation-Bases-Claude.md` ставит Vannes первым, тогда как пользовательский
рейтинг проекта ставит Saint-Malo/Dinan. В проекте уже есть более общий конфликт
источников (`evidence:ranking-source-chatgpt-overall`,
`evidence:ranking-source-perplexity-overall`,
`evidence:ranking-source-operaai-overall`). Новый документ должен усиливать
прозрачность trade-off, а не автоматически менять победителя.

### 5. Три группы источников сильно дублируются

- castles: три отдельных отчёта;
- beaches: два отчёта;
- historical cities: два отчёта;
- Nantes core: `Nantes-Claude.md`, `Nantes-Perplexity.md` и два новых
  трёхдневных отчёта;
- regional food: `Food-Brittany.md`, `Must-try-Brittany.md` и
  `Milk-food-Claude.md`.

Для каждого кластера нужно сохранять уникальные факты и разногласия, но не
создавать несколько одинаковых страниц или evidence records.

## Official verification

В этом разделе использованы только страницы организаций, которые отвечают за место, услугу или событие. Он проверяет нестабильные сведения из новых исследований о Нанте перед возможным переносом в приложение.

| Утверждение из исследований | Результат проверки | Статус для будущей интеграции |
|---|---|---|
| Natural History Museum можно включить в маршрут 7–9 августа | Основное здание Muséum de Nantes **полностью закрыто с 3 ноября 2025 года** на реконструкцию; открытие планируется в **2029 году**. Во время ремонта музей проводит выездные мероприятия, но это не делает основное здание доступным. [Официальные часы и уведомление о закрытии](https://museum.nantesmetropole.fr/home/venir/horaires.html), [выездная программа](https://museum.nantesmetropole.fr/itinerance.html). | **Противоречие.** Не включать основное здание в маршрут. |
| Musée d’arts работает либо 10:00–19:00 ежедневно, либо 11:00–19:00 с выходным во вторник | На даты поездки действует специальный летний режим **1 июля — 31 августа 2026**: 10:00–19:00 ежедневно, по четвергам до 21:00. Во вторник открыта только выставка *Anne et Patrick Poirier. Odyssée de l’oubli* по сниженному тарифу; постоянная коллекция закрыта. [Официальное летнее расписание](https://museedartsdenantes.nantesmetropole.fr/actualites/le-musee-aux-heures-d-ete/). | **Есть после уточнения.** Для 7–9 августа использовать летний режим, а не обычное расписание. |
| Illusion Nantes стоит €15/€12 или €12/€9 | Официальный сайт сам себе противоречит. [Главная страница](https://illusionnantes.fr/fr/) и [FAQ](https://illusionnantes.fr/fr/faq) показывают взрослый / льготный / детский тариф **€15 / €14 / €12**, а [страница билетов](https://illusionnantes.fr/fr/tickets) — **€12 / €11 / €9**. Обе страницы доступны одновременно. | **Нужна свежая проверка.** Не фиксировать цену; проверить итоговую цену выбранного слота в официальной корзине непосредственно перед бронированием. |
| Grand Éléphant требует ранней брони; цена и включение в Pass описаны по-разному | На сезон 2026 отдельный билет на Grand Éléphant стоит **€12 взрослый, €10 льготный/13–17 лет, €8 ребёнок 4–12 лет**, до 4 лет бесплатно. Онлайн-бронирование на период 1 июня — 30 августа открыто с **22 мая 2026**; часть билетов оставляют для продажи на месте в день посещения. [Официальные тарифы](https://www.lesmachines-nantes.fr/pratique/tarifs-billetteries/), [этапы бронирования сезона 2026](https://www.lesmachines-nantes.fr/galerie-des-machines-voyage-en-grand-elephant/). | **Есть после уточнения.** Бронировать на 7 августа заранее; продажа на месте не гарантирует место. |
| Pass Nantes включает Machines de l’Île целиком | Pass Nantes включает по одному посещению **Galerie des Machines** и **Carrousel des Mondes Marins**, но **не включает поездку на Grand Éléphant**. Он также включает неограниченный городской транспорт в период действия, один проезд туда-обратно на airport shuttle, основные музеи и ряд круизов/экскурсий; для части услуг требуется отдельная резервация. [Официальный FAQ Pass Nantes](https://www.levoyageanantes.fr/a-faire/pass-nantes/faq-pass-nantes/), [условия Machines de l’Île](https://www.lesmachines-nantes.fr/pratique/tarifs-billetteries/). | **Противоречие устранено.** Не обещать Elephant по Pass; проверять и бронировать каждую включённую услугу отдельно. |
| Tram Line 1 работает по обычной схеме | С **14 июня по 30 августа 2026** Line 1 частично закрыта из-за работ; официальный городской материал уточняет разрыв между **Commerce и François-Mitterrand** и замену автобусом. Это затрагивает весь визит 6–9 августа. [Naolib: работы на Line 1](https://naolib.fr/fr/actualites/cet-ete-la-ligne-1-fait-peau-neuve-et-on-soccupe-de-vous), [Nantes Métropole: участок и bus relais](https://metropole.nantes.fr/actualites/les-chantiers-de-l-ete-2026-preparent-les-transports-en-commun-de-demain). | **P0.** Маршруты к Machines и западным объектам строить по актуальному планировщику Naolib, а не по обычной линии трамвая. |
| Городской транспорт бесплатен в выходные | С 00:00 субботы до 23:59 воскресенья tram, bus и navibus бесплатны. **Airport shuttle является исключением** и требует отдельного билета. Это применимо к 8–9 августа. [Официальные правила Naolib](https://naolib.fr/gratuite-des-transports-en-commun). | **Есть.** Не покупать обычный городской билет на субботу/воскресенье; не распространять бесплатность на shuttle. |
| После прилёта в 20:05 airport shuttle ещё ходит | В апреле–октябре shuttle ходит каждые **20 минут**; последний выезд из аэропорта — **00:00**, расчётное время до вокзала — около 20 минут. Билет стоит €10, включая выходные; один проезд туда-обратно включён в Pass Nantes с обязательной активацией. С 30 марта 2026 остановка у вокзала перенесена на gare routière, quai A. [Официальная страница Naolib](https://naolib.fr/fr/se-rendre-a-laeroport). | **Есть.** Прилёт в 20:05 совместим с shuttle, но закладывать запас на багаж и задержку рейса. |
| Le Voyage à Nantes 2026 ещё не опубликован полностью | Основная программа уже опубликована: фестиваль проходит **4 июля — 6 сентября 2026**, это 15-я редакция и первая часть цикла об элементах с темой **EARTH / La Terre**. Официальный перечень включает работы Théo Mercier (Place Graslin), Anne-Charlotte Finel (Cryptes de la Cathédrale), Ali Cherri (Place Félix Fournier), Louis Guillaume (Douves du Château), Dominique Petitgand (Square Daviais), Edgar Sarin (Chapelle du Lycée Clemenceau), Barbara Schroeder (Jardin Extraordinaire), Pierrick Sorin (Jardin des Plantes), а также выставки *INTERSTELLAR*, *Sommeils légers* и *Ce que la terre retient*. [Официальная программа 2026](https://www.levoyageanantes.fr/en/events/the-summer-journey/), [*Notre dit pays* в замковых рвах](https://www.levoyageanantes.fr/oeuvres/notre-dit-pays/), [*Les Mistériennes* в Jardin Extraordinaire](https://www.levoyageanantes.fr/oeuvres/les-misteriennes/), [*Hortulanus mirabilis* в Jardin des Plantes](https://www.levoyageanantes.fr/oeuvres/hortulanus-mirabilis/). | **Устаревшее ожидание публикации.** Основные объекты подтверждены на все 7–9 августа; часы конкретного закрытого помещения проверять на его собственной странице. |
| На 7–9 августа ожидаются дополнительные концерты Aux Heures d’Été | Фестиваль 2026 официально идёт **7 июля — 7 августа** и заканчивается в первый день рассматриваемого окна. Страница Château перечисляет последние концерты в замковых рвах **4 и 6 августа**, но не 7–9 августа. При этом [страница программы организатора](https://www.auxheuresete.com/programmation/) на дату проверки всё ещё показывает сообщение «будет опубликована», несмотря на заявление Nantes Métropole о доступной полной программе. [Официальные даты и обзор Nantes Métropole](https://metropole.nantes.fr/actualites/cinq-rendez-vous-a-ne-pas-manquer-aux-heures-d-ete-2026), [официальные даты Château](https://www.chateaunantes.fr/evenements/aux-heures-dete-2026/). | **Нужна свежая проверка.** Не обещать концерт 7–9 августа. Повторно проверить официальный agenda ближе к поездке; на 8–9 августа Aux Heures d’Été уже не рассчитывать. |

### Что уже надёжно для 7–9 августа

- Le Voyage à Nantes и перечисленные летние выставки покрывают всё трёхдневное окно; прежняя пометка «programme pending» для основной программы устарела.
- Natural History Museum исключается, а Musée d’arts используется по летнему расписанию.
- Grand Éléphant планируется отдельным билетом; Pass Nantes не заменяет его бронь.
- На 8–9 августа обычный городской транспорт бесплатен, но маршрут Line 1 изменён, а airport shuttle остаётся платным.

### Что остаётся перепроверить перед поездкой

- Фактическую цену Illusion Nantes в официальной корзине из-за внутреннего конфликта сайта.
- Наличие слотов Grand Éléphant на 7 августа и режим работы, зависящий от погоды.
- Временные изменения Naolib и точный bus relais за несколько дней до приезда.
- Разовые события 7 августа в официальном agenda; подтверждённой программы Aux Heures d’Été на 8–9 августа нет.

## Приоритетный план интеграции

Ниже — будущие независимые этапы. Этот аудит их **не реализует**, не создаёт
GitHub issues и не меняет source/evidence/content.

### P0 — зафиксировать реальную поездку и нестабильную практику

1. Заменить абстрактные date windows на поездку 6–23 августа и отдельный
   Nantes stay 6–9 августа; сохранить arrival 20:05 и фактическое время выезда
   9 августа, когда оно будет известно.
2. Добавить dated facts для airport shuttle, бесплатного транспорта
   8–9 августа, ремонта Line 1, закрытия Natural History Museum, режима Musée
   d’arts и правил Pass Nantes.
3. Не фиксировать цену Illusion Nantes до проверки checkout; availability
   Grand Éléphant хранить как booking action, а не как обещанный слот.
4. Перед публикацией повторно проверить Naolib и официальные booking pages.

Почему сначала это: без правильных дат и транспорта даже хороший список мест
даст невыполнимый маршрут.

### P1 — добавить Nantes stay как отдельный маршрутный слой

Создать компактный трёхдневный сценарий, не превращая Нант в седьмую Brittany
base:

- **6 августа:** прилёт, shuttle, заселение, без вечерней программы;
- **7 августа:** Les Machines de l’Île + Parc des Chantiers, затем один
  компактный indoor/outdoor fallback;
- **8 августа:** Jardin des Plantes, Château des ducs de Bretagne,
  Bouffay/green line и один rainy-day музей;
- **9 августа:** Musée Jules Verne или Planetarium + Jardin Extraordinaire,
  затем выезд к следующей базе.

Маршрут должен хранить travel burden, длительность, обязательную бронь,
weather fallback и различие между бесплатными public artworks и платными
объектами.

### P2 — добавить только ключевые Nantes places

Минимальный набор отдельных страниц:

1. Les Machines de l’Île;
2. Château des ducs de Bretagne;
3. Jardin des Plantes;
4. Musée Jules Verne + Planetarium как связанная западная пара;
5. Jardin Extraordinaire;
6. Le Voyage à Nantes / green line как сезонный городской слой, а не одна
   достопримечательность.

Illusion Nantes и Musée d’arts разумнее сначала оставить fallback cards внутри
маршрута. Отдельная страница оправдана только после подтверждения, что семья
действительно хочет их посещать.

### P3 — добавить небольшой, устойчивый food shortlist

- Talensac — основной рынок/пикник с официальными часами;
- одна проверенная crêperie возле Bouffay;
- один семейный вариант возле Île de Nantes;
- один заранее бронируемый особенный ужин.

Не переносить весь ресторанный список. Для каждого заведения перед добавлением
проверить официальный сайт/бронирование, актуальные часы на 6–9 августа и
подходящий ребёнку формат. Цены описывать диапазоном и `checkedAt`, а не
обещанием конкретного меню.

### После Нанта — только decision-relevant пробелы старого корпуса

Следующий приоритет среди 21 старого файла:

1. town-by-town parking и реальная августовская driving matrix для выбранных
   баз;
2. точные фестивали внутри фактических ночей после утверждения маршрута;
3. 2–3 missing rainy-day anchors рядом с реально выбранными базами;
4. конкретные пляжи только там, где они меняют выбор базы или запасной день;
5. dairy/market и secondary castle/city pages — только после фиксации баз.

Такой порядок сохраняет decision-first характер приложения и не превращает
его в энциклопедию всех найденных мест.

## Предлагаемое разбиение будущей работы

| Этап | Результат | Основные затрагиваемые слои |
|---|---|---|
| A. Source intake | Принять только выбранные Nantes documents без изменения оригиналов; добавить hashes, blocks и решения duplicate/conflict | `research/raw`, `research/source-manifest.json`, `research/blocks`, `research/block-decisions.json`, `research/coverage.json` |
| B. P0 facts | Исправить trip dates и добавить проверенные dated transport/closure/booking facts | `src/config/guide.ts`, `content/facts`, Nantes evidence |
| C. Nantes route | Опубликовать 6–9 August itinerary с fallback и booking actions | `content/routes` или отдельный plan section, route evidence |
| D. Core places | Добавить минимальные Nantes place pages и ссылки из маршрута | `content/things-to-do`, Nantes evidence |
| E. Food shortlist | Добавить Talensac и 3 проверенных формата еды | `content/plan/food.md` или Nantes plan page |
| F. Old-corpus gaps | Отдельно выбрать decision-relevant parking/events/rainy-day items | Только подтверждённые geographic/practical slices |

Не рекомендуется сразу импортировать все 25 документов. Текущий pipeline
требует explicit outcome для каждого substantive block; массовый импорт
создаст большой объём duplicate classification без сопоставимой пользы.
Разумнее сначала принять четыре новых Nantes files и только те старые документы,
из которых фактически будут использованы уникальные утверждения.

## Контроль качества аудита

- В матрице ровно **25** уникальных Drive-файлов.
- Все 25 имеют `Source: нет`; SHA-256 совпадений с `research/raw` нет.
- Итоговые статусы матрицы сходятся: **18 + 4 + 3 = 25**.
- Каждый крупный вывод связан с существующим evidence ID, content path или
  проверенным отсутствием Nantes page.
- Конфликты Natural History Museum, Musée d’arts, Illusion Nantes, Pass Nantes,
  Line 1 и ranking order не сглажены.
- Официальная проверка отделена от утверждений исходных AI reports и датирована
  24 июля 2026 года.
- В рамках аудита не изменены публичные интерфейсы, типы, application content,
  `research/source-manifest.json`, evidence или coverage.

## Решение

Корпус стоит использовать, но **не импортировать целиком**. Четыре новых файла
дают высокоценный и почти отсутствующий в приложении Nantes stay. Старые 21
файл в основном усиливают уже существующие базы и места; их полезная новая
часть — точная логистика, отдельные missing attractions и практические детали,
которые следует брать после выбора маршрута. Первое содержательное обновление
проекта должно быть Nantes-focused и начинаться с P0-проверок, а не с
расширения общего каталога Бретани.
