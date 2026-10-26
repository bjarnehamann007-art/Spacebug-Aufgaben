import { jsPDF } from 'jspdf';

export interface SpriteFrameDef {
  filename: string;
  frame: { x: number; y: number; w: number; h: number };
}

export const SPACEBUG_FRAMES: SpriteFrameDef[] = [
  { filename: 'down-left_000.png', frame: { x: 0, y: 0, w: 89, h: 89 } },
  { filename: 'down-left_001.png', frame: { x: 0, y: 89, w: 89, h: 89 } },
  { filename: 'down-left_002.png', frame: { x: 0, y: 178, w: 89, h: 89 } },
  { filename: 'down-left_003.png', frame: { x: 0, y: 267, w: 89, h: 89 } },
  { filename: 'down-left_004.png', frame: { x: 0, y: 356, w: 89, h: 89 } },
  { filename: 'down-left_005.png', frame: { x: 0, y: 445, w: 89, h: 89 } },
  { filename: 'down-left_006.png', frame: { x: 0, y: 534, w: 89, h: 89 } },
  { filename: 'down-left_007.png', frame: { x: 0, y: 623, w: 89, h: 89 } },
  { filename: 'down-left_008.png', frame: { x: 0, y: 712, w: 89, h: 89 } },
  { filename: 'down-right_000.png', frame: { x: 89, y: 0, w: 89, h: 89 } },
  { filename: 'down-right_001.png', frame: { x: 178, y: 0, w: 89, h: 89 } },
  { filename: 'down-right_002.png', frame: { x: 267, y: 0, w: 89, h: 89 } },
  { filename: 'down-right_003.png', frame: { x: 356, y: 0, w: 89, h: 89 } },
  { filename: 'down-right_004.png', frame: { x: 445, y: 0, w: 89, h: 89 } },
  { filename: 'down-right_005.png', frame: { x: 534, y: 0, w: 89, h: 89 } },
  { filename: 'down-right_006.png', frame: { x: 623, y: 0, w: 89, h: 89 } },
  { filename: 'down-right_007.png', frame: { x: 712, y: 0, w: 89, h: 89 } },
  { filename: 'down-right_008.png', frame: { x: 89, y: 89, w: 89, h: 89 } },
  { filename: 'idle-down_000.png', frame: { x: 89, y: 178, w: 89, h: 89 } },
  { filename: 'idle-left_000.png', frame: { x: 89, y: 267, w: 89, h: 89 } },
  { filename: 'idle-right_000.png', frame: { x: 89, y: 356, w: 89, h: 89 } },
  { filename: 'idle-up_000.png', frame: { x: 89, y: 445, w: 89, h: 89 } },
  { filename: 'left-down_000.png', frame: { x: 89, y: 534, w: 89, h: 89 } },
  { filename: 'left-down_001.png', frame: { x: 89, y: 623, w: 89, h: 89 } },
  { filename: 'left-down_002.png', frame: { x: 89, y: 712, w: 89, h: 89 } },
  { filename: 'left-down_003.png', frame: { x: 178, y: 89, w: 89, h: 89 } },
  { filename: 'left-down_004.png', frame: { x: 267, y: 89, w: 89, h: 89 } },
  { filename: 'left-down_005.png', frame: { x: 356, y: 89, w: 89, h: 89 } },
  { filename: 'left-down_006.png', frame: { x: 445, y: 89, w: 89, h: 89 } },
  { filename: 'left-down_007.png', frame: { x: 534, y: 89, w: 89, h: 89 } },
  { filename: 'left-down_008.png', frame: { x: 623, y: 89, w: 89, h: 89 } },
  { filename: 'left-up_000.png', frame: { x: 712, y: 89, w: 89, h: 89 } },
  { filename: 'left-up_001.png', frame: { x: 178, y: 178, w: 89, h: 89 } },
  { filename: 'left-up_002.png', frame: { x: 178, y: 267, w: 89, h: 89 } },
  { filename: 'left-up_003.png', frame: { x: 178, y: 356, w: 89, h: 89 } },
  { filename: 'left-up_004.png', frame: { x: 178, y: 445, w: 89, h: 89 } },
  { filename: 'left-up_005.png', frame: { x: 178, y: 534, w: 89, h: 89 } },
  { filename: 'left-up_006.png', frame: { x: 178, y: 623, w: 89, h: 89 } },
  { filename: 'left-up_007.png', frame: { x: 178, y: 712, w: 89, h: 89 } },
  { filename: 'left-up_008.png', frame: { x: 267, y: 178, w: 89, h: 89 } },
  { filename: 'right-down_000.png', frame: { x: 356, y: 178, w: 89, h: 89 } },
  { filename: 'right-down_001.png', frame: { x: 445, y: 178, w: 89, h: 89 } },
  { filename: 'right-down_002.png', frame: { x: 534, y: 178, w: 89, h: 89 } },
  { filename: 'right-down_003.png', frame: { x: 623, y: 178, w: 89, h: 89 } },
  { filename: 'right-down_004.png', frame: { x: 712, y: 178, w: 89, h: 89 } },
  { filename: 'right-down_005.png', frame: { x: 267, y: 267, w: 89, h: 89 } },
  { filename: 'right-down_006.png', frame: { x: 267, y: 356, w: 89, h: 89 } },
  { filename: 'right-down_007.png', frame: { x: 267, y: 445, w: 89, h: 89 } },
  { filename: 'right-down_008.png', frame: { x: 267, y: 534, w: 89, h: 89 } },
  { filename: 'right-up_000.png', frame: { x: 267, y: 623, w: 89, h: 89 } },
  { filename: 'right-up_001.png', frame: { x: 267, y: 712, w: 89, h: 89 } },
  { filename: 'right-up_002.png', frame: { x: 356, y: 267, w: 89, h: 89 } },
  { filename: 'right-up_003.png', frame: { x: 445, y: 267, w: 89, h: 89 } },
  { filename: 'right-up_004.png', frame: { x: 534, y: 267, w: 89, h: 89 } },
  { filename: 'right-up_005.png', frame: { x: 623, y: 267, w: 89, h: 89 } },
  { filename: 'right-up_006.png', frame: { x: 712, y: 267, w: 89, h: 89 } },
  { filename: 'right-up_007.png', frame: { x: 356, y: 356, w: 89, h: 89 } },
  { filename: 'right-up_008.png', frame: { x: 356, y: 445, w: 89, h: 89 } },
  { filename: 'up-left_000.png', frame: { x: 356, y: 534, w: 89, h: 89 } },
  { filename: 'up-left_001.png', frame: { x: 356, y: 623, w: 89, h: 89 } },
  { filename: 'up-left_002.png', frame: { x: 356, y: 712, w: 89, h: 89 } },
  { filename: 'up-left_003.png', frame: { x: 445, y: 356, w: 89, h: 89 } },
  { filename: 'up-left_004.png', frame: { x: 534, y: 356, w: 89, h: 89 } },
  { filename: 'up-left_005.png', frame: { x: 623, y: 356, w: 89, h: 89 } },
  { filename: 'up-left_006.png', frame: { x: 712, y: 356, w: 89, h: 89 } },
  { filename: 'up-left_007.png', frame: { x: 445, y: 445, w: 89, h: 89 } },
  { filename: 'up-left_008.png', frame: { x: 445, y: 534, w: 89, h: 89 } },
  { filename: 'up-right_000.png', frame: { x: 445, y: 623, w: 89, h: 89 } },
  { filename: 'up-right_001.png', frame: { x: 445, y: 712, w: 89, h: 89 } },
  { filename: 'up-right_002.png', frame: { x: 534, y: 445, w: 89, h: 89 } },
  { filename: 'up-right_003.png', frame: { x: 623, y: 445, w: 89, h: 89 } },
  { filename: 'up-right_004.png', frame: { x: 712, y: 445, w: 89, h: 89 } },
  { filename: 'up-right_005.png', frame: { x: 534, y: 534, w: 89, h: 89 } },
  { filename: 'up-right_006.png', frame: { x: 534, y: 623, w: 89, h: 89 } },
  { filename: 'up-right_007.png', frame: { x: 534, y: 712, w: 89, h: 89 } },
  { filename: 'up-right_008.png', frame: { x: 623, y: 534, w: 89, h: 89 } },
  { filename: 'walk-down_000.png', frame: { x: 712, y: 534, w: 89, h: 89 } },
  { filename: 'walk-left_000.png', frame: { x: 623, y: 623, w: 89, h: 89 } },
  { filename: 'walk-right_000.png', frame: { x: 623, y: 712, w: 89, h: 89 } },
  { filename: 'walk-up_000.png', frame: { x: 712, y: 623, w: 89, h: 89 } },
];

