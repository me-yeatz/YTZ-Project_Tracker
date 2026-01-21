import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    FolderKanban,
    FileText,
    DollarSign,
    Settings,
    Plus,
    Search,
    Bell,
    User,
    TrendingUp,
    CheckCircle2,
    Clock,
    MessageSquare,
    Bot,
    Table,
    Menu,
    X
} from 'lucide-react';
import { Project, FinancialSummary, ClientMessage, CommunicationStats, AutoResponseSettings, MessageStatus } from './types';
import { MOCK_PROJECTS } from './data/mockData';
import { MOCK_MESSAGES, MOCK_COMMUNICATION_STATS, DEFAULT_AUTO_RESPONSE_SETTINGS } from './data/mockCommunicationData';
import ProjectCard from './components/ProjectCard';
import SubmissionTimeline from './components/SubmissionTimeline';
import FinancialOverview from './components/FinancialOverview';
import CommunicationDashboard from './components/CommunicationDashboard';
import AutoResponseSettingsPanel from './components/AutoResponseSettingsPanel';
import NewProjectModal from './components/NewProjectModal';
import GanttChart from './components/GanttChart';
import AIChatContainer from './components/AIChatContainer';
import DatabaseManager from './components/DatabaseManager';

type ViewMode = 'dashboard' | 'projects' | 'submissions' | 'finances' | 'communications' | 'ai-chat' | 'database';

