import { tx } from '../i18n';
import type { Level, TopicId } from '../types';

/* Obiekty z getterami – wartości zawsze w bieżącym języku. */

export const LEVEL_NAMES: Record<Level, string> = {
  get sp() { return tx('Szkoła podstawowa', 'Primary school'); },
  get lo() { return tx('Liceum', 'High school'); },
  get tech() { return tx('Technikum', 'Technical school'); },
};

export const LEVEL_SHORT: Record<Level, string> = {
  get sp() { return tx('SP', 'PRI'); },
  get lo() { return tx('LO', 'HS'); },
  get tech() { return 'TECH'; },
};

export const LEVEL_DESCRIPTIONS: Record<Level, string> = {
  get sp() { return tx('Działania, ułamki, procenty, proporcje, jednostki, pola i obwody, proste równania.', 'Arithmetic, fractions, percentages, ratios, units, area and perimeter, simple equations.'); },
  get lo() { return tx('Równania i układy, funkcje, ciągi, logarytmy, trygonometria, prawdopodobieństwo, stereometria.', 'Equations and systems, functions, sequences, logarithms, trigonometry, probability, solid geometry.'); },
  get tech() { return tx('Obliczenia finansowe i techniczne, jednostki, wydajność, analiza danych, kosztorysy.', 'Financial and technical calculations, units, efficiency, data analysis, cost estimates.'); },
};

export interface TopicInfo { name: string; exercise: string }

function topic(pl: string, en: string, exPl: string, exEn: string): TopicInfo {
  return { get name() { return tx(pl, en); }, get exercise() { return tx(exPl, exEn); } };
}