export function buildPlayerAnimations(): Record<string, { frames: [number, number][] }> {
  const anims: Record<string, { frames: [number, number][] }> = {};
  for (const item of SPACEBUG_FRAMES) {
    const key = item.filename.slice(0, item.filename.indexOf('_'));
    if (!anims[key]) {
      anims[key] = { frames: [] };
    }
    const { x, y, w, h } = item.frame;
    anims[key].frames.push([x / w, y / h]);
  }
  return anims;
}

export const SPACEBUG_SPRITE_CONFIG = {
  player: {
    src: 'assets/imgs/spacebug.png',
    width: 89,
    height: 89,
    xOffset: 0,
    yOffset: 0,
    scale: 0.46,
    speed: 4,
    delay: 0,
    defaultAnimation: 'idle-right',
  },
  collisionObj: {
    src: 'assets/imgs/asteroid.png',
    width: 80,
    height: 80,
    xOffset: 5,
    yOffset: 4,
    scale: 0.4,
    delay: 60,
    defaultAnimation: 'idle-pos',
  },
  collectableObj: {
    src: 'assets/imgs/powerup.png',
    width: 80,
    height: 80,
    xOffset: 11,
    yOffset: 11,
    scale: 0.24,
    delay: 100,
    defaultAnimation: 'idle-pos',
  },
};

