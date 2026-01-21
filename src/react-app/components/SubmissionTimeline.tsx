import {
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    Building,
    Calendar,
    DollarSign
} from 'lucide-react';
import { Project, Submission } from '../types';

interface SubmissionTimelineProps {
    projects: Project[];
}

const submissionStatusConfig = {
    'pending': { label: 'Pending', color: '#f59e0b', icon: Clock },
    'approved': { label: 'Approved', color: '#059669', icon: CheckCircle2 },
    'rejected': { label: 'Rejected', color: '#dc2626', icon: XCircle },
    'resubmission-required': { label: 'Resubmission', color: '#f97316', icon: AlertCircle }
};

const submissionTypeLabels = {
    'planning-permission': 'Planning Permission',
    'building-permit': 'Building Permit',
    'structural-approval': 'Structural Approval',
    'fire-safety': 'Fire Safety',
    'environmental-impact': 'Environmental Impact',
    'other': 'Other'
};

export default function SubmissionTimeline({ projects }: SubmissionTimelineProps) {
    // Flatten all submissions with project context
    const allSubmissions: Array<Submission & { projectTitle: string; projectColor: string }> = [];

    projects.forEach(project => {
        project.submissions.forEach(submission => {
            allSubmissions.push({
                ...submission,
                projectTitle: project.title,
                projectColor: project.color
            });
        });
    });

    // Sort by submission date (most recent first)
    allSubmissions.sort((a, b) => {
        const dateA = a.submittedDate ? new Date(a.submittedDate).getTime() : 0;
        const dateB = b.submittedDate ? new Date(b.submittedDate).getTime() : 0;
        return dateB - dateA;
    });

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <SummaryCard
                    title="Total Submissions"
                    value={allSubmissions.length.toString()}
                    color="#6366f1"
                />
                <SummaryCard
                    title="Pending"
                    value={allSubmissions.filter(s => s.status === 'pending').length.toString()}
                    color="#f59e0b"
                />
                <SummaryCard
                    title="Approved"
                    value={allSubmissions.filter(s => s.status === 'approved').length.toString()}
                    color="#059669"
                />
                <SummaryCard
                    title="Total Fees"
                    value={`RM ${(allSubmissions.reduce((sum, s) => sum + s.consultantFee, 0) / 1000).toFixed(0)}K`}
                    color="#2563eb"
                />
            </div>

            {/* Timeline */}
            <div className="glass p-8 rounded-2xl">
                <h3 className="text-xl font-display font-bold mb-8">Submission Timeline</h3>

                <div className="space-y-6">
                    {allSubmissions.map((submission, index) => {
                        const config = submissionStatusConfig[submission.status];
                        const StatusIcon = config.icon;

                        return (
                            <div key={submission.id} className="relative">
                                {/* Timeline Line */}
                                {index < allSubmissions.length - 1 && (
                                    <div className="absolute left-6 top-16 w-0.5 h-full bg-white/10"></div>
                                )}

                                {/* Submission Card */}
                                <div className="flex gap-6 group">
                                    {/* Icon */}
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 z-10"
                                        style={{ backgroundColor: `${config.color}20`, color: config.color }}
                                    >
                                        <StatusIcon size={24} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 bg-white/5 p-6 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h4 className="font-semibold text-lg mb-1">
                                                    {submissionTypeLabels[submission.type]}
                                                </h4>
                                                <p className="text-sm text-slate-400">{submission.projectTitle}</p>
                                            </div>
                                            <div
                                                className="px-3 py-1 rounded-full text-xs font-semibold"
                                                style={{ backgroundColor: `${config.color}20`, color: config.color }}
                                            >
                                                {config.label}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <Building size={16} />
                                                <span className="line-clamp-1">{submission.authority}</span>
                                            </div>
                                            {submission.submittedDate && (
                                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                                    <Calendar size={16} />
                                                    <span>Submitted {new Date(submission.submittedDate).toLocaleDateString('en-MY')}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-sm text-green-400 font-semibold">
                                                <DollarSign size={16} />
                                                <span>RM {submission.consultantFee.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {submission.notes && (
                                            <div className="mt-4 p-3 bg-white/5 rounded-lg">
                                                <p className="text-sm text-slate-300">{submission.notes}</p>
                                            </div>
                                        )}

                                        {submission.expectedApprovalDate && (
                                            <div className="mt-4 text-xs text-slate-500">
                                                Expected approval: {new Date(submission.expectedApprovalDate).toLocaleDateString('en-MY')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ title, value, color }: { title: string; value: string; color: string }) {
    return (
        <div className="glass p-6 rounded-2xl">
            <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>
            <h3 className="text-3xl font-display font-bold" style={{ color }}>{value}</h3>
        </div>
    );
}
