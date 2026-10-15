# kendo-kdpw

Zadanie rekrutacyjne: tabela w KendoReact ze stronicowaniem i filtrowaniem po stronie serwera, zasilana publicznym API Hacker News. Cała obsługa siatki siedzi w jednym generycznym komponencie, `GridWrapper`.

## Co robi aplikacja

Tabela pokazuje posty z Hacker News (wyszukiwarka Algolia). Zmiana strony albo filtra to nowe zapytanie do API, więc przeglądarka dostaje zawsze tylko jedną stronę wyników.

- Stronicowanie po 10 rekordów.
- Filtry pod nagłówkami kolumn: tekstowe (Title, Author), liczbowe (Points, Comments, filtrują "co najmniej") i lista rozwijana (Type). Pola tekstowe mają debounce 400 ms, lista działa od razu.
- Najważniejsze dane są w kolumnach, reszta (data utworzenia, link, dyskusja na HN, treść) w wierszu rozwijanym przyciskiem "...".
- Zaznaczanie jednego wiersza; ponowne kliknięcie odznacza. Przycisk "Show selected row" wypisuje dane zaznaczonego wiersza nad tabelą.
- Przycisk "Refresh" ponawia zapytanie z bieżącą stroną i filtrami. Podczas ładowania i odświeżania widać preloader.
- Kolor wiersza zależy od liczby komentarzy: od 2000 wzwyż zielony, poniżej 500 czerwony.

## Uruchomienie

```bash
npm install
npm run dev       # http://localhost:5173
# pozostałe skrypty: npm run build (typy + build produkcyjny), npm run preview, npm run lint
```

### Licencja Kendo

KendoReact wymaga klucza licencyjnego. Bez niego komponenty działają w trybie próbnym i w konsoli pojawia się ostrzeżenie.

## API

Dane pochodzą z publicznego [Hacker News API przez Algolia](https://hn.algolia.com/api).
Endpoint używany w aplikacji: `https://hn.algolia.com/api/v1/search` (zdefiniowany w `src/api/hackerNews.ts`).
Ważne: Algolia udostępnia maksymalnie 1000 najnowszych rekordów na zapytanie.

## GridWrapper

Konfiguracja kolumn i funkcja pobierająca dane wystarczą, żeby dostać gotową tabelę:

const COLUMNS: readonly GridColumnConfig<HnPost>[] = [
  { field: 'type', title: 'Type', width: 130, filter: { type: 'dropdown', options: TYPE_OPTIONS } },
  { field: 'title', title: 'Title', filter: { type: 'text' } },
  { field: 'author', title: 'Author', width: 180, filter: { type: 'text' } },
  { field: 'points', title: 'Points', width: 110, filter: { type: 'number' } },
  { field: 'comments', title: 'Comments', width: 120, filter: { type: 'number' } },
];

<GridWrapper<HnPost>
  title="Hacker News"
  columns={COLUMNS}
  idField="id"
  fetchData={fetchPosts}
  pageSize={10}
  renderDetail={renderPostDetail}
  getRowTone={getRowTone}
/>

| Prop | Znaczenie |
| --- | --- |
| columns | opis kolumn: pole obiektu (sprawdzane przez TypeScript), tytuł, szerokość, opcjonalny filtr (text, number, dropdown) i własne renderowanie komórki |
| idField | pole z unikalnym identyfikatorem wiersza |
| fetchData | (query) => Promise<{ items, total }>; query zawiera skip, take, filters i signal do anulowania |
| pageSize | rozmiar strony, domyślnie 10 |
| renderDetail | zawartość wiersza rozwijanego; bez niego nie ma kolumny z ... |
| getRowTone | 'positive' / 'negative' / undefined, czyli kolor wiersza |
| title | nagłówek nad tabelą |

columns, fetchData, renderDetail i getRowTone powinny mieć stałą tożsamość: najlepiej stała na poziomie modułu albo useMemo / useCallback. Komponenty komórek Kendo są tworzone raz na obiekt kolumny, więc kolumny definiowane inline resetowałyby pola filtrów przy każdym renderze.

Mapowanie filtrów na parametry konkretnego API zostaje poza wrapperem. Dla Hacker News robi to api/hackerNews.ts (tytuł trafia do query, typ i autor do tags, liczby do numericFilters).


## Struktura

```
src/
  App.tsx                 # główny komponent, konfiguruje GridWrapper
  main.tsx                # wejście aplikacji
  styles.css              # style siatki i przycisków
  api/
    types.ts              # DataQuery, PagedResult
    hackerNews.ts         # fetchPosts — pobieranie z Algolia
  components/
    GridWrapper/
      GridWrapper.tsx     # siatka Kendo, stan detali, filtry, paginacja
      types.ts            # typy GridWrapperProps, ColumnFilter, RowTone
      context/GridContext.tsx
      parts/GridParts.tsx      # GridRow, GridDetail
      parts/SelectedRow.tsx    # podgląd zaznaczonego wiersza
      filters.ts
      cells/cellFactories.tsx  # komórki danych i filtry (tekst/liczba/dropdown)
    PostDetail.tsx        # detale posta rozwinięte pod wierszem
  utils/
    rowTone.ts            # kolorowanie wierszy według liczby komentarzy
```