export const PB_ALL = `
class Player:
  # Methods for Top - Down / Isometric
  def move(self):
    __move__()
    
  def turnLeft(self):
    __turnLeft__()

  def turnRight(self):
    __turnRight__()

  def removePow(self):
    __removeObject__()

  def putPow(self):
    __placeObject__()

  # Conditional methods for both styles
  def getPosition(self):
    return __getPosition__()

  def rockLeft(self):
    return __objectLeft__()
  
  def rockRight(self):
    return __objectRight__()
  
  def rockFront(self):
    return __objectFront__()

  def onPow(self):
    return __onObject__()

  def showText(self, text):
    __showText__(text)

argo = Player()

# Methods for Top - Down / Isometric
def move():
  __move__()
  
def turnLeft():
  __turnLeft__()

def turnRight():
  __turnRight__()

def putPow():
  __placeObject__()

def removePow():
  __removeObject__()

def putLog():
  __placeObject__()

def removeLog():
  __removeObject__()

# Conditional methods for both styles
def rockLeft():
  return __objectLeft__()

def rockRight():
  return __objectRight__()

def rockFront():
  return __objectFront__()

def onPow():
  return __onObject__()

def onLog():
  return __onObject__()

def showText(text):
  __showText__(text)

def getPosition():
  return __getPosition__()

def paddle():
  while not rockFront():
    move()
    if onLog():
      removeLog()

def gotoLog():
  if onLog():
    move()
  while not onLog():
    move()
`;

export const MESSAGES_DE = {
  codeExecuted: 'Programm beendet!',
  codeInterrupted: 'Programm wurde abgebrochen!',
  killedInfiniteLoop: 'Mögliche Endlosschleife erkannt! Programm wurde abgebrochen!',
  infiniteLoop: 'Mögliche Endlosschleife erkannt!',
  checkLinnum: 'Prüfe Zeile',
  noColon: 'Am Ende der Zeile fehlt ein Doppelpunkt.',
  noBrackets: 'Achte auf die Klammern am Ende, z.B. move()!',
  noCollectableObj: 'Ups! Hier gibt es nichts aufzuheben!',
  gridNotEmpty: 'Das Feld ist bereits belegt!',
  collision: 'Kollision mit einem Fels!',
  default: 'Dein Code enthält scheinbar einen Fehler.',
  noCode: 'Kein Code zum Ausführen vorhanden!',
  noPlayer: 'Es ist kein Biber vorhanden.',
  errorEOF: 'Achte auf beide Klammern () bei Befehlen wie move(), turnLeft(), ...',
  noInputFun: 'Python input() ist nicht verfügbar!',
  move: 'Ein Feld vorwärts',
  turnLeft: 'Linksdrehung um 90 Grad',
  turnRight: 'Rechtsdrehung um 90 Grad',
  putLog: 'Baumstamm ablegen',
  removeLog: 'Baumstamm aufsammeln',
  onLog: 'Baumstamm auf aktuellem Feld?',
  rockRight: 'Fels auf dem Feld rechts?',
  rockLeft: 'Fels auf dem Feld links?',
  rockFront: 'Felsen direkt vor dem Biber?',
  worldSize: 'Nicht alle Objekte werden angezeigt. Weltgröße anpassen!',
};

export interface ChangelogEntry {
  version: string;
  date: string;
  bugfixes: string[];
  changes: string[];
  future: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.5.0',
    date: '05.2026',
    bugfixes: [],
    changes: [
      'Teilen des aktuellen Codes und der Welt oder einer Datei mit Testfällen direkt als Link (beta)',
      'Direktes Aufrufen einer Datei über Kennwort, wenn die Datei zuvor in Datenbank gespeichert wurde (siehe Link teilen) (beta)',
      'Pre-loading von Icons für Menü',
    ],
    future: [
      'Testdateien auch für eine Welt (statt mindestens 2)',
      'Update grafische Rückmeldung beim Laden von Testdateien',
      'Download - Bereich mit Bedienungshinweisen',
    ],
  },
  {
    version: '1.4.2',
    date: '11.2025',
    bugfixes: [
      'Ziehen von Editor/Menü - Icons lösen kein DragEvent mehr aus.',
      'Dateiendung .json wird automatisch angehängt, damit sollte Dateiendung .customization verhindert werden.',
      'Dateinamen mit Punkt werden auf Namen vor Punkt gekürzt.',
    ],
    changes: [],
    future: [
      'v1.5: Teilen des aktuellen Codes und der Welt oder einer Datei mit Testfällen direkt als Link (beta)',
      'Testdateien auch für eine Welt (statt mindestens 2)',
      'Update grafische Rückmeldung beim Laden von Testdateien',
      'Download - Bereich mit Bedienungshinweisen',
      'Pre-Loading von Images für Menüs',
    ],
  },
  {
    version: '1.4.1',
    date: '08.2025',
    bugfixes: [
      'Bugfix bei automatischer Überprüfung von Testfällen, die einen ExternalError enthielten.',
    ],
    changes: [],
    future: ['Download - Bereich mit Bedienungshinweisen'],
  },
  {
    version: '1.4.0',
    date: '07.2025',
    bugfixes: ['Ausrichtung und Position des Playerobjekts bleibt beim Weltwechsel erhalten'],
    changes: ['Alle sichtbaren Welten werden in eine Datei gespeichert'],
    future: ['Download - Bereich mit Bedienungshinweisen'],
  },
  {
    version: '1.3.0',
    date: '07.2025',
    bugfixes: [],
    changes: ['Testwelten erstellen -> Menü Einstellungen'],
    future: [
      'v1.4.0 Share - Teilen des aktuellen Codes und/oder der Welt direkt als Link',
      'Download - Bereich mit Bedienungshinweisen',
    ],
  },
  {
    version: '1.2.0',
    date: '06.2025',
    bugfixes: ['Fehler bei Verwendung von removeObj, putObj in Python input - Funktion behoben'],
    changes: ['Custom Input Dialog'],
    future: [
      'v1.x : Share - Teilen des aktuellen Codes und/oder der Welt direkt als Link',
      'v1.x : Welt - Tests (d.h. automatisiertes Testen des Codes gegen gegebene Welten)',
      'v1.x : Download - Bereich mit Bedienungshinweisen',
    ],
  },
  {
    version: '1.1.0',
    date: '05.2025',
    bugfixes: [
      'Stabilitätsverbesserung bei Endlosschleifen',
      'Verschachtelte Input Funktionen werden erkannt',
    ],
    changes: [
      'UI Redesign',
      'Dialoge Öffnen, Speichern, Einstellungen direkt in linker Sidebar',
      'Drag&Drop von Datei(en) auf die App öffnet diese direkt',
      'Weltgröße (default) 12x12 Felder',
      'Weltgröße kann in den Einstellungen angepasst werden',
      'Menüeintrag Changelog (beginnt mit Version 1.1)',
    ],
    future: [
      'v1.2 : Share - Teilen des aktuellen Codes und/oder der Welt direkt als Link',
      'v1.x : Download - Bereich mit Bedienungshinweisen',
    ],
  },
];

