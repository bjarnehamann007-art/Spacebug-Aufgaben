import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  buildPlayerAnimations,
  SPACEBUG_SPRITE_CONFIG,
  PB_ALL,
  MESSAGES_DE,
  TASKS,
  TaskItem,
  downloadAllSolutionsPdf,
} from './data/spacebugConfig';
import { EMBEDDED_TASK_WORLDS } from './data/embeddedWorlds';
import { TaskSidebar } from './components/TaskSidebar';
import { PythonEditor, PythonEditorHandle } from './components/PythonEditor';
import {
  StartButtonIcon,
  DebugButtonIcon,
  ResetButtonIcon,
  DeleteButtonIcon,
  SpeedButtonIcon,
} from './components/ControlIcons';
import { SpacebugDialog, DialogName } from './components/SpacebugDialog';

declare global {
  interface Window {
    Sk: any;
  }
}

export interface GridObjectState {
  uuid: symbol;
  id: number; // 4 = player, 5 = rock/asteroid, 6 = powerup/log
  pos: { row: number; col: number };
  dir: [number, number];
  solid?: boolean;
  shift?: boolean;
  lift?: boolean;
}

export interface SerializedGridObject {
  objectStoreState: {
    id: number;
    pos: { row: number; col: number };
    dir: [number, number];
    solid?: boolean;
    shift?: boolean;
    lift?: boolean;
  };
}

export interface WorldEntry {
  canvasConfig: { rows: number; cols: number; grid: number };
  world: SerializedGridObject[];
  userCode: string;
  result?: string;
  grader?: { check: number; base?: number; dir?: boolean };
}

export interface VariableEntry {
  scope: 'global' | 'local';
  name: string;
  value: string;
  type: string;
  show: boolean;
  lineT: boolean;
}

export interface ToastMessage {
  status: boolean;
  type?: 'Stop' | 'Error' | 'Success' | 'Message' | 'Warning' | 'Output';
  value: string;
}

interface AnimationItem {
  name: string;
  dir: [number, number];
  loop: boolean;
  turnDelta?: number;
  action?: 'placeObject' | 'removeObject' | 'showText' | 'shiftObject';
  actionObject?: GridObjectState;
  text?: string;
}

const GRID_SIZE = 40;
const DIRS: [number, number][] = [
  [1, 0],   // 0: right
  [0, -1],  // 1: up
  [-1, 0],  // 2: left
  [0, 1],   // 3: down
];

function dirToAngleRad(dir: [number, number]): number {
  const key = dir.toString();
  if (key === '1,0') return 0;
  if (key === '0,-1') return -Math.PI / 2;
  if (key === '-1,0') return Math.PI;
  if (key === '0,1') return Math.PI / 2;
  return 0;
}

function dirToWalkName(dir: [number, number]): string {
  const key = dir.toString();
  if (key === '1,0') return 'walk-right';
  if (key === '0,-1') return 'walk-up';
  if (key === '-1,0') return 'walk-left';
  if (key === '0,1') return 'walk-down';
  return 'walk-right';
}

function walkToIdleName(animName: string): string {
  const idx = animName.indexOf('-');
  return `idle-${idx >= 0 ? animName.slice(idx + 1) : 'right'}`.toLowerCase();
}

function getNextCell(
  rows: number,
  cols: number,
  pos: { row: number; col: number },
  dir: [number, number]
): [number, number] {
  let r = pos.row + dir[1];
  let c = pos.col + dir[0];
  if (c > cols - 1) c = 0;
  else if (c < 0) c = cols - 1;
  else if (r > rows - 1) r = 0;
  else if (r < 0) r = rows - 1;
  return [r, c];
}

