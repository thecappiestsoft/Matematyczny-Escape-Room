import type { ScenarioOverlay } from '../../localize';
import { lvl } from '../../helpers';

const doorPrompt = 'Lock: a LETTER and a two-digit number. The letter comes from the monitor with the table, the number from the printout.';
const consolePrompt = 'The console has three power dials: X, Y, Z.';

export const labEn: ScenarioOverlay = {
  title: 'The Science Laboratory',
  subtitle: 'Chapter III – System Failure',
  description: 'The security system of a modern laboratory has failed. The doors are locked and the power is going down. Restart the devices one by one and restore power in the control centre.',
  intro: 'The last page of the notebook of the Class of 1926 contained the address of a modern laboratory. You have barely stepped inside when a siren sounds: “SECURITY SYSTEM FAILURE. DOORS LOCKED”. The lights switch to emergency mode. To get out, you must restore the power step by step.',
  ending: 'The power console glows green: “POWER RESTORED. LOCKDOWN LIFTED”. The emergency doors slide open with a hiss. One more message appears on the screen: “Thank you, Guardian of Numbers. More missions are waiting: a bank, a space station, a lost city…”.',
  reward: 'Lab Rescuer',
  items: {
    karta_dostepu: { name: 'Access card', description: 'A laboratory card with access level 1.' },
    klucz_narzedzia: { name: 'Small key', description: 'A small key labelled “Toolbox”.' },
    bezpiecznik: { name: 'Fuse', description: 'A spare 16 A fuse.' },
  },
  clues: {
    notatnik: { title: 'Lab technician’s notebook', text: '“Reagent cabinet code (4 digits): BEAKERS (two digits), then MICROSCOPE, then WHITEBOARD.”' },
    zlewki_wynik: { title: 'Result from the beakers', text: 'The beaker task gives the number 40 – the first two digits of the cabinet code.' },
    mikroskop: {
      title: 'Slide under the microscope',
      text: lvl(
        'The slide is labelled: “Digit = number of cells: 3² − 2”.',
        'On the slide: “A cell divides in two every hour. Digit = after how many hours one cell becomes 128 cells”.',
        'On the slide: “The image of a cell is 2.8 mm at 400× magnification. Digit = the real size of the cell in micrometres (μm)”.',
      ),
    },
    tablica: {
      title: 'Whiteboard',
      text: lvl(
        'Written on the board: “Digit = x, if x ÷ 4 = 2”.',
        'Written on the board: “f(x) = 2x − 3. Digit = the argument for which f(x) = 13”.',
        'Written on the board: “Digit = the energy (kWh) used by a 2 kW device running for 4 h”.',
      ),
    },
    tabela: {
      title: 'Monitor with the sample table',
      text: lvl(
        '“The LETTER of the storeroom door password = the sample whose temperature equals the MEAN temperature of all samples.”',
        '“The LETTER of the storeroom door password = the sample for which f(x) = x² − 6x + 10 is the SMALLEST.”',
        '“The LETTER of the storeroom door password = the production line with the HIGHEST output (pieces per hour).”',
      ),
      visual: lvl(
        { type: 'table', title: 'Sample temperatures', headers: ['Sample', 'A', 'B', 'C', 'D', 'E'], rows: [['°C', 12, 18, 9, 15, 21]] },
        { type: 'table', title: 'Samples – parameter x', headers: ['Sample', 'A', 'B', 'C', 'D', 'E'], rows: [['x', 1, 2, 3, 4, 5]] },
        { type: 'table', title: 'Production lines', headers: ['Line', 'A', 'B', 'C', 'D', 'E'], rows: [['pieces', 480, 350, 420, 300, 540], ['hours worked', 8, 5, 7, 4, 9]] },
      ),
    },
    wydruk: {
      title: 'Printout',
      text: lvl(
        '“The NUMBER in the storeroom door password = the perimeter of a rectangle with sides 15 and 6.”',
        '“The NUMBER in the storeroom door password = the sum of the first six terms of the sequence 2, 4, 6, 8, …”',
        '“The NUMBER in the storeroom door password = 35% of 120.”',
      ),
    },
    lista: { title: 'Inventory list', text: '“The toolbox key is in the shelf mechanism. The shelf releases its lock when the boxes are in the right order (see the labels).”' },
    wykres_mocy: {
      title: 'Energy-use screen',
      text: lvl(
        '“First digit of the console code = the consumption (kW) of the module that uses the LEAST energy.”',
        '“First digit of the console code = the ROOT (x-intercept) of the linear function on the graph.”',
        '“First digit of the console code = the number of months in which the energy cost EXCEEDED £400.”',
      ),
      visual: lvl(
        { type: 'bars', title: 'Module consumption (kW)', labels: ['A', 'B', 'C', 'D'], values: [6, 3, 8, 5], unit: 'kW' },
        { type: 'line', title: 'Generator characteristic', xLabel: 'x', yLabel: 'y', points: [[0, -6], [1, -4], [2, -2], [3, 0], [4, 2]], connect: true, extend: true, xRange: [-2, 6], yRange: [-8, 4], grid: true },
        { type: 'bars', title: 'Energy cost (£)', labels: ['I', 'II', 'III', 'IV', 'V'], values: [350, 420, 380, 450, 410], unit: '£' },
      ),
    },
    dziennik: {
      title: 'Fault log',
      text: lvl(
        '“The console code is X, Y, Z. X – from the energy screen. Y = (X + 9) ÷ 2. Z = Y − X + 2.”',
        '“The console code is X, Y, Z. X – from the screen. Y = log₂ 64. Z satisfies the equation 2Z − Y = 4.”',
        '“The console code is X, Y, Z. X – from the cost screen. Y = the power (kW) of a 230 V, 26 A device, rounded to a whole number. Z = the pump output in l/min if it pumps 300 l per hour.”',
      ),
    },
  },
  puzzles: {
    zlewki: {
      sp: { title: 'Beakers of solution', unit: 'ml', prompt: 'Instructions: “Mix 2 parts concentrate with 3 parts water”. How many ml of concentrate should be added to 60 ml of water?',
        hints: ['The ratio of concentrate to water must stay 2 : 3.', '60 ml of water is 3 parts – how many ml is one part?', '60 ÷ 3 = 20 ml; 2 · 20 = 40 ml.'] },
      lo: { title: 'Beakers of solution', unit: 'g', prompt: 'How many grams of salt must be dissolved in 160 g of water to get a 20% solution?',
        hints: ['Concentration = mass of solute / mass of the WHOLE solution.', 's / (s + 160) = 0.2.', 's = 0.2s + 32 → 0.8s = 32 → s = 40 g.'] },
      tech: { title: 'Beakers of solution', unit: 'l', prompt: 'How many litres of 25% concentrate are needed to make 100 l of 10% solution after diluting with water?',
        hints: ['Water does not change the amount of pure substance.', 'Pure substance in the final solution: 10% · 100 l = 10 l.', '0.25 · x = 10 → x = 40 l.'] },
    },
    szafka: {
      title: 'Reagent cabinet', prompt: 'The cabinet’s electronic lock: 4 digits.',
      hints: ['The technician’s notebook says where the digits come from and in what order.', 'The beakers give a two-digit number; the microscope and the whiteboard give one digit each.', 'Beakers: 40, microscope: 7, whiteboard: 8 → 4078.'],
    },
    robot: {
      sp: { title: 'Cleaning robot', unit: 'm', prompt: 'The robot drove 3 laps around a 4 m × 6 m rectangular table. How many metres did it travel?', hints: ['One lap is the perimeter of the rectangle.', 'Perimeter = 2 · (4 + 6) = 20 m.', '3 · 20 = 60 m.'] },
      lo: { title: 'Cleaning robot', unit: 'm', prompt: 'The robot drove 10 m in a straight line at 30° to the wall. How many metres did it move away from the wall?', hints: ['Draw a right-angled triangle: the robot’s path is the hypotenuse.', 'The distance from the wall is opposite the 30° angle: d = 10 · sin 30°.', 'd = 10 · 1/2 = 5 m.'] },
      tech: { title: 'Cleaning robot', unit: 'min', prompt: 'The robot’s battery has a capacity of 5 Ah and the robot draws 2 A. How many minutes can it run?', hints: ['Running time = capacity / current.', '5 Ah ÷ 2 A = 2.5 h.', '2.5 h = 150 min.'] },
    },
    serwery: {
      sp: { title: 'Server rack', prompt: 'The backup power supply can handle EXACTLY 500 W. Switch on servers with a total draw of 500 W.', hints: ['Try starting with the largest server.', '500 − 300 = 200. Which servers add up to 200 W?', '300 + 120 + 80 = 500 W.'] },
      lo: { title: 'Server rack', prompt: 'The server loads are described by expressions. Switch on servers with a total load of EXACTLY 20.',
        switchLabels: ['f(2), f(x) = x² + 1', 'log 1000', 'a₄ of 2, 4, 8, …', '|−7|', 'sin²x + cos²x'],
        hints: ['Evaluate each expression.', 'f(2) = 5, log 1000 = 3, a₄ = 16, |−7| = 7, sin²x + cos²x = 1.', '16 + 3 + 1 = 20.'] },
      tech: { title: 'Server rack', prompt: 'The UPS has a power of 1.6 kW. Switch on servers with a total draw of EXACTLY 1.6 kW.',
        switchLabels: ['0.4 kW', '250 W', '1.1 kW', '350 W', '0.6 kW'],
        hints: ['Convert everything to watts.', '400, 250, 1100, 350, 600 W; target: 1600 W.', '400 + 250 + 350 + 600 = 1600 W.'] },
    },
    terminal: {
      sp: { title: 'Terminal – temperature graph', prompt: 'The terminal asks: “At what time was the temperature in the chamber HIGHEST?”',
        visual: { type: 'line', title: 'Chamber temperature (°C)', xLabel: 'hour', yLabel: '°C', points: [[8, 18], [10, 22], [12, 27], [14, 25], [16, 21]], connect: true, xRange: [7, 17], yRange: [0, 30], grid: true },
        options: ['8:00', '10:00', '12:00', '14:00'],
        hints: ['Look for the highest point on the graph.', 'Read the values: 18, 22, 27, 25, 21 °C.', 'The highest temperature (27 °C) was at 12:00.'] },
      lo: { title: 'Terminal – graph of a function', prompt: 'The terminal asks: “Which formula describes the function on the graph?”',
        visual: { type: 'line', title: 'Graph of a function', xLabel: 'x', yLabel: 'y', points: [[0, 2], [3, -4]], connect: true, extend: true, xRange: [-2, 5], yRange: [-6, 6], grid: true },
        options: ['y = 2x + 2', 'y = −2x + 2', 'y = −0.5x + 2', 'y = −2x − 2'],
        hints: ['Read where the line crosses the y-axis and check whether it rises or falls.', 'c = 2. m = (−4 − 2)/(3 − 0).', 'm = −2, c = 2 → y = −2x + 2.'] },
      tech: { title: 'Terminal – production cost', prompt: 'The terminal asks: “The graph shows the cost K of producing n items. What are the fixed cost and the cost per item?”',
        visual: { type: 'line', title: 'Production cost K(n) [£]', xLabel: 'n (items)', yLabel: '£', points: [[0, 500], [10, 700], [20, 900]], connect: true, xRange: [0, 25], yRange: [0, 1100], grid: true },
        options: ['£200 and £50/item', '£500 and £20/item', '£500 and £70/item', '£700 and £20/item'],
        hints: ['The fixed cost is paid even when n = 0.', 'K(0) = 500. By how much does the cost rise for 10 more items?', '(700 − 500) / 10 = £20/item. Answer: £500 and £20/item.'] },
    },
    kubek: {
      sp: { title: 'Programmer’s mug', unit: 'mugs', prompt: 'The mug says: “I hold 250 ml”. How many such mugs can you fill from 2 l of coffee?', hints: ['Convert litres to millilitres.', '2 l = 2000 ml.', '2000 ÷ 250 = 8 mugs.'] },
      lo: { title: 'Programmer’s mug', prompt: 'The mug says: “3^(x+1) = 81”. Find x.', hints: ['Write 81 as a power of three.', '81 = 3⁴, so x + 1 = 4.', 'x = 3.'] },
      tech: { title: 'Programmer’s mug', unit: 'm/s', prompt: 'The mug says: “My forklift goes 72 km/h”. How many m/s is that?', hints: ['1 km = 1000 m, 1 h = 3600 s.', 'Divide a speed in km/h by 3.6.', '72 ÷ 3.6 = 20 m/s.'] },
    },
    drzwi_magazyn: {
      sp: { title: 'Storeroom door', prompt: doorPrompt, hints: ['You need the monitor with the table and the printout (start the terminal first).', 'Mean = sum ÷ 5. Perimeter of a rectangle = 2(a + b).', 'Mean: 75 ÷ 5 = 15 → sample D. Perimeter: 2 · 21 = 42. Password: D42.'] },
      lo: { title: 'Storeroom door', prompt: doorPrompt, hints: ['You need the monitor with the table and the printout (start the terminal first).', 'Vertex of a parabola: p = −b/(2a). Sum of an arithmetic sequence: Sₙ = (a₁ + aₙ)/2 · n.', 'p = 3 → sample C (f(3) = 1). S₆ = (2 + 12)/2 · 6 = 42. Password: C42.'] },
      tech: { title: 'Storeroom door', prompt: doorPrompt, hints: ['You need the monitor with the table and the printout (start the terminal first).', 'Output = pieces ÷ hours. 35% = 0.35.', 'A 60, B 70, C 60, D 75, E 60 pieces/h → D. 0.35 · 120 = 42. Password: D42.'] },
    },
    pudla: {
      sp: { title: 'Shelf with boxes', orderLabel: ['smallest volume', 'largest volume'], prompt: 'Arrange the boxes (cuboids, dimensions in dm) from the SMALLEST to the LARGEST volume.',
        items: ['D: 4 × 4 × 1', 'B: 5 × 2 × 2', 'A: 2 × 3 × 4', 'E: 1 × 5 × 5', 'C: 3 × 3 × 3'],
        hints: ['Work out the volume of each box.', 'V = a · b · c.', 'D = 16, B = 20, A = 24, E = 25, C = 27 dm³.'] },
      lo: { title: 'Shelf with containers', orderLabel: ['smallest volume', 'largest volume'], prompt: 'Arrange the containers from the SMALLEST to the LARGEST volume (dimensions in dm).',
        items: ['pyramid: base 9 × 9, H = 4', 'sphere: r = 3', 'cube: a = 5', 'cylinder: r = 3, h = 5', 'cone: r = 6, h = 4'],
        hints: ['Work out the volumes, taking π ≈ 3.14.', 'Pyramid 1/3·base·H, sphere 4/3πr³, cylinder πr²h, cone 1/3πr²h.', '108 < 36π ≈ 113 < 125 < 45π ≈ 141 < 48π ≈ 151.'] },
      tech: { title: 'Shelf with deliveries', orderLabel: ['cheapest per kg', 'most expensive per kg'], prompt: 'Arrange the deliveries from the LOWEST to the HIGHEST price per 1 kg.',
        items: ['B: 5 kg for £20', 'E: 20 kg for £85', 'A: 12 kg for £54', 'D: 8 kg for £38', 'C: 25 kg for £125'],
        hints: ['Compare the unit price, not the price of the whole delivery.', 'Price per kg = price ÷ mass.', 'B 4.00; E 4.25; A 4.50; D 4.75; C 5.00 £/kg.'] },
    },
    waga: {
      sp: { title: 'Warehouse scale', unit: 'g', prompt: 'The scale shows 2 kg 350 g. How many grams is that?', hints: ['1 kg = 1000 g.', '2 kg = 2000 g.', '2000 + 350 = 2350 g.'] },
      lo: { title: 'Warehouse scale', unit: 'g', prompt: 'The mass of an isotope decreases according to m(t) = 80 · (1/2)^(t/5), t in years. How many grams remain after 15 years?', hints: ['Substitute t = 15.', '(1/2)^(15/5) = (1/2)³ = 1/8.', '80 · 1/8 = 10 g.'] },
      tech: { title: 'Warehouse scale', unit: 'boxes', prompt: 'A pallet of boxes weighs 800 kg. The empty pallet weighs 25 kg and one box weighs 25 kg. How many boxes are on the pallet?', hints: ['Subtract the mass of the pallet.', '800 − 25 = 775 kg of boxes.', '775 ÷ 25 = 31 boxes.'] },
    },
    kalibracja: {
      sp: { title: 'Calibration panel', prompt: 'Connect the units with their equivalents to calibrate the sensors.',
        pairs: [['1 km', '1000 m'], ['1 h', '60 min'], ['1 m', '100 cm'], ['1 day', '24 h']],
        hints: ['Each pair describes the same quantity in different units.', 'Kilo = thousand, centi = hundredth.', '1 km = 1000 m, 1 h = 60 min, 1 m = 100 cm, 1 day = 24 h.'] },
      lo: { title: 'Calibration panel', prompt: 'Connect each function with its property.',
        pairs: [['f(x) = 2x + 1', 'linear, increasing'], ['f(x) = −x² + 4', 'maximum at x = 0'], ['f(x) = 2ˣ', 'horizontal asymptote y = 0'], ['f(x) = log x', 'domain: x > 0']],
        hints: ['Think about the type of function: linear, quadratic, exponential, logarithmic.', 'A parabola with a < 0 has its maximum at the vertex. A logarithm exists only for positive numbers.', '2x+1 – linear increasing; −x²+4 – maximum at 0; 2ˣ – asymptote y = 0; log x – x > 0.'] },
      tech: { title: 'Calibration panel', prompt: 'Connect the physical quantities with their units.',
        pairs: [['power', 'W (watt)'], ['energy', 'kWh'], ['pressure', 'Pa (pascal)'], ['electric current', 'A (ampere)']],
        hints: ['On an electricity bill you pay for energy.', 'A bulb’s power is given in watts, pressure in pascals.', 'Power – W, energy – kWh, pressure – Pa, current – A.'] },
    },
    konsola: {
      sp: { title: 'Power console', prompt: consolePrompt, hints: ['X is on the energy-use screen; the formulas for Y and Z are in the fault log.', 'The shortest bar: module B. Substitute X into the formulas.', 'X = 3, Y = (3 + 9) ÷ 2 = 6, Z = 6 − 3 + 2 = 5 → 365.'] },
      lo: { title: 'Power console', prompt: consolePrompt, hints: ['X is on the screen (graph); the formulas for Y and Z are in the fault log.', 'The root is the x for which y = 0. 2⁶ = 64.', 'X = 3, Y = 6, 2Z − 6 = 4 → Z = 5 → 365.'] },
      tech: { title: 'Power console', prompt: consolePrompt, hints: ['X is on the cost screen; the formulas for Y and Z are in the fault log.', 'P = U · I. 1 h = 60 min.', 'X = 3 (II, IV, V), Y = 230 · 26 = 5980 W ≈ 6 kW, Z = 300 ÷ 60 = 5 → 365.'] },
    },
    dron: {
      sp: { title: 'Inspection drone', unit: 'm', prompt: 'The drone flies at 12 m/s. How many metres does it cover in 1.5 minutes?', hints: ['Convert minutes to seconds.', '1.5 min = 90 s. Distance = speed · time.', '12 · 90 = 1080 m.'] },
      lo: { title: 'Inspection drone', unit: 'm', prompt: 'The drone climbs in a straight line at 30° to the ground and travels 40 m. How high is it?', hints: ['The height is the side opposite the 30° angle.', 'h = 40 · sin 30°.', 'h = 40 · 0.5 = 20 m.'] },
      tech: { title: 'Inspection drone', unit: 'min', prompt: 'The drone’s battery is 4000 mAh and its motors draw 8 A. For how many minutes can it fly?', hints: ['Convert mAh to Ah.', '4000 mAh = 4 Ah; time = 4 Ah ÷ 8 A.', '0.5 h = 30 min.'] },
    },
  },
  rooms: {
    glowne: {
      name: 'Main laboratory',
      intro: 'The main laboratory. A red emergency light is pulsing. The door needs an access card, and the card is probably in the locked reagent cabinet.',
      objects: {
        l_tablica: { name: 'Whiteboard', description: 'A whiteboard with the scientists’ notes.' },
        l_notatnik: { name: 'Lab technician’s notebook', description: 'The notebook lies on the lab bench. The last entry is underlined.' },
        l_mikroskop: { name: 'Microscope', description: 'There is a labelled slide under the microscope.' },
        l_zlewki: { name: 'Beakers of solution', description: 'Beakers of coloured liquids. Next to them, instructions for preparing a solution.', openedText: 'The solution is ready – the label shows the number 40.' },
        l_szafka: { name: 'Reagent cabinet', description: 'A glass cabinet with a 4-digit electronic lock.', openedText: 'The cabinet is open.', message: 'The lock beeps: ACCESS GRANTED. Among the vials lies an access card!' },
        l_robot: { name: 'Cleaning robot', description: 'The cleaning robot is stuck under the bench. A task is shown on its little screen.', openedText: 'The robot beeps happily.' },
        l_gasnica: { name: 'Fire extinguisher', description: 'A powder extinguisher, recently inspected. Luckily nothing is on fire.' },
        l_drzwi: { name: 'Door to the computer room', description: 'An automatic door with a card reader.', lockedText: 'Reader: “USE ACCESS CARD”.', openedText: 'The door has slid open.' },
      },
    },
    komputery: {
      name: 'Computer room',
      intro: 'The computer room. The monitors are black and the servers have gone quiet. The power must be restored carefully.',
      objects: {
        c_serwery: { name: 'Server rack', description: 'A rack with five servers and power switches.', openedText: 'The servers hum steadily. Power is on.', message: 'The fans start up and the lights turn green. The terminal is booting!' },
        c_terminal_off: { name: 'Terminal (off)', description: 'The screen is black. No power – start the servers first.' },
        c_terminal: { name: 'Terminal', description: 'The terminal asks a security question.', openedText: 'Terminal: “Correct answer. Printout sent”.', message: 'Terminal: “ACCESS GRANTED”. You hear the printer starting to print.' },
        c_monitor: { name: 'Monitor with a table', description: 'The monitor runs on a battery. It shows a table and a message.' },
        c_drukarka: { name: 'Printer', description: 'A laser printer.', lockedText: 'The printer is waiting for a job from the terminal.', openedText: 'A sheet of paper has come out of the printer.' },
        c_kubek: { name: 'Mug', description: 'A mug with a slogan and a task.', openedText: 'The coffee went cold long ago.' },
        c_powrot: { name: 'Door to the laboratory', description: 'The way back to the main laboratory.' },
        c_drzwi: { name: 'Storeroom door', description: 'A door with a combination lock: a letter and two digits.', openedText: 'The storeroom door is open.' },
      },
    },
    magazyn: {
      name: 'Storeroom',
      intro: 'The storeroom. Rows of shelves, sample containers and a door to the control centre – without power.',
      objects: {
        m_regal: { name: 'Shelf with boxes', description: 'Five labelled boxes stand on the shelf. The shelf has a mechanical lock.', openedText: 'The shelf lock has been released.', message: 'Click! A small key drops out of the shelf mechanism.' },
        m_lista: { name: 'Inventory list', description: 'A clipboard with an inventory list.' },
        m_kontener: { name: 'Sample container', description: 'A container marked “SAMPLES – DO NOT OPEN”. Better leave it alone.' },
        m_skrzynka: { name: 'Toolbox', description: 'A metal box with a padlock.', lockedText: 'A padlock. You need a small key.', openedText: 'The toolbox is open.', message: 'Among the screwdrivers in the box lies a spare fuse.' },
        m_waga: { name: 'Warehouse scale', description: 'A scale with a display and a sticky note on it.', openedText: 'Measurement recorded.' },
        m_powrot: { name: 'Door to the computer room', description: 'The way back to the computer room.' },
        m_panel: { name: 'Door power panel', description: 'The power panel for the control-centre door. Its fuse is missing.', lockedText: 'The fuse socket is empty.', openedText: 'The fuse is in place and the light is green.', message: 'You insert the fuse. The light turns green!' },
        m_drzwi: { name: 'Door to the control centre', description: 'A heavy door to the control centre.', lockedText: 'The door has no power. Check the panel next to it.', openedText: 'The door is open.' },
      },
    },
    sterownia: {
      name: 'Control centre',
      intro: 'The control centre. Warnings are flashing on the screens. First calibrate the sensors, then use the power console.',
      objects: {
        z_kalibracja: { name: 'Calibration panel', description: 'The sensor calibration panel. It needs pairs to be connected.', openedText: 'The sensors are calibrated.', message: 'Calibration complete! The power console rises from the floor.' },
        z_wykres: { name: 'Energy-use screen', description: 'A large screen with a chart.' },
        z_mapa: { name: 'Facility map', description: 'A plan of the laboratory. The escape route is marked – straight through the control centre.' },
        z_dziennik: { name: 'Fault log', description: 'A tablet with the fault log.' },
        z_konsola: { name: 'Power console', description: 'A console with three power dials: X, Y, Z.', openedText: 'Power restored.', message: 'POWER RESTORED. Emergency exit unlocked!' },
        z_dron: { name: 'Inspection drone', description: 'A small drone on its charging dock. There is a task on its screen.', openedText: 'The drone is ready to fly.' },
        z_powrot: { name: 'Door to the storeroom', description: 'The way back to the storeroom.' },
        z_wyjscie: { name: 'Emergency exit', description: 'Emergency doors with a green sign.', lockedText: 'Locked until the power is restored.', openedText: 'The emergency doors are open!' },
      },
    },
  },
};
