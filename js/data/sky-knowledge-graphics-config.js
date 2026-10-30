/** Static teaching diagrams: localized copy and SVG geometry, independent of date and place.
 * Coordinates use a 360 × 158 viewBox. Captions explain the scientific meaning and scale limits.
 * Sources live with the matching entries in mnemonics-config.js. No live sky positions.
 */
window.PLANETENUHR_KNOWLEDGE_GRAPHICS_CONFIG = {
  entries: {
    "planet-order-de": "planets",
    "compass": "compass",
    "moon-brackets": "moon",
    "spectral-classes": "spectrum",
    "star-colors": "colors",
    "meteor-terms": "meteors",
    "light-year": "lightyear",
    "arcturus-spica": "arcturus",
    "galilean-moons": "galilean",
    "moon-quarters-fr": "quarters",
    "planet-order-fr": "planets",
    "mercury-year": "mercury",
    "venus-heat": "venus-heat",
    "venus-rotation": "venus-spin",
    "earth-life": "earth",
    "mars-rust": "mars",
    "jupiter-size": "jupiter-size",
    "jupiter-spin": "jupiter-spin",
    "saturn-density": "saturn-density",
    "uranus-tilt": "uranus",
    "neptune-year": "neptune",
    "sirius-brightness": "sirius",
    "regulus-leo": "regulus",
    "betelgeuse-supergiant": "betelgeuse",
    "proxima-neighbor": "proxima",
    "polaris-north": "polaris",
    "sunlight-delay": "sunlight",
    "stellar-temperature": "colors",
    "sun-age": "sun-age",
    "stellar-fusion": "fusion",
    "white-dwarf": "white-dwarf"
  },
  scenes: {
    "planets": {
      caption: {"de":"Reihenfolge ab der Sonne; Größen und Abstände schematisch.","en":"Order outward from the Sun; sizes and distances are schematic.","fr":"Ordre en partant du Soleil ; tailles et distances schématiques."},
      shapes: [
        {"tag":"line","attrs":{"x1":23,"y1":35,"x2":335,"y2":35,"stroke":"#ffd36a"}},
        {"tag":"path","attrs":{"d":"M 328 30 L 335 35 L 328 40","fill":"none","stroke":"#ffd36a"}},
        {"tag":"circle","attrs":{"cx":29,"cy":77,"r":11,"fill":"#91a2c4"}},
        {"tag":"text","attrs":{"x":29,"y":112,"text-anchor":"middle"},"text":"Me"},
        {"tag":"circle","attrs":{"cx":72,"cy":77,"r":11,"fill":"#e9ba78"}},
        {"tag":"text","attrs":{"x":72,"y":112,"text-anchor":"middle"},"text":"V"},
        {"tag":"circle","attrs":{"cx":115,"cy":77,"r":11,"fill":"#7dc9ff"}},
        {"tag":"text","attrs":{"x":115,"y":112,"text-anchor":"middle"},"text":{"de":"E","en":"E","fr":"T"}},
        {"tag":"circle","attrs":{"cx":158,"cy":77,"r":11,"fill":"#f09a7d"}},
        {"tag":"text","attrs":{"x":158,"y":112,"text-anchor":"middle"},"text":"Ma"},
        {"tag":"circle","attrs":{"cx":201,"cy":77,"r":11,"fill":"#dfb182"}},
        {"tag":"text","attrs":{"x":201,"y":112,"text-anchor":"middle"},"text":"J"},
        {"tag":"circle","attrs":{"cx":244,"cy":77,"r":11,"fill":"#dfcf9d"}},
        {"tag":"text","attrs":{"x":244,"y":112,"text-anchor":"middle"},"text":"S"},
        {"tag":"circle","attrs":{"cx":287,"cy":77,"r":11,"fill":"#9cdddd"}},
        {"tag":"text","attrs":{"x":287,"y":112,"text-anchor":"middle"},"text":"U"},
        {"tag":"circle","attrs":{"cx":330,"cy":77,"r":11,"fill":"#7b9cf4"}},
        {"tag":"text","attrs":{"x":330,"y":112,"text-anchor":"middle"},"text":"N"}
      ]
    },
    "compass": {
      caption: {"de":"Im Uhrzeigersinn: Norden, Osten, Süden, Westen.","en":"Clockwise: north, east, south, west.","fr":"Dans le sens horaire : nord, est, sud, ouest."},
      shapes: [
        {"tag":"circle","attrs":{"cx":180,"cy":76,"r":43,"fill":"none","stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":120,"y1":76,"x2":240,"y2":76,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":180,"y1":16,"x2":180,"y2":136,"stroke":"#91a2c4"}},
        {"tag":"path","attrs":{"d":"M 180 27 L 168 83 L 180 76 L 192 83 Z","fill":"#ffd36a","stroke":"#ffd36a"}},
        {"tag":"text","attrs":{"x":180,"y":13,"text-anchor":"middle"},"text":"N"},
        {"tag":"text","attrs":{"x":252,"y":81,"text-anchor":"middle"},"text":{"de":"O","en":"E","fr":"E"}},
        {"tag":"text","attrs":{"x":180,"y":150,"text-anchor":"middle"},"text":"S"},
        {"tag":"text","attrs":{"x":108,"y":81,"text-anchor":"middle"},"text":{"de":"W","en":"W","fr":"O"}}
      ]
    },
    "moon": {
      caption: {"de":"Rechts hell: zunehmend. Links hell: abnehmend. Schematische Ansicht für nördliche Breiten.","en":"Bright on the right: waxing. Bright on the left: waning. Schematic view for northern latitudes.","fr":"Éclairée à droite : croissante. À gauche : décroissante. Vue schématique aux latitudes nord."},
      shapes: [
        {"tag":"circle","attrs":{"cx":100,"cy":69,"r":30,"fill":"none","stroke":"#91a2c4"}},
        {"tag":"path","attrs":{"d":"M 100 39 A 30 30 0 0 1 100 99 Q 122 69 100 39 Z","fill":"#ffd36a","stroke":"#ffd36a"}},
        {"tag":"circle","attrs":{"cx":260,"cy":69,"r":30,"fill":"none","stroke":"#91a2c4"}},
        {"tag":"path","attrs":{"d":"M 260 39 A 30 30 0 0 0 260 99 Q 238 69 260 39 Z","fill":"#ffd36a","stroke":"#ffd36a"}},
        {"tag":"text","attrs":{"x":100,"y":126,"text-anchor":"middle"},"text":{"de":"zunehmend","en":"waxing","fr":"croissante"}},
        {"tag":"text","attrs":{"x":260,"y":126,"text-anchor":"middle"},"text":{"de":"abnehmend","en":"waning","fr":"décroissante"}}
      ]
    },
    "quarters": {
      caption: {"de":"Premier quartier: p; dernier quartier: d. Die Hilfslinien ergänzen die beleuchtete Hälfte; Ansicht für nördliche Breiten.","en":"Premier quartier: p; dernier quartier: d. Guide lines complete the lit half; view for northern latitudes.","fr":"Premier quartier : p ; dernier quartier : d. Les traits complètent la moitié éclairée ; vue aux latitudes nord."},
      shapes: [
        {"tag":"circle","attrs":{"cx":100,"cy":72,"r":27,"fill":"none","stroke":"#91a2c4"}},
        {"tag":"path","attrs":{"d":"M 100 45 A 27 27 0 0 1 100 99 Z","fill":"#ffd36a","stroke":"#ffd36a"}},
        {"tag":"line","attrs":{"x1":100,"y1":45,"x2":100,"y2":123,"stroke":"#7dc9ff","stroke-dasharray":"4 3"}},
        {"tag":"circle","attrs":{"cx":260,"cy":72,"r":27,"fill":"none","stroke":"#91a2c4"}},
        {"tag":"path","attrs":{"d":"M 260 45 A 27 27 0 0 0 260 99 Z","fill":"#ffd36a","stroke":"#ffd36a"}},
        {"tag":"line","attrs":{"x1":260,"y1":21,"x2":260,"y2":99,"stroke":"#7dc9ff","stroke-dasharray":"4 3"}},
        {"tag":"text","attrs":{"x":140,"y":79,"text-anchor":"middle","font-size":24},"text":"p"},
        {"tag":"text","attrs":{"x":300,"y":79,"text-anchor":"middle","font-size":24},"text":"d"},
        {"tag":"text","attrs":{"x":100,"y":146,"text-anchor":"middle"},"text":"premier quartier"},
        {"tag":"text","attrs":{"x":260,"y":146,"text-anchor":"middle"},"text":"dernier quartier"}
      ]
    },
    "spectrum": {
      caption: {"de":"Klassische Spektralklassen: Die Oberflächentemperatur nimmt von O nach M ab. Farben schematisch.","en":"Classic spectral classes: surface temperature decreases from O to M. Colours are schematic.","fr":"Classes spectrales classiques : la température de surface diminue de O à M. Couleurs schématiques."},
      shapes: [
        {"tag":"circle","attrs":{"cx":36,"cy":59,"r":14,"fill":"#8eaaff"}},
        {"tag":"text","attrs":{"x":36,"y":97,"text-anchor":"middle"},"text":"O"},
        {"tag":"circle","attrs":{"cx":84,"cy":59,"r":14,"fill":"#a8c2ff"}},
        {"tag":"text","attrs":{"x":84,"y":97,"text-anchor":"middle"},"text":"B"},
        {"tag":"circle","attrs":{"cx":132,"cy":59,"r":14,"fill":"#d2e2ff"}},
        {"tag":"text","attrs":{"x":132,"y":97,"text-anchor":"middle"},"text":"A"},
        {"tag":"circle","attrs":{"cx":180,"cy":59,"r":14,"fill":"#f5f3dc"}},
        {"tag":"text","attrs":{"x":180,"y":97,"text-anchor":"middle"},"text":"F"},
        {"tag":"circle","attrs":{"cx":228,"cy":59,"r":14,"fill":"#ffe598"}},
        {"tag":"text","attrs":{"x":228,"y":97,"text-anchor":"middle"},"text":"G"},
        {"tag":"circle","attrs":{"cx":276,"cy":59,"r":14,"fill":"#ffc177"}},
        {"tag":"text","attrs":{"x":276,"y":97,"text-anchor":"middle"},"text":"K"},
        {"tag":"circle","attrs":{"cx":324,"cy":59,"r":14,"fill":"#ee936f"}},
        {"tag":"text","attrs":{"x":324,"y":97,"text-anchor":"middle"},"text":"M"},
        {"tag":"text","attrs":{"x":44,"y":132,"text-anchor":"start"},"text":{"de":"heißer","en":"hotter","fr":"plus chaud"}},
        {"tag":"line","attrs":{"x1":149,"y1":128,"x2":211,"y2":128,"stroke":"#91a2c4"}},
        {"tag":"path","attrs":{"d":"M 204 123 L 211 128 L 204 133","fill":"none","stroke":"#91a2c4"}},
        {"tag":"text","attrs":{"x":316,"y":132,"text-anchor":"end"},"text":{"de":"kühler","en":"cooler","fr":"plus froid"}}
      ]
    },
    "colors": {
      caption: {"de":"Blau bedeutet eine heißere Oberfläche als Rot; die Gesamtleuchtkraft lässt sich daraus allein nicht ablesen. Farben schematisch.","en":"Blue means a hotter surface than red; colour alone does not give total luminosity. Colours are schematic.","fr":"Le bleu indique une surface plus chaude que le rouge ; la couleur seule ne donne pas la luminosité totale. Couleurs schématiques."},
      shapes: [
        {"tag":"circle","attrs":{"cx":89,"cy":65,"r":25,"fill":"#8eaaff"}},
        {"tag":"circle","attrs":{"cx":271,"cy":65,"r":25,"fill":"#ee936f"}},
        {"tag":"text","attrs":{"x":89,"y":118,"text-anchor":"middle"},"text":{"de":"heißer","en":"hotter","fr":"plus chaude"}},
        {"tag":"text","attrs":{"x":271,"y":118,"text-anchor":"middle"},"text":{"de":"kühler","en":"cooler","fr":"plus froide"}},
        {"tag":"line","attrs":{"x1":140,"y1":65,"x2":220,"y2":65,"stroke":"#91a2c4"}},
        {"tag":"path","attrs":{"d":"M 213 60 L 220 65 L 213 70","fill":"none","stroke":"#91a2c4"}}
      ]
    },
    "meteors": {
      caption: {"de":"Im All: Meteoroid. Leuchterscheinung in der Atmosphäre: Meteor. Am Boden: Meteorit. Schematischer Ablauf.","en":"In space: meteoroid. Light phenomenon in the atmosphere: meteor. On the ground: meteorite. Schematic sequence.","fr":"Dans l’espace : météoroïde. Phénomène lumineux dans l’atmosphère : météore. Au sol : météorite. Schéma simplifié."},
      shapes: [
        {"tag":"path","attrs":{"d":"M 40 50 L 57 44 L 70 61 L 59 77 L 42 70 Z","fill":"#91a2c4","stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":83,"y1":65,"x2":123,"y2":65,"stroke":"#ffd36a"}},
        {"tag":"path","attrs":{"d":"M 116 60 L 123 65 L 116 70","fill":"none","stroke":"#ffd36a"}},
        {"tag":"path","attrs":{"d":"M 147 40 L 185 79 M 159 33 L 194 69 M 142 54 L 172 85","fill":"none","stroke":"#ffd36a","stroke-width":3}},
        {"tag":"circle","attrs":{"cx":187,"cy":79,"r":6,"fill":"#ffd36a"}},
        {"tag":"line","attrs":{"x1":211,"y1":65,"x2":252,"y2":65,"stroke":"#ffd36a"}},
        {"tag":"path","attrs":{"d":"M 245 60 L 252 65 L 245 70","fill":"none","stroke":"#ffd36a"}},
        {"tag":"line","attrs":{"x1":272,"y1":91,"x2":335,"y2":91,"stroke":"#91a2c4"}},
        {"tag":"path","attrs":{"d":"M 288 90 L 292 74 L 307 71 L 319 90 Z","fill":"#f09a7d","stroke":"#f09a7d"}},
        {"tag":"text","attrs":{"x":56,"y":128,"text-anchor":"middle"},"text":{"de":"Meteoroid","en":"Meteoroid","fr":"Météoroïde"}},
        {"tag":"text","attrs":{"x":176,"y":128,"text-anchor":"middle"},"text":{"de":"Meteor","en":"Meteor","fr":"Météore"}},
        {"tag":"text","attrs":{"x":304,"y":128,"text-anchor":"middle"},"text":{"de":"Meteorit","en":"Meteorite","fr":"Météorite"}}
      ]
    },
    "lightyear": {
      caption: {"de":"Ein Lichtjahr ist eine Strecke: rund 9,46 Billionen Kilometer. Der Lichtstrahl braucht dafür ein Jahr. Schematisch.","en":"A light-year is a distance: about 9.46 trillion kilometres. Light travels it in one year. Schematic.","fr":"Une année-lumière est une distance : environ 9 460 milliards de kilomètres, parcourus par la lumière en un an. Schéma."},
      shapes: [
        {"tag":"text","attrs":{"x":42,"y":113,"text-anchor":"middle"},"text":{"de":"Start","en":"Start","fr":"Départ"}},
        {"tag":"text","attrs":{"x":310,"y":113,"text-anchor":"middle"},"text":{"de":"Ziel","en":"Finish","fr":"Arrivée"}},
        {"tag":"circle","attrs":{"cx":42,"cy":69,"r":5,"fill":"#ffd36a"}},
        {"tag":"circle","attrs":{"cx":310,"cy":69,"r":5,"fill":"#7dc9ff"}},
        {"tag":"line","attrs":{"x1":62,"y1":69,"x2":290,"y2":69,"stroke":"#ffd36a"}},
        {"tag":"path","attrs":{"d":"M 283 64 L 290 69 L 283 74","fill":"none","stroke":"#ffd36a"}},
        {"tag":"text","attrs":{"x":180,"y":41,"text-anchor":"middle"},"text":{"de":"1 Jahr Lichtweg","en":"1 year of light travel","fr":"1 an de trajet lumineux"}}
      ]
    },
    "arcturus": {
      caption: {"de":"Vom gebogenen Griff des Großen Wagens zu Arktur, dann weiter zu Spica. Nur eine schematische Suchhilfe, keine maßstäbliche Sternkarte.","en":"Follow the Big Dipper’s handle arc to Arcturus, then continue to Spica. A schematic guide, not a scaled star chart.","fr":"Suivre l’arc du manche de la Grande Casserole vers Arcturus, puis Spica. Repère schématique, pas une carte à l’échelle."},
      shapes: [
        {"tag":"path","attrs":{"d":"M 33 40 L 61 35 L 75 55 L 47 59 Z M 75 55 L 99 67 L 119 90 L 136 102","fill":"none","stroke":"#91a2c4"}},
        {"tag":"circle","attrs":{"cx":33,"cy":40,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":61,"cy":35,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":75,"cy":55,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":47,"cy":59,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":99,"cy":67,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":119,"cy":90,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":136,"cy":102,"r":3,"fill":"#e9f0ff"}},
        {"tag":"path","attrs":{"d":"M 136 102 Q 205 143 303 56","fill":"none","stroke":"#ffd36a","stroke-dasharray":"4 4"}},
        {"tag":"circle","attrs":{"cx":213,"cy":112,"r":6,"fill":"#f09a7d"}},
        {"tag":"circle","attrs":{"cx":303,"cy":56,"r":5,"fill":"#7dc9ff"}},
        {"tag":"text","attrs":{"x":209,"y":141,"text-anchor":"middle"},"text":{"de":"Arktur","en":"Arcturus","fr":"Arcturus"}},
        {"tag":"text","attrs":{"x":309,"y":35,"text-anchor":"middle"},"text":"Spica"}
      ]
    },
    "galilean": {
      caption: {"de":"Von innen nach außen: Io, Europa, Ganymed, Kallisto. Gezeigt ist die Reihenfolge der Bahnen, keine momentane Fernrohransicht; Abstände schematisch.","en":"From inner to outer orbit: Io, Europa, Ganymede, Callisto. Orbital order, not a current telescope view; distances schematic.","fr":"Orbites de l’intérieur vers l’extérieur : Io, Europe, Ganymède, Callisto. Ordre orbital, pas une vue actuelle au télescope ; distances schématiques."},
      shapes: [
        {"tag":"line","attrs":{"x1":39,"y1":70,"x2":330,"y2":70,"stroke":"#91a2c4"}},
        {"tag":"circle","attrs":{"cx":39,"cy":70,"r":24,"fill":"#dfb182"}},
        {"tag":"circle","attrs":{"cx":111,"cy":70,"r":5,"fill":"#e4c180"}},
        {"tag":"circle","attrs":{"cx":179,"cy":70,"r":5,"fill":"#dbe1d5"}},
        {"tag":"circle","attrs":{"cx":247,"cy":70,"r":7,"fill":"#b4a79a"}},
        {"tag":"circle","attrs":{"cx":319,"cy":70,"r":6,"fill":"#968d88"}},
        {"tag":"text","attrs":{"x":39,"y":123,"text-anchor":"middle"},"text":"Jupiter"},
        {"tag":"text","attrs":{"x":111,"y":104,"text-anchor":"middle"},"text":"Io"},
        {"tag":"text","attrs":{"x":179,"y":123,"text-anchor":"middle"},"text":{"de":"Europa","en":"Europa","fr":"Europe"}},
        {"tag":"text","attrs":{"x":247,"y":104,"text-anchor":"middle"},"text":{"de":"Ganymed","en":"Ganymede","fr":"Ganymède"}},
        {"tag":"text","attrs":{"x":319,"y":123,"text-anchor":"middle"},"text":{"de":"Kallisto","en":"Callisto","fr":"Callisto"}}
      ]
    },
    "mercury": {
      caption: {"de":"Ein Umlauf Merkurs um die Sonne: rund 88 Erdentage. Bahn und Körpergrößen schematisch.","en":"One Mercury orbit around the Sun: about 88 Earth days. Orbit and sizes are schematic.","fr":"Une révolution de Mercure autour du Soleil : environ 88 jours terrestres. Orbite et tailles schématiques."},
      shapes: [
        {"tag":"ellipse","attrs":{"cx":180,"cy":68,"rx":112,"ry":43,"fill":"none","stroke":"#91a2c4"}},
        {"tag":"circle","attrs":{"cx":180,"cy":68,"r":14,"fill":"#ffd36a"}},
        {"tag":"circle","attrs":{"cx":280,"cy":49,"r":8,"fill":"#91a2c4"}},
        {"tag":"path","attrs":{"d":"M 90 42 L 96 29 L 103 42","fill":"none","stroke":"#ffd36a"}},
        {"tag":"text","attrs":{"x":180,"y":135,"text-anchor":"middle","font-size":17},"text":{"de":"88 Erdentage","en":"88 Earth days","fr":"88 jours terrestres"}},
        {"tag":"text","attrs":{"x":294,"y":29,"text-anchor":"middle"},"text":{"de":"Merkur","en":"Mercury","fr":"Mercure"}}
      ]
    },
    "venus-heat": {
      caption: {"de":"Vergleich: Merkur erreicht tagsüber etwa 430 °C, die Venusoberfläche etwa 467 °C. Balken ab 0 °C; kein Vergleich zweier Mitteltemperaturen.","en":"Comparison: Mercury reaches about 430 °C in daytime; Venus’s surface is about 467 °C. Bars start at 0 °C; these are not two mean temperatures.","fr":"Comparaison : Mercure atteint environ 430 °C le jour ; la surface de Vénus est à environ 467 °C. Barres depuis 0 °C ; ce ne sont pas deux températures moyennes."},
      shapes: [
        {"tag":"text","attrs":{"x":24,"y":25,"text-anchor":"start"},"text":{"de":"Merkur · Tagesmaximum","en":"Mercury · daytime maximum","fr":"Mercure · maximum diurne"}},
        {"tag":"rect","attrs":{"x":24,"y":36,"width":258,"height":18,"fill":"#91a2c4","rx":4}},
        {"tag":"text","attrs":{"x":292,"y":50,"text-anchor":"start"},"text":"430 °C"},
        {"tag":"text","attrs":{"x":24,"y":84,"text-anchor":"start"},"text":{"de":"Venus · Oberfläche","en":"Venus · surface","fr":"Vénus · surface"}},
        {"tag":"rect","attrs":{"x":24,"y":96,"width":280.2,"height":18,"fill":"#f09a7d","rx":4}},
        {"tag":"text","attrs":{"x":313,"y":110,"text-anchor":"start","font-size":11},"text":"467 °C"}
      ]
    },
    "venus-spin": {
      caption: {"de":"Venus: eine Eigendrehung relativ zu den Sternen dauert rund 243 Erdentage, ein Sonnenumlauf 225. Das ist nicht die Länge ihres Sonnentages.","en":"Venus: one rotation relative to the stars takes about 243 Earth days, one orbit 225. This is not its solar-day length.","fr":"Vénus : une rotation par rapport aux étoiles dure environ 243 jours terrestres, une révolution 225. Ce n’est pas la durée du jour solaire."},
      shapes: [
        {"tag":"text","attrs":{"x":24,"y":25,"text-anchor":"start"},"text":{"de":"Eigendrehung","en":"Rotation","fr":"Rotation"}},
        {"tag":"rect","attrs":{"x":24,"y":36,"width":243,"height":18,"fill":"#f09a7d","rx":4}},
        {"tag":"text","attrs":{"x":277,"y":50,"text-anchor":"start","font-size":11},"text":{"de":"243 Tage","en":"243 days","fr":"243 jours"}},
        {"tag":"text","attrs":{"x":24,"y":87,"text-anchor":"start"},"text":{"de":"Sonnenumlauf","en":"Orbit","fr":"Révolution"}},
        {"tag":"rect","attrs":{"x":24,"y":98,"width":225,"height":18,"fill":"#ffd36a","rx":4}},
        {"tag":"text","attrs":{"x":259,"y":112,"text-anchor":"start","font-size":11},"text":{"de":"225 Tage","en":"225 days","fr":"225 jours"}}
      ]
    },
    "earth": {
      caption: {"de":"Wasser, Land und ein Blatt als Symbole für die belebte Erde. Keine Karte oder Aussage über Flächenanteile.","en":"Water, land and a leaf symbolise Earth’s life. Not a map or a statement of surface proportions.","fr":"L’eau, les terres et une feuille symbolisent la vie sur Terre. Ni carte ni représentation des proportions de surface."},
      shapes: [
        {"tag":"circle","attrs":{"cx":128,"cy":73,"r":43,"fill":"#7dc9ff"}},
        {"tag":"path","attrs":{"d":"M 103 42 L 125 39 L 135 55 L 119 64 L 123 78 L 104 82 L 96 65 Z","fill":"#80d0ac","stroke":"#80d0ac"}},
        {"tag":"path","attrs":{"d":"M 145 79 L 159 84 L 154 103 L 138 110 L 135 93 Z","fill":"#80d0ac","stroke":"#80d0ac"}},
        {"tag":"path","attrs":{"d":"M 219 97 Q 211 48 267 43 Q 273 88 219 97 Z","fill":"#80d0ac","stroke":"#80d0ac"}},
        {"tag":"path","attrs":{"d":"M 212 111 Q 229 77 253 58","fill":"none","stroke":"#e9f0ff"}},
        {"tag":"text","attrs":{"x":128,"y":139,"text-anchor":"middle"},"text":{"de":"Erde","en":"Earth","fr":"Terre"}}
      ]
    },
    "mars": {
      caption: {"de":"Roter Staub und oxidierte eisenhaltige Körner: eine symbolische Vergrößerung der Marsoberfläche.","en":"Red dust and oxidised iron-bearing grains: a symbolic close-up of Mars’s surface.","fr":"Poussière rouge et grains riches en fer oxydés : agrandissement symbolique de la surface martienne."},
      shapes: [
        {"tag":"circle","attrs":{"cx":80,"cy":69,"r":33,"fill":"#f09a7d"}},
        {"tag":"line","attrs":{"x1":118,"y1":49,"x2":190,"y2":31,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":118,"y1":89,"x2":190,"y2":109,"stroke":"#91a2c4"}},
        {"tag":"rect","attrs":{"x":193,"y":26,"width":141,"height":88,"fill":"#35262c","rx":4}},
        {"tag":"circle","attrs":{"cx":212,"cy":46,"r":5,"fill":"#c87f59"}},
        {"tag":"circle","attrs":{"cx":241,"cy":57,"r":9,"fill":"#c87f59"}},
        {"tag":"circle","attrs":{"cx":270,"cy":43,"r":6,"fill":"#c87f59"}},
        {"tag":"circle","attrs":{"cx":305,"cy":61,"r":8,"fill":"#c87f59"}},
        {"tag":"circle","attrs":{"cx":222,"cy":90,"r":7,"fill":"#c87f59"}},
        {"tag":"circle","attrs":{"cx":271,"cy":92,"r":5,"fill":"#c87f59"}},
        {"tag":"circle","attrs":{"cx":307,"cy":96,"r":4,"fill":"#c87f59"}},
        {"tag":"text","attrs":{"x":80,"y":129,"text-anchor":"middle"},"text":"Mars"},
        {"tag":"text","attrs":{"x":264,"y":139,"text-anchor":"middle"},"text":{"de":"oxidierte Körner","en":"oxidised grains","fr":"grains oxydés"}}
      ]
    },
    "jupiter-size": {
      caption: {"de":"Durchmesser im ungefähren Verhältnis 11 : 1. Der Abstand zwischen Erde und Jupiter ist frei gewählt.","en":"Diameters in an approximate 11:1 ratio. The separation between Earth and Jupiter is arbitrary.","fr":"Diamètres dans un rapport approximatif de 11 à 1. L’écart entre la Terre et Jupiter est arbitraire."},
      shapes: [
        {"tag":"circle","attrs":{"cx":85,"cy":74,"r":4,"fill":"#7dc9ff"}},
        {"tag":"circle","attrs":{"cx":244,"cy":74,"r":44,"fill":"#dfb182"}},
        {"tag":"text","attrs":{"x":85,"y":137,"text-anchor":"middle"},"text":{"de":"Erde","en":"Earth","fr":"Terre"}},
        {"tag":"text","attrs":{"x":244,"y":137,"text-anchor":"middle"},"text":"Jupiter"},
        {"tag":"text","attrs":{"x":180,"y":25,"text-anchor":"middle","font-size":18},"text":"1 : 11"}
      ]
    },
    "jupiter-spin": {
      caption: {"de":"Jupiter dreht sich in etwa 9,9 Stunden einmal um seine Achse. Pfeil und Planet schematisch; keine Animation in Echtzeit.","en":"Jupiter rotates once in about 9.9 hours. Arrow and planet are schematic; this is not a real-time animation.","fr":"Jupiter effectue une rotation en environ 9,9 heures. Flèche et planète schématiques ; ce n’est pas une animation en temps réel."},
      shapes: [
        {"tag":"circle","attrs":{"cx":180,"cy":69,"r":33,"fill":"#dfb182"}},
        {"tag":"line","attrs":{"x1":154,"y1":55,"x2":206,"y2":55,"stroke":"#987866","stroke-width":5}},
        {"tag":"line","attrs":{"x1":151,"y1":77,"x2":209,"y2":77,"stroke":"#a9826d","stroke-width":6}},
        {"tag":"path","attrs":{"d":"M 127 77 C 98 29 262 24 235 83","fill":"none","stroke":"#ffd36a"}},
        {"tag":"path","attrs":{"d":"M 229 73 L 235 83 L 245 77","fill":"none","stroke":"#ffd36a"}},
        {"tag":"text","attrs":{"x":180,"y":139,"text-anchor":"middle","font-size":17},"text":{"de":"≈ 9,9 Stunden","en":"≈ 9.9 hours","fr":"≈ 9,9 heures"}}
      ]
    },
    "saturn-density": {
      caption: {"de":"Gleiche Volumina, symbolische Massepunkte: Saturn hat im Mittel weniger Masse pro Volumen als Wasser. Kein Experiment mit einem Wasserbecken.","en":"Equal volumes, symbolic mass dots: Saturn has less average mass per volume than water. Not an experiment in a pool.","fr":"Volumes égaux, points de masse symboliques : Saturne a moins de masse moyenne par volume que l’eau. Pas une expérience dans un bassin."},
      shapes: [
        {"tag":"rect","attrs":{"x":58,"y":30,"width":78,"height":78,"fill":"none","rx":4,"stroke":"#ffd36a"}},
        {"tag":"rect","attrs":{"x":224,"y":30,"width":78,"height":78,"fill":"none","rx":4,"stroke":"#7dc9ff"}},
        {"tag":"circle","attrs":{"cx":77,"cy":51,"r":4,"fill":"#ffd36a"}},
        {"tag":"circle","attrs":{"cx":117,"cy":51,"r":4,"fill":"#ffd36a"}},
        {"tag":"circle","attrs":{"cx":97,"cy":69,"r":4,"fill":"#ffd36a"}},
        {"tag":"circle","attrs":{"cx":77,"cy":89,"r":4,"fill":"#ffd36a"}},
        {"tag":"circle","attrs":{"cx":117,"cy":89,"r":4,"fill":"#ffd36a"}},
        {"tag":"circle","attrs":{"cx":243,"cy":49,"r":4,"fill":"#7dc9ff"}},
        {"tag":"circle","attrs":{"cx":263,"cy":49,"r":4,"fill":"#7dc9ff"}},
        {"tag":"circle","attrs":{"cx":283,"cy":49,"r":4,"fill":"#7dc9ff"}},
        {"tag":"circle","attrs":{"cx":243,"cy":69,"r":4,"fill":"#7dc9ff"}},
        {"tag":"circle","attrs":{"cx":263,"cy":69,"r":4,"fill":"#7dc9ff"}},
        {"tag":"circle","attrs":{"cx":283,"cy":69,"r":4,"fill":"#7dc9ff"}},
        {"tag":"circle","attrs":{"cx":243,"cy":89,"r":4,"fill":"#7dc9ff"}},
        {"tag":"circle","attrs":{"cx":263,"cy":89,"r":4,"fill":"#7dc9ff"}},
        {"tag":"circle","attrs":{"cx":283,"cy":89,"r":4,"fill":"#7dc9ff"}},
        {"tag":"text","attrs":{"x":180,"y":78,"text-anchor":"middle","font-size":27},"text":"<"},
        {"tag":"text","attrs":{"x":97,"y":137,"text-anchor":"middle"},"text":{"de":"Saturn · Mittel","en":"Saturn · average","fr":"Saturne · moyenne"}},
        {"tag":"text","attrs":{"x":263,"y":137,"text-anchor":"middle"},"text":{"de":"Wasser","en":"Water","fr":"Eau"}}
      ]
    },
    "uranus": {
      caption: {"de":"Die Achse ist rund 98° gegen die Senkrechte zur Bahnebene geneigt. Lage, Winkelbogen und Körper sind schematisch.","en":"The axis tilts about 98° from the perpendicular to the orbital plane. Position, angle arc and body are schematic.","fr":"L’axe est incliné d’environ 98° par rapport à la perpendiculaire au plan orbital. Position, arc et corps schématiques."},
      shapes: [
        {"tag":"line","attrs":{"x1":35,"y1":76,"x2":325,"y2":76,"stroke":"#91a2c4","stroke-dasharray":"5 4"}},
        {"tag":"line","attrs":{"x1":180,"y1":14,"x2":180,"y2":132,"stroke":"#91a2c4","stroke-dasharray":"3 4"}},
        {"tag":"circle","attrs":{"cx":180,"cy":76,"r":29,"fill":"#9cdddd"}},
        {"tag":"line","attrs":{"x1":119,"y1":67.4,"x2":241,"y2":84.6,"stroke":"#ffd36a","stroke-width":3}},
        {"tag":"path","attrs":{"d":"M 180 31 A 45 45 0 0 1 224.56 82.26","fill":"none","stroke":"#ffd36a"}},
        {"tag":"text","attrs":{"x":237,"y":35,"text-anchor":"middle"},"text":"98°"},
        {"tag":"text","attrs":{"x":180,"y":148,"text-anchor":"middle"},"text":{"de":"Bahnebene","en":"Orbital plane","fr":"Plan orbital"}}
      ]
    },
    "neptune": {
      caption: {"de":"Ein Umlauf Neptuns um die Sonne: rund 165 Erdenjahre. Bahn und Körpergrößen schematisch.","en":"One Neptune orbit around the Sun: about 165 Earth years. Orbit and sizes are schematic.","fr":"Une révolution de Neptune autour du Soleil : environ 165 années terrestres. Orbite et tailles schématiques."},
      shapes: [
        {"tag":"ellipse","attrs":{"cx":180,"cy":68,"rx":112,"ry":43,"fill":"none","stroke":"#91a2c4"}},
        {"tag":"circle","attrs":{"cx":180,"cy":68,"r":14,"fill":"#ffd36a"}},
        {"tag":"circle","attrs":{"cx":280,"cy":49,"r":8,"fill":"#7b9cf4"}},
        {"tag":"path","attrs":{"d":"M 90 42 L 96 29 L 103 42","fill":"none","stroke":"#ffd36a"}},
        {"tag":"text","attrs":{"x":180,"y":135,"text-anchor":"middle","font-size":17},"text":{"de":"165 Erdenjahre","en":"165 Earth years","fr":"165 années terrestres"}},
        {"tag":"text","attrs":{"x":294,"y":29,"text-anchor":"middle"},"text":{"de":"Neptun","en":"Neptune","fr":"Neptune"}}
      ]
    },
    "sirius": {
      caption: {"de":"Sirius im Großen Hund hervorgehoben. Schematische Linienfigur; keine maßstäbliche Sternkarte und keine Helligkeitsskala.","en":"Sirius highlighted in Canis Major. Schematic stick figure, not a scaled star chart or brightness scale.","fr":"Sirius mise en évidence dans le Grand Chien. Figure schématique, sans échelle de position ni d’éclat."},
      shapes: [
        {"tag":"line","attrs":{"x1":131,"y1":44,"x2":91,"y2":47,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":131,"y1":44,"x2":169,"y2":36,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":131,"y1":44,"x2":179,"y2":92,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":179,"y1":92,"x2":157,"y2":121,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":179,"y1":92,"x2":221,"y2":126,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":91,"y1":47,"x2":81,"y2":126,"stroke":"#91a2c4"}},
        {"tag":"circle","attrs":{"cx":131,"cy":44,"r":6,"fill":"#ffd36a"}},
        {"tag":"circle","attrs":{"cx":91,"cy":47,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":169,"cy":36,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":179,"cy":92,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":157,"cy":121,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":221,"cy":126,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":81,"cy":126,"r":3,"fill":"#e9f0ff"}},
        {"tag":"text","attrs":{"x":180,"y":18,"text-anchor":"middle"},"text":{"de":"Großer Hund","en":"Canis Major","fr":"Grand Chien"}},
        {"tag":"text","attrs":{"x":144,"y":48,"text-anchor":"start","fill":"#ffd36a"},"text":"Sirius"}
      ]
    },
    "regulus": {
      caption: {"de":"Regulus am Fuß der Sichel im Löwen hervorgehoben. Schematische Linienfigur; keine maßstäbliche Sternkarte oder Helligkeitsskala.","en":"Regulus highlighted at the foot of Leo’s sickle. Schematic stick figure, not a scaled star chart or brightness scale.","fr":"Régulus mise en évidence au pied de la faucille du Lion. Figure schématique, sans échelle de position ni d’éclat."},
      shapes: [
        {"tag":"line","attrs":{"x1":244,"y1":121,"x2":244,"y2":87,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":244,"y1":87,"x2":222,"y2":64,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":222,"y1":64,"x2":226,"y2":41,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":226,"y1":41,"x2":261,"y2":29,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":261,"y1":29,"x2":280,"y2":45,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":222,"y1":64,"x2":129,"y2":56,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":129,"y1":56,"x2":65,"y2":108,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":65,"y1":108,"x2":129,"y2":101,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":129,"y1":101,"x2":244,"y2":121,"stroke":"#91a2c4"}},
        {"tag":"circle","attrs":{"cx":244,"cy":121,"r":6,"fill":"#ffd36a"}},
        {"tag":"circle","attrs":{"cx":244,"cy":87,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":222,"cy":64,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":226,"cy":41,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":261,"cy":29,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":280,"cy":45,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":129,"cy":56,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":129,"cy":101,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":65,"cy":108,"r":3,"fill":"#e9f0ff"}},
        {"tag":"text","attrs":{"x":180,"y":18,"text-anchor":"middle"},"text":{"de":"Löwe","en":"Leo","fr":"Lion"}},
        {"tag":"text","attrs":{"x":257,"y":125,"text-anchor":"start","fill":"#ffd36a"},"text":{"de":"Regulus","en":"Regulus","fr":"Régulus"}}
      ]
    },
    "betelgeuse": {
      caption: {"de":"Beteigeuze an Orions Schulter hervorgehoben. Sternbild und Größenvergleich mit der Sonne sind schematisch, kein messbarer Größenmaßstab.","en":"Betelgeuse highlighted at Orion’s shoulder. Constellation and comparison with the Sun are schematic, not a measurable size scale.","fr":"Bételgeuse mise en évidence à l’épaule d’Orion. Constellation et comparaison au Soleil schématiques, sans échelle mesurable."},
      shapes: [
        {"tag":"line","attrs":{"x1":64,"y1":39,"x2":102,"y2":25,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":102,"y1":25,"x2":137,"y2":43,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":64,"y1":39,"x2":92,"y2":86,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":137,"y1":43,"x2":112,"y2":76,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":112,"y1":76,"x2":102,"y2":81,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":102,"y1":81,"x2":92,"y2":86,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":92,"y1":86,"x2":65,"y2":128,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":112,"y1":76,"x2":145,"y2":120,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":65,"y1":128,"x2":145,"y2":120,"stroke":"#91a2c4"}},
        {"tag":"circle","attrs":{"cx":64,"cy":39,"r":6,"fill":"#ffd36a"}},
        {"tag":"circle","attrs":{"cx":137,"cy":43,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":112,"cy":76,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":102,"cy":81,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":92,"cy":86,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":65,"cy":128,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":145,"cy":120,"r":3,"fill":"#e9f0ff"}},
        {"tag":"circle","attrs":{"cx":102,"cy":25,"r":3,"fill":"#e9f0ff"}},
        {"tag":"text","attrs":{"x":100,"y":149,"text-anchor":"middle"},"text":"Orion"},
        {"tag":"circle","attrs":{"cx":262,"cy":62,"r":31,"fill":"#f09a7d"}},
        {"tag":"circle","attrs":{"cx":262,"cy":125,"r":3,"fill":"#ffd36a"}},
        {"tag":"text","attrs":{"x":262,"y":16,"text-anchor":"middle"},"text":{"de":"Beteigeuze","en":"Betelgeuse","fr":"Bételgeuse"}},
        {"tag":"text","attrs":{"x":262,"y":149,"text-anchor":"middle"},"text":{"de":"Sonne","en":"Sun","fr":"Soleil"}},
        {"tag":"line","attrs":{"x1":72,"y1":39,"x2":223,"y2":50,"stroke":"#f09a7d","stroke-dasharray":"3 4"}}
      ]
    },
    "proxima": {
      caption: {"de":"Lichtweg von Proxima Centauri zur Erde: rund 4,25 Jahre. Größen und Abstand schematisch; Proxima ist mit bloßem Auge unsichtbar.","en":"Light travel from Proxima Centauri to Earth: about 4.25 years. Sizes and distance schematic; Proxima is invisible to the naked eye.","fr":"Trajet lumineux de Proxima du Centaure à la Terre : environ 4,25 ans. Tailles et distance schématiques ; Proxima est invisible à l’œil nu."},
      shapes: [
        {"tag":"circle","attrs":{"cx":43,"cy":69,"r":17,"fill":"#f09a7d"}},
        {"tag":"circle","attrs":{"cx":316,"cy":69,"r":12,"fill":"#7dc9ff"}},
        {"tag":"line","attrs":{"x1":76,"y1":69,"x2":286,"y2":69,"stroke":"#ffd36a"}},
        {"tag":"path","attrs":{"d":"M 279 64 L 286 69 L 279 74","fill":"none","stroke":"#ffd36a"}},
        {"tag":"text","attrs":{"x":43,"y":113,"text-anchor":"middle"},"text":"Proxima"},
        {"tag":"text","attrs":{"x":316,"y":113,"text-anchor":"middle"},"text":{"de":"Erde","en":"Earth","fr":"Terre"}},
        {"tag":"text","attrs":{"x":180,"y":41,"text-anchor":"middle","font-size":16},"text":{"de":"≈ 4,25 Lichtjahre","en":"≈ 4.25 light-years","fr":"≈ 4,25 années-lumière"}},
        {"tag":"text","attrs":{"x":180,"y":144,"text-anchor":"middle","font-size":11},"text":{"de":"Lichtlaufzeit ≈ 4,25 Jahre","en":"Light travel ≈ 4.25 years","fr":"Trajet lumineux ≈ 4,25 ans"}}
      ]
    },
    "polaris": {
      caption: {"de":"Sternspuren um den Himmelsnordpol; Polaris steht nahe daran, nicht exakt im Zentrum. Schematisch, Blick nach Norden.","en":"Star trails around the north celestial pole; Polaris is nearby, not exactly at the centre. Schematic view northward.","fr":"Traînées autour du pôle Nord céleste ; la Polaire en est proche, sans être exactement au centre. Schéma vers le nord."},
      shapes: [
        {"tag":"circle","attrs":{"cx":170,"cy":74,"r":26,"fill":"none","stroke":"#91a2c4","stroke-dasharray":"45 8"}},
        {"tag":"circle","attrs":{"cx":170,"cy":74,"r":44,"fill":"none","stroke":"#91a2c4","stroke-dasharray":"71 14"}},
        {"tag":"circle","attrs":{"cx":170,"cy":74,"r":61,"fill":"none","stroke":"#91a2c4","stroke-dasharray":"101 18"}},
        {"tag":"line","attrs":{"x1":166,"y1":74,"x2":174,"y2":74,"stroke":"#91a2c4"}},
        {"tag":"line","attrs":{"x1":170,"y1":70,"x2":170,"y2":78,"stroke":"#91a2c4"}},
        {"tag":"circle","attrs":{"cx":178,"cy":68,"r":4,"fill":"#ffd36a"}},
        {"tag":"text","attrs":{"x":245,"y":65,"text-anchor":"start"},"text":{"de":"Polarstern","en":"Polaris","fr":"Polaire"}},
        {"tag":"text","attrs":{"x":170,"y":149,"text-anchor":"middle"},"text":"N"}
      ]
    },
    "sunlight": {
      caption: {"de":"Sonne → Erde: Licht braucht im Mittel etwa 8 Minuten und 20 Sekunden. Größen und Abstand schematisch.","en":"Sun → Earth: light takes about 8 minutes 20 seconds on average. Sizes and distance schematic.","fr":"Soleil → Terre : la lumière met en moyenne environ 8 minutes 20 secondes. Tailles et distance schématiques."},
      shapes: [
        {"tag":"circle","attrs":{"cx":43,"cy":69,"r":17,"fill":"#ffd36a"}},
        {"tag":"circle","attrs":{"cx":316,"cy":69,"r":12,"fill":"#7dc9ff"}},
        {"tag":"line","attrs":{"x1":76,"y1":69,"x2":286,"y2":69,"stroke":"#ffd36a"}},
        {"tag":"path","attrs":{"d":"M 279 64 L 286 69 L 279 74","fill":"none","stroke":"#ffd36a"}},
        {"tag":"text","attrs":{"x":43,"y":113,"text-anchor":"middle"},"text":{"de":"Sonne","en":"Sun","fr":"Soleil"}},
        {"tag":"text","attrs":{"x":316,"y":113,"text-anchor":"middle"},"text":{"de":"Erde","en":"Earth","fr":"Terre"}},
        {"tag":"text","attrs":{"x":180,"y":41,"text-anchor":"middle","font-size":16},"text":"≈ 8 min 20 s"}
      ]
    },
    "sun-age": {
      caption: {"de":"Von der Entstehung bis heute: etwa 4,6 Milliarden Jahre. Die Linie zeigt das bisherige Alter, nicht die gesamte Lebensdauer der Sonne.","en":"From formation to today: about 4.6 billion years. The line shows the Sun’s age so far, not its entire lifetime.","fr":"De la formation à aujourd’hui : environ 4,6 milliards d’années. La ligne indique l’âge actuel, pas toute la durée de vie du Soleil."},
      shapes: [
        {"tag":"line","attrs":{"x1":46,"y1":72,"x2":314,"y2":72,"stroke":"#ffd36a"}},
        {"tag":"path","attrs":{"d":"M 307 67 L 314 72 L 307 77","fill":"none","stroke":"#ffd36a"}},
        {"tag":"circle","attrs":{"cx":46,"cy":72,"r":6,"fill":"#ffd36a"}},
        {"tag":"circle","attrs":{"cx":314,"cy":72,"r":16,"fill":"#ffd36a"}},
        {"tag":"text","attrs":{"x":46,"y":115,"text-anchor":"middle"},"text":{"de":"Entstehung","en":"Formation","fr":"Formation"}},
        {"tag":"text","attrs":{"x":314,"y":115,"text-anchor":"middle"},"text":{"de":"heute","en":"today","fr":"aujourd’hui"}},
        {"tag":"text","attrs":{"x":180,"y":34,"text-anchor":"middle"},"text":{"de":"≈ 4,6 Milliarden Jahre","en":"≈ 4.6 billion years","fr":"≈ 4,6 milliards d’années"}}
      ]
    },
    "fusion": {
      caption: {"de":"Stark vereinfachte Nettoreaktion im Sternkern: vier Wasserstoffkerne werden zu einem Heliumkern; Energie wird frei. Zwischenschritte und weitere Teilchen fehlen.","en":"Highly simplified net reaction in the stellar core: four hydrogen nuclei form one helium nucleus, releasing energy. Intermediate steps and other particles omitted.","fr":"Bilan très simplifié au cœur stellaire : quatre noyaux d’hydrogène forment un noyau d’hélium en libérant de l’énergie. Étapes intermédiaires et autres particules omises."},
      shapes: [
        {"tag":"circle","attrs":{"cx":50,"cy":53,"r":10,"fill":"#7dc9ff"}},
        {"tag":"circle","attrs":{"cx":79,"cy":53,"r":10,"fill":"#7dc9ff"}},
        {"tag":"circle","attrs":{"cx":50,"cy":84,"r":10,"fill":"#7dc9ff"}},
        {"tag":"circle","attrs":{"cx":79,"cy":84,"r":10,"fill":"#7dc9ff"}},
        {"tag":"line","attrs":{"x1":111,"y1":69,"x2":165,"y2":69,"stroke":"#ffd36a"}},
        {"tag":"path","attrs":{"d":"M 158 64 L 165 69 L 158 74","fill":"none","stroke":"#ffd36a"}},
        {"tag":"circle","attrs":{"cx":207,"cy":59,"r":11,"fill":"#7dc9ff"}},
        {"tag":"circle","attrs":{"cx":226,"cy":59,"r":11,"fill":"#f09a7d"}},
        {"tag":"circle","attrs":{"cx":207,"cy":79,"r":11,"fill":"#f09a7d"}},
        {"tag":"circle","attrs":{"cx":226,"cy":79,"r":11,"fill":"#7dc9ff"}},
        {"tag":"text","attrs":{"x":264,"y":76,"text-anchor":"middle","font-size":20},"text":"+"},
        {"tag":"path","attrs":{"d":"M 307 43 L 292 70 L 305 70 L 296 95 L 323 61 L 309 61 Z","fill":"#ffd36a","stroke":"#ffd36a"}},
        {"tag":"text","attrs":{"x":65,"y":129,"text-anchor":"middle"},"text":{"de":"4 H-Kerne","en":"4 H nuclei","fr":"4 noyaux H"}},
        {"tag":"text","attrs":{"x":217,"y":129,"text-anchor":"middle"},"text":{"de":"He-Kern","en":"He nucleus","fr":"Noyau He"}},
        {"tag":"text","attrs":{"x":307,"y":129,"text-anchor":"middle"},"text":{"de":"Energie","en":"Energy","fr":"Énergie"}}
      ]
    },
    "white-dwarf": {
      caption: {"de":"Ähnliche Größenordnung wie die Erde, aber oft eine Masse in der Größenordnung der Sonne. Kreise schematisch; weiße Zwerge besitzen unterschiedliche Radien und Massen.","en":"Similar in size to Earth, but often with mass of the order of the Sun’s. Circles schematic; white dwarfs vary in radius and mass.","fr":"Taille comparable à la Terre, mais souvent une masse de l’ordre de celle du Soleil. Cercles schématiques ; rayons et masses variables selon la naine blanche."},
      shapes: [
        {"tag":"circle","attrs":{"cx":88,"cy":66,"r":27,"fill":"#7dc9ff"}},
        {"tag":"circle","attrs":{"cx":270,"cy":66,"r":27,"fill":"#e9f0ff"}},
        {"tag":"text","attrs":{"x":180,"y":74,"text-anchor":"middle","font-size":24},"text":"≈"},
        {"tag":"text","attrs":{"x":88,"y":124,"text-anchor":"middle"},"text":{"de":"Erde","en":"Earth","fr":"Terre"}},
        {"tag":"text","attrs":{"x":270,"y":124,"text-anchor":"middle"},"text":{"de":"Weißer Zwerg","en":"White dwarf","fr":"Naine blanche"}},
        {"tag":"text","attrs":{"x":180,"y":24,"text-anchor":"middle"},"text":{"de":"Größenvergleich","en":"Size comparison","fr":"Comparaison des tailles"}}
      ]
    }
  }
};
