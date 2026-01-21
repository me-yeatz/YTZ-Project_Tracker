import { useMemo } from 'react';
import { Project } from '../types';
import { Calendar, Clock, TrendingUp } from 'lucide-react';

interface GanttChartProps {
    projects: Project[];
}

export default function GanttChart({ projects }: GanttChartProps) {
    // Calculate date range for the chart
    const { minDate, maxDate, totalDays } = useMemo(() => {
        const dates = projects.flatMap(p => [
            new Date(p.startDate),
            p.targetCompletionDate ? new Date(p.targetCompletionDate) : new Date(),
            p.actualCompletionDate ? new Date(p.actualCompletionDate) : new Date()
        ]);

        const min = new Date(Math.min(...dates.map(d => d.getTime())));
        const max = new Date(Math.max(...dates.map(d => d.getTime())));

        // Add padding
        min.setDate(min.getDate() - 7);
        max.setDate(max.getDate() + 7);

        const diffTime = Math.abs(max.getTime() - min.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return { minDate: min, maxDate: max, totalDays: diffDays };
    }, [projects]);

    // Generate month markers
    const monthMarkers = useMemo(() => {
        const markers: { date: Date; label: string; position: number }[] = [];
        const current = new Date(minDate);
        current.setDate(1); // Start of month

        while (current <= maxDate) {
            const daysSinceStart = Math.floor((current.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
            const position = (daysSinceStart / totalDays) * 100;

            markers.push({
                date: new Date(current),
                label: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                position
            });

            current.setMonth(current.getMonth() + 1);
        }

        return markers;
    }, [minDate, maxDate, totalDays]);

    // Calculate project bar position and width
    const getProjectBar = (project: Project) => {
        const start = new Date(project.startDate);
        const end = project.targetCompletionDate
            ? new Date(project.targetCompletionDate)
            : new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000); // Default 90 days

        const startDays = Math.floor((start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
        const endDays = Math.floor((end.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));

        const left = (startDays / totalDays) * 100;
        const width = ((endDays - startDays) / totalDays) * 100;

        // Calculate progress
        const today = new Date();
        const totalProjectDays = endDays - startDays;
        const elapsedDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const progress = Math.min(Math.max((elapsedDays / totalProjectDays) * 100, 0), 100);

        return { left, width, progress, start, end };
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'concept': return '#6366f1';
            case 'design-development': return '#8b5cf6';
            case 'submission-prep': return '#f59e0b';
            case 'submitted': return '#3b82f6';
            case 'approved': return '#10b981';
            case 'on-hold': return '#ef4444';
            case 'completed': return '#059669';
            default: return '#64748b';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'concept': return 'Concept';
            case 'design-development': return 'Design Dev';
            case 'submission-prep': return 'Submission Prep';
            case 'submitted': return 'Submitted';
            case 'approved': return 'Approved';
            case 'on-hold': return 'On Hold';
            case 'completed': return 'Completed';
            default: return status;
        }
    };

    // Calculate statistics
    const stats = useMemo(() => {
        const active = projects.filter(p =>
            ['concept', 'design-development', 'submission-prep', 'submitted'].includes(p.status)
        ).length;

        const onTrack = projects.filter(p => {
            if (!p.targetCompletionDate) return false;
            const today = new Date();
            const target = new Date(p.targetCompletionDate);
            return today <= target && !['completed', 'on-hold'].includes(p.status);
        }).length;

        const delayed = projects.filter(p => {
            if (!p.targetCompletionDate) return false;
            const today = new Date();
            const target = new Date(p.targetCompletionDate);
            return today > target && !['completed'].includes(p.status);
        }).length;

        return { active, onTrack, delayed };
    }, [projects]);

    if (projects.length === 0) {
        return (
            <div className="glass rounded-2xl p-12 text-center">
                <Calendar size={48} className="mx-auto text-slate-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
                <p className="text-slate-400">Create your first project to see the timeline</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Active Projects</p>
                            <p className="text-2xl font-bold text-blue-400">{stats.active}</p>
                        </div>
                        <TrendingUp size={24} className="text-blue-400" />
                    </div>
                </div>
                <div className="glass p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">On Track</p>
                            <p className="text-2xl font-bold text-green-400">{stats.onTrack}</p>
                        </div>
                        <Clock size={24} className="text-green-400" />
                    </div>
                </div>
                <div className="glass p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Delayed</p>
                            <p className="text-2xl font-bold text-red-400">{stats.delayed}</p>
                        </div>
                        <Calendar size={24} className="text-red-400" />
                    </div>
                </div>
            </div>

            {/* Gantt Chart */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-display font-bold">Project Timeline</h3>
                        <p className="text-sm text-slate-400">
                            {minDate.toLocaleDateString()} - {maxDate.toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-slate-400">Progress</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-white/10"></div>
                            <span className="text-slate-400">Remaining</span>
                        </div>
                    </div>
                </div>

                {/* Timeline Header */}
                <div className="mb-4">
                    <div className="relative h-12 border-b border-white/10">
                        {monthMarkers.map((marker, idx) => (
                            <div
                                key={idx}
                                className="absolute top-0 h-full border-l border-white/5"
                                style={{ left: `${marker.position}%` }}
                            >
                                <span className="absolute top-2 left-2 text-xs text-slate-500 font-medium">
                                    {marker.label}
                                </span>
                            </div>
                        ))}
                        {/* Today marker */}
                        <div
                            className="absolute top-0 h-full border-l-2 border-red-500"
                            style={{
                                left: `${((new Date().getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24) / totalDays) * 100}%`
                            }}
                        >
                            <span className="absolute -top-1 left-1 text-xs text-red-500 font-semibold">
                                Today
                            </span>
                        </div>
                    </div>
                </div>

                {/* Project Bars */}
                <div className="space-y-3">
                    {projects.map((project) => {
                        const bar = getProjectBar(project);
                        const statusColor = getStatusColor(project.status);

                        return (
                            <div key={project.id} className="group">
                                <div className="flex items-center gap-4">
                                    {/* Project Info */}
                                    <div className="w-64 flex-shrink-0">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: project.color }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate group-hover:text-white transition-colors">
                                                    {project.title}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {project.clientName}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline Bar */}
                                    <div className="flex-1 relative h-10">
                                        <div className="absolute inset-0">
                                            {/* Background grid */}
                                            {monthMarkers.map((marker, idx) => (
                                                <div
                                                    key={idx}
                                                    className="absolute top-0 h-full border-l border-white/5"
                                                    style={{ left: `${marker.position}%` }}
                                                />
                                            ))}
                                        </div>

                                        {/* Project bar */}
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 h-6 rounded-lg overflow-hidden transition-all group-hover:h-8"
                                            style={{
                                                left: `${bar.left}%`,
                                                width: `${bar.width}%`,
                                                backgroundColor: `${statusColor}20`,
                                                border: `1px solid ${statusColor}40`
                                            }}
                                        >
                                            {/* Progress bar */}
                                            <div
                                                className="h-full transition-all"
                                                style={{
                                                    width: `${bar.progress}%`,
                                                    backgroundColor: statusColor,
                                                    opacity: 0.6
                                                }}
                                            />

                                            {/* Status label */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span
                                                    className="text-xs font-medium px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    style={{ color: statusColor }}
                                                >
                                                    {getStatusLabel(project.status)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Tooltip on hover */}
                                        <div className="absolute left-0 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                            <div className="glass rounded-lg p-3 shadow-xl min-w-[200px]">
                                                <p className="font-semibold text-sm mb-2">{project.title}</p>
                                                <div className="space-y-1 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Start:</span>
                                                        <span>{bar.start.toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Target:</span>
                                                        <span>{bar.end.toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Progress:</span>
                                                        <span>{Math.round(bar.progress)}%</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Status:</span>
                                                        <span style={{ color: statusColor }}>
                                                            {getStatusLabel(project.status)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-xs text-slate-500 mb-3">Status Legend:</p>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { status: 'concept', label: 'Concept' },
                            { status: 'design-development', label: 'Design Development' },
                            { status: 'submission-prep', label: 'Submission Prep' },
                            { status: 'submitted', label: 'Submitted' },
                            { status: 'approved', label: 'Approved' },
                            { status: 'on-hold', label: 'On Hold' },
                            { status: 'completed', label: 'Completed' }
                        ].map(({ status, label }) => (
                            <div key={status} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded"
                                    style={{ backgroundColor: getStatusColor(status) }}
                                />
                                <span className="text-xs text-slate-400">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
