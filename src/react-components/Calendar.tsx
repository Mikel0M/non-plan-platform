import React from "react";
import { usersManagerInstance } from '../classes/UsersManager';

interface ToDO {
    id: string;
    title: string;
    startDate?: string;
    dueDate?: string;
    completed: boolean;
    projectId?: string;
    color?: string;
    assignedTo?: string;
    projectName?: string;
    rawToDo?: any;
}

interface CalendarProps {
    tasks: ToDO[];
    start: string;
    end: string;
    onEditTask?: (task: ToDO) => void;
}

function getDaysArray(start: Date, end: Date) {
    const arr: Date[] = [];
    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        arr.push(new Date(dt));
    }
    return arr;
}

export const Calendar: React.FC<CalendarProps> = ({ tasks, start, end, onEditTask }) => {
    // Calculate extended date range (1 year before and after)
    const today = new Date();
    const extendedStart = new Date(today);
    extendedStart.setFullYear(today.getFullYear() - 1);
    const extendedEnd = new Date(today);
    extendedEnd.setFullYear(today.getFullYear() + 1);
    // Use the wider range for the calendar
    const startDate = new Date(start);
    const endDate = new Date(end);
    const calendarStart = extendedStart < startDate ? extendedStart : startDate;
    const calendarEnd = extendedEnd > endDate ? extendedEnd : endDate;
    const days = getDaysArray(calendarStart, calendarEnd);

    // Helper function to get the offset and width for a task bar
    const getBarStyle = (task: ToDO) => {
        if (!task.startDate || !task.dueDate) return {};
        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(task.dueDate);
        const offset = Math.floor((taskStart.getTime() - calendarStart.getTime()) / (1000 * 3600 * 24));
        const width = Math.floor((taskEnd.getTime() - taskStart.getTime()) / (1000 * 3600 * 24)) + 1;
        return {
            gridColumnStart: offset + 1,
            gridColumnEnd: offset + width + 1,
            background: task.completed ? "var(--color-success)" : "var(--color-complementary)",
            color: "var(--primary)",
            borderRadius: 4,
            padding: "2px 8px",
            margin: "2px 0"
        };
    };

    // Group days by month and year for header
    const monthYearLabels: { label: string; span: number }[] = [];
    let lastMonth = -1, lastYear = -1, currentSpan = 0;
    days.forEach((d, i) => {
        const month = d.getMonth();
        const year = d.getFullYear();
        if (month !== lastMonth || year !== lastYear) {
            if (currentSpan > 0) {
                // Use lastMonth/lastYear for correct label
                monthYearLabels.push({ label: `${new Date(lastYear, lastMonth).toLocaleString('default', { month: 'short' })} ${lastYear}`, span: currentSpan });
            }
            lastMonth = month;
            lastYear = year;
            currentSpan = 1;
        } else {
            currentSpan++;
        }
        if (i === days.length - 1) {
            monthYearLabels.push({ label: `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`, span: currentSpan });
        }
    });

    // --- Sticky header logic ---
    // We'll use a horizontally scrollable wrapper for both header and grid, and make the header sticky at the top.
    // Add refs for vertical scroll sync
    const leftColRef = React.useRef<HTMLDivElement>(null);
    const gridRef = React.useRef<HTMLDivElement>(null);
    // Scroll to today on mount or when days change
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    // Prevent infinite scroll loop
    const isSyncingScroll = React.useRef(false);

    // Sync vertical scroll between left column and grid
    const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (isSyncingScroll.current) return;
        isSyncingScroll.current = true;
        if (e.target === leftColRef.current && gridRef.current) {
            gridRef.current.scrollTop = (e.target as HTMLDivElement).scrollTop;
        } else if (e.target === gridRef.current && leftColRef.current) {
            leftColRef.current.scrollTop = (e.target as HTMLDivElement).scrollTop;
        }
        setTimeout(() => { isSyncingScroll.current = false; }, 0);
    };

    // Get unique task titles for the left column
    const taskTitles = tasks.length > 0 ? tasks.map(task => task.title) : ['No tasks'];
    const rowHeight = 32;
    const rowGap = 5;
    const colWidth = 40;

    // Helper to get user name from id
    const getUserName = (userId?: string) => {
        if (!userId) return '';
        const user = usersManagerInstance.getUsers().find(u => u.id === userId);
        return user ? `${user.name} ${user.surname}` : '';
    };

    // Track hovered task index and tooltip position
    const [hoveredTaskIdx, setHoveredTaskIdx] = React.useState<number | null>(null);
    const [tooltip, setTooltip] = React.useState<{ idx: number, x: number, y: number } | null>(null);

    // Tooltip width for clamping
    const tooltipWidth = 220;

    // Helper to get tooltip content as JSX
    const getTooltipJSX = (task: ToDO) => {
        const responsible = getUserName(task.assignedTo);
        return (
            <div style={{ padding: 8, background: 'var(--background-100)', color: 'var(--primary)', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', border: `1px solid var(--primary)`, minWidth: 180 }}>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>{task.projectName}</div>
                <div style={{ fontWeight: 500 }}>{task.title}</div>
                {responsible && <div style={{ fontSize: 13, color: 'var(--primary)' }}>{responsible}</div>}
            </div>
        );
    };

    React.useEffect(() => {
        if (!scrollContainerRef.current) return;
        const today = new Date();
        const todayIdx = days.findIndex(d =>
            d.getFullYear() === today.getFullYear() &&
            d.getMonth() === today.getMonth() &&
            d.getDate() === today.getDate()
        );
        if (todayIdx > -1) {
            const cellWidth = colWidth;
            const containerWidth = scrollContainerRef.current.clientWidth;
            const scrollTo = cellWidth * todayIdx - containerWidth / 2 + cellWidth / 2;
            scrollContainerRef.current.scrollLeft = Math.max(0, scrollTo);
        }
    }, [days.length]);

    // Ensure both left column and grid always have the same scroll height and scroll together
    React.useEffect(() => {
        if (!leftColRef.current || !gridRef.current) return;
        leftColRef.current.scrollTop = gridRef.current.scrollTop;
    }, [tasks.length]);

    return (
        <div className="dashboardCard calendar-fixed-size" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Sticky header for both columns */}
            <div style={{ display: 'flex', position: 'sticky', top: 0, zIndex: 3, background: 'var(--background-100)' }}>
                <div style={{ width: 200, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: days.length * colWidth }}>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${days.length}, ${colWidth}px)`, minWidth: days.length * colWidth }}>
                        {monthYearLabels.map((m, i) => (
                            <div key={i} style={{ textAlign: "center", fontWeight: 600, fontSize: 14, gridColumn: `span ${m.span}`, minHeight: rowHeight, maxHeight: rowHeight, borderBottom: '1px solid #ccc', background: 'var(--background-100)' }}>{m.label}</div>
                        ))}
                        {days.map((d, i) => (
                            <div key={i} style={{ textAlign: "center", fontSize: 12, minHeight: rowHeight, maxHeight: rowHeight, borderBottom: '1px solid #ccc', background: 'var(--background-100)' }}>{d.getDate()}</div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Scrollable area for both left column and grid */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', height: '100%', overflow: 'auto' }} ref={scrollContainerRef}>
                {/* Fixed left column for task names */}
                <div
                    style={{
                        width: 200,
                        flexShrink: 0,
                        background: 'var(--background-100)',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        position: 'sticky',
                        left: 0,
                        zIndex: 10, // Increase zIndex to ensure buttons are above grid lines
                    }}
                >
                    <div id="taskNamesScroller" style={{ height: '100%' }}>
                        {taskTitles.map((title, idx) => (
                            <button
                                key={idx}
                                className="calendar-task-title-btn"
                                data-project-color
                                style={{
                                    marginBottom: rowGap,
                                    padding: '8px 12px',
                                    border: hoveredTaskIdx === idx ? '1px solid var(--primary)' : `2px solid ${tasks[idx]?.color || 'var(--primary)'}`,
                                    color: hoveredTaskIdx === idx ? 'var(--background-100)' : '#fff',
                                    fontWeight: 500,
                                    minHeight: rowHeight,
                                    maxHeight: rowHeight,
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    boxSizing: 'border-box',
                                    background: hoveredTaskIdx === idx ? (tasks[idx]?.color || 'var(--primary)') : 'var(--background-100)',
                                    borderRadius: 16,
                                    transition: 'background 0.2s, color 0.2s, border 0.2s',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    '--project-color': tasks[idx]?.color || 'var(--primary)'
                                } as React.CSSProperties}
                                onClick={() => onEditTask && tasks[idx] && onEditTask(tasks[idx])}
                                onMouseEnter={e => {
                                    setHoveredTaskIdx(idx);
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setTooltip({ idx, x: rect.right + 8, y: rect.top });
                                }}
                                onMouseLeave={() => {
                                    setHoveredTaskIdx(null);
                                    setTooltip(null);
                                }}
                            >{title}</button>
                        ))}
                    </div>
                </div>
                {/* Gantt grid */}
                <div style={{ flex: 1, minWidth: days.length * colWidth, height: '100%' }}>
                    <div
                        ref={gridRef}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${days.length}, ${colWidth}px)`,
                            gridTemplateRows: `repeat(${taskTitles.length}, ${rowHeight}px)`,
                            rowGap: rowGap,
                            minWidth: days.length * colWidth,
                            width: days.length * colWidth,
                            minHeight: taskTitles.length * (rowHeight + rowGap),
                            borderLeft: 'none',
                            borderTop: 'none',
                            borderBottom: '1px solid #ccc',
                            borderRight: '1px solid #ccc',
                            position: 'relative',
                        }}
                    >
                        {/* Render grid cells */}
                        {taskTitles.map((_, rowIdx) =>
                            days.map((_, colIdx) => (
                                <div
                                    key={`cell-${rowIdx}-${colIdx}`}
                                    className="calendar-grid-cell"
                                    style={{
                                        borderRight: '1px solid #444',
                                        minHeight: rowHeight,
                                        maxHeight: rowHeight,
                                        minWidth: colWidth,
                                        maxWidth: colWidth,
                                        boxSizing: 'border-box',
                                        background: 'transparent',
                                    }}
                                />
                            ))
                        )}
                        {/* Task bars as colored lines */}
                        {tasks.map((task, rowIdx) => {
                            // Bar for tasks with both start and due date
                            if (task.startDate && task.dueDate) {
                                const taskStart = new Date(task.startDate);
                                const taskEnd = new Date(task.dueDate);
                                const offset = Math.floor((taskStart.getTime() - calendarStart.getTime()) / (1000 * 3600 * 24));
                                const width = Math.floor((taskEnd.getTime() - taskStart.getTime()) / (1000 * 3600 * 24)) + 1;
                                return (
                                    <div
                                        key={task.id}
                                        className="calendar-task-bar"
                                        style={{
                                            gridRow: rowIdx + 1,
                                            gridColumn: `${offset + 1} / span ${width}`,
                                            background: task.color || (task.completed ? 'var(--green)' : 'var(--primary-100)'),
                                            borderRadius: 4,
                                            height: 10,
                                            marginTop: 10,
                                            marginBottom: 10,
                                            zIndex: 2,
                                            position: 'relative',
                                            transition: 'border 0.2s',
                                            border: hoveredTaskIdx === rowIdx ? '1px solid var(--primary)' : undefined,
                                        }}
                                        onMouseEnter={e => {
                                            setHoveredTaskIdx(rowIdx);
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setTooltip({ idx: rowIdx, x: rect.right + 8, y: rect.top });
                                        }}
                                        onMouseLeave={() => {
                                            setHoveredTaskIdx(null);
                                            setTooltip(null);
                                        }}
                                        onClick={() => onEditTask && tasks[rowIdx] && onEditTask(tasks[rowIdx])}
                                    />
                                );
                            }
                            // Dot for tasks with only due date
                            if (!task.startDate && task.dueDate) {
                                const due = new Date(task.dueDate);
                                const offset = Math.floor((due.getTime() - calendarStart.getTime()) / (1000 * 3600 * 24));
                                return (
                                    <div
                                        key={task.id}
                                        style={{
                                            gridRow: rowIdx + 1,
                                            gridColumn: offset + 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: rowHeight,
                                            zIndex: 3,
                                        }}
                                        onMouseEnter={e => {
                                            setHoveredTaskIdx(rowIdx);
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setTooltip({ idx: rowIdx, x: rect.right + 8, y: rect.top });
                                        }}
                                        onMouseLeave={() => {
                                            setHoveredTaskIdx(null);
                                            setTooltip(null);
                                        }}
                                    >
                                        <span
                                            className="calendar-task-dot"
                                            style={{
                                                display: 'inline-block',
                                                width: 14,
                                                height: 14,
                                                borderRadius: '50%',
                                                background: task.color || 'var(--primary-100)',
                                                transition: 'border 0.2s',
                                                border: hoveredTaskIdx === rowIdx ? '1px solid var(--primary)' : '',
                                            }}
                                            onClick={() => onEditTask && tasks[rowIdx] && onEditTask(tasks[rowIdx])}
                                        />
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>
            </div>
            {/* Tooltip rendering */}
            {tooltip && tasks[tooltip.idx] && (
                <div style={{
                    position: 'fixed',
                    left: Math.min(tooltip.x, window.innerWidth - tooltipWidth - 8),
                    top: tooltip.y,
                    pointerEvents: 'none',
                    zIndex: 9999,
                    width: tooltipWidth
                }}>
                    {getTooltipJSX(tasks[tooltip.idx])}
                </div>
            )}
        </div>
    );
};