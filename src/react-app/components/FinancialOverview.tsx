import React from 'react';
import { DollarSign, TrendingUp, FileText, CheckCircle2 } from 'lucide-react';
import { Project } from '../types';

interface FinancialOverviewProps {
    projects: Project[];
    detailed?: boolean;
}

export default function FinancialOverview({ projects, detailed = false }: FinancialOverviewProps) {
    // Calculate financial metrics
    const totalBudget = projects.reduce((sum, p) => sum + (p.totalBudget || 0), 0);
    const totalConsultantFees = projects.reduce((sum, project) =>
        sum + project.submissions.reduce((subSum, sub) => subSum + sub.consultantFee, 0), 0
    );
    const paidFees = projects.reduce((sum, project) =>
        sum + project.submissions
            .filter(s => s.status === 'approved')
            .reduce((subSum, sub) => subSum + sub.consultantFee, 0), 0
    );
    const pendingFees = totalConsultantFees - paidFees;

    // Group fees by project
    const projectFinancials = projects.map(project => {
        const projectFees = project.submissions.reduce((sum, sub) => sum + sub.consultantFee, 0);
        const projectPaid = project.submissions
            .filter(s => s.status === 'approved')
            .reduce((sum, sub) => sum + sub.consultantFee, 0);

        return {
            ...project,
            totalFees: projectFees,
            paidFees: projectPaid,
            pendingFees: projectFees - projectPaid
        };
    }).sort((a, b) => b.totalFees - a.totalFees);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FinancialCard
                    title="Total Project Budget"
                    value={`RM ${(totalBudget / 1000000).toFixed(2)}M`}
                    icon={<TrendingUp size={24} />}
                    color="#6366f1"
                />
                <FinancialCard
                    title="Total Consultant Fees"
                    value={`RM ${(totalConsultantFees / 1000).toFixed(0)}K`}
                    icon={<DollarSign size={24} />}
                    color="#2563eb"
                />
                <FinancialCard
                    title="Fees Paid"
                    value={`RM ${(paidFees / 1000).toFixed(0)}K`}
                    icon={<CheckCircle2 size={24} />}
                    color="#059669"
                />
                <FinancialCard
                    title="Pending Fees"
                    value={`RM ${(pendingFees / 1000).toFixed(0)}K`}
                    icon={<FileText size={24} />}
                    color="#f59e0b"
                />
            </div>

            {/* Detailed Breakdown */}
            {detailed && (
                <div className="glass p-8 rounded-2xl">
                    <h3 className="text-xl font-display font-bold mb-8">Project Financial Breakdown</h3>

                    <div className="space-y-4">
                        {projectFinancials.map(project => (
                            <div
                                key={project.id}
                                className="bg-white/5 p-6 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-lg mb-1">{project.title}</h4>
                                        <p className="text-sm text-slate-400">{project.clientName}</p>
                                    </div>
                                    {project.totalBudget && (
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500 mb-1">Project Budget</p>
                                            <p className="text-lg font-bold text-blue-400">
                                                RM {(project.totalBudget / 1000000).toFixed(2)}M
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-white/5">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-2">Total Fees</p>
                                        <p className="text-xl font-bold text-slate-200">
                                            RM {project.totalFees.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-2">Paid</p>
                                        <p className="text-xl font-bold text-green-400">
                                            RM {project.paidFees.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-2">Pending</p>
                                        <p className="text-xl font-bold text-amber-400">
                                            RM {project.pendingFees.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Submissions List */}
                                <div className="mt-6 pt-6 border-t border-white/5">
                                    <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wide">
                                        Submissions ({project.submissions.length})
                                    </p>
                                    <div className="space-y-2">
                                        {project.submissions.map(sub => (
                                            <div
                                                key={sub.id}
                                                className="flex items-center justify-between text-sm py-2 px-3 bg-white/5 rounded-lg"
                                            >
                                                <span className="text-slate-300">{sub.type.replace(/-/g, ' ').toUpperCase()}</span>
                                                <div className="flex items-center gap-4">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-semibold ${sub.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                                                sub.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                                                    'bg-red-500/20 text-red-400'
                                                            }`}
                                                    >
                                                        {sub.status}
                                                    </span>
                                                    <span className="text-slate-400 font-mono">
                                                        RM {sub.consultantFee.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function FinancialCard({ title, value, icon, color }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
}) {
    return (
        <div className="glass p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full -mr-12 -mt-12"></div>
            <div className="flex items-start justify-between mb-4">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${color}20`, color }}
                >
                    {icon}
                </div>
            </div>
            <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>
            <h3 className="text-3xl font-display font-bold">{value}</h3>
        </div>
    );
}