export interface TaskItem {
  id: number;
  title: string;
  shortTitle: string;
  category: string;
  difficulty: 1 | 2 | 3;
  introText: string;
  image1Url: string;
  image2Url: string;
  worldJsonUrl: string;
  solutionCode: string;
  solutionExplanation: string;
}

export const TASKS: TaskItem[] = [
  {
    id: 1,
    title: 'Slalom-Lieferung',
    shortTitle: 'Slalom-Lieferung',
    category: 'Sequenzen',
    difficulty: 1,
    introText:
      'Argo startet links vor zwei versetzten Asteroiden-Toren. Sammle das PowerUp vor dem ersten Tor ein, fliege im Slalom durch die Lücken und lege das PowerUp direkt vor dem Ziel-Asteroiden rechts ab.',
    image1Url: 'assets/tasks/custom_task1_vorher.svg',
    image2Url: 'assets/tasks/custom_task1_nachher.svg',
    worldJsonUrl: 'assets/tasks/custom_task1.json',
    solutionCode: `move()
removePow()
turnRight()
move()
turnLeft()
move()
move()
turnLeft()
move()
turnRight()
move()
move()
putPow()`,
    solutionExplanation:
      'Argo nimmt das PowerUp auf, weicht dem ersten Hindernis nach unten aus, kehrt hinter der zweiten Barriere wieder auf die Hauptspur zurück und legt das PowerUp vor dem End-Asteroiden ab.',
  },
  {
    id: 2,
    title: 'Satelliten-Wartung',
    shortTitle: 'Satelliten-Wartung',
    category: 'Sequenzen',
    difficulty: 2,
    introText:
      'Ein Satellit (Asteroid in der Mitte) ist oben und unten von zwei verbrauchten PowerUps umgeben. Sammle beide PowerUps nacheinander ein und platziere ein einzelnes PowerUp rechts hinter dem Satelliten.',
    image1Url: 'assets/tasks/custom_task2_vorher.svg',
    image2Url: 'assets/tasks/custom_task2_nachher.svg',
    worldJsonUrl: 'assets/tasks/custom_task2.json',
    solutionCode: `move()
turnLeft()
move()
turnRight()
move()
removePow()
move()
turnRight()
move()
move()
turnRight()
move()
removePow()
turnLeft()
turnLeft()
move()
turnLeft()
move()
putPow()`,
    solutionExplanation:
      'Argo fliegt über die obere Flanke zum ersten PowerUp, umrundet den Satelliten rechts nach unten zum zweiten PowerUp und positioniert anschließend ein neues PowerUp rechts neben dem Satelliten.',
  },
  {
    id: 3,
    title: 'Cargo-Express',
    shortTitle: 'Cargo-Express',
    category: 'Wiederholungen',
    difficulty: 2,
    introText:
      'Vor Argo liegt eine durchgehende Frachtspur aus PowerUps, die direkt vor einem Asteroiden endet. Sammle mit einer Schleife alle PowerUps ein, halte vor dem Asteroiden an und wende Argo um 180 Grad.',
    image1Url: 'assets/tasks/custom_task3_vorher.svg',
    image2Url: 'assets/tasks/custom_task3_nachher.svg',
    worldJsonUrl: 'assets/tasks/custom_task3.json',
    solutionCode: `while not rockFront():
    move()
    removePow()
turnLeft()
turnLeft()`,
    solutionExplanation:
      'Solange kein Asteroid vor Argo liegt (while not rockFront()), rückt Argo jeweils ein Feld vor und sammelt das dortige PowerUp ein. Am Ende wendet sie mit zwei Linksdrehungen.',
  },
  {
    id: 4,
    title: 'Schutzschild bauen',
    shortTitle: 'Schutzschild bauen',
    category: 'Wiederholungen',
    difficulty: 2,
    introText:
      'Rechts neben Argo verläuft eine senkrechte Asteroidenwand. Fliege an der gesamten Wand entlang nach oben und lege auf jedem Feld direkt links neben der Wand ein PowerUp als Schutzschild ab.',
    image1Url: 'assets/tasks/custom_task4_vorher.svg',
    image2Url: 'assets/tasks/custom_task4_nachher.svg',
    worldJsonUrl: 'assets/tasks/custom_task4.json',
    solutionCode: `while rockRight():
    putPow()
    move()`,
    solutionExplanation:
      'Mit der Bedingung while rockRight() erkennt Argo, ob sich rechts neben ihr noch die Asteroidenwand befindet, legt dort ein PowerUp ab und fliegt ein Feld weiter nach oben.',
  },
  {
    id: 5,
    title: 'Eck-Patrouille',
    shortTitle: 'Eck-Patrouille',
    category: 'Wiederholungen',
    difficulty: 2,
    introText:
      'Argo befindet sich in einem winkelförmigen Sektor. Fliege mit einer Schleife bis zum ersten Stopp-Asteroiden rechts, biege nach oben ab, fliege bis zum oberen Asteroiden und hebe dort das PowerUp auf.',
    image1Url: 'assets/tasks/custom_task5_vorher.svg',
    image2Url: 'assets/tasks/custom_task5_nachher.svg',
    worldJsonUrl: 'assets/tasks/custom_task5.json',
    solutionCode: `while not rockFront():
    move()
turnLeft()
while not rockFront():
    move()
removePow()`,
    solutionExplanation:
      'Zwei aufeinanderfolgende while-Schleifen führen Argo zuerst horizontal bis zum ersten Hindernis und nach einer Linksdrehung vertikal bis zum Ziel-PowerUp vor dem zweiten Hindernis.',
  },
  {
    id: 6,
    title: 'Pendelverkehr',
    shortTitle: 'Pendelverkehr',
    category: 'Wiederholungen',
    difficulty: 2,
    introText:
      'Argo startet am linken Rand zwischen zwei gegenüberliegenden Asteroiden. Fliege bis zum rechten Asteroiden, lege dort ein PowerUp ab und kehre wieder auf dein Startfeld mit Blick nach rechts zurück.',
    image1Url: 'assets/tasks/custom_task6_vorher.svg',
    image2Url: 'assets/tasks/custom_task6_nachher.svg',
    worldJsonUrl: 'assets/tasks/custom_task6.json',
    solutionCode: `while not rockFront():
    move()
putPow()
turnLeft()
turnLeft()
while not rockFront():
    move()
turnLeft()
turnLeft()`,
    solutionExplanation:
      'Argo fliegt bis zum rechten Begrenzungs-Asteroiden, legt das PowerUp ab, dreht um 180 Grad, fliegt bis zum linken Begrenzungs-Asteroiden zurück und richtet sich wieder nach rechts aus.',
  },
  {
    id: 7,
    title: 'Lückenfüller',
    shortTitle: 'Lückenfüller',
    category: 'Fallunterscheidungen',
    difficulty: 2,
    introText:
      'Argo soll bis zum Asteroiden am rechten Rand fliegen. Auf einigen Feldern liegen bereits PowerUps. Prüfe nach jedem Schritt per Fallunterscheidung, ob das Feld noch leer ist, und fülle nur die Lücken auf.',
    image1Url: 'assets/tasks/custom_task7_vorher.svg',
    image2Url: 'assets/tasks/custom_task7_nachher.svg',
    worldJsonUrl: 'assets/tasks/custom_task7.json',
    solutionCode: `while not rockFront():
    move()
    if not onPow():
        putPow()`,
    solutionExplanation:
      'In jedem Schleifendurchlauf prüft Argo nach dem Vorrücken mit if not onPow():, ob auf dem Feld noch kein PowerUp liegt, und legt nur dann eines ab.',
  },
  {
    id: 8,
    title: 'Energie-Inverter',
    shortTitle: 'Energie-Inverter',
    category: 'Fallunterscheidungen',
    difficulty: 3,
    introText:
      'Argo fliegt bis zum Asteroiden und invertiert unterwegs jedes Feld: Liegt auf einem Feld bereits ein PowerUp, hebt sie es auf – ist das Feld hingegen leer, legt sie dort ein neues PowerUp ab.',
    image1Url: 'assets/tasks/custom_task8_vorher.svg',
    image2Url: 'assets/tasks/custom_task8_nachher.svg',
    worldJsonUrl: 'assets/tasks/custom_task8.json',
    solutionCode: `while not rockFront():
    move()
    if onPow():
        removePow()
    else:
        putPow()`,
    solutionExplanation:
      'Mit einer zweiseitigen Fallunterscheidung (if onPow(): ... else: ...) kehrt Argo den Zustand jedes besuchten Feldes bis zum End-Asteroiden um.',
  },
  {
    id: 9,
    title: 'Wand-Detektor',
    shortTitle: 'Wand-Detektor',
    category: 'Fallunterscheidungen',
    difficulty: 3,
    introText:
      'Argo fliegt nach rechts bis zum Stopp-Asteroiden. Immer wenn sich links oberhalb ihrer aktuellen Position ein Asteroid befindet (rockLeft()), soll Argo zur Markierung ein PowerUp ablegen.',
    image1Url: 'assets/tasks/custom_task9_vorher.svg',
    image2Url: 'assets/tasks/custom_task9_nachher.svg',
    worldJsonUrl: 'assets/tasks/custom_task9.json',
    solutionCode: `while not rockFront():
    move()
    if rockLeft():
        putPow()`,
    solutionExplanation:
      'Nach jedem Schritt prüft Argo mit if rockLeft():, ob sich links neben ihrer Flugrichtung (also im Feld darüber) ein Asteroid befindet, und setzt genau dort ein PowerUp.',
  },
  {
    id: 10,
    title: 'Slalom-Pilot',
    shortTitle: 'Slalom-Pilot',
    category: 'Fallunterscheidungen',
    difficulty: 3,
    introText:
      'Argo ist auf dem Weg zum PowerUp am rechten Ende, doch einzelne Asteroiden blockieren die Spur. Prüfe in einer Schleife mit if rockFront():, ob ein Hindernis vor Argo liegt, weiche ihm oben herum aus und sammle am Ziel das PowerUp ein.',
    image1Url: 'assets/tasks/custom_task10_vorher.svg',
    image2Url: 'assets/tasks/custom_task10_nachher.svg',
    worldJsonUrl: 'assets/tasks/custom_task10.json',
    solutionCode: `while not onPow():
    if rockFront():
        turnLeft()
        move()
        turnRight()
        move()
        move()
        turnRight()
        move()
        turnLeft()
    else:
        move()
removePow()`,
    solutionExplanation:
      'Solange Argo das Ziel-PowerUp noch nicht erreicht hat (while not onPow()), entscheidet sie vor jedem Schritt mit if rockFront():, ob sie ein Ausweichmanöver über die obere Spur fliegt oder direkt vorrückt.',
  },
  {
    id: 11,
    title: 'Tunnel-Prüfer',
    shortTitle: 'Tunnel-Prüfer',
    category: 'Fallunterscheidungen',
    difficulty: 3,
    introText:
      'Argo durchfliegt einen Korridor bis zum Stopp-Asteroiden rechts. Nur dort, wo gleichzeitig links UND rechts ein Asteroid angrenzt (rockLeft() and rockRight()), darf ein PowerUp liegen – fehlt es dort, lege eines ab. Liegt hingegen an einer einseitig oder beidseitig offenen Stelle ein fehlplatziertes PowerUp, entferne es mit elif onPow():.',
    image1Url: 'assets/tasks/custom_task11_vorher.svg',
    image2Url: 'assets/tasks/custom_task11_nachher.svg',
    worldJsonUrl: 'assets/tasks/custom_task11.json',
    solutionCode: `while not rockFront():
    move()
    if rockLeft() and rockRight():
        if not onPow():
            putPow()
    elif onPow():
        removePow()`,
    solutionExplanation:
      'Mit der logischen Verknüpfung if rockLeft() and rockRight(): erkennt Argo enge Tunnelabschnitte und ergänzt dort fehlende PowerUps. Im elif-Zweig werden falsch platzierte PowerUps außerhalb des Tunnels eingesammelt.',
  },
  {
    id: 12,
    title: 'Labyrinth-Navigator',
    shortTitle: 'Labyrinth-Navigator',
    category: 'Fallunterscheidungen',
    difficulty: 3,
    introText:
      'Steuere Argo durch das verwinkelte Asteroiden-Labyrinth bis zum Ziel-PowerUp und hebe es auf. Prüfe in einer Schleife mit if / elif / else: Ist der Weg vorne frei (not rockFront()), rücke vor. Ist vorne blockiert, aber links frei (elif not rockLeft()), drehe nach links – sonst (else) nach rechts.',
    image1Url: 'assets/tasks/custom_task12_vorher.svg',
    image2Url: 'assets/tasks/custom_task12_nachher.svg',
    worldJsonUrl: 'assets/tasks/custom_task12.json',
    solutionCode: `while not onPow():
    if not rockFront():
        move()
    elif not rockLeft():
        turnLeft()
    else:
        turnRight()
removePow()`,
    solutionExplanation:
      'Solange das Ziel-PowerUp noch nicht erreicht ist (while not onPow()), prüft eine mehrstufige Fallunterscheidung (if / elif / else) zuerst die freie Geradeausfahrt, dann die Linkskurve und wählt andernfalls die Rechtskurve.',
  },
  {
    id: 13,
    title: 'Seitenkammer-Bergung',
    shortTitle: 'Seitenkammer-Bergung',
    category: 'Fallunterscheidungen',
    difficulty: 3,
    introText:
      'Argo fliegt durch einen von Asteroiden gesäumten Hauptgang bis zum Stopp-Asteroiden rechts. Überall dort, wo links (if not rockLeft():) oder rechts (elif not rockRight():) eine Lücke in der Seitenwand ist, liegt eine Seitenkammer mit einem PowerUp. Biege in jede offene Kammer ab, sammle das PowerUp ein und kehre auf den Hauptgang zurück.',
    image1Url: 'assets/tasks/custom_task13_vorher.svg',
    image2Url: 'assets/tasks/custom_task13_nachher.svg',
    worldJsonUrl: 'assets/tasks/custom_task13.json',
    solutionCode: `while not rockFront():
    move()
    if not rockLeft():
        turnLeft()
        move()
        removePow()
        turnLeft()
        turnLeft()
        move()
        turnLeft()
    elif not rockRight():
        turnRight()
        move()
        removePow()
        turnLeft()
        turnLeft()
        move()
        turnRight()`,
    solutionExplanation:
      'Nach jedem Schritt im Hauptgang prüft Argo mit if not rockLeft(): und elif not rockRight():, ob sich oben oder unten eine Seitenkammer öffnet, holt das dortige PowerUp ab und richtet sich im Hauptgang wieder nach rechts aus.',
  },
  {
    id: 14,
    title: 'Doppel-Slalom',
    shortTitle: 'Doppel-Slalom',
    category: 'Fallunterscheidungen',
    difficulty: 3,
    introText:
      'Mehrere Asteroiden blockieren den Weg zum Ziel-PowerUp rechts, und teilweise ist zusätzlich die obere oder untere Ausweichspur versperrt! Prüfe bei einem Hindernis (if rockFront():) mit einer verschachtelten Fallunterscheidung (if not rockLeft(): ... else: ...), ob Argo oben links oder unten rechts herum ausweichen muss.',
    image1Url: 'assets/tasks/custom_task14_vorher.svg',
    image2Url: 'assets/tasks/custom_task14_nachher.svg',
    worldJsonUrl: 'assets/tasks/custom_task14.json',
    solutionCode: `while not onPow():
    if rockFront():
        if not rockLeft():
            turnLeft()
            move()
            turnRight()
            move()
            move()
            turnRight()
            move()
            turnLeft()
        else:
            turnRight()
            move()
            turnLeft()
            move()
            move()
            turnLeft()
            move()
            turnRight()
    else:
        move()
removePow()`,
    solutionExplanation:
      'Steht Argo vor einem Hindernis (if rockFront():), entscheidet eine innere Fallunterscheidung anhand von if not rockLeft():, ob das Ausweichmanöver über die obere Spur oder über die untere Spur geflogen wird.',
  },
  {
    id: 15,
    title: 'Reaktor-Inspektion',
    shortTitle: 'Reaktor-Inspektion',
    category: 'Fallunterscheidungen',
    difficulty: 3,
    introText:
      'Kombiniere Wartung und Kurven-Navigation in einer Schleife (while not rockFront():): 1. Entferne nach move() vorhandene PowerUps (if onPow():) oder lege eines ab, falls links ODER rechts ein Asteroid liegt (elif rockLeft() or rockRight():). 2. Steht Argo danach vor einer Eckwand (if rockFront():), biege in die freie Richtung ab (if not rockLeft(): / elif not rockRight():).',
    image1Url: 'assets/tasks/custom_task15_vorher.svg',
    image2Url: 'assets/tasks/custom_task15_nachher.svg',
    worldJsonUrl: 'assets/tasks/custom_task15.json',
    solutionCode: `while not rockFront():
    move()
    if onPow():
        removePow()
    elif rockLeft() or rockRight():
        putPow()
    if rockFront():
        if not rockLeft():
            turnLeft()
        elif not rockRight():
            turnRight()`,
    solutionExplanation:
      'Nach jedem Schritt erledigt der erste if/elif-Block die Feldwartung, während der zweite if-Block an Ecken prüft, ob links oder rechts frei ist, und abbiegt. In der Endbucht sind alle drei Seiten durch Asteroiden begrenzt, sodass die Schleife endet.',
  },
];