export const TOPICS: Record<TopicId, TopicInfo> = {
  dzialania: topic('Działania na liczbach', 'Arithmetic', 'Ćwicz rachunek pamięciowy: 10 działań dziennie, sprawdzaj wynik działaniem odwrotnym.', 'Practise mental arithmetic: 10 calculations a day, and check each result with the inverse operation.'),
  kolejnosc: topic('Kolejność wykonywania działań', 'Order of operations', 'Rozwiąż kilka wyrażeń z nawiasami – najpierw nawiasy, potem mnożenie i dzielenie, na końcu dodawanie i odejmowanie.', 'Solve a few expressions with brackets: brackets first, then multiplication and division, then addition and subtraction.'),
  ulamki: topic('Ułamki zwykłe i dziesiętne', 'Fractions and decimals', 'Porównuj ułamki, zamieniając je na postać dziesiętną lub sprowadzając do wspólnego mianownika.', 'Compare fractions by converting them to decimals or to a common denominator.'),
  procenty: topic('Procenty', 'Percentages', 'Ćwicz obliczanie p% z liczby oraz liczby z danego jej procentu (np. 70% ceny = 4,90 zł).', 'Practise finding p% of a number and finding a number from its percentage (e.g. 70% of the price = £4.90).'),
  proporcje: topic('Proporcje', 'Ratio and proportion', 'Układaj proporcje a : b = c : d i rozwiązuj je „na krzyż”. Sprawdzaj, czy wynik ma sens.', 'Set up proportions a : b = c : d and solve them by cross-multiplying. Check that the result makes sense.'),
  jednostki: topic('Jednostki miary', 'Units of measurement', 'Zrób ściągę przeliczeń (mm–cm–dm–m–km, g–kg–t, ml–l, s–min–h) i ćwicz zamiany w obie strony.', 'Make a conversion cheat sheet (mm–cm–m–km, g–kg–t, ml–l, s–min–h) and practise converting both ways.'),
  pola: topic('Pola i obwody figur', 'Area and perimeter', 'Powtórz wzory na pola: prostokąt, trójkąt, trapez, równoległobok, koło. Rysuj figurę i zaznaczaj wymiary.', 'Revise the area formulas: rectangle, triangle, trapezium, parallelogram, circle. Sketch the shape and mark its dimensions.'),
  bryly: topic('Bryły – objętość i pole', 'Solids: volume and surface area', 'Powtórz wzory na objętość graniastosłupa, ostrosłupa (1/3·Pp·H), walca, stożka i kuli.', 'Revise the volume formulas for a prism, pyramid (1/3·base·height), cylinder, cone and sphere.'),
  rownania: topic('Równania i układy równań', 'Equations and systems', 'Rozwiązuj równania krok po kroku i zawsze sprawdzaj wynik, podstawiając go do równania.', 'Solve equations step by step and always check the result by substituting it back.'),
  geometria: topic('Geometria płaska', 'Plane geometry', 'Powtórz własności wielokątów: sumy kątów, liczbę przekątnych n(n−3)/2, kąty w wielokątach foremnych.', 'Revise polygon properties: angle sums, the number of diagonals n(n−3)/2, angles of regular polygons.'),
  ciagi: topic('Ciągi liczbowe', 'Sequences', 'Ćwicz rozpoznawanie reguły ciągu oraz wzory na n-ty wyraz i sumę ciągu arytmetycznego i geometrycznego.', 'Practise spotting the rule of a sequence and the formulas for the n-th term and sum of arithmetic and geometric sequences.'),
  funkcje: topic('Funkcje', 'Functions', 'Odczytuj z wykresu miejsce zerowe, monotoniczność i wartości; dopasowuj wzór y = ax + b do wykresu.', 'Read roots, monotonicity and values from graphs; match the formula y = ax + b to a graph.'),
  trygonometria: topic('Trygonometria', 'Trigonometry', 'Powtórz wartości sin, cos, tg dla kątów 30°, 45°, 60° i zależności w trójkącie prostokątnym.', 'Revise sin, cos and tan for 30°, 45° and 60° and the relations in a right-angled triangle.'),
  logarytmy: topic('Logarytmy', 'Logarithms', 'Ćwicz definicję: logₐb = c ⇔ aᶜ = b. Zacznij od logarytmów o podstawie 2, 3 i 10.', 'Practise the definition: logₐb = c ⇔ aᶜ = b. Start with bases 2, 3 and 10.'),
  potegi: topic('Potęgi i pierwiastki', 'Powers and roots', 'Powtórz działania na potęgach i porównywanie liczb z pierwiastkami (szacowanie).', 'Revise the laws of indices and comparing numbers with roots (estimation).'),
  prawdopodobienstwo: topic('Prawdopodobieństwo i kombinatoryka', 'Probability and counting', 'Wypisuj wszystkie zdarzenia elementarne w prostych doświadczeniach i licz P(A) = |A| / |Ω|.', 'List all outcomes of simple experiments and compute P(A) = |A| / |Ω|.'),
  statystyka: topic('Statystyka', 'Statistics', 'Ćwicz liczenie średniej, mediany (najpierw uporządkuj dane!) i dominanty na krótkich zestawach danych.', 'Practise the mean, median (sort the data first!) and mode on short data sets.'),
  finanse: topic('Obliczenia finansowe', 'Financial maths', 'Porównuj oferty: oprocentowanie, kapitalizacja, rabaty. Licz na konkretnych kwotach.', 'Compare offers: interest rates, compounding, discounts. Work with concrete amounts.'),
  technika: topic('Obliczenia techniczne', 'Technical calculations', 'Ćwicz wzory techniczne: P = U·I, E = P·t, wydajność = ilość / czas. Pilnuj jednostek.', 'Practise technical formulas: P = U·I, E = P·t, output = quantity / time. Watch the units.'),
  logika: topic('Logika i łączenie informacji', 'Logic and combining clues', 'Zapisuj zebrane informacje w tabeli – łatwiej wtedy zauważyć, co wynika z czego.', 'Write the collected information in a table; it is easier to see what follows from what.'),
  wykresy: topic('Odczytywanie wykresów i danych', 'Reading charts and data', 'Przy każdym wykresie najpierw przeczytaj opisy osi i jednostki, dopiero potem odczytuj wartości.', 'For every chart, read the axis labels and units first, then read the values.'),
  systemy_liczbowe: topic('Systemy zapisu liczb', 'Number systems', 'Zapisuj liczby w systemie egipskim i rzymskim – to dobre ćwiczenie rozumienia rzędów wielkości.', 'Write numbers in Egyptian and Roman numerals; it is good practice for place value.'),
  optymalizacja: topic('Optymalizacja i dobór wariantu', 'Optimisation and choosing options', 'Porównuj warianty, licząc koszt lub wydajność na jednostkę (zł/kg, szt./h).', 'Compare options by computing cost or output per unit (per kg, pieces per hour).'),
};
