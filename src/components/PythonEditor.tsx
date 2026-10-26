import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { EditorState, StateField, StateEffect, Compartment } from '@codemirror/state';
import {
  EditorView,
  Decoration,
  DecorationSet,
  lineNumbers,
  keymap,
  highlightSpecialChars,
  drawSelection,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { python, globalCompletion, localCompletionSource } from '@codemirror/lang-python';
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  indentOnInput,
  bracketMatching,
} from '@codemirror/language';
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  CompletionContext,
} from '@codemirror/autocomplete';
import { MESSAGES_DE, restoreCopiedPythonIndentation } from '../data/spacebugConfig';

export interface PythonEditorHandle {
  getCode: () => string;
  setCode: (code: string) => void;
  highlightLine: (lineno: number) => void;
  resetHighlightLine: () => void;
  setReadOnly: (readOnly: boolean) => void;
  getMaxLineNumbers: () => number;
}

interface PythonEditorProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  onEditorClick?: () => void;
  onMouseDown?: () => void;
}

const setHighlightLineEffect = StateEffect.define<number | undefined>();

const highlightDecoration = Decoration.line({
  attributes: {
    style: 'background-color: #ffe5ef; border-radius: 8px;',
  },
});

const highlightLineField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(deco, tr) {
    deco = deco.map(tr.changes);
    for (const e of tr.effects) {
      if (e.is(setHighlightLineEffect)) {
        deco = Decoration.none;
        if (e.value !== undefined) {
          deco = deco.update({ add: [highlightDecoration.range(e.value)] });
        }
      }
    }
    return deco;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const spacebugCompletions = [
  { label: 'move()', type: 'function', detail: MESSAGES_DE.move },
  { label: 'turnLeft()', type: 'function', detail: MESSAGES_DE.turnLeft },
  { label: 'turnRight()', type: 'function', detail: MESSAGES_DE.turnRight },
  { label: 'putPow()', type: 'function', detail: 'Power-up ablegen' },
  { label: 'removePow()', type: 'function', detail: 'Power-up aufsammeln' },
  { label: 'onPow()', type: 'function', detail: 'Power-up auf aktuellem Feld?' },
  { label: 'rockFront()', type: 'function', detail: 'Felsen direkt vor Spacebug?' },
  { label: 'rockLeft()', type: 'function', detail: MESSAGES_DE.rockLeft },
  { label: 'rockRight()', type: 'function', detail: MESSAGES_DE.rockRight },
  { label: 'showText()', type: 'function', detail: 'Text ausgeben' },
  { label: 'getPosition()', type: 'function', detail: 'Aktuelle Position [x, y]' },
  { label: 'onLog()', type: 'function', detail: MESSAGES_DE.onLog },
  { label: 'removeLog()', type: 'function', detail: MESSAGES_DE.removeLog },
  { label: 'putLog()', type: 'function', detail: MESSAGES_DE.putLog },
  { label: 'argo.move()', type: 'method', detail: MESSAGES_DE.move },
  { label: 'argo.turnLeft()', type: 'method', detail: MESSAGES_DE.turnLeft },
  { label: 'argo.turnRight()', type: 'method', detail: MESSAGES_DE.turnRight },
  { label: 'argo.putPow()', type: 'method', detail: 'Power-up ablegen' },
  { label: 'argo.removePow()', type: 'method', detail: 'Power-up aufsammeln' },
  { label: 'argo.onPow()', type: 'method', detail: 'Power-up auf aktuellem Feld?' },
  { label: 'argo.rockFront()', type: 'method', detail: 'Felsen direkt vor Spacebug?' },
  { label: 'argo.rockLeft()', type: 'method', detail: MESSAGES_DE.rockLeft },
  { label: 'argo.rockRight()', type: 'method', detail: MESSAGES_DE.rockRight },
];

function spacebugCompletionSource(context: CompletionContext) {
  const word = context.matchBefore(/[\w.]*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;
  return {
    from: word.from,
    options: spacebugCompletions,
  };
}

const spacebugLightTheme = EditorView.theme({
  '&': {
    height: '100%',
    color: 'var(--primary-font-color)',
    backgroundColor: 'transparent',
    borderRadius: '14px !important',
    fontSize: '14px',
  },
  '.cm-tooltip-autocomplete': {
    borderRadius: '4px',
    overflow: 'hidden',
  },
  '.cm-tooltip': {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
  },
  '.cm-scroller': {
    padding: '10px',
  },
  '.cm-editor': {
    fontSize: '14px',
  },
  '.cm-lineNumbers': {
    borderRadius: '14px 0 0 14px',
  },
  '.cm-gutterElement': {
    overflow: 'hidden',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-gutters': {
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '14px 0 0 14px',
  },
});

export const PythonEditor = forwardRef<PythonEditorHandle, PythonEditorProps>(
  ({ initialCode = '', onCodeChange, onEditorClick, onMouseDown }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const readOnlyCompartmentRef = useRef(new Compartment());
    const fontSizeRef = useRef(14);
    const onCodeChangeRef = useRef(onCodeChange);
    onCodeChangeRef.current = onCodeChange;

    useEffect(() => {
      if (!containerRef.current) return;

      const state = EditorState.create({
        doc: initialCode,
        extensions: [
          lineNumbers(),
          highlightSpecialChars(),
          history(),
          drawSelection(),
          indentOnInput(),
          syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
          bracketMatching(),
          closeBrackets(),
          autocompletion({
            override: [spacebugCompletionSource, localCompletionSource, globalCompletion],
          }),
          python(),
          highlightLineField,
          spacebugLightTheme,
          readOnlyCompartmentRef.current.of(EditorState.readOnly.of(false)),
          EditorView.clipboardInputFilter.of((pastedText) =>
            restoreCopiedPythonIndentation(pastedText)
          ),
          keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged && onCodeChangeRef.current) {
              onCodeChangeRef.current(update.state.doc.toString());
            }
          }),
        ],
      });

      const view = new EditorView({
        state,
        parent: containerRef.current,
      });

      viewRef.current = view;

      return () => {
        view.destroy();
        viewRef.current = null;
      };
    }, []);

    useImperativeHandle(ref, () => ({
      getCode: () =>
        restoreCopiedPythonIndentation(viewRef.current?.state.doc.toString() ?? ''),
      setCode: (code: string) => {
        const view = viewRef.current;
        if (!view) return;
        const normalized = restoreCopiedPythonIndentation(code);
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: normalized },
        });
      },
      highlightLine: (lineno: number) => {
        const view = viewRef.current;
        if (!view || lineno <= 0 || lineno > view.state.doc.lines) return;
        const pos = view.state.doc.line(lineno).from;
        view.dispatch({
          effects: [
            setHighlightLineEffect.of(pos),
            EditorView.scrollIntoView(pos, { yMargin: 40 }),
          ],
        });
      },
      resetHighlightLine: () => {
        const view = viewRef.current;
        if (!view) return;
        view.dispatch({
          effects: setHighlightLineEffect.of(undefined),
        });
      },
      setReadOnly: (readOnly: boolean) => {
        const view = viewRef.current;
        if (!view) return;
        view.dispatch({
          effects: readOnlyCompartmentRef.current.reconfigure(EditorState.readOnly.of(readOnly)),
        });
      },
      getMaxLineNumbers: () => viewRef.current?.state.doc.lines ?? 1,
    }));

    const handleWheel = (e: React.WheelEvent) => {
      if (e.ctrlKey && viewRef.current) {
        e.preventDefault();
        if (e.deltaY > 0) {
          fontSizeRef.current = Math.max(14, fontSizeRef.current - 1);
        } else if (e.deltaY < 0) {
          fontSizeRef.current = Math.min(50, fontSizeRef.current + 1);
        }
        viewRef.current.dom.style.fontSize = `${fontSizeRef.current}px`;
      }
    };

    return (
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={onMouseDown}
        onClick={onEditorClick}
        className="absolute inset-0 w-full h-full"
      />
    );
  }
);