/**
 * Restores and normalizes Python indentation when code is copied from a PDF viewer
 * (which may either emit non-breaking spaces \u00A0 or strip leading whitespace).
 */
export function restoreCopiedPythonIndentation(rawText: string): string {
  // Normalize line endings and special space characters (\u00A0, tabs, zero-width spaces)
  const normalized = rawText
    .replace(/\r\n?/g, '\n')
    .replace(/[\u00A0\u2007\u202F]/g, ' ')
    .replace(/\u200B/g, '')
    .replace(/\t/g, '    ');

  const rawLines = normalized.split('\n');
  const nonEmptyTrimmed = rawLines.map((l) => l.trim()).filter((l) => l.length > 0);
  if (nonEmptyTrimmed.length === 0) return normalized;

  // 1a. Check exact full-task solutionCode match first across all 15 tasks
  for (const task of TASKS) {
    const solLines = task.solutionCode.split('\n');
    const solTrimmed = solLines.map((l) => l.trim());
    if (
      nonEmptyTrimmed.length === solTrimmed.length &&
      solTrimmed.every((line, idx) => line === nonEmptyTrimmed[idx])
    ) {
      return task.solutionCode;
    }
  }

  // 1b. Check if the pasted lines match a contiguous slice of any task's solutionCode
  for (const task of TASKS) {
    const solLines = task.solutionCode.split('\n');
    const solTrimmed = solLines.map((l) => l.trim());

    if (nonEmptyTrimmed.length <= solTrimmed.length) {
      for (let start = 0; start <= solTrimmed.length - nonEmptyTrimmed.length; start++) {
        let match = true;
        for (let i = 0; i < nonEmptyTrimmed.length; i++) {
          if (solTrimmed[start + i] !== nonEmptyTrimmed[i]) {
            match = false;
            break;
          }
        }
        if (match) {
          return solLines.slice(start, start + nonEmptyTrimmed.length).join('\n');
        }
      }
    }
  }

  // 2. If the first non-empty line is accidentally indented (e.g. pasted after cursor spaces),
  // strip leading spaces from top-level lines if subsequent lines already have indentation.
  const firstNonEmptyIdx = rawLines.findIndex((l) => l.trim().length > 0);
  if (firstNonEmptyIdx >= 0 && /^ +/.test(rawLines[firstNonEmptyIdx])) {
    const otherLinesHaveIndent = rawLines.some(
      (l, idx) => idx !== firstNonEmptyIdx && l.trim().length > 0 && /^ +/.test(l)
    );
    if (otherLinesHaveIndent) {
      rawLines[firstNonEmptyIdx] = rawLines[firstNonEmptyIdx].trimStart();
      return rawLines.join('\n');
    }
  }

  // 3. If any line already has proper indentation (> 0 spaces), keep the normalized text
  const hasExistingIndent = rawLines.some((l) => l.trim().length > 0 && /^ +/.test(l));
  if (hasExistingIndent) {
    return normalized;
  }

  // 4. Fallback: If a PDF viewer stripped all leading spaces from a block with ':' headers,
  // reconstruct standard 4-space Python indentation automatically.
  const hasBlockHeader = nonEmptyTrimmed.some((l) =>
    /^(while|for|if|elif|else|def)\b.*:\s*$/.test(l)
  );
  if (!hasBlockHeader) {
    return normalized;
  }

  let indentLevel = 0;
  const reconstructed: string[] = [];
  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) {
      reconstructed.push('');
      continue;
    }
    if (/^(elif|else)\b.*:\s*$/.test(trimmed)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    reconstructed.push(' '.repeat(indentLevel * 4) + trimmed);
    if (/^(while|for|if|elif|else|def)\b.*:\s*$/.test(trimmed)) {
      indentLevel += 1;
    }
  }
  return reconstructed.join('\n');
}

