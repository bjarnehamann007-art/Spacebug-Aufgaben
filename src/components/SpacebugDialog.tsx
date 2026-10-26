import React, { useState, useRef, useEffect } from 'react';
import { CHANGELOG } from '../data/spacebugConfig';

export type DialogName =
  | 'save'
  | 'open'
  | 'size'
  | 'screenshot'
  | 'test'
  | 'share'
  | 'code'
  | 'input'
  | 'changelog'
  | undefined;

interface SpacebugDialogProps {
  dialogName: DialogName;
  inputArg?: string;
  cols: number;
  rows: number;
  maxCols: number;
  maxRows: number;
  onClose: () => void;
  onSaveJson: (fileName: string, includeCode: boolean, includeWorld: boolean) => void;
  onOpenFiles: (files: FileList) => void;
  onChangeGridSize: (cols: number, rows: number) => void;
  onSaveScreenshot: (fileName: string, toClipboard: boolean) => void;
  onGenerateTestCases: (
    fileName: string,
    opts: { logPlayer: boolean; dirPlayer: boolean; solidObj: boolean; pickupObj: boolean }
  ) => void;
  onSubmitInput: (value: string) => void;
  onShareLink: (clipboard: boolean) => void;
  shareKeyword?: string;
  shareState: 'default' | 'pending' | 'success' | 'copied';
  onOpenWithCode: (code: string) => void;
}

