import React, { useState, useEffect } from 'react';
import { ChevronDown, ZoomIn, X, ArrowRight, Play } from 'lucide-react';
import { TASKS, TaskItem } from '../data/spacebugConfig';

interface TaskSidebarProps {
  height: number;
  activeTaskId: number;
  onSelectTask?: (task: TaskItem) => void;
  onLoadTaskWorld?: (task: TaskItem) => void;
}

interface ZoomedImageState {
  task: TaskItem;
  activeTab: 'vorher' | 'nachher' | 'both';
}

export const TaskSidebar: React.FC<TaskSidebarProps> = ({
  height,
  onSelectTask,
  onLoadTaskWorld,
}) => {
  const [openTaskId, setOpenTaskId] = useState<number | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [zoomedState, setZoomedState] = useState<ZoomedImageState | null>(null);

  const toggleTask = (task: TaskItem) => {
    const nextOpen = openTaskId === task.id ? null : task.id;
    setOpenTaskId(nextOpen);
    if (nextOpen !== null && onSelectTask) {
      onSelectTask(task);
    }
  };

  const handleImageError = (key: string) => {
    setBrokenImages((prev) => ({ ...prev, [key]: true }));
  };

  // Close zoom modal on Escape key
  useEffect(() => {
    if (!zoomedState) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setZoomedState(null);
      } else if (e.key === 'ArrowLeft') {
        setZoomedState((prev) => (prev ? { ...prev, activeTab: 'vorher' } : null));
      } else if (e.key === 'ArrowRight') {
        setZoomedState((prev) => (prev ? { ...prev, activeTab: 'nachher' } : null));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomedState]);

  const renderWorldThumbnail = (
    task: TaskItem,
    url: string,
    key: string,
    label: string,
    tab: 'vorher' | 'nachher'
  ) => {
    const isBroken = brokenImages[key];
    return (
      <button
        type="button"
        onClick={() => setZoomedState({ task, activeTab: tab })}
        title={`${label} vergrößern`}
        className="group relative flex flex-col items-center bg-[#f3f5f7] hover:bg-[#e8edf2] rounded-[8px] border border-[#e0e4e9] hover:border-[#b8c4d0] p-1.5 transition-all cursor-zoom-in text-left w-full overflow-hidden"
      >
        <div className="relative w-full h-[104px] rounded-[6px] bg-black flex items-center justify-center overflow-hidden">
          {!isBroken ? (
            <img
              src={url}
              alt={`${task.title} – ${label}`}
              referrerPolicy="no-referrer"
              onError={() => handleImageError(key)}
              className="max-w-full max-h-full object-contain transition-transform duration-200 group-hover:scale-105 select-none"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#9f9f9f] text-xs">
              <span>{label}</span>
            </div>
          )}

          {/* Subtle Zoom-In badge on hover */}
          <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-[6px] bg-black/65 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
            <ZoomIn className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-1.5 flex items-center justify-between w-full px-1">
          <span className="text-[11px] font-semibold text-[#3d3d3d]">{label}</span>
          <span className="text-[10px] text-[#8a8a8a] group-hover:text-[#0079ff] transition-colors">
            Vergrößern
          </span>
        </div>
      </button>
    );
  };

  return (
    <>
      <aside
        style={{ height: `${height}px` }}
        className="w-[360px] xl:w-[390px] shrink-0 bg-[#fbfbfb] rounded-[14px] shadow-[4px_4px_10px_#00000040] flex flex-col overflow-hidden select-none"
      >
        {/* Clean Header without "Aufgabe 1 - 15" text */}
        <div className="px-4 py-2.5 border-b border-[#e8e9ed] bg-[#fbfbfb] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-[32px] h-[32px] rounded-[8px] bg-[#f3f5f7] shadow-[2px_2px_8px_#0003] flex items-center justify-center overflow-hidden shrink-0">
              <img
                src="assets/imgs/player.png"
                alt="Spacebug"
                referrerPolicy="no-referrer"
                className="w-[44px] relative -left-[2px] top-[5px] -rotate-[50deg] grayscale-[0.2]"
              />
            </div>
            <div>
              <span className="block text-[9.5px] tracking-wider text-[#5a5a5a] leading-none">
                PYTHON SPACEBUG
              </span>
              <strong className="text-[16.5px] font-bold text-[#2d2d2d] leading-tight">
                Aufgaben
              </strong>
            </div>
          </div>
        </div>

        {/* Task List sized so all 15 tasks fill the column cleanly */}
        <div className="flex-1 overflow-y-auto thin-scrollbar px-3 py-2 space-y-1">
          {TASKS.map((task: TaskItem) => {
            const isOpen = openTaskId === task.id;
            return (
              <div
                key={task.id}
                className={`rounded-[8px] border transition-colors duration-150 overflow-hidden ${
                  isOpen
                    ? 'border-[#cfcfd6] bg-[#fbfbfb] shadow-[0_2px_6px_rgba(0,0,0,0.04)]'
                    : 'border-[#e8e9ed] bg-[#f3f5f7] hover:bg-[#ebeff3]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleTask(task)}
                  aria-expanded={isOpen}
                  className="w-full px-3 py-1.5 min-h-[34px] flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-[6px] flex items-center justify-center text-[12px] font-bold tabular-nums transition-colors shrink-0 ${
                        isOpen
                          ? 'bg-[#00dfa2] text-white'
                          : 'bg-[#fbfbfb] text-[#5a5a5a] border border-[#e0e0e0]'
                      }`}
                    >
                      {task.id}
                    </span>
                    <div className="min-w-0">
                      <span className="block font-semibold text-[13.5px] text-[#2d2d2d] truncate">
                        {task.shortTitle}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-[4px] font-medium hidden sm:inline-block bg-[#eceff3] text-[#6a6a6a]">
                      {task.category}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#5a5a5a] shrink-0 transition-transform duration-150 ${
                        isOpen ? 'rotate-180 text-[#2d2d2d]' : ''
                      }`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-3.5 pb-3.5 pt-2 border-t border-[#e8e9ed] bg-[#fbfbfb]">
                    {/* Short task description */}
                    <p className="text-[13px] leading-[1.48] text-[#4a4a4a] mb-3 select-text">
                      {task.introText}
                    </p>

                    {/* Two small clickable images: Startwelt (vorher) & Endposition (nachher) */}
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
                      {renderWorldThumbnail(
                        task,
                        task.image1Url,
                        `${task.id}-vorher`,
                        'Startwelt',
                        'vorher'
                      )}

                      <div className="flex flex-col items-center justify-center text-[#9f9f9f] px-0.5">
                        <ArrowRight className="w-4 h-4" />
                      </div>

                      {renderWorldThumbnail(
                        task,
                        task.image2Url,
                        `${task.id}-nachher`,
                        'Endposition',
                        'nachher'
                      )}
                    </div>

                    {/* Action button: Startwelt laden */}
                    {onLoadTaskWorld && (
                      <div className="mt-2.5">
                        <button
                          type="button"
                          onClick={() => onLoadTaskWorld(task)}
                          className="w-full py-1.5 px-2.5 rounded-[6px] bg-[#f3f5f7] hover:bg-[#e5f1ff] text-[#4a4a4a] hover:text-[#0079ff] border border-[#e2e5ea] hover:border-[#b8d8ff] text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                          <span className="truncate">Startwelt laden</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Lightbox Modal for Enlarging Startwelt / Endposition Images */}
      {zoomedState && (
        <div
          onClick={() => setZoomedState(null)}
          className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-6 select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#fbfbfb] rounded-[14px] shadow-[0_12px_36px_rgba(0,0,0,0.35)] border border-[#e0e0e0] max-w-[920px] w-full overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-[#e8e9ed] flex items-center justify-between bg-[#fbfbfb]">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0079ff]">
                  {zoomedState.task.category}
                </span>
                <h3 className="text-[17px] font-bold text-[#2d2d2d] leading-snug">
                  {zoomedState.task.shortTitle}
                </h3>
              </div>

              {/* View Mode Switcher: Startwelt | Endposition | Beide */}
              <div className="flex items-center gap-2">
                <div className="flex bg-[#f3f5f7] p-1 rounded-[8px] border border-[#e2e5ea]">
                  <button
                    type="button"
                    onClick={() => setZoomedState({ ...zoomedState, activeTab: 'vorher' })}
                    className={`px-3 py-1 rounded-[6px] text-[12px] font-semibold transition-colors cursor-pointer ${
                      zoomedState.activeTab === 'vorher'
                        ? 'bg-white text-[#2d2d2d] shadow-xs'
                        : 'text-[#6a6a6a] hover:text-[#2d2d2d]'
                    }`}
                  >
                    Startwelt
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomedState({ ...zoomedState, activeTab: 'nachher' })}
                    className={`px-3 py-1 rounded-[6px] text-[12px] font-semibold transition-colors cursor-pointer ${
                      zoomedState.activeTab === 'nachher'
                        ? 'bg-white text-[#2d2d2d] shadow-xs'
                        : 'text-[#6a6a6a] hover:text-[#2d2d2d]'
                    }`}
                  >
                    Endposition
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomedState({ ...zoomedState, activeTab: 'both' })}
                    className={`px-3 py-1 rounded-[6px] text-[12px] font-semibold transition-colors cursor-pointer ${
                      zoomedState.activeTab === 'both'
                        ? 'bg-white text-[#2d2d2d] shadow-xs'
                        : 'text-[#6a6a6a] hover:text-[#2d2d2d]'
                    }`}
                  >
                    Vergleich
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setZoomedState(null)}
                  title="Schließen (Esc)"
                  className="w-8 h-8 rounded-[8px] bg-[#f3f5f7] hover:bg-[#ffe5ef] text-[#5a5a5a] hover:text-[#ff0060] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Task description inside modal */}
            <div className="px-5 py-3 bg-[#f3f5f7] border-b border-[#e8e9ed] text-[13.5px] text-[#4a4a4a]">
              {zoomedState.task.introText}
            </div>

            {/* Enlarged Image(s) Content */}
            <div className="p-6 bg-[#141619] flex items-center justify-center min-h-[380px] max-h-[72vh] overflow-auto">
              {zoomedState.activeTab === 'vorher' && (
                <div className="flex flex-col items-center">
                  <img
                    src={zoomedState.task.image1Url}
                    alt={`${zoomedState.task.shortTitle} – Startwelt`}
                    referrerPolicy="no-referrer"
                    className="max-h-[58vh] w-auto object-contain rounded-[8px] border border-white/15 shadow-lg"
                  />
                  <span className="mt-3 text-[13px] font-semibold text-white/90 bg-white/10 px-3 py-1 rounded-[6px]">
                    Startwelt (Vorher)
                  </span>
                </div>
              )}

              {zoomedState.activeTab === 'nachher' && (
                <div className="flex flex-col items-center">
                  <img
                    src={zoomedState.task.image2Url}
                    alt={`${zoomedState.task.shortTitle} – Endposition`}
                    referrerPolicy="no-referrer"
                    className="max-h-[58vh] w-auto object-contain rounded-[8px] border border-white/15 shadow-lg"
                  />
                  <span className="mt-3 text-[13px] font-semibold text-white/90 bg-white/10 px-3 py-1 rounded-[6px]">
                    Endposition (Nachher)
                  </span>
                </div>
              )}

              {zoomedState.activeTab === 'both' && (
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 w-full">
                  <div className="flex flex-col items-center">
                    <img
                      src={zoomedState.task.image1Url}
                      alt={`${zoomedState.task.shortTitle} – Startwelt`}
                      referrerPolicy="no-referrer"
                      className="max-h-[52vh] w-auto object-contain rounded-[8px] border border-white/15 shadow-lg"
                    />
                    <span className="mt-2.5 text-[12px] font-semibold text-white/90 bg-white/10 px-3 py-1 rounded-[6px]">
                      Startwelt (Vorher)
                    </span>
                  </div>

                  <div className="hidden md:flex items-center justify-center text-white/50">
                    <ArrowRight className="w-6 h-6" />
                  </div>

                  <div className="flex flex-col items-center">
                    <img
                      src={zoomedState.task.image2Url}
                      alt={`${zoomedState.task.shortTitle} – Endposition`}
                      referrerPolicy="no-referrer"
                      className="max-h-[52vh] w-auto object-contain rounded-[8px] border border-white/15 shadow-lg"
                    />
                    <span className="mt-2.5 text-[12px] font-semibold text-white/90 bg-white/10 px-3 py-1 rounded-[6px]">
                      Endposition (Nachher)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-[#fbfbfb] border-t border-[#e8e9ed] flex items-center justify-between">
              <span className="text-[12px] text-[#7a7a7a]">
                Tipp: Mit den Pfeiltasten ← / → zwischen Startwelt und Endposition wechseln
              </span>
              <div className="flex items-center gap-2">
                {onLoadTaskWorld && (
                  <button
                    type="button"
                    onClick={() => {
                      onLoadTaskWorld(zoomedState.task);
                      setZoomedState(null);
                    }}
                    className="px-3.5 py-1.5 rounded-[6px] bg-[#f3f5f7] hover:bg-[#e5f1ff] text-[#4a4a4a] hover:text-[#0079ff] border border-[#e2e5ea] text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Startwelt laden</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setZoomedState(null)}
                  className="px-3.5 py-1.5 rounded-[6px] bg-[#f3f5f7] hover:bg-[#e5e8ec] text-[#4a4a4a] text-[12.5px] font-medium transition-colors cursor-pointer"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
