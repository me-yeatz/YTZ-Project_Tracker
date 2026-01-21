import {
    MapPin,
    User,
    Calendar,
    DollarSign,
    FileText,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle
} from 'lucide-react';
import { Project } from '../types';

interface ProjectCardProps {
    project: Project;
}

const statusConfig = {
    'concept': { label: 'Concept', color: '#6366f1', icon: Clock },
    'design-development': { label: 'Design Dev', color: '#3b82f6', icon: Clock },
    'submission-prep': { label: 'Prep Submit', color: '#f59e0b', icon: Clock },
    'submitted': { label: 'Submitted', color: '#f97316', icon: AlertCircle },
    'approved': { label: 'Approved', color: '#059669', icon: CheckCircle2 },
    'on-hold': { label: 'On Hold', color: '#64748b', icon: XCircle },
    'completed': { label: 'Completed', color: '#10b981', icon: CheckCircle2 }
};

export default function ProjectCard({ project }: ProjectCardProps) {
    const config = statusConfig[project.status];
    const StatusIcon = config.icon;

    const totalFees = project.submissions.reduce((sum, sub) => sum + sub.consultantFee, 0);
    const pendingSubmissions = project.submissions.filter(s => s.status === 'pending').length;
    const approvedSubmissions = project.submissions.filter(s => s.status === 'approved').length;

    return (
        <div className="glass p-6 rounded-2xl hover:border-red-500/30 transition-all group cursor-pointer animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${project.color}20`, color: project.color }}
                >
                    <FileText size={24} />
                </div>
                <button className="text-slate-500 hover:text-white transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Project Title */}
            <h3 className="text-xl font-display font-bold mb-2 group-hover:text-red-500 transition-colors line-clamp-2">
                {project.title}
            </h3>

            {/* Client & Location */}
            <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <User size={14} />
                    <span className="line-clamp-1">{project.clientName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <MapPin size={14} />
                    <span className="line-clamp-1">{project.location}</span>
                </div>
            </div>

            {/* Status Badge */}
            <div className="mb-6">
                <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: `${config.color}20`, color: config.color }}
                >
                    <StatusIcon size={14} />
                    {config.label}
                </div>
            </div>

            {/* Submissions Summary */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white/5 rounded-xl">
                <div>
                    <p className="text-xs text-slate-500 mb-1">Pending</p>
                    <p className="text-lg font-bold text-amber-500">{pendingSubmissions}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 mb-1">Approved</p>
                    <p className="text-lg font-bold text-green-500">{approvedSubmissions}</p>
                </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                    <Calendar size={14} />
                    <span>Due {new Date(project.targetCompletionDate || project.startDate).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-300 font-semibold">
                    <DollarSign size={14} />
                    <span>RM {(totalFees / 1000).toFixed(1)}K</span>
                </div>
            </div>
        </div>
    );
}