/**
 * Generates and downloads a clean, multi-page PDF containing all 15 tasks and their Python solutions
 * with preserved indentation for clean copy & paste.
 */
export function downloadAllSolutionsPdf(): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Document Header
  doc.setFillColor(243, 245, 247);
  doc.roundedRect(margin, y - 8, contentWidth, 20, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(45, 45, 45);
  doc.text(`Python Spacebug – Musterlösungen (Aufgaben 1 – ${TASKS.length})`, margin + 5, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(90, 90, 90);
  doc.text(
    'Übersicht aller Aufgabenstellungen, Lösungswege und fertigen Python-Programme',
    margin + 5,
    y + 6.5
  );
  y += 20;

  // Courier 9pt character width in mm: 9 * 0.352778 * 0.600 = 1.905 mm per char
  const charWidthMm = 9 * 0.352778 * 0.6;

  for (const task of TASKS) {
    const descLines = doc.splitTextToSize(task.introText, contentWidth - 10);
    const explLines = doc.splitTextToSize(`Erklärung: ${task.solutionExplanation}`, contentWidth - 10);
    const codeLines = task.solutionCode.split('\n');

    const blockHeight =
      12 +
      descLines.length * 4.5 +
      4 +
      codeLines.length * 4.5 +
      6 +
      explLines.length * 4.3 +
      8;

    if (y + blockHeight > pageHeight - 16) {
      doc.addPage();
      y = 18;
    }

    // Task Header Bar
    doc.setFillColor(235, 239, 243);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(35, 35, 35);
    doc.text(`${task.id}. ${task.shortTitle}`, margin + 4, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(task.category, pageWidth - margin - 4, y + 5.5, { align: 'right' });
    y += 12;

    // Task Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    doc.text(descLines, margin + 2, y);
    y += descLines.length * 4.5 + 2;

    // Code Box
    const codeBoxHeight = codeLines.length * 4.5 + 5;
    doc.setFillColor(248, 249, 251);
    doc.setDrawColor(215, 220, 226);
    doc.roundedRect(margin + 2, y, contentWidth - 4, codeBoxHeight, 2, 2, 'FD');

    const baseCodeX = margin + 6;

    // Pass 1: Draw subtle vertical indent guides first so graphics operators are not interleaved with text
    doc.setDrawColor(210, 218, 228);
    doc.setLineWidth(0.25);
    let guideY = y + 4.6;
    for (const cLine of codeLines) {
      const leadingMatch = cLine.match(/^( +)/);
      const leadingSpaces = leadingMatch ? leadingMatch[1].length : 0;
      const indentLevels = Math.floor(leadingSpaces / 4);
      if (indentLevels > 0) {
        for (let lvl = 0; lvl < indentLevels; lvl++) {
          const guideX = baseCodeX + lvl * 4 * charWidthMm + 0.4;
          doc.line(guideX, guideY - 3.3, guideX, guideY + 1.0);
        }
      }
      guideY += 4.5;
    }

    // Pass 2: Render code lines in an uninterrupted text sequence with preserved indentation
    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(25, 25, 25);
    let codeY = y + 4.6;
    for (const cLine of codeLines) {
      const leadingMatch = cLine.match(/^( +)/);
      const leadingSpaces = leadingMatch ? leadingMatch[1].length : 0;
      const pdfLine =
        leadingSpaces > 0
          ? '\u00A0'.repeat(leadingSpaces) + cLine.slice(leadingSpaces)
          : cLine;
      doc.text(pdfLine, baseCodeX, codeY);
      codeY += 4.5;
    }
    y += codeBoxHeight + 4;

    // Explanation
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.8);
    doc.setTextColor(85, 85, 85);
    doc.text(explLines, margin + 2, y);
    y += explLines.length * 4.3 + 6;
  }

  doc.save('Spacebug_Alle_Loesungen.pdf');
}




