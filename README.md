# Matematyczny Escape Room

Edukacyjna gra przygodowa typu point-and-click do nauki matematyki (SP / LO / Technikum).
React + TypeScript + Vite, grafika SVG, zapis w localStorage. © 2026 CappySoft.pl

## Zagraj

https://thecappiestsoft.github.io/Matematyczny-Escape-Room/

## Uruchomienie

```bash
npm install
npm run dev          # tryb deweloperski (otwiera app.html)
npm run build        # build produkcyjny -> dist/
npm run build:single # cała gra w jednym pliku HTML -> dist-single/app.html
npm run build:pages  # jak build:single + kopia do ./index.html (wersja dla GitHub Pages)
npm test             # automatyczne przejście wszystkich scenariuszy na wszystkich poziomach
```

## GitHub Pages

- `app.html` – punkt wejścia kodu źródłowego (używany przez Vite).
- `index.html` – **gotowa, zbudowana gra** w jednym pliku. To ją wyświetla GitHub Pages
  (Settings → Pages → „Deploy from a branch”, gałąź `main`, folder `/ (root)`).
- Po każdej zmianie kodu workflow `.github/workflows/deploy.yml` uruchamia testy,
  buduje grę i sam odświeża `index.html`. Nie edytuj `index.html` ręcznie.

## Zawartość wersji 1

- 3 kompletne scenariusze (Stara Szkoła, Piramida, Laboratorium) × 4 pomieszczenia × 6–8 obiektów,
  każdy z osobnymi zadaniami dla SP, LO i technikum (inne metody, nie tylko inne liczby).
- 3 zapowiedziane rozdziały kampanii (Bank, Stacja kosmiczna, Zaginione miasto).
- Zamki: klawiatura numeryczna, pokrętła cyfrowe, koła litera+cyfra, koła symboli, zamki na przedmiot,
  mechanizmy z przełącznikami, zamki uruchamiane zdarzeniem (np. światło, zasilanie).
- Zagadki: liczbowe, wybór, porządkowanie, dopasowywanie par, kody łączone z kilku wskazówek, przełączniki,
  wykresy/tabele/figury/zegar/liczby egipskie.
- Ekwipunek, dziennik wskazówek, mapa, 3 poziomy podpowiedzi, czas, punktacja, raport edukacyjny, osiągnięcia.
- Motyw jasny i ciemny (przełącznik ze słońcem i księżycem na ekranie startowym i w menu gry), dwa języki: PL i EN.
- Tryby: szybka gra, kampania, wyzwanie na czas, tryb klasowy (drużyny na jednym urządzeniu, kod pokoju).
- Panel nauczyciela: lekcja, analiza błędów, klucz odpowiedzi, punktacja, eksport CSV/JSON, import, edytor scenariuszy
  z automatycznym sprawdzaniem grywalności, widok prezentacyjny.

## Architektura

```
src/types.ts              model danych (scenariusz = dane)
src/data/scenarios/       scenariusze (school, pyramid, lab, zapowiedzi)
src/engine/game.ts        silnik: interakcje, zamki, przedmioty, czas, punkty (czyste funkcje)
src/engine/answers.ts     sprawdzanie odpowiedzi
src/engine/report.ts      raport edukacyjny; achievements.ts – osiągnięcia; validate.ts – automatyczny tester
src/storage/repo.ts       interfejs Repository + LocalRepository (łatwa wymiana na backend)
src/net/transport.ts      interfejs pod grę sieciową w trybie klasowym (kod pokoju)
src/render/               tła, grafiki obiektów, wizualizacje (SVG)
src/ui/                   ekrany, gra, panel nauczyciela, edytor
```

Nowy scenariusz = nowy obiekt `Scenario` (plik w `src/data/scenarios/` lub edytor nauczyciela / import JSON).