export default function App() {
    const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
    const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);

    // Communication Manager State
    const [messages, setMessages] = useState<ClientMessage[]>(MOCK_MESSAGES);
    const [communicationStats, setCommunicationStats] = useState<CommunicationStats>(MOCK_COMMUNICATION_STATS);
    const [autoResponseSettings, setAutoResponseSettings] = useState<AutoResponseSettings>(DEFAULT_AUTO_RESPONSE_SETTINGS);
    const [showSettingsPanel, setShowSettingsPanel] = useState(false);

    // AI Chat State
    const [hfApiKey, setHfApiKey] = useState<string>(() => {
        return localStorage.getItem('hf_api_key') || '';
    });

    const handleSaveHfApiKey = (apiKey: string) => {
        setHfApiKey(apiKey);
        localStorage.setItem('hf_api_key', apiKey);
    };

    // Mobile sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        // Initially open on desktop (larger screens), closed on mobile
        return typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;
    });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const isCurrentlyMobile = window.innerWidth < 1024; // Changed to lg breakpoint (1024px)
            setIsMobile(isCurrentlyMobile);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);


    const handleMessageStatusChange = (messageId: string, status: MessageStatus) => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, status } : msg
        ));
        // Update stats
        const updatedMessages = messages.map(msg =>
            msg.id === messageId ? { ...msg, status } : msg
        );
        setCommunicationStats({
            ...communicationStats,
            newMessages: updatedMessages.filter(m => m.status === 'new').length,
            aiResponded: updatedMessages.filter(m => m.status === 'ai-responded').length,
            escalated: updatedMessages.filter(m => m.status === 'escalated').length,
            resolved: updatedMessages.filter(m => m.status === 'resolved').length
        });
    };

    const handleSaveSettings = (newSettings: AutoResponseSettings) => {
        setAutoResponseSettings(newSettings);
        // In production, this would save to backend/database
        localStorage.setItem('autoResponseSettings', JSON.stringify(newSettings));
    };

    const handleCreateProject = (newProjectData: Omit<Project, 'id'>) => {
        const newProject: Project = {
            ...newProjectData,
            id: `project-${Date.now()}`
        };
        setProjects(prev => [newProject, ...prev]);
        setViewMode('projects'); // Navigate to projects view to see the new project
    };


    // Calculate financial summary
    const financialSummary: FinancialSummary = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p =>
            ['concept', 'design-development', 'submission-prep', 'submitted'].includes(p.status)
        ).length,
        totalConsultantFees: projects.reduce((sum, project) =>
            sum + project.submissions.reduce((subSum, sub) => subSum + sub.consultantFee, 0), 0
        ),
        pendingSubmissions: projects.reduce((sum, project) =>
            sum + project.submissions.filter(s => s.status === 'pending').length, 0
        ),
        approvedSubmissions: projects.reduce((sum, project) =>
            sum + project.submissions.filter(s => s.status === 'approved').length, 0
        )
    };

    const filteredProjects = projects.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-[#0a0a0c] text-white">
            {/* Mobile menu button */}
            <button
                className={`fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/10 lg:hidden ${sidebarOpen ? 'hidden' : 'block'
                    }`}
                onClick={() => setSidebarOpen(true)}
            >
                <Menu size={24} />
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-full w-80 lg:w-64 shrink-0 glass border-r border-white/5 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}
            >
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-red-600/20">
                        <img src="/Icon_01.png" alt="YEATZ Logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <span className="font-display font-bold text-xl tracking-tight block">Y E A T Z</span>
                        <span className="text-xs text-slate-400">Architecture Studio</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        active={viewMode === 'dashboard'}
                        onClick={() => {
                            setViewMode('dashboard');
                            if (isMobile) setSidebarOpen(false);
                        }}
                    />
                    <NavItem
                        icon={<FolderKanban size={20} />}
                        label="Projects"
                        active={viewMode === 'projects'}
                        onClick={() => {
                            setViewMode('projects');
                            if (isMobile) setSidebarOpen(false);
                        }}
                        badge={financialSummary.activeProjects}
                    />
                    <NavItem
                        icon={<FileText size={20} />}
                        label="Submissions"
                        active={viewMode === 'submissions'}
                        onClick={() => {
                            setViewMode('submissions');
                            if (isMobile) setSidebarOpen(false);
                        }}
                        badge={financialSummary.pendingSubmissions}
                    />
                    <NavItem
                        icon={<DollarSign size={20} />}
                        label="Finances"
                        active={viewMode === 'finances'}
                        onClick={() => {
                            setViewMode('finances');
                            if (isMobile) setSidebarOpen(false);
                        }}
                    />
                    <NavItem
                        icon={<MessageSquare size={20} />}
                        label="Communications"
                        active={viewMode === 'communications'}
                        onClick={() => {
                            setViewMode('communications');
                            if (isMobile) setSidebarOpen(false);
                        }}
                        badge={communicationStats.newMessages}
                    />
                    <NavItem
                        icon={<Bot size={20} />}
                        label="AI Assistant"
                        active={viewMode === 'ai-chat'}
                        onClick={() => {
                            setViewMode('ai-chat');
                            if (isMobile) setSidebarOpen(false);
                        }}
                    />
                    <NavItem
                        icon={<Table size={20} />}
                        label="Database"
                        active={viewMode === 'database'}
                        onClick={() => {
                            setViewMode('database');
                            if (isMobile) setSidebarOpen(false);
                        }}
                    />
                </nav>

                <div className="p-4 border-t border-white/5">
                    <NavItem icon={<Settings size={20} />} label="Settings" onClick={() => { }} />
                    <div className="mt-4 p-4 rounded-xl bg-white/5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-orange-400 flex items-center justify-center">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Yeatz</p>
                            <p className="text-xs text-slate-400">Architect</p>
                        </div>
                    </div>
                </div>

                {/* Close button for mobile */}
                <button
                    className="absolute top-4 right-4 p-1 rounded-lg bg-white/10 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                >
                    <X size={20} />
                </button>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Main Content */}
            <main className="flex-1 p-8 grid-bg relative transition-all duration-300 lg:ml-64">
                {/* Header */}
                <header className="flex items-center justify-between mb-12">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search projects, clients, locations..."
                            className="pl-12 pr-6 py-3 bg-white/5 border border-white/5 rounded-2xl w-96 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all focus:bg-white/10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors relative">
                            <Bell size={20} className="text-slate-400" />
                            {financialSummary.pendingSubmissions > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0a0c]"></span>
                            )}
                        </button>
                        <button
                            onClick={() => setShowNewProjectModal(true)}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-red-600/20 active:scale-95"
                        >
                            <Plus size={20} />
                            <span>New Project</span>
                        </button>
                    </div>
                </header>

                {/* Dashboard View */}
                {viewMode === 'dashboard' && (
                    <>
                        {/* Hero Section */}
                        <section className="mb-12 animate-fade-in">
                            <h1 className="text-4xl font-display font-bold mb-4">Good morning, Yeatz!</h1>
                            <p className="text-slate-400 max-w-2xl">
                                You have <span className="text-red-500 font-semibold">{financialSummary.activeProjects} active projects</span> and{' '}
                                <span className="text-amber-500 font-semibold">{financialSummary.pendingSubmissions} pending submissions</span> requiring attention.
                            </p>
                        </section>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                            <StatCard
                                title="Total Projects"
                                value={financialSummary.totalProjects.toString()}
                                sub={`${financialSummary.activeProjects} active`}
                                icon={<FolderKanban size={24} />}
                                color="#dc2626"
                            />
                            <StatCard
                                title="Pending Submissions"
                                value={financialSummary.pendingSubmissions.toString()}
                                sub="Awaiting approval"
                                icon={<Clock size={24} />}
                                color="#f59e0b"
                            />
                            <StatCard
                                title="Approved This Month"
                                value={financialSummary.approvedSubmissions.toString()}
                                sub="+2 from last month"
                                icon={<CheckCircle2 size={24} />}
                                color="#059669"
                            />
                            <StatCard
                                title="Consultant Fees"
                                value={`RM ${(financialSummary.totalConsultantFees / 1000).toFixed(0)}K`}
                                sub="Total tracked"
                                icon={<DollarSign size={24} />}
                                color="#2563eb"
                            />
                        </div>

                        {/* Gantt Chart Timeline */}
                        <section className="mb-12">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-display font-bold">Project Timeline</h2>
                                <p className="text-sm text-slate-400">Visual overview of all project schedules</p>
                            </div>
                            <GanttChart projects={projects} />
                        </section>

                        {/* Recent Projects */}
                        <section className="mb-12">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-display font-bold">Active Projects</h2>
                                <button
                                    onClick={() => setViewMode('projects')}
                                    className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
                                >
                                    View All <TrendingUp size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProjects.slice(0, 6).map((project) => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}
                            </div>
                        </section>

                        {/* Financial Overview */}
                        <FinancialOverview projects={projects} />
                    </>
                )}

                {/* Projects View */}
                {viewMode === 'projects' && (
                    <>
                        <section className="mb-8 animate-fade-in">
                            <h1 className="text-4xl font-display font-bold mb-4">All Projects</h1>
                            <p className="text-slate-400">Manage your architecture projects and track their progress</p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    </>
                )}

                {/* Submissions View */}
                {viewMode === 'submissions' && (
                    <>
                        <section className="mb-8 animate-fade-in">
                            <h1 className="text-4xl font-display font-bold mb-4">Submission Tracking</h1>
                            <p className="text-slate-400">Monitor all submissions to local authorities</p>
                        </section>

                        <SubmissionTimeline projects={projects} />
                    </>
                )}

                {/* Finances View */}
                {viewMode === 'finances' && (
                    <>
                        <section className="mb-8 animate-fade-in">
                            <h1 className="text-4xl font-display font-bold mb-4">Financial Overview</h1>
                            <p className="text-slate-400">Track consultant fees and project budgets</p>
                        </section>

                        <FinancialOverview projects={projects} detailed />
                    </>
                )}

                {/* Communications View */}
                {viewMode === 'communications' && (
                    <>
                        <section className="mb-8 animate-fade-in">
                            <h1 className="text-4xl font-display font-bold mb-4">AI Communication Manager</h1>
                            <p className="text-slate-400">Intelligent client message handling with Claude AI auto-response</p>
                        </section>

                        <CommunicationDashboard
                            messages={messages}
                            stats={communicationStats}
                            onMessageStatusChange={handleMessageStatusChange}
                            onOpenSettings={() => setShowSettingsPanel(true)}
                        />
                    </>
                )}

                {/* AI Chat View */}
                {viewMode === 'ai-chat' && (
                    <>
                        <section className="mb-8 animate-fade-in">
                            <h1 className="text-4xl font-display font-bold mb-4">AI Assistant</h1>
                            <p className="text-slate-400">Chat with our AI assistant powered by Hugging Face models</p>
                        </section>

                        <div className="h-[calc(100vh-250px)]">
                            <AIChatContainer hfApiKey={hfApiKey} onSaveApiKey={handleSaveHfApiKey} />
                        </div>
                    </>
                )}

                {/* Database View */}
                {viewMode === 'database' && (
                    <>
                        <section className="mb-8 animate-fade-in">
                            <h1 className="text-4xl font-display font-bold mb-4">Database Manager</h1>
                            <p className="text-slate-400">Manage your projects, tasks, clients and documents</p>
                        </section>

                        <div className="h-[calc(100vh-250px)]">
                            <DatabaseManager />
                        </div>
                    </>
                )}
            </main>

            {/* New Project Modal */}
            {showNewProjectModal && (
                <NewProjectModal
                    onClose={() => setShowNewProjectModal(false)}
                    onSave={handleCreateProject}
                />
            )}

            {/* Settings Panel */}
            {showSettingsPanel && (
                <AutoResponseSettingsPanel
                    settings={autoResponseSettings}
                    onSave={handleSaveSettings}
                    onClose={() => setShowSettingsPanel(false)}
                />
            )}
        </div>
    );
}

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
    badge?: number;
}

function NavItem({ icon, label, active = false, onClick, badge }: NavItemProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative ${active
                ? 'bg-red-600/10 text-red-500 border border-red-500/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
        >
            {icon}
            <span className="font-medium">{label}</span>
            {badge !== undefined && badge > 0 && (
                <span className="ml-auto bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                    {badge}
                </span>
            )}
        </button>
    );
}

interface StatCardProps {
    title: string;
    value: string;
    sub: string;
    color: string;
    icon: React.ReactNode;
}

function StatCard({ title, value, sub, color, icon }: StatCardProps) {
    return (
        <div className="glass p-6 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20`, color }}>
                    {icon}
                </div>
            </div>
            <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>
            <h3 className="text-3xl font-display font-bold mb-2">{value}</h3>
            <p className="text-xs text-slate-500">{sub}</p>
        </div>
    );
}
