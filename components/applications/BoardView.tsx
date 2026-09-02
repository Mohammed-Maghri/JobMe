"use client";

import { useState } from "react";
import type { DragEvent } from "react";
import { Plus } from "lucide-react";
import {
  BOARD_STATUSES,
  STATUS_COLORS,
  STATUS_LABELS,
  type ApplicationStatusValue,
} from "@/lib/applications/constants";
import type { ApplicationRecord } from "@/lib/applications/queries";
import ApplicationCard from "./ApplicationCard";

type Props = {
  applications: ApplicationRecord[];
  pendingIds: ReadonlySet<string>;
  onOpen: (id: string) => void;
  onStatusChange: (id: string, status: ApplicationStatusValue) => void;
  onAdd: (status: ApplicationStatusValue) => void;
};

const DRAG_TYPE = "application/x-applypilot-id";

/**
 * Kanban board.
 *
 * Only this element scrolls horizontally — the page itself never does. Dragging
 * uses the platform's own HTML5 API rather than a library; the per-card status
 * dropdown covers keyboard and touch, so no interaction depends on a drag.
 */
export default function BoardView({
  applications,
  pendingIds,
  onOpen,
  onStatusChange,
  onAdd,
}: Props) {
  const [dropTarget, setDropTarget] = useState<ApplicationStatusValue | null>(null);

  const handleDragStart = (event: DragEvent<HTMLDivElement>, id: string) => {
    event.dataTransfer.setData(DRAG_TYPE, id);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
    status: ApplicationStatusValue,
  ) => {
    event.preventDefault();
    setDropTarget(null);
    const id = event.dataTransfer.getData(DRAG_TYPE);
    if (id) onStatusChange(id, status);
  };

  return (
    <div
      className="-mx-5 overflow-x-auto overscroll-x-contain px-5 pb-2 sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10"
      role="region"
      aria-label="Application board"
      tabIndex={0}
    >
      {/*
        Below `xl` the columns keep a fixed width and the row scrolls. From
        `xl` they share the available width so all five fit without scrolling,
        which is how the board is meant to read on a desktop.
      */}
      <ul className="flex min-w-max gap-4 xl:min-w-0">
        {BOARD_STATUSES.map((status) => {
          const items = applications.filter((app) => app.status === status);
          const isTarget = dropTarget === status;
          return (
            <li
              key={status}
              className="w-[17.5rem] shrink-0 sm:w-[18.5rem] xl:w-auto xl:min-w-0 xl:flex-1"
            >
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setDropTarget(status);
                }}
                onDragLeave={() => setDropTarget((c) => (c === status ? null : c))}
                onDrop={(event) => handleDrop(event, status)}
                className={`flex h-full flex-col rounded-[10px] border-2 bg-surface transition-colors ${
                  isTarget ? "border-plum bg-plum/5" : "border-line"
                }`}
              >
                <div
                  className={`flex items-center gap-2 border-b-2 px-3 py-2.5 ${STATUS_COLORS[status].border} ${STATUS_COLORS[status].tint}`}
                >
                  <span
                    aria-hidden="true"
                    className={`size-2.5 shrink-0 rounded-full ${STATUS_COLORS[status].fill}`}
                  />
                  <h3
                    className={`font-display text-[0.9375rem] font-bold ${STATUS_COLORS[status].text}`}
                  >
                    {STATUS_LABELS[status]}
                  </h3>
                  <span
                    className={`pixel-notch-sm inline-flex min-w-6 items-center justify-center border-2 bg-surface px-1.5 py-0.5 font-display text-[0.75rem] font-bold tabular-nums ${STATUS_COLORS[status].border} ${STATUS_COLORS[status].text}`}
                  >
                    {items.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => onAdd(status)}
                    aria-label={`Add application to ${STATUS_LABELS[status]}`}
                    className="ml-auto inline-flex size-11 items-center justify-center rounded-[4px] text-espresso/55 transition-colors hover:bg-surface hover:text-plum"
                  >
                    <Plus size={17} strokeWidth={2.4} aria-hidden="true" />
                  </button>
                </div>

                <div className="flex flex-1 flex-col gap-2.5 p-2.5">
                  {items.length === 0 ? (
                    <p className="rounded-[8px] border-2 border-dashed border-line px-3 py-6 text-center text-[0.8125rem] text-espresso/50">
                      Nothing here yet.
                    </p>
                  ) : (
                    items.map((application) => (
                      <ApplicationCard
                        key={application.id}
                        application={application}
                        pending={pendingIds.has(application.id)}
                        onOpen={onOpen}
                        onStatusChange={onStatusChange}
                        onDragStart={handleDragStart}
                      />
                    ))
                  )}

                  <button
                    type="button"
                    onClick={() => onAdd(status)}
                    className="mt-auto inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[6px] border-2 border-dashed border-line font-display text-[0.875rem] font-bold text-espresso/65 transition-colors hover:border-plum/45 hover:text-plum"
                  >
                    <Plus size={15} strokeWidth={2.4} aria-hidden="true" />
                    Add application
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
