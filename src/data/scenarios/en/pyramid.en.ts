import type { ScenarioOverlay } from '../../localize';
import { lvl } from '../../helpers';

const passPrompt = 'The stone passage has four rotating rings with digits.';
const chestPrompt = 'The chest has three wheels with shape symbols. Set them according to the papyrus.';
const sarcPrompt = 'The sarcophagus lid is held by three stone rings.';

export const pyramidEn: ScenarioOverlay = {
  title: 'The Secret of the Egyptian Pyramid',
  subtitle: 'Chapter II – Numbers of the Pharaohs',
  description: 'An archaeological expedition turns into a trap: the pyramid’s stone gate closes behind you. The ancient priests left puzzles – solve them to see the sun again.',
  intro: 'The notebook of the Class of 1926 has led you to Egypt. You cross the threshold of the pyramid with the expedition… and suddenly you hear a crash. The stone gate closes behind you, cutting off the way back. In the torchlight you see signs on the wall – the pharaoh’s priests clearly expected visitors.',
  ending: 'The altar plates sink one after another and the Sun Gate opens with a roar. The desert sun dazzles you. The expedition leader cannot believe it: “You have deciphered a mechanism nobody has understood for four thousand years!”. A new page appears in the notebook of the Class of 1926: a sketch of a laboratory…',
  reward: 'Pyramid Guardian',
  items: {
    pochodnia: { name: 'Torch', description: 'A burning torch. It will light up dark corners.' },
    skarabeusz: { name: 'Golden scarab', description: 'A golden scarab figurine. It fits some kind of hollow.' },
    klucz_ra: { name: 'Key of Ra', description: 'A key shaped like the sun with rays.' },
  },
  clues: {
    legenda: { title: 'Key to Egyptian numerals', text: 'A clay tablet explains the signs: stroke = 1, hobble (arch) = 10, coil of rope = 100, lotus flower = 1000. Egyptians wrote a number by repeating the signs and adding their values.' },
    posag: {
      title: 'Tablets of the Anubis statue',
      text: lvl(
        'The statue holds two tablets with numbers. Below: “The passage code is the SUM of both numbers”.',
        'On the tablet the priests wrote the first three terms of a geometric sequence. Below: “The passage code is the SUM of the FIRST FIVE terms of this sequence”.',
        'The tablet is a granary record: the number of sacks of grain. “Each month 12% of the INITIAL stock is used. The passage code is the number of sacks left after 3 months”.',
      ),
    },
    papirus: {
      title: 'Priest’s papyrus',
      text: lvl(
        '“Set the chest symbols: FIRST – the shape with 4 equal sides and 4 right angles. SECOND – the shape whose angles add up to 180°. THIRD – the shape with no vertices.”',
        '“Set the chest symbols: FIRST – the regular polygon with an interior angle of 120°. SECOND – the regular polygon with exactly 5 diagonals. THIRD – the regular polygon whose interior angles add up to 360°.”',
        '“Set the chest symbols (bar cross-sections): FIRST – the cross-section with area ≈ 3.14 cm² for a dimension of 2 cm (diameter). SECOND – the regular profile with a perimeter of 15 cm and side 3 cm. THIRD – the profile with area a²√3/4.”',
      ),
      visual: { type: 'symbols', items: ['tri', 'sq', 'pent', 'hex', 'circ'], caption: 'symbols on the chest wheels' },
    },
    model_wynik: { title: 'Number from the pyramid model', text: 'The pyramid model hides the number 60.' },
    inskrypcja: {
      title: 'Inscription above the sarcophagus',
      text: lvl(
        '“Sarcophagus code: the first two digits are the number from the pyramid model, the last one is the number of VERTICES of a square-based pyramid.”',
        '“Sarcophagus code: the first two digits are the number from the pyramid model, the last one is the number of EDGES of a square-based pyramid.”',
        '“Sarcophagus code: the first two digits are the number from the pyramid model, the last one is the number of all FACES of a square-based pyramid (including the base).”',
      ),
    },
    gwiazdy: {
      title: 'Star map',
      text: lvl(
        'Carved between the stars: “The altar plates must add up to 25% of 120”.',
        'Carved between the stars: “The altar plates must add up to the MINIMUM value of f(x) = x² − 8x + 46”.',
        'Carved between the stars are the heights of Nile floods (cubits): 22, 35, 30, 41, 28. “The altar plates must add up to the MEDIAN of these data”.',
      ),
    },
    klepsydra: { title: 'Hourglass', text: 'On the hourglass: “Time flows like sand – but the wise do not rush their counting”.' },
  },
  puzzles: {
    przejscie: {
      sp: { title: 'Stone passage', prompt: passPrompt, hints: ['Read both numbers from the statue’s tablets – the key to the signs is on the clay tablet.', 'Count the signs of each kind: lotuses (thousands), coils (hundreds), arches (tens), strokes (ones).', 'Tablets: 1243 and 135. Sum: 1243 + 135 = 1378.'] },
      lo: { title: 'Stone passage', prompt: passPrompt, hints: ['Read the numbers from the tablet – the key to the signs is on the clay tablet.', 'Sequence 3, 12, 48: ratio r = 4. Sₙ = a₁ · (rⁿ − 1)/(r − 1).', 'S₅ = 3 · (4⁵ − 1)/3 = 1024 − 1 = 1023 (3 + 12 + 48 + 192 + 768).'] },
      tech: { title: 'Stone passage', prompt: passPrompt, hints: ['Read the grain stock from the tablet – the key to the signs is on the clay tablet.', 'The tablet shows 2 lotuses and 5 coils. 12% is always taken from the initial stock.', '2500 sacks; 12% · 2500 = 300 a month; 2500 − 3 · 300 = 1600.'] },
    },
    mozaika: {
      sp: { title: 'Floor mosaic', prompt: 'The mosaic has 7 rows of 9 tiles, but 15 tiles have fallen out. How many tiles are left?', hints: ['First count all the tiles.', '7 · 9 = 63.', '63 − 15 = 48.'] },
      lo: { title: 'Floor mosaic', prompt: 'The mosaic is a regular octagon. How many diagonals does an octagon have?', hints: ['From each vertex, diagonals go to the non-adjacent vertices.', 'Number of diagonals of an n-gon: n(n − 3)/2.', '8 · 5 / 2 = 20.'] },
      tech: { title: 'Floor mosaic', unit: 'tiles', prompt: 'A tile measures 20 cm × 20 cm. How many tiles are needed for a 3 m × 2.4 m floor (no spare)?', hints: ['Compare the floor area with the area of one tile – in the same units.', '3 m × 2.4 m = 300 cm × 240 cm; one tile: 400 cm².', '72 000 ÷ 400 = 180 tiles.'] },
    },
    sciana: {
      sp: { title: 'Wall of hieroglyphs', prompt: 'A sequence is carved on the wall: 2, 5, 11, 23, 47, … What is the next number?', hints: ['Check how each number is made from the previous one.', 'Try: multiply by 2 and add something.', 'Rule: ×2 + 1. 47 · 2 + 1 = 95.'] },
      lo: { title: 'Wall of hieroglyphs', prompt: 'The wall describes an arithmetic sequence: a₃ = 11, a₇ = 27. Find a₁₂.', hints: ['There are 4 “steps” of the sequence between a₃ and a₇.', '4d = 27 − 11, so d = 4. Then a₁ = a₃ − 2d.', 'd = 4, a₁ = 3, a₁₂ = 3 + 11 · 4 = 47.'] },
      tech: { title: 'Wall of hieroglyphs', unit: 'bricks', prompt: 'The builders made 4000 bricks in week 1, and each week 5% more than the week before. How many bricks were made in week 3?', hints: ['This is a geometric sequence – each week is the previous one · 1.05.', 'a₃ = a₁ · r², r = 1.05.', '4000 · 1.05² = 4000 · 1.1025 = 4410.'] },
    },
    waga: {
      sp: { title: 'Priests’ balance', unit: 'g', prompt: 'On the balance, 3 jugs of oil balance 2 sacks of grain. A sack weighs 150 g (it is a model!). How much does one jug weigh?', hints: ['Work out how much both sacks weigh together.', '2 · 150 = 300 g – that is what 3 jugs weigh.', '300 ÷ 3 = 100 g.'] },
      lo: { title: 'Priests’ balance', prompt: 'The mass m of a stone satisfies the proportion m : 12 = 15 : 4. Find m.', hints: ['In a proportion, the product of the outer terms equals the product of the inner terms.', '4m = 12 · 15.', 'm = 180 ÷ 4 = 45.'] },
      tech: { title: 'Priests’ balance', unit: 'kg', prompt: 'Bronze is an alloy of copper and tin in the ratio 4 : 1. How many kg of copper are there in 35 kg of bronze?', hints: ['The alloy consists of 4 + 1 = 5 equal parts.', 'One part = 35 ÷ 5 kg.', '7 kg · 4 = 28 kg of copper.'] },
    },
    skrzynia: {
      sp: { title: 'Chest with symbols', prompt: chestPrompt, hints: ['The clue is on the papyrus hidden behind the wall of hieroglyphs.', 'A triangle’s angles add up to 180°; a square has 4 equal sides and right angles.', 'Square, triangle, circle.'] },
      lo: { title: 'Chest with symbols', prompt: chestPrompt, hints: ['The clue is on the papyrus hidden behind the wall of hieroglyphs.', 'Interior angle of a regular n-gon: (n − 2)·180°/n. Diagonals: n(n − 3)/2. Angle sum: (n − 2)·180°.', '120° → hexagon; 5 diagonals → pentagon; 360° → square.'] },
      tech: { title: 'Chest with symbols', prompt: chestPrompt, hints: ['The clue is on the papyrus hidden behind the wall of hieroglyphs.', 'A circle with diameter 2 cm: π · 1² ≈ 3.14. 15 ÷ 3 = 5 sides. a²√3/4 is the area of an equilateral triangle.', 'Circle, pentagon, triangle.'] },
    },
    model: {
      sp: { title: 'Pyramid model', unit: 'dm³', prompt: 'The model stands on a cuboid plinth measuring 5 dm × 4 dm × 3 dm. Work out the volume of the plinth (dm³).', hints: ['The volume of a cuboid depends on its three dimensions.', 'V = a · b · c.', '5 · 4 · 3 = 60 dm³.'] },
      lo: { title: 'Pyramid model', prompt: 'The model is a regular square-based pyramid: base edge 6, height 4. Work out the lateral surface area.', hints: ['You need the slant height of a side face (h).', 'h² = H² + (a/2)² = 4² + 3². A side face is a triangle with area a · h / 2.', 'h = 5; one face: 6 · 5 / 2 = 15; four faces: 60.'] },
      tech: { title: 'Pyramid model', unit: 'm³', prompt: 'The scale model represents a pyramid with a 6 m × 6 m square base and a height of 5 m. How many m³ of stone are needed to build it?', hints: ['A pyramid holds less than a cuboid with the same base and height.', 'V = 1/3 · base area · H.', '1/3 · 36 · 5 = 60 m³.'] },
    },
    figury: {
      sp: { title: 'Wall of shapes', prompt: 'Match each shape to its area.',
        pairs: [['square with side 4', '16'], ['rectangle 3 × 5', '15'], ['triangle: base 6, height 4', '12'], ['parallelogram: side 7, height 2', '14']],
        hints: ['Each shape has a different area formula.', 'Square a², rectangle a·b, triangle a·h/2, parallelogram a·h.', '16, 15, 12, 14.'] },
      lo: { title: 'Wall of shapes', prompt: 'Match each solid to its volume formula.',
        pairs: [['sphere', '4/3 · πr³'], ['cone', '1/3 · πr²h'], ['cylinder', 'πr²h'], ['pyramid', '1/3 · base · H']],
        hints: ['The cone and the pyramid are the “pointed” solids – their volume has a factor of 1/3.', 'A cylinder is a prism with a circular base; a cone is a “pyramid” with a circular base.', 'Sphere – 4/3πr³, cone – 1/3πr²h, cylinder – πr²h, pyramid – 1/3·base·H.'] },
      tech: { title: 'Wall of shapes', prompt: 'Match the units to their equivalents.',
        pairs: [['1 m³', '1000 l'], ['1 ha', '10 000 m²'], ['1 l', '1 dm³'], ['1 m/s', '3.6 km/h']],
        hints: ['Picture the size of each thing (a cube with side 1 m, a 100 m × 100 m square…).', '1 m³ = 1000 dm³; 1 ha = 100 m · 100 m; 1 h = 3600 s.', '1 m³ = 1000 l, 1 ha = 10 000 m², 1 l = 1 dm³, 1 m/s = 3.6 km/h.'] },
    },
    plyty: {
      sp: { title: 'Floor slabs', unit: 'slabs', prompt: 'The slabs measure 30 cm × 30 cm. How many slabs cover a 3 m × 1.8 m floor?', hints: ['Count how many slabs fit along each side.', '300 ÷ 30 = 10 slabs and 180 ÷ 30 = 6 slabs.', '10 · 6 = 60 slabs.'] },
      lo: { title: 'Floor slabs', unit: '°', prompt: 'The slabs are regular hexagons. How many degrees is the interior angle of one slab?', hints: ['The angle sum of an n-gon: (n − 2) · 180°.', 'Hexagon: 4 · 180° = 720°, and the angles are equal.', '720° ÷ 6 = 120°.'] },
      tech: { title: 'Floor slabs', unit: '£', prompt: 'Renovating 15 m² of floor: tiles at £80/m², and we buy 10% extra. How much do the tiles cost?', hints: ['The extra increases the area you need to buy.', '15 m² · 1.1 = 16.5 m².', '16.5 · 80 = £1320.'] },
    },
    sarkofag: {
      sp: { title: 'Sarcophagus', prompt: sarcPrompt, hints: ['Read the inscription above the sarcophagus and solve the pyramid-model puzzle.', 'A square-based pyramid: 4 base vertices + the apex.', '60 and 5 vertices → 605.'] },
      lo: { title: 'Sarcophagus', prompt: sarcPrompt, hints: ['Read the inscription above the sarcophagus and solve the pyramid-model puzzle.', 'A square-based pyramid: 4 base edges + 4 slanted edges.', '60 and 8 edges → 608.'] },
      tech: { title: 'Sarcophagus', prompt: sarcPrompt, hints: ['Read the inscription above the sarcophagus and solve the pyramid-model puzzle.', 'A square-based pyramid: 1 base + 4 side faces.', '60 and 5 faces → 605.'] },
    },
    oltarz: {
      sp: { title: 'Altar with plates', prompt: 'There are six numbered plates on the altar. Press the plates whose sum equals the number from the star map.',
        hints: ['First solve the star-map puzzle.', '25% is one quarter. 120 ÷ 4 = ?', 'The number is 30, e.g. 5 + 10 + 15 = 30 or 8 + 5 + 17 = 30.'] },
      lo: { title: 'Altar with plates', prompt: 'There are six plates with expressions on the altar. Press the plates whose values add up to the number from the star map.',
        switchLabels: ['2³', '√49', 'log₅ 125', '|−12|', '(5 choose 2)', '3!'],
        hints: ['First find the minimum value of the quadratic function from the star map.', 'For a > 0 the minimum is at the vertex: p = −b/(2a) = 4, q = f(4).', 'f(4) = 16 − 32 + 46 = 30. E.g. 8 + 12 + 10 = 30.'] },
      tech: { title: 'Altar with plates', prompt: 'There are six plates with calculations on the altar. Press the plates whose values add up to the number from the star map.',
        switchLabels: ['15% of 60', '0.25 · 48', '3.6 km/h in m/s', '1/4 of 32', '2.5 m in dm', '120 min in h'],
        hints: ['First find the median of the star-map data – sort it!', '22, 28, 30, 35, 41 – the median is the middle value. Plate values: 9, 12, 1, 8, 25, 2.', 'Median = 30. E.g. 9 + 12 + 8 + 1 = 30.'] },
    },
    skarb: {
      sp: { title: 'Pharaoh’s treasure', prompt: 'Five caskets hold 12, 15, 9, 20 and 14 gold coins. How many coins are there per casket on average?', hints: ['The mean is the sum divided by the number of caskets.', '12 + 15 + 9 + 20 + 14 = 70.', '70 ÷ 5 = 14 coins.'] },
      lo: { title: 'Pharaoh’s treasure', prompt: 'A casket holds 5 gold and 3 silver coins. We draw 2 coins at once. Find the probability that both are gold (as a fraction).', hints: ['Count all possible pairs of coins and the pairs of gold coins.', '|Ω| = (8 choose 2) = 28; |A| = (5 choose 2) = 10.', 'P = 10/28 = 5/14.'] },
      tech: { title: 'Pharaoh’s treasure', prompt: 'One troy ounce of gold is 31.1 g. How many grams are 20 ounces?', hints: ['Multiply the mass of one ounce by the number of ounces.', '31.1 · 20.', '622 g.'] },
    },
  },
  rooms: {
    wejscie: {
      name: 'Entrance chamber',
      intro: 'The entrance chamber. Behind you – the closed gate. In front of you – a statue of Anubis and a stone passage with rotating rings.',
      objects: {
        e_brama: { name: 'Stone gate', description: 'The gate you came through. Shut tight – you need to find another way out.' },
        e_posag: { name: 'Statue of Anubis', description: 'The statue of the god Anubis holds tablets with strange signs.' },
        e_pochodnia: { name: 'Torch', description: 'A torch in a holder. It is still burning.', openedText: 'An empty torch holder.', message: 'You take the torch from its holder. It will be useful in the dark.' },
        e_tabliczka: { name: 'Clay tablet', description: 'A tablet with drawings of signs and numbers – like a dictionary!' },
        e_urna: { name: 'Urn', description: 'A clay urn painted with a boat on the Nile. Empty.' },
        e_mozaika: { name: 'Floor mosaic', description: 'A mosaic is hidden under the sand. Some of its tiles are missing.', openedText: 'Mosaic deciphered.' },
        e_przejscie: { name: 'Stone passage', description: 'The passage is blocked by a slab with four rotating rings of digits.', openedText: 'The slab has slid aside. Behind it is a dark corridor to the Hall of Hieroglyphs.' },
      },
    },
    hieroglify: {
      name: 'Hall of Hieroglyphs',
      intro: 'The Hall of Hieroglyphs is plunged in darkness. At the far end there is a dark niche, and on the opposite wall – a gate with a beetle-shaped hollow.',
      objects: {
        h_nisza: { name: 'Dark niche', description: 'A completely dark niche. You will see nothing here without light.', lockedText: 'Too dark. A light source would help.', openedText: 'The torch lights up the niche and the wall full of hieroglyphs next to it.', message: 'The torch’s flame brings a wall covered in hieroglyphs out of the darkness!' },
        h_sciana: { name: 'Wall of hieroglyphs', description: 'Rows of signs form a sequence of numbers. One is missing.', openedText: 'The pressed stone opened a hiding place in the niche.', message: 'You press the right sign… Something grinds in the niche and a hiding place opens!' },
        h_papirus: { name: 'Papyrus', description: 'A priest’s rolled-up papyrus.' },
        h_skrzynia: { name: 'Chest with symbols', description: 'A painted chest with three wheels of shape symbols.', openedText: 'The chest is open.', message: 'The lid rises. Inside a golden scarab glitters!' },
        h_waga: { name: 'Priests’ balance', description: 'A bronze balance with pans. A task is carved next to it.', openedText: 'The pans are balanced.' },
        h_powrot: { name: 'Corridor to the entrance chamber', description: 'The way back to the entrance chamber.' },
        h_wrota: { name: 'Scarab gate', description: 'A stone gate with a scarab-shaped hollow.', lockedText: 'The hollow is empty. Something must fit into it…', openedText: 'The scarab flashed and the gate slid open.' },
      },
    },
    geometria: {
      name: 'Geometry hall',
      intro: 'The geometry hall. Shapes on the walls, a pyramid model on a plinth and, in the middle, a heavy sarcophagus.',
      objects: {
        g_figury: { name: 'Wall of shapes', description: 'Movable stone tiles with shapes and numbers. They need to be matched in pairs.', openedText: 'The wall moved aside, revealing a hidden door.', message: 'A grinding sound – part of the wall slides away and reveals a hidden door!' },
        g_inskrypcja: { name: 'Inscription', description: 'An inscription in the stone, right above the sarcophagus.' },
        g_model: { name: 'Pyramid model', description: 'A stone pyramid model on a plinth. A task is carved on the plinth.', openedText: 'The number 60 glows on the model.' },
        g_misa: { name: 'Fire bowl', description: 'A bronze bowl with glowing embers. The warmth is pleasant on your hands.' },
        g_plyty: { name: 'Floor slabs', description: 'One of the floor slabs has a task carved into it.', openedText: 'The floor task is solved.' },
        g_sarkofag: { name: 'Sarcophagus', description: 'A gilded sarcophagus with three stone rings on its lid.', openedText: 'The sarcophagus lid has been pushed aside.', message: 'The lid slides. Instead of a mummy – a key shaped like the sun!' },
        g_powrot: { name: 'Gate to the Hall of Hieroglyphs', description: 'The way back to the Hall of Hieroglyphs.' },
        g_drzwi: { name: 'Hidden door', description: 'A door with a sun symbol. In the middle is a round keyhole.', lockedText: 'The keyhole is shaped like a sun with rays.', openedText: 'The door is open. It leads to the treasure chamber.' },
      },
    },
    skarbiec: {
      name: 'Treasure chamber',
      intro: 'The treasure chamber shines with gold. On the ceiling – a star map; in front of you, an altar with plates and behind it the closed Sun Gate.',
      objects: {
        s_skarb: { name: 'Pile of treasure', description: 'Caskets full of coins. A task is engraved on one of them.', openedText: 'The treasure has been counted – but it stays where it is.' },
        s_gwiazdy: { name: 'Star map', description: 'A star map shines on the wall. An inscription is carved between the constellations.' },
        s_klepsydra: { name: 'Hourglass', description: 'A huge hourglass. The sand trickles very slowly.' },
        s_oltarz: { name: 'Altar with plates', description: 'An altar with six plates that can be pressed.', openedText: 'The plates have sunk. The mechanism is working!', message: 'A deep rumble of machinery… The Sun Gate has moved!' },
        s_posag: { name: 'Golden statue', description: 'A golden statue of the pharaoh gazes towards the Sun Gate.' },
        s_powrot: { name: 'Door to the geometry hall', description: 'The way back to the geometry hall.' },
        s_brama: { name: 'Sun Gate', description: 'A huge gate leading outside. It is moved by the altar mechanism.', lockedText: 'The gate will not budge. Start the altar mechanism.', openedText: 'The gate is open. You can see the sun!' },
      },
    },
  },
};