export const SpacebugDialog: React.FC<SpacebugDialogProps> = ({
  dialogName,
  inputArg,
  cols,
  rows,
  maxCols,
  maxRows,
  onClose,
  onSaveJson,
  onOpenFiles,
  onChangeGridSize,
  onSaveScreenshot,
  onGenerateTestCases,
  onSubmitInput,
  onShareLink,
  shareKeyword,
  shareState,
  onOpenWithCode,
}) => {
  const [fileNameSave, setFileNameSave] = useState('');
  const [loadCode, setLoadCode] = useState(true);
  const [loadWorld, setLoadWorld] = useState(true);

  const [rangeCols, setRangeCols] = useState(cols);
  const [rangeRows, setRangeRows] = useState(rows);

  const [screenshotName, setScreenshotName] = useState('');
  const [screenshotClipboard, setScreenshotClipboard] = useState(true);

  const [moreOptions, setMoreOptions] = useState(false);
  const [logPlayer, setLogPlayer] = useState(true);
  const [dirPlayer, setDirPlayer] = useState(true);
  const [solidObj, setSolidObj] = useState(true);
  const [pickupObj, setPickupObj] = useState(true);

  const [inputValue, setInputValue] = useState('');
  const [openCodeVal, setOpenCodeVal] = useState('');
  const [activeDropbox, setActiveDropbox] = useState(false);
  const [emailAddress, setEmailAddress] = useState<string | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const promptInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRangeCols(cols);
    setRangeRows(rows);
  }, [cols, rows, dialogName]);

  useEffect(() => {
    if (dialogName === 'input') {
      setInputValue('');
      setTimeout(() => promptInputRef.current?.focus(), 30);
    }
    setFileNameSave('');
    setScreenshotName('');
    setOpenCodeVal('');
    setMoreOptions(false);
    setEmailAddress(undefined);
  }, [dialogName]);

  if (!dialogName) return null;

  const isChangelog = dialogName === 'changelog';

  const handleSendEmail = () => {
    const decoded = atob('ZmVlZGJhY2tAcHl0aG9uLXNwYWNlYnVnLmRl');
    setEmailAddress(decoded);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="min-w-[320px] rounded-[12px] shadow-[4px_4px_15px_#0003] border border-[#e0e0e0] bg-[#fbfbfb] overflow-hidden text-[#5a5a5a]"
    >
      <div className={`relative m-[20px] text-[14px] ${isChangelog ? 'w-[440px]' : 'w-[340px]'}`}>
        {/* SAVE DIALOG */}
        {dialogName === 'save' && (
          <>
            <div className="text-center font-bold text-[17px] my-[20px] mb-[16px] py-[20px] bg-[#f3f5f7] rounded-[6px]">
              Download
            </div>
            <div className="p-[4px]">
              Lade den aktuellen Inhalt des Grafikfensters und des Editors als JSON - Datei
              herunter.
            </div>
            <div className="flex items-center justify-center w-full my-[16px] py-[10px] px-[14px] bg-[#f3f5f7] rounded-[6px]">
              <img
                src="assets/svgs/download.svg"
                alt="file save"
                referrerPolicy="no-referrer"
                className="mr-[14px] block"
              />
              <div className="w-full">
                <input
                  type="text"
                  value={fileNameSave}
                  onChange={(e) => setFileNameSave(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onSaveJson(fileNameSave, loadCode, loadWorld);
                    }
                  }}
                  placeholder="Schreibe hier..."
                  className="w-full h-[24px] border-0 border-b border-dashed border-[#979797] bg-transparent py-[8px] px-[4px] mb-[4px] focus:outline-none"
                />
                <div className="flex items-center mt-1">
                  <input
                    type="checkbox"
                    id="sb-save-code"
                    checked={loadCode}
                    onChange={(e) => setLoadCode(e.target.checked)}
                    className="custom-checkbox"
                  />
                  <label htmlFor="sb-save-code" className="mx-[4px] text-[10px] cursor-pointer">
                    Code
                  </label>
                  <input
                    type="checkbox"
                    id="sb-save-world"
                    checked={loadWorld}
                    onChange={(e) => setLoadWorld(e.target.checked)}
                    className="custom-checkbox ml-2"
                  />
                  <label htmlFor="sb-save-world" className="mx-[4px] text-[10px] cursor-pointer">
                    World
                  </label>
                </div>
              </div>
            </div>
            <div className="flex">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-[#f3f5f7] rounded-[6px] py-[8px] px-[10px] text-[#5a5a5a] hover:translate-y-[1px] transition-transform"
              >
                Abbruch
              </button>
              <span className="w-[20px] shrink-0" />
              <button
                type="button"
                onClick={() => onSaveJson(fileNameSave, loadCode, loadWorld)}
                className="w-full bg-[#00dfa2] rounded-[6px] py-[8px] px-[10px] text-white font-medium hover:translate-y-[1px] transition-transform"
              >
                Speichern
              </button>
            </div>
          </>
        )}

        {/* OPEN / UPLOAD DIALOG */}
        {dialogName === 'open' && (
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveDropbox(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragLeave={() => setActiveDropbox(false)}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveDropbox(false);
              if (e.dataTransfer.files?.length) {
                onOpenFiles(e.dataTransfer.files);
              }
            }}
          >
            <div className="text-center font-bold text-[17px] my-[20px] mb-[16px] py-[20px] bg-[#f3f5f7] rounded-[6px]">
              Upload
            </div>
            <div
              className={`flex items-center justify-center w-full my-[16px] py-[10px] px-[14px] rounded-[6px] ${
                activeDropbox ? 'bg-[#e5fcf6]' : 'bg-[#f3f5f7]'
              }`}
            >
              <img
                src="assets/svgs/upload.svg"
                alt="file open"
                referrerPolicy="no-referrer"
                className="mr-[14px] block"
              />
              <div className="w-full text-[13px]">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".json,application/json"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      onOpenFiles(e.target.files);
                    }
                  }}
                  className="hidden"
                />
                Datei(en) hineinziehen <span className="italic">oder</span> Öffnen klicken!
              </div>
            </div>
            <div className="flex">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-[#f3f5f7] rounded-[6px] py-[8px] px-[10px] text-[#5a5a5a] hover:translate-y-[1px] transition-transform"
              >
                Abbruch
              </button>
              <span className="w-[20px] shrink-0" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-[#00dfa2] rounded-[6px] py-[8px] px-[10px] text-white font-medium hover:translate-y-[1px] transition-transform"
              >
                Öffnen
              </button>
            </div>
          </div>
        )}

        {/* GRID SIZE DIALOG */}
        {dialogName === 'size' && (
          <>
            <div className="text-center font-bold text-[17px] my-[20px] mb-[16px] py-[20px] bg-[#f3f5f7] rounded-[6px]">
              Weltgröße anpassen
            </div>
            <div className="p-[4px]">
              Welt und Code werden beim Ändern der Größe zurückgesetzt. Die Fenstergröße bestimmt
              die maximalen Maße der App.
            </div>
            <div className="flex items-center justify-center w-full my-[16px] py-[10px] px-[14px] bg-[#f3f5f7] rounded-[6px]">
              <div className="mr-[14px]">
                <img src="assets/svgs/grid.svg" alt="grid size" referrerPolicy="no-referrer" />
              </div>
              <div className="flex flex-col items-start">
                <div className="flex items-center justify-center my-[5px]">
                  <span className="inline-block w-[42px] mr-[5px] text-[13px]">Breite</span>
                  <input
                    type="range"
                    min={8}
                    max={maxCols}
                    step={1}
                    value={rangeCols}
                    onChange={(e) => setRangeCols(Number(e.target.value))}
                    className="custom-range mx-[16px]"
                  />
                  <span className="inline-block w-[24px] text-right tabular-nums">{rangeCols}</span>
                </div>
                <div className="flex items-center justify-center my-[5px]">
                  <span className="inline-block w-[42px] mr-[5px] text-[13px]">Höhe</span>
                  <input
                    type="range"
                    min={1}
                    max={maxRows}
                    step={1}
                    value={rangeRows}
                    onChange={(e) => setRangeRows(Number(e.target.value))}
                    className="custom-range mx-[16px]"
                  />
                  <span className="inline-block w-[24px] text-right tabular-nums">{rangeRows}</span>
                </div>
              </div>
            </div>
            <div className="flex">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-[#f3f5f7] rounded-[6px] py-[8px] px-[10px] text-[#5a5a5a] hover:translate-y-[1px] transition-transform"
              >
                Abbruch
              </button>
              <span className="w-[20px] shrink-0" />
              <button
                type="button"
                onClick={() => onChangeGridSize(rangeCols, rangeRows)}
                className="w-full bg-[#00dfa2] rounded-[6px] py-[8px] px-[10px] text-white font-medium hover:translate-y-[1px] transition-transform"
              >
                Bestätigen
              </button>
            </div>
          </>
        )}

        {/* SCREENSHOT DIALOG */}
        {dialogName === 'screenshot' && (
          <>
            <div className="text-center font-bold text-[17px] my-[20px] mb-[16px] py-[20px] bg-[#f3f5f7] rounded-[6px]">
              Screenshot erstellen
            </div>
            <div className="p-[4px]">
              Speichere einen Screenshot der aktuellen Welt als PNG oder direkt in die
              Zwischenablage. Der Hintergrund wird im Screenshot transparent.
            </div>
            <div className="flex items-center justify-center w-full my-[16px] py-[10px] px-[14px] bg-[#f3f5f7] rounded-[6px]">
              <img
                src="assets/svgs/screenshot.svg"
                alt="screenshot"
                referrerPolicy="no-referrer"
                className="mr-[14px] block"
              />
              <div className="w-full">
                <input
                  type="text"
                  value={screenshotName}
                  onChange={(e) => setScreenshotName(e.target.value)}
                  placeholder="Name für Screenshot eingeben oder..."
                  className="w-full h-[24px] border-0 border-b border-dashed border-[#979797] bg-transparent py-[8px] px-[4px] mb-[6px] focus:outline-none"
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sb-screenshot-clip"
                    checked={screenshotClipboard}
                    onChange={(e) => setScreenshotClipboard(e.target.checked)}
                    className="custom-checkbox"
                  />
                  <label
                    htmlFor="sb-screenshot-clip"
                    className="mx-[6px] text-[10px] cursor-pointer"
                  >
                    ...direkt in Zwischenablage kopieren
                  </label>
                </div>
              </div>
            </div>
            <div className="flex">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-[#f3f5f7] rounded-[6px] py-[8px] px-[10px] text-[#5a5a5a] hover:translate-y-[1px] transition-transform"
              >
                Abbruch
              </button>
              <span className="w-[20px] shrink-0" />
              <button
                type="button"
                onClick={() => onSaveScreenshot(screenshotName || 'spacebug-welt.png', screenshotClipboard)}
                className="w-full bg-[#00dfa2] rounded-[6px] py-[8px] px-[10px] text-white font-medium hover:translate-y-[1px] transition-transform"
              >
                Speichern
              </button>
            </div>
          </>
        )}

        {/* GENERATE TESTCASES DIALOG */}
        {dialogName === 'test' && (
          <>
            <div className="text-center font-bold text-[17px] my-[20px] mb-[16px] py-[20px] bg-[#f3f5f7] rounded-[6px]">
              Testfälle erstellen{' '}
              <sup className="ml-[4px] bg-gradient-to-br from-[#cb218e] to-[#6617cb] rounded-[4px] py-[2px] px-[6px] text-white text-[0.7em] font-light">
                beta
              </sup>
            </div>
            <div className="p-[4px] text-[13px] leading-snug">
              Erstelle verschiedene Welten und schreibe den Code, welcher alle Welten löst. Aus
              diesen Daten wird eine .json - Datei mit den Welten als Testfällen und dem jeweils
              richtigen Endzustand der Welt generiert. Es müssen mindestens zwei Welten angegeben
              werden.
            </div>
            <div className="flex items-center justify-center w-full my-[16px] py-[10px] px-[14px] bg-[#f3f5f7] rounded-[6px]">
              <img
                src="assets/svgs/test.svg"
                alt="run tests"
                referrerPolicy="no-referrer"
                className="mr-[14px] block"
              />
              <div className="w-full">
                <input
                  type="text"
                  value={fileNameSave}
                  onChange={(e) => setFileNameSave(e.target.value)}
                  placeholder="Dateiname hier schreiben ..."
                  className="w-full h-[24px] border-0 border-b border-dashed border-[#979797] bg-transparent py-[8px] px-[4px] mb-[4px] focus:outline-none"
                />
                <div
                  onClick={() => setMoreOptions(!moreOptions)}
                  className="w-full cursor-pointer ml-[4px] py-[4px] text-[12px] font-bold hover:text-[#2d2d2d]"
                >
                  Weitere Optionen
                </div>
              </div>
            </div>
            {moreOptions && (
              <div className="flex items-center justify-center w-full my-[12px] py-[10px] px-[14px] bg-[#f3f5f7] rounded-[6px]">
                <div className="w-full grid grid-cols-[20px_1fr] gap-[10px] text-[12px]">
                  <div>
                    <input
                      type="checkbox"
                      checked={logPlayer}
                      onChange={(e) => setLogPlayer(e.target.checked)}
                      className="custom-checkbox"
                    />
                  </div>
                  <div>Position des Playerobjektes wird in der Lösung gespeichert.</div>
                  <div>
                    <input
                      type="checkbox"
                      checked={dirPlayer}
                      onChange={(e) => setDirPlayer(e.target.checked)}
                      className="custom-checkbox"
                    />
                  </div>
                  <div>
                    Ausrichtung (nach oben, rechts, ...) des Playerobjektes wird zusätzlich in
                    Lösung gespeichert.
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={solidObj}
                      onChange={(e) => setSolidObj(e.target.checked)}
                      className="custom-checkbox"
                    />
                  </div>
                  <div>Position aller Felsen werden in Lösung gespeichert.</div>
                  <div>
                    <input
                      type="checkbox"
                      checked={pickupObj}
                      onChange={(e) => setPickupObj(e.target.checked)}
                      className="custom-checkbox"
                    />
                  </div>
                  <div>Position aller Power-ups wird in Lösung gespeichert.</div>
                </div>
              </div>
            )}
            <div className="flex">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-[#f3f5f7] rounded-[6px] py-[8px] px-[10px] text-[#5a5a5a] hover:translate-y-[1px] transition-transform"
              >
                Abbruch
              </button>
              <span className="w-[20px] shrink-0" />
              <button
                type="button"
                onClick={() =>
                  onGenerateTestCases(fileNameSave, {
                    logPlayer,
                    dirPlayer,
                    solidObj,
                    pickupObj,
                  })
                }
                className="w-full bg-[#00dfa2] rounded-[6px] py-[8px] px-[10px] text-white font-medium hover:translate-y-[1px] transition-transform"
              >
                Speichern
              </button>
            </div>
          </>
        )}

        {/* SHARE LINK DIALOG */}
        {dialogName === 'share' && (
          <>
            <div className="text-center font-bold text-[17px] my-[20px] mb-[16px] py-[20px] bg-[#f3f5f7] rounded-[6px]">
              Link teilen{' '}
              <sup className="ml-[4px] bg-gradient-to-br from-[#cb218e] to-[#6617cb] rounded-[4px] py-[2px] px-[6px] text-white text-[0.7em] font-light">
                beta
              </sup>
            </div>
            <div className="p-[4px] text-[13px] leading-snug">
              Erstelle einen Link, mit dem du alle geladenen Welten des Grafikfensters sowie den
              Code im Editor teilen kannst.{' '}
              <span>
                Ist aktuell eine Datei mit Testfällen geladen, so wird für diese ebenfalls ein Link
                erzeugt.
              </span>
              <em className="block mt-[5px]">
                Hinweis: Da sich diese Funktion noch im beta-Status befindet, sollte die Datei
                immer zusätzlich lokal gespeichert werden.
              </em>
            </div>
            <div className="flex items-center justify-center w-full my-[16px] py-[10px] px-[14px] bg-[#f3f5f7] rounded-[6px]">
              <img
                src="assets/svgs/sharelink.svg"
                alt="share link"
                referrerPolicy="no-referrer"
                className="mr-[14px] block"
              />
              <div className="w-full text-[13px]">
                {shareKeyword ? (
                  <>
                    Kennwort: <strong>{shareKeyword}</strong>
                    <span className="block text-[11px] mt-[4px] break-all">
                      {window.location.origin}{window.location.pathname}?keyword={shareKeyword}
                    </span>
                  </>
                ) : (
                  'Klicke Veröffentlichen, um den Link zu erstellen...'
                )}
              </div>
            </div>
            <div className="flex">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-[#f3f5f7] rounded-[6px] py-[8px] px-[10px] text-[#5a5a5a] hover:translate-y-[1px] transition-transform"
              >
                Schließen
              </button>
              <span className="w-[20px] shrink-0" />
              {shareState === 'default' || shareState === 'pending' ? (
                <button
                  type="button"
                  onClick={() => onShareLink(false)}
                  className="w-full bg-[#00dfa2] rounded-[6px] py-[8px] px-[10px] text-white font-medium hover:translate-y-[1px] transition-transform"
                >
                  Veröffentlichen
                </button>
              ) : shareState === 'success' ? (
                <button
                  type="button"
                  onClick={() => onShareLink(true)}
                  className="w-full bg-[#00dfa2] rounded-[6px] py-[8px] px-[10px] text-white font-medium hover:translate-y-[1px] transition-transform"
                >
                  Link kopieren
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full bg-[#00dfa2] opacity-70 rounded-[6px] py-[8px] px-[10px] text-white font-medium"
                >
                  Link kopiert!
                </button>
              )}
            </div>
          </>
        )}

        {/* OPEN WITH CODE DIALOG */}
        {dialogName === 'code' && (
          <>
            <div className="text-center font-bold text-[17px] my-[20px] mb-[16px] py-[20px] bg-[#f3f5f7] rounded-[6px]">
              Aufgabe öffnen{' '}
              <sup className="ml-[4px] bg-gradient-to-br from-[#cb218e] to-[#6617cb] rounded-[4px] py-[2px] px-[6px] text-white text-[0.7em] font-light">
                beta
              </sup>
            </div>
            <div className="p-[4px] text-[13px] leading-snug">
              Werden Links unter <em>Einstellungen &gt; Link teilen</em> erstellt, so kann das dort
              generierte Kennwort genutzt werden, um die Aufgabe direkt vom Server zu laden.
            </div>
            <div className="flex items-center justify-center w-full my-[16px] py-[10px] px-[14px] bg-[#f3f5f7] rounded-[6px]">
              <div className="m-auto flex items-center justify-center">
                Kennwort eingeben:{' '}
                <input
                  type="text"
                  maxLength={4}
                  size={4}
                  value={openCodeVal}
                  onChange={(e) => {
                    const val = e.target.value;
                    setOpenCodeVal(val);
                    if (val.length === 4) {
                      onOpenWithCode(val);
                    }
                  }}
                  className="text-center h-[30px] m-[5px] px-[5px] border border-[#979797] bg-[#f3f5f7] rounded-[8px] font-bold text-[18px] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-[#f3f5f7] rounded-[6px] py-[8px] px-[10px] text-[#5a5a5a] hover:translate-y-[1px] transition-transform"
              >
                Abbruch
              </button>
            </div>
          </>
        )}

        {/* PYTHON INPUT() DIALOG */}
        {dialogName === 'input' && (
          <>
            <div className="text-center font-bold text-[17px] my-[20px] mb-[16px] py-[20px] bg-[#f3f5f7] rounded-[6px]">
              Eingabe
            </div>
            <div className="p-[4px]">{inputArg}</div>
            <div className="flex items-center justify-center w-full my-[16px] py-[10px] px-[14px] bg-[#f3f5f7] rounded-[6px]">
              <img
                src="assets/svgs/input.svg"
                alt="input"
                referrerPolicy="no-referrer"
                className="mr-[14px] block"
              />
              <div className="w-full">
                <input
                  ref={promptInputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onSubmitInput(inputValue);
                    }
                  }}
                  className="w-full h-[24px] border-0 border-b border-dashed border-[#979797] bg-transparent py-[8px] px-[4px] mb-[4px] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-[#f3f5f7] rounded-[6px] py-[8px] px-[10px] text-[#5a5a5a] hover:translate-y-[1px] transition-transform"
              >
                Abbruch
              </button>
              <span className="w-[20px] shrink-0" />
              <button
                type="button"
                onClick={() => onSubmitInput(inputValue)}
                className="w-full bg-[#00dfa2] rounded-[6px] py-[8px] px-[10px] text-white font-medium hover:translate-y-[1px] transition-transform"
              >
                Bestätigen
              </button>
            </div>
          </>
        )}

        {/* CHANGELOG DIALOG */}
        {dialogName === 'changelog' && (
          <>
            <div className="text-center font-bold text-[17px] my-[20px] mb-[16px] py-[20px] bg-[#f3f5f7] rounded-[6px]">
              Changelog
            </div>
            <div className="p-[4px] text-[13px] leading-snug">
              Bug-Reports, Feedback und Feature - Requests einfach per Mail senden. Bei
              Fehlermeldungen bitte JSON-Datei mit Welt und Code sowie einer kurzen Beschreibung
              des Fehlers schicken.
            </div>
            <div className="rounded-[6px] my-[10px] h-[150px] overflow-y-auto thin-scrollbar space-y-2">
              {CHANGELOG.map((entry) => (
                <div key={entry.version} className="bg-[#f3f5f7] rounded-[6px] p-[10px] text-[13px]">
                  <strong>{entry.date}</strong> (v{entry.version})
                  {entry.bugfixes.length > 0 && (
                    <>
                      <i className="block my-[6px]">-- Bugfixes --</i>
                      <ol className="list-decimal pl-[20px] pb-[6px] m-0 leading-[1.4]">
                        {entry.bugfixes.map((bf, i) => (
                          <li key={i}>{bf}</li>
                        ))}
                      </ol>
                    </>
                  )}
                  <i className="block my-[6px]">-- Updates --</i>
                  <ol className="list-decimal pl-[20px] pb-[6px] m-0 leading-[1.4]">
                    {entry.changes.map((ch, i) => (
                      <li key={i}>{ch}</li>
                    ))}
                  </ol>
                  <i className="block my-[6px]">-- In Planung --</i>
                  <ol className="list-decimal pl-[20px] pb-[6px] m-0 leading-[1.4]">
                    {entry.future.map((ft, i) => (
                      <li key={i}>{ft}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
            {emailAddress && (
              <div className="text-[12px] py-[8px] px-[14px] mb-[12px] bg-[#e5fcf6] rounded-[6px] text-center">
                Nutzen Sie <strong>{emailAddress}</strong> für Ihre Anfrage.
              </div>
            )}
            <div className="flex">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-[#f3f5f7] rounded-[6px] py-[8px] px-[10px] text-[#5a5a5a] hover:translate-y-[1px] transition-transform"
              >
                Schließen
              </button>
              <span className="w-[20px] shrink-0" />
              <button
                type="button"
                onClick={handleSendEmail}
                className="w-full bg-[#00dfa2] rounded-[6px] py-[8px] px-[10px] text-white font-medium hover:translate-y-[1px] transition-transform"
              >
                E-Mail senden
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
