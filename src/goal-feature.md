# Hedef (Goal / Birikim) Özelliği — Kapsam

## Ne işe yarıyor

Kullanıcıya **"Hedef"** olarak pazarlanıyor, ama teknik olarak yeni bir işlem türü: **Birikim (`Saving`)**. Gelir/gider gibi para gerçekten çıkmıyor — sadece yer değiştiriyor. Bu yüzden **hiçbir toplam/rapor ekranında gider gibi sayılmaz** (`TotalExpense`, `NetBalance` vb. hiçbir yerde Saving'i içermez).

Akış RecurringTransaction/Subscription'dan farklı: Hedefe **katkı ekledikçe** (`contribute`) gerçek bir Birikim (`Saving`) tipinde `TransactionV2` kaydı oluşur ve hedefin `currentAmount`'ı (mevcut birikim) artar. Hedef başına biriken tutar, DB'de ayrıca tutulan bir alan (`Goal.CurrentAmount`) — transaction'ları toplayarak hesaplanmıyor, bu yüzden her zaman anlık ve tutarlıdır.

**Önemli kısıt**: Birikim tipinde bir `TransactionV2` **sadece** hedefe katkı akışıyla oluşturulabilir. Genel `POST/PUT/DELETE /api/transactions` üzerinden:
- Elle `TransactionType: Saving` ile işlem oluşturulamaz (400 döner)
- Var olan bir Saving işlemi güncellenemez/silinemez (400 döner, `BusinessRuleException`)

Yani "bir katkıyı düzeltme/geri alma" aksiyonu **bu iterasyonda yok** — hedefin kendisi silinebilir ama geçmiş katkı işlemleri (Saving transaction'lar) elle değiştirilemez/silinemez.

## `TransactionTypes` enum artık 3 değerli

```
Income  = 0   // Gelir
Expense = 1   // Gider
Saving  = 2   // Birikim — sadece hedef katkı akışından gelir
```

Bu, tüm proje genelinde geçerli — raporlar (`GET /api/reports/transactions/categorized`, `/noncategorized`), `GET /api/transactions?TransactionType=...`, Calendar (`GET /api/transactions/calendar`) gibi `TransactionType` parametresi/alanı kullanan her yerde `Saving` artık geçerli bir değer. FE tarafında transaction render ederken 3. bir görsel stil (ör. mavi/nötr renk, "Birikim" etiketi) eklemek gerekecek — Income/Expense ikilisine göre kodlanmış yerler varsa gözden geçirilmeli.

**`TransactionDto`'ya `goalId: int | null` eklendi** — bir işlem bir hedefe aitse (Saving tipindeyse) bu alan dolu gelir, aksi halde `null`.

## Endpoint'ler (base: `api/goals`)

| Method | Route | Açıklama |
|---|---|---|
| GET | `/` | Kart listesi (sayfalı + `IsCompleted` filtresi) |
| GET | `/metrics` | Dashboard metrikleri |
| GET | `/{id}` | Tekil hedef |
| POST | `/` | Hedef oluştur |
| PUT | `/{id}` | Hedef güncelle (biriken tutar buradan değişmez) |
| DELETE | `/{id}` | Hedefi sil (soft delete) |
| POST | `/{id}/contribute` | Hedefe katkı ekle |

### GET `/api/goals?PageNumber=1&PageSize=20&IsCompleted=false`
`IsCompleted` opsiyonel: `true` (tamamlananlar) / `false` (aktifler). Boş bırakılırsa hepsi döner ("Tümü").

Response: `BaseResponse<PaginatedModel<GoalDto>>`.

### GET `/api/goals/metrics?CurrencyId=1`
`CurrencyId` opsiyonel filtre. **Belirtilmezse tüm para birimleri karışık toplanır** (projedeki `period-summary`/`category-spending` raporlarıyla aynı, mevcut/kabul edilen davranış) — çoklu para birimi kullanan kullanıcılar için FE'nin bunu bilmesi gerekiyor.

```json
{
  "activeGoalCount": 3,
  "completedGoalCount": 1,
  "totalTargetAmount": 150000.00,
  "totalSavedAmount": 42500.00,
  "currency": null
}
```

### POST `/api/goals` — body
```json
{
  "name": "Araba Peşinatı",
  "targetAmount": 100000.00,
  "currencyId": 1,
  "deadline": "2027-06-01T00:00:00",
  "labels": [4, 9]
}
```
- `targetAmount`: zorunlu, > 0
- `currencyId`: zorunlu (Subscription'daki gibi "belirsiz tutar" kavramı yok — hedef tutarı ve para birimi hep net)
- `deadline`: **opsiyonel** ("Son Tarih" — açık uçlu hedefler de olabilir, null geçilebilir)
- `labels`: `UserLabel.Id` listesi, birden fazla olabilir
- `currentAmount` (mevcut birikim) create body'sinde **yok** — her hedef 0 ile başlar

### PUT `/api/goals/{id}` — aynı body (Create ile birebir aynı alanlar)
`currentAmount` burada da **yok/değiştirilemez** — sadece `name`, `targetAmount`, `currencyId`, `deadline`, `labels` güncellenebilir. Biriken tutarı değiştirmenin tek yolu `contribute` endpoint'i.

### DELETE `/api/goals/{id}` — body yok, soft delete
Hedef silindiğinde ona ait **tüm katkı (Saving) transaction'ları da silinir** (cascade soft-delete) — hedef ile birlikte katkı geçmişi de kaybolur, raporlarda/`GET /api/transactions`'ta artık görünmezler.

### POST `/api/goals/{id}/contribute` — body
```json
{
  "amount": 5000.00,
  "contributionDate": "2026-08-25T10:00:00"
}
```
- `amount`: zorunlu, > 0
- `contributionDate`: opsiyonel, verilmezse `now`
- **`currencyId` YOK** — katkı her zaman hedefin kendi para birimini kullanır (karışıklığı önlemek için), FE bu alanı göndermemeli/formda göstermemeli
- Bu çağrı: (1) `goal.currentAmount`'ı `amount` kadar artırır, (2) arka planda `TransactionType: Saving`, `GoalId: {id}` olan gerçek bir `TransactionV2` oluşturur (raporlarda/takvimde görünür, ama gider olarak sayılmaz)

## Response — `GoalDto`
```json
{
  "id": 7,
  "name": "Araba Peşinatı",
  "targetAmount": 100000.00,
  "currentAmount": 42500.00,
  "remainingAmount": 57500.00,
  "progressPercent": 42.5,
  "isCompleted": false,
  "currency": { "id": 1, "code": "TRY", "symbol": "₺", "isSymbolRight": false, "name": "Türk Lirası", "rank": 1 },
  "deadline": "2027-06-01T00:00:00",
  "labels": [{ "id": 4, "name": "Araç", "colorCode": "#3366ff" }]
}
```
- `remainingAmount`, `progressPercent`, `isCompleted` **backend'de türetilir** (DB'de tutulmaz): `remainingAmount = max(0, target - current)`, `progressPercent = min(100, current/target*100)`, `isCompleted = current >= target`
- Hedefin üzerinde katkı yapılabilir (`currentAmount > targetAmount` olabilir) — bu durumda `progressPercent` görsel olarak 100'de kalır, `remainingAmount` 0 olur, ama `currentAmount` gerçek (>target) değeri gösterir

## Kart ekranı için FE notları
- **Metrikler** (`GET /api/goals/metrics`): "Aktif Hedef Sayısı" = `activeGoalCount`, "Tamamlanan Hedef Sayısı" = `completedGoalCount`, "Toplam Hedef Tutarı" = `totalTargetAmount`, "Toplam Biriken Tutar" = `totalSavedAmount`.
- **Kart listesi** (`GET /api/goals`): her kartta progress bar için `progressPercent` doğrudan kullanılabilir; kart üzerinde "Biriken: {currentAmount}", "Kalan: {remainingAmount}", "Hedef: {targetAmount}" gösterilebilir.
- `isCompleted: true` olan kartlar farklı bir rozet/stil ile ayrılabilir (ör. "Tamamlandı 🎉").
- "Katkı ekle" aksiyonu → `POST /{id}/contribute`, muhtemelen bir modal ile tutar/tarih sorulmalı (para birimi hedeften sabit, tekrar sorulmamalı).

## Diğer ekranlara etkisi
- **Raporlar** (`GET /api/reports/transactions/categorized`, `/noncategorized`, `/category-spending`, `/period-summary`): `Expense`/`Income` toplamları **değişmedi**, Saving hiçbirine karışmaz. Kategorize/kategorize-olmayan rapor endpoint'lerinde `TransactionTypes` filtre parametresi olarak artık `Saving` da geçerli — istersen "Birikim raporu" gibi ayrı bir görünüm için kullanılabilir.
- **Takvim** (`GET /api/transactions/calendar`): Saving transaction'lar günün `transactionCount`/`previewTransactions` alanlarında görünür (gerçek bir işlem olduğu için), ama `totalIncome`/`totalExpense`'e dahil edilmez. Ayrı bir `totalSaving` alanı **eklenmedi** — FE, önizleme işlemlerini `transactionType` alanına göre kendi ayırt edip farklı render edebilir.
- **Genel işlem listesi** (`GET /api/transactions`): `TransactionType=Saving` filtresiyle sadece katkı işlemleri listelenebilir; her satırda `goalId` doluysa hangi hedefe ait olduğu bilinir. Bu ekrandan bir Saving satırının düzenle/sil aksiyonları **backend'de 400 döner** — FE'nin bu satırlar için düzenle/sil butonlarını gizlemesi (veya deneyip hata almadan önce engellemesi) önerilir.