export default function App() {
  // Canvas configuration
  const [canvasConfig, setCanvasConfig] = useState({ rows: 12, cols: 12, grid: GRID_SIZE });
  const [selectedToolId, setSelectedToolId] = useState<number | undefined>(undefined);
  const [animationActive, setAnimationActive] = useState(false);
  const [debuggerOn, setDebuggerOn] = useState(false);
  const [showPlayMenu, setShowPlayMenu] = useState(true);
  const [speedIndex, setSpeedIndex] = useState(0); // 0 -> speed 1 (slow), 1 -> speed 2 (medium), 2 -> speed 4 (fast)
  const [showSidebarMenu, setShowSidebarMenu] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleText, setConsoleText] = useState('');
  const [debugVariables, setDebugVariables] = useState<VariableEntry[]>([]);
  const [toast, setToast] = useState<ToastMessage>({ status: false, value: '' });

  // Multi-world / testcase state
  const [worldArray, setWorldArray] = useState<WorldEntry[]>([]);
  const [worldArrayIndex, setWorldArrayIndex] = useState(0);
  const [testcasesLoaded, setTestcasesLoaded] = useState(false);
  const [testResults, setTestResults] = useState<boolean[] | null>(null);
  const [codeValidationRunning, setCodeValidationRunning] = useState(false);
  const [syncCode, setSyncCode] = useState(true);

  // Dialogs & Active Task state
  const [activeDialog, setActiveDialog] = useState<DialogName>(undefined);
  const [inputDialogArg, setInputDialogArg] = useState<string>('');
  const [dragOverlayActive, setDragOverlayActive] = useState(false);
  const [showImpressum, setShowImpressum] = useState(false);
  const [shareState, setShareState] = useState<'default' | 'pending' | 'success' | 'copied'>('default');
  const [shareKeyword, setShareKeyword] = useState<string | undefined>(undefined);
  const [activeTask, setActiveTask] = useState<TaskItem>(TASKS[0]);

  // Refs for mutable simulation state
  const editorRef = useRef<PythonEditorHandle>(null);
  const gameCanvasRef = useRef<HTMLCanvasElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const sidebarFileInputRef = useRef<HTMLInputElement>(null);

  const gridRef = useRef<(0 | GridObjectState | [GridObjectState, GridObjectState])[][]>([]);
  const savedWorldBeforeRunRef = useRef<SerializedGridObject[]>([]);
  const playerStateRef = useRef<GridObjectState | null>(null);
  const playerPixelRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const playerAngleRef = useRef<number>(0);
  const playerAnimRef = useRef<{
    currentAnim: string;
    frameIdx: number;
    nextId: number;
    queue: AnimationItem[];
    active: boolean;
    rafId: number;
    speed: number;
    onCycleEnd?: () => void;
  }>({
    currentAnim: 'idle-right',
    frameIdx: 0,
    nextId: 0,
    queue: [],
    active: false,
    rafId: 0,
    speed: 1,
  });

  const imagesRef = useRef<{
    player: HTMLImageElement | null;
    rock: HTMLImageElement | null;
    powerup: HTMLImageElement | null;
    loaded: boolean;
  }>({ player: null, rock: null, powerup: null, loaded: false });

  const playerAnimationsRef = useRef<Record<string, { frames: [number, number][] }>>(
    buildPlayerAnimations()
  );

  const inputResolverRef = useRef<((val: string) => void) | null>(null);
  const debugSuspensionRef = useRef<any>(null);
  const debugPrevLineRef = useRef<number | undefined>(undefined);
  const debugVarsRef = useRef<VariableEntry[]>([]);
  const toastTimeoutRef = useRef<number | undefined>(undefined);
  const runCancelledRef = useRef<boolean>(false);
  const commandStepCountRef = useRef<number>(0);
  const initialTaskLoadedRef = useRef<boolean>(false);

  const showToast = useCallback(
    (type: ToastMessage['type'], value: string) => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
      setToast({ status: true, type, value });
      const duration = type === 'Error' || type === 'Stop' || type === 'Warning' ? 7500 : 4000;
      toastTimeoutRef.current = window.setTimeout(() => {
        setToast({ status: false, type: undefined, value: '' });
      }, duration);
    },
    []
  );

  const clearToast = () => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToast({ status: false, type: undefined, value: '' });
  };

  // Serialize current grid
  const serializeGrid = useCallback((): SerializedGridObject[] => {
    const flat: GridObjectState[] = [];
    for (const row of gridRef.current) {
      for (const cell of row) {
        if (cell !== 0) {
          if (Array.isArray(cell)) {
            flat.push(cell[0], cell[1]);
          } else {
            flat.push(cell);
          }
        }
      }
    }
    return flat.map((obj) => ({
      objectStoreState: {
        id: obj.id,
        pos: { row: obj.pos.row, col: obj.pos.col },
        dir: [...obj.dir] as [number, number],
        solid: obj.solid,
        shift: obj.shift,
        lift: obj.lift,
      },
    }));
  }, []);

  // Render canvas
  const renderWorld = useCallback(() => {
    const canvas = gameCanvasRef.current;
    if (!canvas || !imagesRef.current.loaded) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw rocks (5) and powerups (6) first
    for (const row of gridRef.current) {
      for (const cell of row) {
        if (cell === 0) continue;
        const items = Array.isArray(cell) ? cell : [cell];
        for (const item of items) {
          if (item.id === 5 && imagesRef.current.rock) {
            const cfg = SPACEBUG_SPRITE_CONFIG.collisionObj;
            ctx.drawImage(
              imagesRef.current.rock,
              0,
              0,
              cfg.width,
              cfg.height,
              item.pos.col * GRID_SIZE + cfg.xOffset,
              item.pos.row * GRID_SIZE + cfg.yOffset,
              cfg.width * cfg.scale,
              cfg.height * cfg.scale
            );
          } else if (item.id === 6 && imagesRef.current.powerup) {
            const cfg = SPACEBUG_SPRITE_CONFIG.collectableObj;
            ctx.drawImage(
              imagesRef.current.powerup,
              0,
              0,
              cfg.width,
              cfg.height,
              item.pos.col * GRID_SIZE + cfg.xOffset,
              item.pos.row * GRID_SIZE + cfg.yOffset,
              cfg.width * cfg.scale,
              cfg.height * cfg.scale
            );
          }
        }
      }
    }

    // Draw player (4) on top with clean centered rotation
    if (playerStateRef.current && imagesRef.current.player) {
      const cfg = SPACEBUG_SPRITE_CONFIG.player;
      const drawW = cfg.width * cfg.scale;
      const drawH = cfg.height * cfg.scale;
      const centerX = playerPixelRef.current.x + GRID_SIZE / 2;
      const centerY = playerPixelRef.current.y + GRID_SIZE / 2;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(playerAngleRef.current);
      // Frame (1, 4) in spacebug.png is idle-right_000.png (facing right)
      ctx.drawImage(
        imagesRef.current.player,
        1 * cfg.width,
        4 * cfg.height,
        cfg.width,
        cfg.height,
        -drawW / 2,
        -drawH / 2,
        drawW,
        drawH
      );
      ctx.restore();
    }

    ctx.restore();
  }, []);

  // Draw white grid lines on gridCanvas
  const drawGridLines = useCallback((rows: number, cols: number, grid: number) => {
    const gridCanvas = gridCanvasRef.current;
    if (!gridCanvas) return;
    const width = cols * grid + 1;
    const height = rows * grid + 1;
    gridCanvas.width = width;
    gridCanvas.height = height;
    const ctx = gridCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(0.5, 0.5);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let r = 1; r < rows + 1; r++) {
      ctx.moveTo(0, grid * r);
      ctx.lineTo(grid * cols, grid * r);
    }
    for (let c = 1; c < cols; c++) {
      ctx.moveTo(grid * c, 0);
      ctx.lineTo(grid * c, grid * (rows + 1) + 1);
    }
    ctx.stroke();
    ctx.restore();
  }, []);

  // Create empty grid
  const createEmptyGrid = useCallback((rows: number, cols: number) => {
    gridRef.current = Array.from({ length: rows }, () => Array(cols).fill(0));
    playerStateRef.current = null;
    cancelAnimationFrame(playerAnimRef.current.rafId);
    playerAnimRef.current.queue = [];
    playerAnimRef.current.active = false;
  }, []);

  // Place object into gridRef
  const toGrid = useCallback((obj: GridObjectState) => {
    const { row, col } = obj.pos;
    if (!gridRef.current[row] || col < 0 || col >= gridRef.current[row].length) return;
    const current = gridRef.current[row][col];
    if (current === 0) {
      gridRef.current[row][col] = obj;
    } else if (!Array.isArray(current)) {
      if (current.id === 4 && obj.id === 6) {
        gridRef.current[row][col] = [obj, current];
      } else if (current.id === 6 && obj.id === 4) {
        gridRef.current[row][col] = [current, obj];
      }
    }
  }, []);

  const syncPlayerNextId = (dir: [number, number]) => {
    const str = dir.toString();
    if (str === '1,0') playerAnimRef.current.nextId = 0;
    else if (str === '0,-1') playerAnimRef.current.nextId = 1;
    else if (str === '-1,0') playerAnimRef.current.nextId = 2;
    else if (str === '0,1') playerAnimRef.current.nextId = 3;
  };

  // Fill grid from serialized world array
  const fillGrid = useCallback(
    (serialized: SerializedGridObject[], rows = canvasConfig.rows, cols = canvasConfig.cols) => {
      createEmptyGrid(rows, cols);
      for (const item of serialized) {
        const st = item.objectStoreState;
        if (st.pos.row >= rows || st.pos.col >= cols) continue;
        const obj: GridObjectState = {
          uuid: Symbol(),
          id: st.id,
          pos: { row: st.pos.row, col: st.pos.col },
          dir: [...st.dir] as [number, number],
          solid: st.solid ?? st.id === 5,
          shift: st.shift ?? false,
          lift: st.lift ?? st.id === 6,
        };
        toGrid(obj);
        if (obj.id === 4) {
          playerStateRef.current = obj;
          playerPixelRef.current = {
            x: obj.pos.col * GRID_SIZE,
            y: obj.pos.row * GRID_SIZE,
          };
          playerAngleRef.current = dirToAngleRad(obj.dir);
          syncPlayerNextId(obj.dir);
          playerAnimRef.current.currentAnim = walkToIdleName(dirToWalkName(obj.dir));
          playerAnimRef.current.frameIdx = 0;
        }
      }
      savedWorldBeforeRunRef.current = JSON.parse(JSON.stringify(serialized));
      renderWorld();
    },
    [canvasConfig.cols, canvasConfig.rows, createEmptyGrid, renderWorld, toGrid]
  );

  // Preload original Spacebug sprite images on mount and load initial task world
  useEffect(() => {
    const pImg = new Image();
    const rImg = new Image();
    const powImg = new Image();
    let count = 0;
    const onLoad = () => {
      count += 1;
      if (count === 3) {
        imagesRef.current = { player: pImg, rock: rImg, powerup: powImg, loaded: true };
        renderWorld();
        if (!initialTaskLoadedRef.current && TASKS.length > 0) {
          initialTaskLoadedRef.current = true;
          const urlKey = TASKS[0].worldJsonUrl;
          const embedded =
            EMBEDDED_TASK_WORLDS[urlKey] ||
            EMBEDDED_TASK_WORLDS[`/${urlKey.replace(/^\.?\//, '')}`];
          if (embedded) {
            const nextRows = embedded.canvasConfig?.rows || 12;
            const nextCols = embedded.canvasConfig?.cols || 12;
            setCanvasConfig({ rows: nextRows, cols: nextCols, grid: GRID_SIZE });
            if (embedded.world) {
              fillGrid(embedded.world, nextRows, nextCols);
              savedWorldBeforeRunRef.current = JSON.parse(JSON.stringify(embedded.world));
            }
          } else {
            fetch(TASKS[0].worldJsonUrl)
              .then((res) => res.json())
              .then((data) => {
                const nextRows = data.canvasConfig?.rows || 12;
                const nextCols = data.canvasConfig?.cols || 12;
                setCanvasConfig({ rows: nextRows, cols: nextCols, grid: GRID_SIZE });
                if (data.world) {
                  fillGrid(data.world, nextRows, nextCols);
                  savedWorldBeforeRunRef.current = JSON.parse(JSON.stringify(data.world));
                }
              })
              .catch(() => {
                // ignore initial load error
              });
          }
        }
      }
    };
    pImg.onload = onLoad;
    rImg.onload = onLoad;
    powImg.onload = onLoad;
    pImg.src = SPACEBUG_SPRITE_CONFIG.player.src;
    rImg.src = SPACEBUG_SPRITE_CONFIG.collisionObj.src;
    powImg.src = SPACEBUG_SPRITE_CONFIG.collectableObj.src;

    createEmptyGrid(12, 12);
  }, [createEmptyGrid, fillGrid, renderWorld]);

  // Adjust canvas resolution and grid when canvasConfig changes
  useEffect(() => {
    const canvas = gameCanvasRef.current;
    if (!canvas) return;
    const width = canvasConfig.cols * canvasConfig.grid + 1;
    const height = canvasConfig.rows * canvasConfig.grid + 1;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    drawGridLines(canvasConfig.rows, canvasConfig.cols, canvasConfig.grid);
    renderWorld();
  }, [canvasConfig, drawGridLines, renderWorld]);

  // Animation queue processor: executes each animation item cleanly and at a calm, visible speed
  const runAnimationStep = useCallback(
    (item: AnimationItem): Promise<AnimationItem | undefined> => {
      return new Promise((resolve) => {
        let startTime: number | undefined;
        let actionStartTime: number | undefined;
        let remainingSteps = GRID_SIZE;
        const startAngle = playerAngleRef.current;
        playerAnimRef.current.currentAnim = item.name;
        playerAnimRef.current.frameIdx = 0;

        const maxFrame =
          (playerAnimationsRef.current[item.name]?.frames.length ?? 1) - 1;

        const step = (timestamp: number) => {
          if (startTime === undefined) startTime = timestamp;
          if (actionStartTime === undefined) actionStartTime = timestamp;
          const elapsed = timestamp - startTime;
          const speed = playerAnimRef.current.speed;

          if (item.action) {
            const actionDuration = Math.max(120, Math.round(280 / speed));
            if (timestamp - actionStartTime === 0) {
              if (item.action === 'showText') {
                showToast('Output', item.text || '');
                playerAnimRef.current.frameIdx = 0;
              }
              renderWorld();
            }
            if (timestamp - actionStartTime < actionDuration) {
              playerAnimRef.current.rafId = requestAnimationFrame(step);
              return;
            }
            if (playerAnimRef.current.queue.length === 0) {
              playerAnimRef.current.currentAnim = walkToIdleName(item.name);
            }
            const next = playerAnimRef.current.queue.shift();
            renderWorld();
            resolve(next);
            return;
          }

          // Smooth 60fps rotation animation (turnLeft / turnRight)
          if (item.turnDelta !== undefined) {
            const turnDuration = Math.max(130, Math.round(300 / speed));
            const totalElapsed = timestamp - actionStartTime;
            const progress = Math.min(1, totalElapsed / turnDuration);
            // Smooth cubic ease-in-out
            const eased =
              progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            playerAngleRef.current = startAngle + item.turnDelta * eased;
            renderWorld();

            if (progress < 1) {
              playerAnimRef.current.rafId = requestAnimationFrame(step);
              return;
            }

            playerAngleRef.current = startAngle + item.turnDelta;
            if (playerAnimRef.current.queue.length === 0) {
              playerAnimRef.current.currentAnim = walkToIdleName(item.name);
            }
            const next = playerAnimRef.current.queue.shift();
            renderWorld();
            resolve(next);
            return;
          }

          if (remainingSteps > 0) {
            const [dx, dy] = item.dir;
            playerPixelRef.current.x += dx * speed;
            playerPixelRef.current.y += dy * speed;

            const cols = canvasConfig.cols;
            const rows = canvasConfig.rows;

            if (playerPixelRef.current.x > (cols - 0.5) * GRID_SIZE) {
              playerPixelRef.current.x = -GRID_SIZE / 2;
            } else if (playerPixelRef.current.x < -GRID_SIZE / 2) {
              playerPixelRef.current.x = (cols - 0.5) * GRID_SIZE;
            } else if (playerPixelRef.current.y > (rows - 0.5) * GRID_SIZE) {
              playerPixelRef.current.y = -GRID_SIZE / 2;
            } else if (playerPixelRef.current.y < -GRID_SIZE / 2) {
              playerPixelRef.current.y = (rows - 0.5) * GRID_SIZE;
            } else if (item.loop) {
              remainingSteps = Math.max(0, remainingSteps - speed);
            } else {
              if (playerAnimRef.current.frameIdx >= maxFrame) {
                remainingSteps = 0;
              }
            }
          } else {
            // Snap cleanly to current logical grid cell at the end of each step
            if (playerStateRef.current) {
              playerPixelRef.current = {
                x: playerStateRef.current.pos.col * GRID_SIZE,
                y: playerStateRef.current.pos.row * GRID_SIZE,
              };
            }
            if (playerAnimRef.current.queue.length === 0) {
              playerAnimRef.current.currentAnim = walkToIdleName(item.name);
            }
            const next = playerAnimRef.current.queue.shift();
            renderWorld();
            resolve(next);
            return;
          }

          const frameDelay = Math.max(16, Math.round(32 / speed));
          if (elapsed >= frameDelay && !item.action) {
            if (
              playerAnimRef.current.frameIdx < maxFrame ||
              item.name.includes('walk')
            ) {
              playerAnimRef.current.frameIdx += 1;
            }
            startTime = timestamp;
          }

          renderWorld();
          playerAnimRef.current.rafId = requestAnimationFrame(step);
        };

        playerAnimRef.current.rafId = requestAnimationFrame(step);
      });
    },
    [canvasConfig.cols, canvasConfig.rows, renderWorld, showToast]
  );

  const requestPlayerAnimation = useCallback(
    (item: AnimationItem) => {
      if (!playerAnimRef.current.active) {
        playerAnimRef.current.active = true;
        const processNext = (curr: AnimationItem | undefined) => {
          if (!curr) {
            cancelAnimationFrame(playerAnimRef.current.rafId);
            playerAnimRef.current.active = false;
            playerAnimRef.current.frameIdx = 0;
            if (playerStateRef.current) {
              playerPixelRef.current = {
                x: playerStateRef.current.pos.col * GRID_SIZE,
                y: playerStateRef.current.pos.row * GRID_SIZE,
              };
              playerAngleRef.current = dirToAngleRad(playerStateRef.current.dir);
            }
            renderWorld();
            if (playerAnimRef.current.onCycleEnd) {
              playerAnimRef.current.onCycleEnd();
            }
            return;
          }
          runAnimationStep(curr).then((nextItem) => {
            cancelAnimationFrame(playerAnimRef.current.rafId);
            playerAnimRef.current.frameIdx = 0;
            processNext(nextItem);
          });
        };
        processNext(item);
      } else {
        playerAnimRef.current.queue.push(item);
      }
    },
    [renderWorld, runAnimationStep]
  );

  // Rotate player left (used both by Python turnLeft() and clicking player icon)
  const playerTurnLeft = useCallback(
    (animate = true) => {
      const p = playerStateRef.current;
      if (!p) return;
      syncPlayerNextId(p.dir);
      playerAnimRef.current.nextId =
        playerAnimRef.current.nextId < 3 ? playerAnimRef.current.nextId + 1 : 0;
      const fromDir = dirToWalkName(p.dir).slice(5);
      p.dir = [...DIRS[playerAnimRef.current.nextId]] as [number, number];
      const toDir = dirToWalkName(p.dir).slice(5);
      if (animate) {
        requestPlayerAnimation({
          name: `${fromDir}-${toDir}`,
          dir: [0, 0],
          loop: false,
          turnDelta: -Math.PI / 2,
        });
      } else {
        playerAngleRef.current = dirToAngleRad(p.dir);
      }
    },
    [requestPlayerAnimation]
  );

  const playerTurnRight = useCallback(
    (animate = true) => {
      const p = playerStateRef.current;
      if (!p) return;
      syncPlayerNextId(p.dir);
      playerAnimRef.current.nextId =
        playerAnimRef.current.nextId > 0 ? playerAnimRef.current.nextId - 1 : 3;
      const fromDir = dirToWalkName(p.dir).slice(5);
      p.dir = [...DIRS[playerAnimRef.current.nextId]] as [number, number];
      const toDir = dirToWalkName(p.dir).slice(5);
      if (animate) {
        requestPlayerAnimation({
          name: `${fromDir}-${toDir}`,
          dir: [0, 0],
          loop: false,
          turnDelta: Math.PI / 2,
        });
      } else {
        playerAngleRef.current = dirToAngleRad(p.dir);
      }
    },
    [requestPlayerAnimation]
  );

  // Sync current world changes into worldArray if multiple worlds exist
  const syncWorldToStore = useCallback(() => {
    const serialized = serializeGrid();
    savedWorldBeforeRunRef.current = serialized;
    setWorldArray((prev) => {
      if (prev.length <= 1) return prev;
      const copy = [...prev];
      copy[worldArrayIndex] = {
        ...copy[worldArrayIndex],
        canvasConfig,
        world: serialized,
        userCode: syncCode ? '' : editorRef.current?.getCode() ?? '',
      };
      return copy;
    });
  }, [canvasConfig, serializeGrid, syncCode, worldArrayIndex]);

  // Select tool in editor bar
  const handleSelectTool = (type: 'player' | 'collisionObj' | 'collectableObj') => {
    if (animationActive || debuggerOn) return;
    if (type === 'player') {
      if (playerStateRef.current && selectedToolId === 4) {
        playerTurnLeft(true);
        syncWorldToStore();
      } else {
        setSelectedToolId(4);
      }
    } else if (type === 'collisionObj') {
      setSelectedToolId(5);
    } else if (type === 'collectableObj') {
      setSelectedToolId(6);
    }
  };

  // Click on canvas cell
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (animationActive || debuggerOn || testcasesLoaded) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / GRID_SIZE);
    const row = Math.floor((e.clientY - rect.top) / GRID_SIZE);
    if (
      row < 0 ||
      row >= canvasConfig.rows ||
      col < 0 ||
      col >= canvasConfig.cols
    ) {
      return;
    }

    const cell = gridRef.current[row][col];
    let effectiveToolId = selectedToolId;
    if (cell !== 0) {
      effectiveToolId = Array.isArray(cell) ? cell[1].id : cell.id;
      setSelectedToolId(effectiveToolId);
    }

    if (!effectiveToolId) return;

    if (cell === 0) {
      if (effectiveToolId === 4 && playerStateRef.current) {
        // Move existing player to new cell
        const oldPos = playerStateRef.current.pos;
        const oldCell = gridRef.current[oldPos.row][oldPos.col];
        gridRef.current[oldPos.row][oldPos.col] = Array.isArray(oldCell) ? oldCell[0] : 0;
        playerStateRef.current.pos = { row, col };
        playerPixelRef.current = { x: col * GRID_SIZE, y: row * GRID_SIZE };
        toGrid(playerStateRef.current);
      } else {
        const newObj: GridObjectState = {
          uuid: Symbol(),
          id: effectiveToolId,
          pos: { row, col },
          dir: [1, 0],
          solid: effectiveToolId === 5,
          shift: false,
          lift: effectiveToolId === 6,
        };
        toGrid(newObj);
        if (effectiveToolId === 4) {
          playerStateRef.current = newObj;
          playerPixelRef.current = { x: col * GRID_SIZE, y: row * GRID_SIZE };
          playerAngleRef.current = 0;
          playerAnimRef.current.currentAnim = 'idle-right';
          playerAnimRef.current.nextId = 0;
        }
      }
    } else {
      // Remove from grid
      if (Array.isArray(cell)) {
        if (cell[1].id === 4) {
          playerStateRef.current = null;
        }
        gridRef.current[row][col] = cell[0];
      } else {
        if (cell.id === 4) {
          playerStateRef.current = null;
        }
        gridRef.current[row][col] = 0;
      }
    }

    syncWorldToStore();
    renderWorld();
  };

  // Python runtime methods bound to Sk.builtins
  // mode:
  // - 'async-play': each command suspends Python execution until its visual animation finishes (strictly sequential!)
  // - 'sync-debug': used by step-by-step debugger
  // - 'headless': used by fast testcase validation without animation
  const bindSkulptBuiltins = useCallback(
    (mode: 'async-play' | 'sync-debug' | 'headless' = 'async-play') => {
      const Sk = window.Sk;
      if (!Sk) return;

      const animate = mode !== 'headless';
      const isSequentialAsync = mode === 'async-play';

      const removeFromCurrentCellKeepUnder = (p: GridObjectState) => {
        const cell = gridRef.current[p.pos.row][p.pos.col];
        if (Array.isArray(cell)) {
          gridRef.current[p.pos.row][p.pos.col] = cell[0];
        } else {
          gridRef.current[p.pos.row][p.pos.col] = 0;
        }
      };

      // Helper that executes a command step and, in 'async-play' mode, waits for its animation to finish before returning to Python
      const runCommandSequentially = (
        executeAndQueueAnim: () => void
      ) => {
        if (!isSequentialAsync) {
          executeAndQueueAnim();
          return Sk.builtin.none.none$;
        }

        return Sk.misceval.promiseToSuspension(
          new Promise((resolve, reject) => {
            if (runCancelledRef.current) {
              reject(new Error('interrupted'));
              return;
            }

            try {
              executeAndQueueAnim();
            } catch (err) {
              reject(err);
              return;
            }

            const finishStep = () => {
              if (runCancelledRef.current) {
                reject(new Error('interrupted'));
                return;
              }
              const pauseMs = Math.max(40, Math.round(140 / playerAnimRef.current.speed));
              window.setTimeout(() => {
                if (runCancelledRef.current) {
                  reject(new Error('interrupted'));
                  return;
                }
                resolve(Sk.builtin.none.none$);
              }, pauseMs);
            };

            if (playerAnimRef.current.active) {
              const prevEnd = playerAnimRef.current.onCycleEnd;
              playerAnimRef.current.onCycleEnd = () => {
                playerAnimRef.current.onCycleEnd = prevEnd;
                finishStep();
              };
            } else {
              finishStep();
            }
          })
        );
      };

      Sk.builtins.__move__ = new Sk.builtin.func(() => {
        return runCommandSequentially(() => {
          const p = playerStateRef.current;
          if (!p) return;
          const oldX = p.pos.col * GRID_SIZE;
          const oldY = p.pos.row * GRID_SIZE;
          removeFromCurrentCellKeepUnder(p);
          const [nr, nc] = getNextCell(canvasConfig.rows, canvasConfig.cols, p.pos, p.dir);
          const target = gridRef.current[nr][nc];
          let moved = false;
          if (target === 0) {
            p.pos = { row: nr, col: nc };
            toGrid(p);
            moved = true;
          } else if (!Array.isArray(target)) {
            if (target.id === 6) {
              p.pos = { row: nr, col: nc };
              toGrid(p);
              moved = true;
            } else if (target.solid) {
              // Stay on current cell without throwing an error
              toGrid(p);
              moved = false;
            }
          } else {
            toGrid(p);
          }
          if (animate && moved) {
            playerPixelRef.current = { x: oldX, y: oldY };
            requestPlayerAnimation({
              name: dirToWalkName(p.dir),
              dir: [...p.dir] as [number, number],
              loop: true,
            });
          }
        });
      });

      Sk.builtins.__turnLeft__ = new Sk.builtin.func(() => {
        return runCommandSequentially(() => {
          playerTurnLeft(animate);
        });
      });

      Sk.builtins.__turnRight__ = new Sk.builtin.func(() => {
        return runCommandSequentially(() => {
          playerTurnRight(animate);
        });
      });

      Sk.builtins.__placeObject__ = new Sk.builtin.func(() => {
        return runCommandSequentially(() => {
          const p = playerStateRef.current;
          if (!p) return;
          const cell = gridRef.current[p.pos.row][p.pos.col];
          if (!Array.isArray(cell)) {
            const pow: GridObjectState = {
              uuid: Symbol(),
              id: 6,
              pos: { row: p.pos.row, col: p.pos.col },
              dir: [1, 0],
              solid: false,
              lift: true,
            };
            toGrid(pow);
            if (animate) {
              requestPlayerAnimation({
                name: dirToWalkName(p.dir),
                dir: [0, 0],
                loop: false,
                action: 'placeObject',
                actionObject: pow,
              });
            }
          }
        });
      });

      Sk.builtins.__removeObject__ = new Sk.builtin.func(() => {
        return runCommandSequentially(() => {
          const p = playerStateRef.current;
          if (!p) return;
          const cell = gridRef.current[p.pos.row][p.pos.col];
          if (Array.isArray(cell)) {
            const removed = cell[0];
            gridRef.current[p.pos.row][p.pos.col] = p;
            if (animate) {
              requestPlayerAnimation({
                name: dirToWalkName(p.dir),
                dir: [0, 0],
                loop: false,
                action: 'removeObject',
                actionObject: removed,
              });
            }
          }
        });
      });

      Sk.builtins.__onObject__ = new Sk.builtin.func(() => {
        const p = playerStateRef.current;
        if (!p) return Sk.ffi.remapToPy(false);
        const cell = gridRef.current[p.pos.row][p.pos.col];
        const isOn = Array.isArray(cell) && cell[0].id === 6;
        return Sk.ffi.remapToPy(isOn);
      });

      Sk.builtins.__objectFront__ = new Sk.builtin.func(() => {
        const p = playerStateRef.current;
        if (!p) return Sk.ffi.remapToPy(false);
        const [nr, nc] = getNextCell(canvasConfig.rows, canvasConfig.cols, p.pos, p.dir);
        const cell = gridRef.current[nr][nc];
        const isRock = cell !== 0 && !Array.isArray(cell) && !!cell.solid;
        return Sk.ffi.remapToPy(isRock);
      });

      const checkLateral = (side: 'left' | 'right'): boolean => {
        const p = playerStateRef.current;
        if (!p) return false;
        let idx = 0;
        for (let i = 0; i < 4; i++) {
          if (DIRS[i].toString() === p.dir.toString()) idx = i;
        }
        const latIdx = side === 'right' ? (idx - 1 < 0 ? 3 : idx - 1) : idx + 1 > 3 ? 0 : idx + 1;
        const [nr, nc] = getNextCell(canvasConfig.rows, canvasConfig.cols, p.pos, DIRS[latIdx]);
        const cell = gridRef.current[nr][nc];
        return cell !== 0 && !Array.isArray(cell) && !!cell.solid;
      };

      Sk.builtins.__objectRight__ = new Sk.builtin.func(() =>
        Sk.ffi.remapToPy(checkLateral('right'))
      );

      Sk.builtins.__objectLeft__ = new Sk.builtin.func(() =>
        Sk.ffi.remapToPy(checkLateral('left'))
      );

      Sk.builtins.__showText__ = new Sk.builtin.func((textPy: any) => {
        const val = textPy?.v;
        if (typeof val !== 'string') {
          showToast('Warning', 'showText() akzeptiert nur Zeichenketten <str>!');
          return Sk.builtin.none.none$;
        }
        return runCommandSequentially(() => {
          const p = playerStateRef.current;
          if (animate && p) {
            requestPlayerAnimation({
              name: dirToWalkName(p.dir),
              dir: [0, 0],
              loop: false,
              action: 'showText',
              text: val,
            });
          } else {
            showToast('Output', val);
          }
        });
      });

      Sk.builtins.__getPosition__ = new Sk.builtin.func(() => {
        const p = playerStateRef.current;
        if (!p) return Sk.ffi.remapToPy([0, 0]);
        return Sk.ffi.remapToPy([p.pos.col, p.pos.row]);
      });

      Sk.builtins.input = new Sk.builtin.func((promptPy: any) => {
        const promptStr = promptPy?.v ?? '';
        return Sk.misceval.promiseToSuspension(
          new Promise((resolve) => {
            const openModal = () => {
              setInputDialogArg(String(promptStr));
              setActiveDialog('input');
              inputResolverRef.current = (userVal: string) => {
                resolve(new Sk.builtin.str(userVal));
              };
            };
            if (playerAnimRef.current.active) {
              const prevEnd = playerAnimRef.current.onCycleEnd;
              playerAnimRef.current.onCycleEnd = () => {
                playerAnimRef.current.onCycleEnd = prevEnd;
                openModal();
              };
            } else {
              openModal();
            }
          })
        );
      });
    },
    [
      canvasConfig.cols,
      canvasConfig.rows,
      playerTurnLeft,
      playerTurnRight,
      requestPlayerAnimation,
      showToast,
      toGrid,
    ]
  );

  // Stop / reset compiler state
  const resetCompiler = useCallback((reason?: string) => {
    runCancelledRef.current = true;
    if (window.Sk) {
      window.Sk.execLimit = 0;
    }
    cancelAnimationFrame(playerAnimRef.current.rafId);
    playerAnimRef.current.queue = [];
    playerAnimRef.current.active = false;
    playerAnimRef.current.onCycleEnd = undefined;
    debugSuspensionRef.current = null;
    debugPrevLineRef.current = undefined;
    setAnimationActive(false);
    if (reason !== 'keepDebug') {
      setDebuggerOn(false);
    }
    editorRef.current?.setReadOnly(false);
  }, []);

  // Save backup to localStorage without overwriting the clean pre-run world state
  const saveBackup = useCallback(() => {
    const worldToSave =
      savedWorldBeforeRunRef.current.length > 0
        ? savedWorldBeforeRunRef.current
        : serializeGrid();
    savedWorldBeforeRunRef.current = worldToSave;
    const code = editorRef.current?.getCode() ?? '';
    const backupData =
      worldArray.length > 0
        ? worldArray.map((w, idx) =>
            idx === worldArrayIndex
              ? { ...w, world: worldToSave, userCode: code, canvasConfig }
              : w
          )
        : { canvasConfig, world: worldToSave, userCode: code };
    try {
      localStorage.setItem('spbug-backup', JSON.stringify(backupData));
    } catch {
      // ignore storage quota errors
    }
  }, [canvasConfig, serializeGrid, worldArray, worldArrayIndex]);

  // Handle Skulpt syntax errors ONLY
  const handleSkulptError = useCallback(
    (err: any) => {
      if (runCancelledRef.current || err?.nativeError?.message === 'interrupted') {
        return;
      }
      if (err?.tp$name === 'ExternalError' || err?.tp$name === 'TimeLimitError') {
        resetCompiler('done');
        return;
      }

      const rawErrStr = err?.toString ? err.toString() : '';
      const lineno = err?.traceback?.[0]?.lineno || err?.traceback?.[1]?.lineno;
      const msg = lineno
        ? `${MESSAGES_DE.checkLinnum} ${lineno}: ${MESSAGES_DE.default}`
        : rawErrStr || MESSAGES_DE.default;

      resetCompiler('syntax');
      showToast('Error', msg);

      const maxLines = editorRef.current?.getMaxLineNumbers() ?? 1;
      if (lineno && lineno <= maxLines) {
        editorRef.current?.highlightLine(lineno);
      }
    },
    [resetCompiler, showToast]
  );

  // Debugger step execution
  const stepDebugger = useCallback(() => {
    const Sk = window.Sk;
    if (!Sk) return;

    const extractVariables = (susp: any) => {
      const gbl = susp.$gbl ? susp.$gbl : susp.$d;
      let hasLocal = false;
      const toPyStr = (vObj: any) => {
        let val = vObj.v;
        const tName = vObj.tp$name || '';
        if (tName === 'bool') val = val === 1 ? 'True' : 'False';
        else if (tName === 'list') val = `[${val}]`;
        else if (tName === 'str') val = `'${val}'`;
        else if (tName === 'tuple') val = `(${val})`;
        return { val: String(val), type: tName };
      };

      const pushVar = (dict: any, key: string, scope: 'global' | 'local') => {
        const cleanName = key.replace('_$rw$', '');
        const { val, type } = toPyStr(dict[key]);
        const idx = debugVarsRef.current.findIndex(
          (v) => v.name === cleanName && v.scope === scope
        );
        if (idx === -1) {
          debugVarsRef.current.push({
            scope,
            name: cleanName,
            value: val,
            type,
            show: true,
            lineT: false,
          });
        } else {
          debugVarsRef.current = debugVarsRef.current.map((v, i) =>
            i === idx ? { ...v, value: val, type, lineT: false } : v
          );
        }
      };

      if (gbl) {
        for (const k of Object.keys(gbl)) {
          if (
            gbl[k] &&
            gbl[k].v != null &&
            gbl[k].v !== '__main__' &&
            gbl[k].v !== 'debugUserCode.py'
          ) {
            pushVar(gbl, k, 'global');
          }
        }
      }
      if (susp.$tmps) {
        const tmps = susp.$tmps;
        for (const k of Object.keys(tmps)) {
          if (tmps[k] !== undefined && !tmps[k].$d && !k.includes('$')) {
            hasLocal = true;
            pushVar(tmps, k, 'local');
          }
        }
      }
      if (!hasLocal) {
        debugVarsRef.current = debugVarsRef.current.map((v) =>
          v.scope === 'local' ? { ...v, lineT: true } : v
        );
      }
      setDebugVariables([...debugVarsRef.current]);
      setConsoleText('');
    };

    if (!debugSuspensionRef.current) {
      const code = editorRef.current?.getCode() ?? '';
      debugVarsRef.current = [];
      setDebugVariables([]);
      runCancelledRef.current = false;
      Sk.execLimit = Infinity;
      Sk.globals = {};
      bindSkulptBuiltins('sync-debug');

      Sk.configure({
        output: (txt: string) => setConsoleText((prev) => prev + txt),
        debugging: true,
        read: (x: string) => {
          if (!Sk.builtinFiles || !Sk.builtinFiles.files[x]) throw `File not found: '${x}'`;
          return Sk.builtinFiles.files[x];
        },
        retainGlobals: true,
      });

      Sk.misceval
        .asyncToPromise(() => Sk.importMainWithBody('prerequisites', false, PB_ALL, true))
        .then(() => {
          try {
            const susp = Sk.importMainWithBody('debugUserCode', false, code, true);
            debugSuspensionRef.current = susp;
            const firstLine = susp?.child?.$lineno;
            debugPrevLineRef.current = firstLine;
            editorRef.current?.setReadOnly(true);
            if (typeof firstLine === 'number') {
              editorRef.current?.highlightLine(firstLine);
            }
          } catch (err: any) {
            resetCompiler('debugInitError');
            showToast('Error', err.toString());
          }
        });
      return;
    }

    // Advance one line in suspension
    let stepped = false;
    while (!stepped) {
      try {
        debugSuspensionRef.current = debugSuspensionRef.current.resume();
      } catch (err: any) {
        resetCompiler('debugError');
        editorRef.current?.resetHighlightLine();
        const line = err?.traceback?.[1]?.lineno || err?.traceback?.[0]?.lineno;
        showToast(
          err?.nativeError ? 'Warning' : 'Error',
          err?.nativeError
            ? `${err.nativeError.message}! Prüfe Zeile ${line || 1}.`
            : err.toString()
        );
        return;
      }

      if (!debugSuspensionRef.current || !debugSuspensionRef.current.$isSuspension) {
        if (debugSuspensionRef.current) {
          extractVariables(debugSuspensionRef.current);
        }
        editorRef.current?.resetHighlightLine();
        resetCompiler('debugFinished');
        return;
      }

      let child = debugSuspensionRef.current.child?.child;
      let activeNode = debugSuspensionRef.current.child;
      let currentLineno = activeNode?.$lineno;

      if (child && child.$filename === 'debugUserCode.py') {
        while (child.$isSuspension && child.$filename !== 'prerequisites.py') {
          currentLineno = child.$lineno;
          activeNode = child;
          child = child.child;
        }
      }

      if (currentLineno !== debugPrevLineRef.current) {
        if (typeof currentLineno === 'number') {
          editorRef.current?.highlightLine(currentLineno);
        }
        if (activeNode) {
          extractVariables(activeNode);
        }
        debugPrevLineRef.current = currentLineno;
        stepped = true;
      }
    }
  }, [bindSkulptBuiltins, resetCompiler, showToast]);

  // Run user Python code
  const handlePlay = () => {
    const rawCodeCheck = (editorRef.current?.getCode() ?? '').trim();
    if (rawCodeCheck === 'LÖSUNGEN' || rawCodeCheck === 'LOESUNGEN') {
      downloadAllSolutionsPdf();
      showToast('Success', 'Lösungs-PDF wird heruntergeladen!');
      return;
    }

    if (codeValidationRunning) {
      showToast('Warning', 'Warte bis alle Tests fertig sind!');
      return;
    }

    if (debuggerOn) {
      stepDebugger();
      return;
    }

    if (animationActive) {
      // Stop running execution and restore world before run
      resetCompiler('stop');
      fillGrid(savedWorldBeforeRunRef.current);
      showToast('Warning', MESSAGES_DE.codeInterrupted);
      return;
    }

    const code = editorRef.current?.getCode() ?? '';
    if (!code.trim()) {
      showToast('Warning', MESSAGES_DE.noCode);
      editorRef.current?.setReadOnly(false);
      return;
    }

    // Restore clean pre-run world state before executing so repeated runs always start from the Startwelt
    if (savedWorldBeforeRunRef.current.length > 0) {
      fillGrid(savedWorldBeforeRunRef.current);
    }

    if (!playerStateRef.current) {
      // Place default player at (0,0) and inform user (matches original Spacebug behavior)
      const defaultPlayer: GridObjectState = {
        uuid: Symbol(),
        id: 4,
        pos: { row: 0, col: 0 },
        dir: [1, 0],
      };
      toGrid(defaultPlayer);
      playerStateRef.current = defaultPlayer;
      playerPixelRef.current = { x: 0, y: 0 };
      playerAnimRef.current.currentAnim = 'idle-right';
      playerAnimRef.current.nextId = 0;
      savedWorldBeforeRunRef.current = serializeGrid();
      renderWorld();
      showToast('Message', 'Playerobjekt wurde automatisch in Welt platziert!');
      return;
    }

    editorRef.current?.resetHighlightLine();
    const speeds = [1, 2, 4];
    playerAnimRef.current.speed = speeds[speedIndex];
    saveBackup();

    const Sk = window.Sk;
    if (!Sk) {
      showToast('Error', 'Python-Engine wird geladen...');
      return;
    }

    setConsoleText('');
    setDebugVariables([]);
    setAnimationActive(true);
    editorRef.current?.setReadOnly(true);

    runCancelledRef.current = false;
    commandStepCountRef.current = 0;

    Sk.execLimit = Infinity;
    Sk.globals = {};
    bindSkulptBuiltins('async-play');

    Sk.configure({
      output: (txt: string) => {
        setConsoleText((prev) => prev + txt);
      },
      debugging: false,
      read: (x: string) => {
        if (!Sk.builtinFiles || !Sk.builtinFiles.files[x]) throw `File not found: '${x}'`;
        return Sk.builtinFiles.files[x];
      },
      retainGlobals: false,
      yieldLimit: 100,
      execLimit: Infinity,
    });

    Sk.misceval
      .asyncToPromise(() => Sk.importMainWithBody('prerequisites', false, PB_ALL, true))
      .then(() => {
        Sk.configure({
          output: (txt: string) => setConsoleText((prev) => prev + txt),
          debugging: false,
          read: (x: string) => {
            if (!Sk.builtinFiles || !Sk.builtinFiles.files[x]) throw `File not found: '${x}'`;
            return Sk.builtinFiles.files[x];
          },
          retainGlobals: true,
          yieldLimit: 100,
          execLimit: Infinity,
        });
        return Sk.misceval.asyncToPromise(() =>
          Sk.importMainWithBody('usercode', false, code, true)
        );
      })
      .then(
        () => {
          if (!runCancelledRef.current) {
            setTimeout(() => {
              resetCompiler('End of Animation');
            }, 80);
          }
        },
        (err: any) => {
          handleSkulptError(err);
        }
      );
  };

  // Encode world state for Grader / Testcases
  const encodeWorldState = (graderCfg: { check: number; dir?: boolean }): string => {
    let out = '';
    const dirStrings = ['1,0', '0,-1', '-1,0', '0,1'];
    const serialized = serializeGrid();
    for (const item of serialized) {
      let u = item.objectStoreState.id;
      if (graderCfg.check && graderCfg.check.toString().includes(u.toString())) {
        const { row, col } = item.objectStoreState.pos;
        if (u === 4 && graderCfg.dir) {
          u = dirStrings.indexOf(item.objectStoreState.dir.toString());
        }
        out +=
          u.toString().padStart(2, '0') +
          row.toString().padStart(2, '0') +
          col.toString().padStart(2, '0');
      }
    }
    return out;
  };

  // Run validation across worlds
  const runValidation = async (
    worldsToValidate: WorldEntry[],
    graderCfg: { check: number; dir?: boolean },
    checkExistingResult: boolean
  ): Promise<any[] | null> => {
    if (worldsToValidate.length < 2) {
      showToast(
        'Warning',
        'Zu wenige Welten! Mindestens zwei Welten zum Erstellen von Testfällen angeben.'
      );
      return null;
    }
    const code = editorRef.current?.getCode() ?? '';
    if (!code.trim()) {
      showToast('Warning', 'Kein Code im Editor! Teste ein Programm zunächst gegen eine selbst erstellte Welt.');
      return null;
    }

    const Sk = window.Sk;
    if (!Sk) return null;

    setCodeValidationRunning(true);
    const backupCurrentWorld = serializeGrid();
    const results: any[] = [];

    for (const w of worldsToValidate) {
      fillGrid(w.world, w.canvasConfig?.rows || canvasConfig.rows, w.canvasConfig?.cols || canvasConfig.cols);
      bindSkulptBuiltins('headless');
      Sk.execLimit = 2000;
      Sk.globals = {};

      let success = false;
      try {
        await Sk.misceval.asyncToPromise(() =>
          Sk.importMainWithBody('prerequisites', false, PB_ALL, true)
        );
        Sk.configure({
          output: () => {},
          debugging: false,
          read: (x: string) => Sk.builtinFiles.files[x],
          retainGlobals: true,
          yieldLimit: 100,
          execLimit: 2000,
        });
        await Sk.misceval.asyncToPromise(() =>
          Sk.importMainWithBody('validateUsercode', false, code, true)
        );
        success = true;
      } catch {
        success = false;
      }

      const encoded = encodeWorldState(w.grader || graderCfg);
      if (checkExistingResult) {
        results.push(success && encoded === w.result);
      } else {
        results.push({
          ...w,
          grader: graderCfg,
          userCode: '',
          result: success ? encoded : '',
        });
      }
    }

    fillGrid(backupCurrentWorld);
    setCodeValidationRunning(false);
    return results;
  };

  // Play menu actions (DEBUG, RESET, DELETE, SPEED, TEST)
  const handlePlayMenuAction = async (action: 'DEBUG' | 'RESET' | 'DELETE' | 'SPEED' | 'TEST') => {
    if (codeValidationRunning) {
      showToast('Warning', 'Warte bis alle Tests fertig sind!');
      return;
    }

    if (action === 'DEBUG') {
      if (animationActive) return;
      if (!debuggerOn) {
        const code = editorRef.current?.getCode() ?? '';
        if (code.trim() && playerStateRef.current) {
          savedWorldBeforeRunRef.current = serializeGrid();
          setDebuggerOn(true);
          setShowConsole(true);
          stepDebugger();
        } else {
          showToast(
            'Message',
            'Code und Playerobjekt müssen zum Ausführen des Debuggers vorhanden sein.'
          );
        }
      } else {
        resetCompiler('debugToggleOff');
        editorRef.current?.resetHighlightLine();
        setConsoleText('');
        setDebugVariables([]);
      }
    } else if (action === 'RESET') {
      if (!animationActive && savedWorldBeforeRunRef.current.length > 0) {
        editorRef.current?.resetHighlightLine();
        editorRef.current?.setReadOnly(false);
        setConsoleText('');
        setDebugVariables([]);
        setSelectedToolId(undefined);
        setTestResults(null);
        resetCompiler('resetBtn');
        fillGrid(savedWorldBeforeRunRef.current);
      }
    } else if (action === 'DELETE') {
      if (!animationActive && !debuggerOn) {
        setSelectedToolId(undefined);
        createEmptyGrid(canvasConfig.rows, canvasConfig.cols);
        savedWorldBeforeRunRef.current = [];
        renderWorld();
      }
    } else if (action === 'SPEED') {
      if (playerStateRef.current && !animationActive && !debuggerOn) {
        const speeds = [1, 2, 4];
        const nextIdx = (speedIndex + 1) % 3;
        setSpeedIndex(nextIdx);
        playerAnimRef.current.speed = speeds[nextIdx];
      }
    } else if (action === 'TEST') {
      if (worldArray.length > 0 && worldArray.every((w) => w.result)) {
        const res = await runValidation(
          worldArray,
          worldArray[0].grader || { check: 456 },
          true
        );
        if (res) {
          setTestResults(res as boolean[]);
        }
      }
    }
  };

  // Multi-world bar handlers
  const handleSelectWorldIndex = (idx: number) => {
    if (codeValidationRunning) {
      showToast('Warning', 'Warte bis alle Tests fertig sind!');
      return;
    }
    if (idx === worldArrayIndex || animationActive) return;
    setWorldArrayIndex(idx);
    setConsoleText('');
    const target = worldArray[idx];
    if (target) {
      if (!syncCode && target.userCode !== undefined) {
        editorRef.current?.setCode(target.userCode);
      }
      fillGrid(target.world, target.canvasConfig?.rows || canvasConfig.rows, target.canvasConfig?.cols || canvasConfig.cols);
    }
  };

  const handleAddNewWorld = () => {
    if (animationActive) return;
    if (worldArray.length === 8) {
      showToast('Warning', 'Maximale Anzahl an Welten erreicht');
      return;
    }
    const currentSerialized = serializeGrid();
    if (currentSerialized.length === 0) {
      showToast('Message', 'Erstelle zuerst eine Welt!');
      return;
    }
    const entry: WorldEntry = {
      world: JSON.parse(JSON.stringify(currentSerialized)),
      userCode: syncCode ? '' : editorRef.current?.getCode() ?? '',
      canvasConfig,
    };
    const nextArr =
      worldArray.length > 0 ? [...worldArray, entry] : [entry, JSON.parse(JSON.stringify(entry))];
    const nextIdx = nextArr.length - 1;
    setWorldArray(nextArr);
    setWorldArrayIndex(nextIdx);
  };

  const handleDeleteCurrentWorld = () => {
    if (animationActive || worldArray.length === 0) return;
    const copy = [...worldArray];
    copy.splice(worldArrayIndex, 1);
    if (copy.length <= 1) {
      if (copy.length === 1) {
        fillGrid(copy[0].world);
      }
      setWorldArray([]);
      setWorldArrayIndex(0);
    } else {
      const nextIdx = worldArrayIndex >= copy.length ? copy.length - 1 : worldArrayIndex;
      setWorldArray(copy);
      setWorldArrayIndex(nextIdx);
      fillGrid(copy[nextIdx].world);
    }
    saveBackup();
  };

  // File operations
  const handleSaveJson = (fileName: string, includeCode: boolean, includeWorld: boolean) => {
    resetCompiler('save');
    setConsoleText('');
    const code = editorRef.current?.getCode() ?? '';
    const currentWorld = serializeGrid();
    let payload: any;
    if (worldArray.length > 0) {
      payload = worldArray.map((w, i) => ({
        ...w,
        world: i === worldArrayIndex ? currentWorld : w.world,
        userCode: includeCode ? (testcasesLoaded ? '' : code) : '',
        canvasConfig: w.canvasConfig || canvasConfig,
      }));
    } else {
      payload = {
        canvasConfig,
        world: includeWorld ? currentWorld : [],
        userCode: includeCode ? code : '',
      };
    }

    const cleanName = (fileName ? fileName : 'filename').split('.')[0] + '.json';
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = cleanName;
    a.click();
    a.remove();
    setActiveDialog(undefined);
  };

  const handleOpenFiles = (files: FileList) => {
    resetCompiler('open');
    setConsoleText('');
    setTestResults(null);
    setActiveDialog(undefined);

    const validFiles: File[] = [];
    const invalidNames: string[] = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].type === 'application/json' || files[i].name.endsWith('.json')) {
        validFiles.push(files[i]);
      } else {
        invalidNames.push(files[i].name);
      }
    }
    if (invalidNames.length > 0) {
      showToast('Error', `Folgende Dateien konnten nicht geladen werden: ${invalidNames.join(', ')}`);
    }
    if (validFiles.length === 0) return;

    setWorldArray([]);
    setTestcasesLoaded(false);
    setWorldArrayIndex(0);
    setSelectedToolId(undefined);

    if (validFiles.length === 1) {
      const reader = new FileReader();
      reader.readAsText(validFiles[0]);
      reader.onload = () => {
        try {
          let data = JSON.parse(String(reader.result));
          if (Array.isArray(data) && data.length > 0) {
            if (data.every((item: any) => item.result)) {
              setTestcasesLoaded(true);
              data = data.map((c: any) => ({ ...c, userCode: '' }));
            }
            setWorldArray(data);
            const first = data[0];
            if (first.canvasConfig) setCanvasConfig(first.canvasConfig);
            if (first.userCode) editorRef.current?.setCode(first.userCode);
            if (first.world) {
              fillGrid(
                first.world,
                first.canvasConfig?.rows || canvasConfig.rows,
                first.canvasConfig?.cols || canvasConfig.cols
              );
            }
          } else {
            if (data.canvasConfig) setCanvasConfig(data.canvasConfig);
            if (data.userCode !== undefined) editorRef.current?.setCode(data.userCode);
            if (data.world) {
              fillGrid(
                data.world,
                data.canvasConfig?.rows || canvasConfig.rows,
                data.canvasConfig?.cols || canvasConfig.cols
              );
            }
          }
        } catch {
          showToast('Error', 'Ungültiges Dateiformat');
        }
      };
    } else {
      // Load multiple single-world JSON files into worldArray
      const promises = validFiles.map(
        (file) =>
          new Promise<WorldEntry | undefined>((resolve) => {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => {
              try {
                const parsed = JSON.parse(String(reader.result));
                if (Array.isArray(parsed)) {
                  showToast(
                    'Warning',
                    `Datei ${file.name} einzeln laden, da diese bereits mehrere Welten enthält.`
                  );
                  resolve(undefined);
                } else {
                  resolve(parsed);
                }
              } catch {
                resolve(undefined);
              }
            };
          })
      );
      Promise.all(promises).then((loaded) => {
        const filtered = loaded.filter((w): w is WorldEntry => w !== undefined);
        if (filtered.length > 0) {
          setWorldArray(filtered);
          const first = filtered[0];
          if (first.canvasConfig) setCanvasConfig(first.canvasConfig);
          if (first.userCode) editorRef.current?.setCode(first.userCode);
          if (first.world) {
            fillGrid(
              first.world,
              first.canvasConfig?.rows || canvasConfig.rows,
              first.canvasConfig?.cols || canvasConfig.cols
            );
          }
        }
      });
    }
  };

  const handleOpenBackup = () => {
    setActiveDialog(undefined);
    setConsoleText('');
    const raw = localStorage.getItem('spbug-backup');
    if (!raw) {
      showToast('Message', 'Kein lokales Backup gefunden.');
      return;
    }
    try {
      const data = JSON.parse(raw);
      setSelectedToolId(undefined);
      if (Array.isArray(data) && data.length > 0) {
        setWorldArray(data);
        const first = data[0];
        if (first.canvasConfig) setCanvasConfig(first.canvasConfig);
        if (first.userCode !== undefined) editorRef.current?.setCode(first.userCode);
        if (first.world) {
          fillGrid(
            first.world,
            first.canvasConfig?.rows || canvasConfig.rows,
            first.canvasConfig?.cols || canvasConfig.cols
          );
        }
      } else {
        if (data.canvasConfig) setCanvasConfig(data.canvasConfig);
        if (data.userCode !== undefined) editorRef.current?.setCode(data.userCode);
        if (data.world) {
          fillGrid(
            data.world,
            data.canvasConfig?.rows || canvasConfig.rows,
            data.canvasConfig?.cols || canvasConfig.cols
          );
        }
      }
    } catch {
      showToast('Error', 'Backup konnte nicht geladen werden.');
    }
  };

  const handleResetApp = (reloadGridSize = true) => {
    resetCompiler('resetApp');
    const nextCfg = reloadGridSize ? { rows: 12, cols: 12, grid: GRID_SIZE } : canvasConfig;
    setCanvasConfig(nextCfg);
    createEmptyGrid(nextCfg.rows, nextCfg.cols);
    savedWorldBeforeRunRef.current = [];
    editorRef.current?.setCode('');
    editorRef.current?.resetHighlightLine();
    setWorldArray([]);
    setWorldArrayIndex(0);
    setTestcasesLoaded(false);
    setTestResults(null);
    setSelectedToolId(undefined);
    setConsoleText('');
    setDebugVariables([]);
    setShowSidebarMenu(false);
    renderWorld();
  };

  const handleChangeGridSize = (newCols: number, newRows: number) => {
    resetCompiler('changeGridSize');
    const nextCfg = { rows: newRows, cols: newCols, grid: GRID_SIZE };
    setCanvasConfig(nextCfg);
    createEmptyGrid(newRows, newCols);
    savedWorldBeforeRunRef.current = [];
    editorRef.current?.setCode('');
    setWorldArray([]);
    setWorldArrayIndex(0);
    setTestcasesLoaded(false);
    setTestResults(null);
    setActiveDialog(undefined);
  };

  const handleSaveScreenshot = (fileName: string, toClipboard: boolean) => {
    const srcCanvas = gameCanvasRef.current;
    if (!srcCanvas) return;
    const dpr = window.devicePixelRatio || 1;
    const { rows, cols, grid } = canvasConfig;
    const cellPx = grid * dpr;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = cols * cellPx;
    offCanvas.height = rows * cellPx;
    const ctx = offCanvas.getContext('2d');
    if (ctx) {
      ctx.translate(0.5, 0.5);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      for (let r = 1; r < rows; r++) {
        ctx.moveTo(0, cellPx * r);
        ctx.lineTo(cellPx * cols, cellPx * r);
      }
      for (let c = 1; c < cols; c++) {
        ctx.moveTo(cellPx * c, 0);
        ctx.lineTo(cellPx * c, cellPx * rows);
      }
      ctx.stroke();
      ctx.drawImage(srcCanvas, 0, 0);
    }

    if (toClipboard && navigator.clipboard && window.ClipboardItem) {
      offCanvas.toBlob((blob) => {
        if (blob) {
          const item = new ClipboardItem({ [blob.type]: blob });
          navigator.clipboard
            .write([item])
            .then(() => {
              showToast('Success', 'Grafik in Zwischenablage kopiert!');
            })
            .catch(() => {
              showToast('Error', 'Kopieren in Zwischenablage abgebrochen!');
            })
            .finally(() => {
              offCanvas.remove();
              setActiveDialog(undefined);
            });
        }
      });
    } else {
      const dataUrl = offCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
      a.href = dataUrl;
      a.click();
      a.remove();
      offCanvas.remove();
      setActiveDialog(undefined);
    }
  };

  const handleGenerateTestCases = async (
    fileName: string,
    opts: { logPlayer: boolean; dirPlayer: boolean; solidObj: boolean; pickupObj: boolean }
  ) => {
    const digits: string[] = [];
    if (opts.logPlayer) digits.push('4');
    if (opts.solidObj) digits.push('5');
    if (opts.pickupObj) digits.push('6');
    const checkNum = parseInt(digits.join('') || '456', 10);
    const graderCfg = { check: checkNum, base: 10, dir: opts.dirPlayer };

    // Ensure current world state is synced into worldArray
    const currentSerialized = serializeGrid();
    const updatedWorlds = worldArray.map((w, idx) =>
      idx === worldArrayIndex ? { ...w, world: currentSerialized } : w
    );

    const validated = await runValidation(updatedWorlds, graderCfg, false);
    setActiveDialog(undefined);
    if (validated) {
      const cleanName = (fileName ? fileName : 'testcases').split('.')[0] + '.json';
      const blob = new Blob([JSON.stringify(validated)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = cleanName;
      a.click();
      a.remove();
    } else {
      showToast('Warning', 'Scheinbar gibt es keine Testwelten zum Speichern!');
    }
  };

  const handleShareLink = (toClipboard: boolean) => {
    if (!toClipboard) {
      setShareState('pending');
      const code = Math.random().toString(36).substring(2, 6).toUpperCase();
      const payload = {
        canvasConfig,
        world: serializeGrid(),
        userCode: editorRef.current?.getCode() ?? '',
      };
      try {
        localStorage.setItem(`spbug-share-${code}`, JSON.stringify(payload));
      } catch {
        // ignore
      }
      setTimeout(() => {
        setShareKeyword(code);
        setShareState('success');
      }, 300);
    } else if (shareKeyword) {
      const url = `${window.location.origin}${window.location.pathname}?keyword=${shareKeyword}`;
      navigator.clipboard?.writeText(url).then(() => {
        setShareState('copied');
      });
    }
  };

  const handleOpenWithCode = (code: string) => {
    const key = code.toUpperCase();
    const stored = localStorage.getItem(`spbug-share-${key}`);
    if (stored) {
      const data = JSON.parse(stored);
      if (data.canvasConfig) setCanvasConfig(data.canvasConfig);
      if (data.userCode !== undefined) editorRef.current?.setCode(data.userCode);
      if (data.world) fillGrid(data.world);
      setActiveDialog(undefined);
      showToast('Success', `Aufgabe ${key} geladen!`);
    } else {
      showToast('Error', 'Der eingegebene Code ist nicht richtig!');
    }
  };

  const handleSubmitInputDialog = (val: string) => {
    setActiveDialog(undefined);
    if (inputResolverRef.current) {
      const resolve = inputResolverRef.current;
      inputResolverRef.current = null;
      resolve(val);
    }
  };

  const handleCloseDialog = () => {
    if (activeDialog === 'input' && inputResolverRef.current) {
      inputResolverRef.current = null;
      resetCompiler('inputCancelled');
    }
    setActiveDialog(undefined);
    setShareState('default');
    setShareKeyword(undefined);
  };

  const handleLoadTaskWorld = async (task: TaskItem, silent = false) => {
    try {
      setActiveTask(task);
      resetCompiler('loadTask');
      setConsoleText('');
      setTestResults(null);
      setActiveDialog(undefined);
      setWorldArray([]);
      setTestcasesLoaded(false);
      setWorldArrayIndex(0);
      setSelectedToolId(undefined);

      const urlKey = task.worldJsonUrl;
      let data =
        EMBEDDED_TASK_WORLDS[urlKey] ||
        EMBEDDED_TASK_WORLDS[`/${urlKey.replace(/^\.?\//, '')}`];
      if (!data) {
        const response = await fetch(task.worldJsonUrl);
        if (!response.ok) throw new Error('Failed to fetch task world');
        data = await response.json();
      }

      const nextRows = data.canvasConfig?.rows || 12;
      const nextCols = data.canvasConfig?.cols || 12;
      setCanvasConfig({ rows: nextRows, cols: nextCols, grid: GRID_SIZE });

      if (data.userCode !== undefined && data.userCode !== '') {
        editorRef.current?.setCode(data.userCode);
      }
      editorRef.current?.resetHighlightLine();

      if (data.world) {
        fillGrid(data.world, nextRows, nextCols);
        savedWorldBeforeRunRef.current = JSON.parse(JSON.stringify(data.world));
      }
      if (!silent) {
        showToast('Success', `Startwelt „${task.shortTitle}“ geladen!`);
      }
    } catch {
      showToast('Error', 'Startwelt konnte nicht geladen werden.');
    }
  };

  // Calculate total Spacebug app height to match TaskSidebar height cleanly
  const canvasPixelWidth = canvasConfig.cols * canvasConfig.grid + 1;
  const canvasPixelHeight = canvasConfig.rows * canvasConfig.grid + 1;
  const spacebugTotalHeight = canvasPixelHeight + 170; // canvas + 50px world bar + 50px editor bar + 70px play bar

  const maxCols = Math.max(12, Math.trunc((window.innerWidth - 920) / GRID_SIZE));
  const maxRows = Math.max(12, Math.trunc((window.innerHeight - 210) / GRID_SIZE));

  // Toast color helpers matching original Spacebug app-toast
  const getToastColors = (type: ToastMessage['type']) => {
    if (type === 'Success') {
      return { accent: 'bg-[#00dfa2]', body: 'bg-[#e5fcf6]' };
    }
    if (type === 'Warning') {
      return { accent: 'bg-[#ff862f]', body: 'bg-[#fff3ea]' };
    }
    if (type === 'Message' || type === 'Output') {
      return { accent: 'bg-[#0079ff]', body: 'bg-[#e5f1ff]' };
    }
    return { accent: 'bg-[#ff0060]', body: 'bg-[#ffe5ef]' };
  };

  return (
    <div className="h-screen w-screen bg-[#e7f0f8] flex flex-col justify-center items-center overflow-hidden select-none px-6">
      {/* Main 2-Column Workspace: Left = TaskSidebar, Right = Original SpaceBug App */}
      <div className="flex items-start justify-center gap-6 max-w-full">
        {/* LEFT COLUMN: Collapsible Tasks */}
        <TaskSidebar
          height={spacebugTotalHeight}
          activeTaskId={activeTask.id}
          onSelectTask={(task) => handleLoadTaskWorld(task, true)}
          onLoadTaskWorld={(task) => handleLoadTaskWorld(task, false)}
        />

        {/* RIGHT COLUMN: Exact Recreation of Python SpaceBug (spacebug.uni-trier.de) */}
        <div className="flex flex-col items-center shrink-0">
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragOverlayActive(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragOverlayActive(false);
              if (e.dataTransfer.files?.length) {
                handleOpenFiles(e.dataTransfer.files);
              }
            }}
            onClick={() => {
              if (dragOverlayActive) setDragOverlayActive(false);
            }}
            className="relative shadow-[4px_4px_10px_#00000040] rounded-[14px] overflow-hidden transform-gpu bg-[#fbfbfb]"
          >
            {/* Modal Dialog Overlay (.app__overlay) */}
            {activeDialog && (
              <div
                onClick={handleCloseDialog}
                className="absolute inset-0 w-full h-full z-[999] bg-[#0006] text-white text-[1.1rem] flex flex-col justify-center items-center"
              >
                <SpacebugDialog
                  dialogName={activeDialog}
                  inputArg={inputDialogArg}
                  cols={canvasConfig.cols}
                  rows={canvasConfig.rows}
                  maxCols={maxCols}
                  maxRows={maxRows}
                  onClose={handleCloseDialog}
                  onSaveJson={handleSaveJson}
                  onOpenFiles={handleOpenFiles}
                  onChangeGridSize={handleChangeGridSize}
                  onSaveScreenshot={handleSaveScreenshot}
                  onGenerateTestCases={handleGenerateTestCases}
                  onSubmitInput={handleSubmitInputDialog}
                  onShareLink={handleShareLink}
                  shareKeyword={shareKeyword}
                  shareState={shareState}
                  onOpenWithCode={handleOpenWithCode}
                />
              </div>
            )}

            {/* Drag & Drop File Overlay */}
            {dragOverlayActive && (
              <div className="absolute inset-0 w-full h-full z-[999] bg-[#0006] text-white text-[1.1rem] flex flex-col justify-center items-center">
                Datei(en) zum Öffnen hineinziehen
                <div className="flex justify-center items-center m-[30px] w-[100px] h-[100px] p-[4px] bg-white rounded-full">
                  <img
                    src="assets/svgs/upload.svg"
                    width="50px"
                    alt="Upload"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            )}

            {/* Main Content Split (.content) */}
            <div className="flex transform-gpu" style={{ height: `${spacebugTotalHeight}px` }}>
              {/* Content Left: 40px Sidebar Menu + 480px Code Editor + Console + Toast */}
              <div className="relative flex transform-gpu h-full">
                {/* 40px Left Sidebar (app-sidebar-menu) */}
                <div className="w-[40px] bg-[#fbfbfb] overflow-visible flex flex-col items-center justify-end h-full">
                  {/* app-sidebar-icons (flex-direction: column-reverse) */}
                  <div className="flex flex-col-reverse mb-[10px]">
                    <input
                      ref={sidebarFileInputRef}
                      type="file"
                      hidden
                      multiple
                      accept=".json,application/json"
                      onChange={(e) => {
                        if (e.target.files?.length) {
                          handleOpenFiles(e.target.files);
                          e.target.value = '';
                        }
                      }}
                    />
                    {[
                      { name: 'settings', url: 'assets/svgs/settingsv2.svg', title: 'Einstellungen' },
                      { name: 'save', url: 'assets/svgs/download.svg', title: 'Speichern' },
                      { name: 'open', url: 'assets/svgs/upload.svg', title: 'Öffnen' },
                      { name: 'code', url: 'assets/svgs/openwithcode.svg', title: 'Aufgabe mit Code öffnen' },
                    ].map((icon) => (
                      <button
                        key={icon.name}
                        type="button"
                        title={icon.title}
                        onClick={() => {
                          if (icon.name === 'settings') {
                            setShowSidebarMenu((prev) => !prev);
                          } else if (icon.name === 'save') {
                            setShowSidebarMenu(false);
                            setActiveDialog('save');
                          } else if (icon.name === 'open') {
                            setShowSidebarMenu(false);
                            sidebarFileInputRef.current?.click();
                          } else if (icon.name === 'code') {
                            setShowSidebarMenu(false);
                            setActiveDialog('code');
                          }
                        }}
                        className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center m-[6px] hover:bg-[#f3f5f7] transition-colors"
                      >
                        <img
                          src={icon.url}
                          alt={icon.title}
                          referrerPolicy="no-referrer"
                          className="w-[22px] opacity-80"
                        />
                      </button>
                    ))}
                  </div>

                  {/* Slide-out Settings Menu (.menu) */}
                  {showSidebarMenu && (
                    <div className="absolute top-0 left-[40px] h-full rounded-r-[8px] bg-[#fbfbfbe6] backdrop-blur-[2px] py-[10px] pr-[10px] pl-0 z-[999] w-[235px]">
                      <div className="border border-[#e8e9ed] relative rounded-[8px] h-full p-[10px] overflow-y-auto no-scrollbar">
                        <div className="flex items-center my-[6px]">
                          <div className="flex items-center justify-center w-[34px] h-[34px] bg-[#f3f5f7] mt-[6px] mr-[8px] mb-[10px] rounded-[8px] overflow-hidden shadow-[2px_2px_8px_#0003] shrink-0">
                            <img
                              src="assets/imgs/player.png"
                              alt="Spacebug"
                              referrerPolicy="no-referrer"
                              className="relative -left-[2px] top-[6px] w-[50px] grayscale-[0.2] -rotate-[50deg]"
                            />
                          </div>
                          <div>
                            <span className="block text-[0.6rem] leading-none">PYTHON</span>
                            <strong className="text-[1.2rem] leading-tight">SPACEBUG</strong>
                          </div>
                          <sup className="ml-[4px] bg-gradient-to-br from-[#cb218e] to-[#6617cb] rounded-[4px] py-[2px] px-[6px] text-white text-[0.7em]">
                            v1.5.0
                          </sup>
                        </div>

                        {/* app-settings items */}
                        <div className="text-[#2d2d2d] sb-settings-anim mt-1">
                          {[
                            { label: 'Variablen anzeigen', icon: 'assets/svgs/console.svg', action: () => { setShowConsole((p) => !p); setShowSidebarMenu(false); } },
                            { label: 'Link teilen', icon: 'assets/svgs/sharelink.svg', action: () => { setActiveDialog('share'); setShowSidebarMenu(false); } },
                            { label: 'Testfälle erstellen', icon: 'assets/svgs/test.svg', action: () => { setActiveDialog('test'); setShowSidebarMenu(false); } },
                            { label: 'Weltgröße anpassen', icon: 'assets/svgs/grid.svg', action: () => { setActiveDialog('size'); setShowSidebarMenu(false); } },
                            { label: 'Screenshot erstellen', icon: 'assets/svgs/screenshot.svg', action: () => { setActiveDialog('screenshot'); setShowSidebarMenu(false); } },
                            { label: 'Backup öffnen', icon: 'assets/svgs/backup.svg', action: () => { handleOpenBackup(); setShowSidebarMenu(false); } },
                            { label: 'App zurücksetzen', icon: 'assets/svgs/clear.svg', action: () => { handleResetApp(true); } },
                            { label: 'Changelog anzeigen', icon: 'assets/svgs/updates.svg', action: () => { setActiveDialog('changelog'); setShowSidebarMenu(false); } },
                          ].map((item) => (
                            <div
                              key={item.label}
                              onClick={item.action}
                              className="flex items-center p-[8px] cursor-pointer hover:bg-[#f3f5f7] hover:rounded-[8px] transition-colors"
                            >
                              <div className="flex justify-center items-center mr-[10px]">
                                <img
                                  src={item.icon}
                                  alt=""
                                  referrerPolicy="no-referrer"
                                  className="w-[14px]"
                                />
                              </div>
                              <div className="text-[14px]">{item.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Editor Wrapper (.editor-wrapper, width: 480px) */}
                <div className="flex flex-col h-full w-[480px]">
                  <div className="relative flex-1 h-full bg-[#f3f5f7] transition-all duration-200">
                    <PythonEditor
                      ref={editorRef}
                      onMouseDown={() => {
                        if (!debuggerOn) {
                          editorRef.current?.resetHighlightLine();
                        }
                      }}
                      onEditorClick={() => {
                        if (showSidebarMenu) setShowSidebarMenu(false);
                      }}
                    />
                  </div>

                  {/* Console / Variable Table (app-console) */}
                  {showConsole && (
                    <div className="flex justify-center items-center h-fit bg-[#f0f0f0] p-[6px] border-t border-[#e5e5e5]">
                      {debugVariables.filter((v) => v.show).length > 0 && (
                        <table className="min-w-[360px] table-fixed border-collapse text-left text-[#5a5a5a] text-[14px]">
                          <thead className="h-[30px]">
                            <tr>
                              <th className="px-[4px]">Variable</th>
                              <th className="px-[4px]">Wert</th>
                              <th className="px-[4px]">Typ</th>
                              <th className="px-[4px] w-[64px]">Bereich</th>
                              <th />
                            </tr>
                          </thead>
                          <tbody>
                            {debugVariables
                              .filter((v) => v.show)
                              .map((v) => (
                                <tr
                                  key={`${v.scope}-${v.name}`}
                                  className={
                                    v.lineT ? 'line-through italic text-[#d3d3d3]' : ''
                                  }
                                >
                                  <td className="px-[4px] break-words">{v.name}</td>
                                  <td className="px-[4px] break-words">{v.value}</td>
                                  <td className="px-[4px] break-words">{v.type}</td>
                                  <td className="px-[4px] italic">{v.scope}</td>
                                  <td className="px-[4px]">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDebugVariables((prev) =>
                                          prev.map((item) =>
                                            item.name === v.name && item.scope === v.scope
                                              ? { ...item, show: false }
                                              : item
                                          )
                                        )
                                      }
                                      className="w-[30px] h-[30px] rounded-full flex justify-center items-center group"
                                    >
                                      <svg width="8px" height="8px" viewBox="0 0 21 21">
                                        <g
                                          fill="#d3d3d3"
                                          className="group-hover:fill-[#ff0060] transition-colors"
                                        >
                                          <rect
                                            transform="translate(10.9602, 10.9602) rotate(-45) translate(-10.9602, -10.9602)"
                                            x="8.96015511"
                                            y="-2.53984489"
                                            width="4"
                                            height="27"
                                            rx="2"
                                          />
                                          <rect
                                            transform="translate(10.9602, 10.9602) rotate(45) translate(-10.9602, -10.9602)"
                                            x="8.96015511"
                                            y="-2.53984489"
                                            width="4"
                                            height="27"
                                            rx="2"
                                          />
                                        </g>
                                      </svg>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      )}
                      {consoleText && (
                        <div className="whitespace-pre-line max-h-[200px] overflow-y-auto no-scrollbar px-[20px] text-[#5a5a5a] w-full">
                          {consoleText}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Toast Notification (app-toast) with (i) Error Explanation Button */}
                {toast.status && (
                  <div className="absolute w-full bottom-0 flex justify-center z-[2] pointer-events-none">
                    <div
                      onClick={clearToast}
                      className={`pointer-events-auto flex rounded-[8px] shadow-[0_3px_12px_#0006] mb-[60px] w-[78%] max-w-[340px] overflow-hidden cursor-pointer sb-toast-show ${
                        getToastColors(toast.type).body
                      }`}
                    >
                      <div className={`w-[10px] shrink-0 ${getToastColors(toast.type).accent}`} />
                      <div className="w-full h-full">
                        <div className="mt-[10px] mx-[16px] flex items-center justify-between">
                          <span className="text-[14px] font-black text-[#2d2d2d]">
                            {toast.type}
                          </span>
                        </div>
                        <div className="mt-[4px] mx-[16px] mb-[10px] break-words text-[#5a5a5a] text-[12px]">
                          {toast.value}
                        </div>
                      </div>
                      <div
                        className={`flex justify-center items-center pr-[14px] text-[#5a5a5a] font-medium ${
                          getToastColors(toast.type).body
                        }`}
                      >
                        x
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Content Right: Game World Canvas + Dashboard (.content__right) */}
              <div className="relative flex flex-col items-center overflow-hidden bg-[#0a0a0a]">
                {/* app-canvas */}
                <div
                  className="relative overflow-hidden bg-black"
                  style={{ width: `${canvasPixelWidth}px`, height: `${canvasPixelHeight}px` }}
                >
                  <canvas
                    ref={gameCanvasRef}
                    onClick={handleCanvasClick}
                    className="absolute z-[2] cursor-pointer"
                  />
                  <canvas
                    ref={gridCanvasRef}
                    className="absolute z-[1] opacity-50 pointer-events-none"
                  />
                </div>

                {/* app-dashboard */}
                <div className="relative flex flex-col justify-center items-center bg-black rounded-b-[14px] w-full">
                  {/* app-world-icon-bar */}
                  <div className="flex justify-center items-center text-white h-[50px]">
                    {worldArray.length > 0 && !testcasesLoaded && (
                      <button
                        type="button"
                        onClick={handleDeleteCurrentWorld}
                        className="flex justify-center items-center w-[40px] h-[40px] rounded-full text-[#757575] hover:scale-125 transition-transform"
                      >
                        -
                      </button>
                    )}
                    {worldArray.length > 0 && (
                      <div className="flex">
                        {worldArray.map((_, idx) => {
                          const isCurrent = worldArrayIndex === idx && !testResults;
                          const isPass = testResults?.[idx] === true;
                          const isFail = testResults?.[idx] === false;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectWorldIndex(idx)}
                              className="flex justify-center items-center w-[40px] h-[40px] rounded-full hover:scale-125 transition-transform"
                            >
                              <svg
                                width="14px"
                                viewBox="0 0 40 40"
                                stroke={
                                  isPass
                                    ? 'var(--green)'
                                    : isFail
                                    ? 'var(--pink)'
                                    : '#5A5A5A'
                                }
                                strokeWidth="4"
                                fill={
                                  isPass
                                    ? 'var(--green)'
                                    : isFail
                                    ? 'var(--pink)'
                                    : isCurrent
                                    ? '#5a5a5a'
                                    : 'transparent'
                                }
                              >
                                <circle cx="20" cy="20" r="12" />
                              </svg>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {!testcasesLoaded && (
                      <button
                        type="button"
                        onClick={handleAddNewWorld}
                        title="Neue Welt hinzufügen"
                        className="flex justify-center items-center w-[40px] h-[40px] rounded-full text-[#757575] hover:scale-125 transition-transform"
                      >
                        +
                      </button>
                    )}
                  </div>

                  {/* app-editor-icon-bar */}
                  <div
                    className={`relative flex justify-center items-center px-[20px] h-[50px] rounded-[40px] overflow-hidden ${
                      testcasesLoaded ? 'bg-transparent' : 'bg-[#fff3]'
                    }`}
                  >
                    {!testcasesLoaded ? (
                      <>
                        <div className="icons">
                          <button
                            type="button"
                            onClick={() => handleSelectTool('player')}
                            title="Spacebug platzieren / drehen"
                            className={`flex justify-center items-center cursor-pointer border-0 bg-transparent h-[50px] w-[50px] transition-colors hover:bg-white/10 ${
                              selectedToolId === 4 ? 'sb-editor-selected' : ''
                            }`}
                          >
                            <img
                              src="assets/imgs/player.png"
                              alt="Spacebug"
                              width={34}
                              referrerPolicy="no-referrer"
                            />
                          </button>
                        </div>
                        <div className="icons">
                          <button
                            type="button"
                            onClick={() => handleSelectTool('collisionObj')}
                            title="Fels / Asteroid platzieren"
                            className={`flex justify-center items-center cursor-pointer border-0 bg-transparent h-[50px] w-[50px] transition-colors hover:bg-white/10 ${
                              selectedToolId === 5 ? 'sb-editor-selected' : ''
                            }`}
                          >
                            <img
                              src="assets/imgs/asteroid.png"
                              alt="Asteroid"
                              width={34}
                              referrerPolicy="no-referrer"
                            />
                          </button>
                        </div>
                        <div className="icons">
                          <button
                            type="button"
                            onClick={() => handleSelectTool('collectableObj')}
                            title="Power-up platzieren"
                            className={`flex justify-center items-center cursor-pointer border-0 bg-transparent h-[50px] w-[50px] transition-colors hover:bg-white/10 ${
                              selectedToolId === 6 ? 'sb-editor-selected' : ''
                            }`}
                          >
                            <img
                              src="assets/imgs/powerup.png"
                              alt="Powerup"
                              width={20}
                              referrerPolicy="no-referrer"
                            />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center">
                        {!codeValidationRunning ? (
                          <button
                            type="button"
                            onClick={() => handlePlayMenuAction('TEST')}
                            className="flex items-center justify-center h-[30px] rounded-[40px] text-[#aeaeae] py-[4px] px-[10px] text-[0.9em] hover:bg-white/10"
                          >
                            <img
                              src="assets/svgs/run-tests.svg"
                              alt=""
                              referrerPolicy="no-referrer"
                              className="h-[20px] mr-[10px]"
                            />
                            Run Tests
                          </button>
                        ) : (
                          <div className="flex items-center gap-[8px]">
                            <span
                              className="w-[10px] h-[10px] bg-[#979797] rounded-full"
                              style={{ animation: 'sb-dot-pulse 1.2s infinite ease-in-out 0s' }}
                            />
                            <span
                              className="w-[10px] h-[10px] bg-[#979797] rounded-full"
                              style={{ animation: 'sb-dot-pulse 1.2s infinite ease-in-out 0.2s' }}
                            />
                            <span
                              className="w-[10px] h-[10px] bg-[#979797] rounded-full"
                              style={{ animation: 'sb-dot-pulse 1.2s infinite ease-in-out 0.4s' }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* app-start-icon-bar */}
                  <div className="flex items-center">
                    {/* Left controls: Debug & Reset */}
                    <div className="flex">
                      {showPlayMenu && (
                        <button
                          type="button"
                          onClick={() => handlePlayMenuAction('DEBUG')}
                          title="Debugger (Schritt für Schritt)"
                          className="flex justify-center items-center rounded-full h-[46px] w-[46px] mx-[2px] text-[#535353]"
                        >
                          <DebugButtonIcon active={debuggerOn} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handlePlayMenuAction('RESET')}
                        title="Welt zurücksetzen"
                        className="flex justify-center items-center rounded-full h-[46px] w-[46px] mx-[2px] text-[#535353]"
                      >
                        <ResetButtonIcon />
                      </button>
                    </div>

                    {/* Center Start / Play button */}
                    <div>
                      <button
                        type="button"
                        onClick={handlePlay}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowPlayMenu((prev) => !prev);
                        }}
                        title="Programm starten / stoppen"
                        className="flex justify-center items-center rounded-full h-[70px] w-[70px]"
                      >
                        <StartButtonIcon active={animationActive || debuggerOn} />
                      </button>
                    </div>

                    {/* Right controls: Delete & Speed */}
                    <div className="flex">
                      <button
                        type="button"
                        onClick={() => handlePlayMenuAction('DELETE')}
                        title="Welt leeren"
                        className="flex justify-center items-center rounded-full h-[46px] w-[46px] mx-[2px] text-[#535353]"
                      >
                        <DeleteButtonIcon />
                      </button>
                      {showPlayMenu && (
                        <button
                          type="button"
                          onClick={() => handlePlayMenuAction('SPEED')}
                          title="Geschwindigkeit ändern"
                          className="flex justify-center items-center rounded-full h-[46px] w-[46px] mx-[2px] text-[#535353]"
                        >
                          <SpeedButtonIcon speed={speedIndex} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Original Impressum Link below Spacebug window */}
          <p
            onClick={() => setShowImpressum((prev) => !prev)}
            className="cursor-pointer text-[#9f9f9f] text-[0.9rem] mt-2.5 mb-0 hover:text-[#5a5a5a] transition-colors"
          >
            Impressum
          </p>
        </div>
      </div>

      {/* Original Impressum Modal */}
      {showImpressum && (
        <div
          onClick={() => setShowImpressum(false)}
          className="fixed inset-0 z-[1000] bg-black/20 flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center justify-center p-[30px] w-[520px] rounded-[12px] shadow-[4px_4px_15px_rgba(0,0,0,0.2)] border border-[#e0e0e0] bg-[#fbfbfb] text-[#5a5a5a] text-center"
          >
            <h2 className="text-[20px] font-bold text-[#2d2d2d] mt-0 mb-3">Impressum</h2>
            <div>Python SPACEBUG ist ein Projekt der Universität Trier.</div>
            <p className="my-3 leading-relaxed">
              <em>Inhaltlich verantwortlich:</em>
              <br />
              Universität Trier
              <br />
              FB IV - Abteilung Informatikwissenschaften
              <br />
              Universitätsring 15
              <br />
              54296 Trier.
            </p>
            <p className="mb-4 leading-relaxed">
              Es gilt das Impressum der Universität Trier:
              <br />
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.uni-trier.de/impressum"
                className="text-[#0079ff] hover:underline"
              >
                https://www.uni-trier.de/impressum
              </a>
            </p>
            <button
              type="button"
              onClick={() => setShowImpressum(false)}
              className="w-full bg-[#f3f5f7] rounded-[6px] py-[8px] px-[10px] text-[#5a5a5a] hover:bg-[#e8ecef] transition-colors"
            >
              Impressum schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
