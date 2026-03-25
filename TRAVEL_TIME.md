# Kako sistem računa vreme putovanja između lokacija

## Kratko objašnjenje

Svaki put kad neko bira termin, sistem proverava da li specijalist fizički može da stigne — ili da ode — između dve lokacije. Kao kad planiraš put u Google Mapsu, samo mnogo jednostavnije.

---

## Odakle dolaze koordinate (GPS tačke)?

### Booking adresa (klijentova nekretnina)
Korisnik je u koraku 1 odabrao adresu koristeći Swisstopo pretragu ili klikanjem na mapu. Swisstopo vraća tačne GPS koordinate (`lat`, `lon`) te adrese. Te koordinate se prosleđuju dalje kroz ceo booking flow.

### Adrese već zakazanih termina (Outlook eventi)
Svaki termin u `OUTLOOK_CALENDAR` mock-u ima polje `location: { lat, lon, label }`. Ovo predstavlja koordinate lokacije na kojoj se taj snimak odvija.

U produkciji ove koordinate bi dolazile iz Microsoft Graph API-ja — konkretno iz `event.location.coordinates` koji Outlook čuva uz svaki događaj kada se booking kreira (i mi sami upisujemo koordinate kad pravimo novi termin).

### Office/baza (Propus studio)
Ako nekom eventu nedostaje lokacija (npr. interni meeting, trening), sistem koristi fiksnu tačku — `BASE_LOCATION` — što je Propus kancelarija u Zürichu (Zürich HB area). Pretpostavljamo da specijalist u tom slučaju kreće ili dolazi iz kancelarije.

---

## Kako se računa udaljenost između dve tačke?

Koristi se **Haversine formula** — to je matematička formula koja uzima dve GPS tačke i vraća **vazdušnu udaljenost** između njih u kilometrima.

Jednostavno rečeno: uzmeš koordinate tačke A i tačke B, i dobiješ "koliko je to kilometara u pravoj liniji", kao da povučeš konac na mapi između ta dva mesta.

**Primer:** Altstetten (zapad Züricha) → Witikon (istok Züricha) = oko 7.8 km vazdušnom linijom.

---

## Zašto vazdušna linija, a ne prava ruta?

Jer nemamo Google Maps. Vazdušna linija je uvek kraća od stvarne rute (nema zaobilaženja jednosmernih, mostova, semafora), pa kompenzujemo pretpostavljenom brzinom i fiksnim bufferima da bi rezultat bio realan u proseku.

---

## Kako se od distance dolazi do minuta?

```
distancaKm = haversine(tačka A, tačka B)

minutaVožnje = (distancaKm / 30) * 60   ← pretpostavka: 30 km/h prosek u gradu
+ 10 minuta                              ← pakovanje opreme, parking, hodanje do ulaza
= ukupno minuta

zaokruži na sledeći višekratnik od 5    ← npr. 22 min → 25 min
minimum 15 min                           ← čak i za komšiju, minimum je 15
```

**Zašto 30 km/h?** Zürich je kompaktan grad sa puno semafora, tramvaja i jednosmernih ulica. 30 km/h je realna prosečna brzina za spontanu vožnju bez autoputa, pogotovo sa opremom u autu.

**Zašto +10 min?** Specijalist ne može odmah da krene čim shoot završi — mora da pakuje stative, produžne kablove, laptop, eventualno plati parking, prođe kroz garažu.

---

## Šta algoritam konkretno proverava?

Za svaki kandidat termin (npr. 10:00–14:00), algoritam radi dve provere:

### Provera 1: "Da li može da stigne?" (backward)
Gleda poslednji event pre tog termina i pita:
> Ako je specijalist završio posao u **X lokaciji** u **X vreme**, da li ima dovoljno vremena da stigne do **klijentove adrese** pre nego što novi termin počne?

Ako ne može → blokira taj termin i prikazuje poruku.

### Provera 2: "Da li može da ode na vreme?" (forward)
Gleda sledeći event posle tog termina i pita:
> Ako novi termin završi u **Y vreme** na **klijentovoj adresi**, da li ima dovoljno vremena da stigne do **sledećeg eventa na Y lokaciji** pre nego što taj počne?

Ako ne može → blokira taj termin i prikazuje poruku.

---

## Šta sistem NE zna (ograničenja)

| Šta ne zna | Zašto je to bitno |
|---|---|
| Stvarna ruta (putevi, zaobilaznice) | Vazdušna linija je uvek kraća od pravog puta |
| Saobraćaj u realnom vremenu | Rush hour u 17h ≠ vožnja u 10h |
| Da li specijalist ima auto ili ide tramvajem | Uvek pretpostavljamo auto |
| Da li je parking dostupan odmah | Fiksan +10 min buffer može biti premalo ili previše |
| Weekendi / praznici (vreme vožnje je drugačije) | Nismo ih ni aktivirali za booking |

---

## Kako poboljšati u produkciji

Jedino što treba promeniti je funkcija `estimatedTravelMinutes()` u `app/booking/page.tsx` — sve ostalo (logika provjere slotova, UI prikaz) ostaje isto.

Umesto Haversine vazdušne linije → poziv na **Google Maps Distance Matrix API** (server-side, API key u `.env`):
```
GET https://maps.googleapis.com/maps/api/distancematrix/json
  ?origins=lat1,lon1
  &destinations=lat2,lon2
  &departure_time=now   ← uzima u obzir saobraćaj
  &mode=driving
  &key=GOOGLE_MAPS_API_KEY
```

Vraća stvarno vreme vožnje sa aktuelnim saobraćajem. Ostatak koda se ne menja.
