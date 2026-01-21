import { useState } from 'react';
import {
    MessageSquare,
    Phone,
    Mail,
    Globe,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Search,
    Settings,
    Bot,
    User
} from 'lucide-react';
import { ClientMessage, CommunicationStats, MessageStatus, MessagePriority } from '../types';

interface CommunicationDashboardProps {
    messages: ClientMessage[];
    stats: CommunicationStats;
    onMessageStatusChange: (messageId: string, status: MessageStatus) => void;
    onOpenSettings: () => void;
}

export default function CommunicationDashboard({
    messages,
    stats,
    onMessageStatusChange,
    onOpenSettings
}: CommunicationDashboardProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<MessageStatus | 'all'>('all');
    const [filterPriority, setFilterPriority] = useState<MessagePriority | 'all'>('all');
    const [selectedMessage, setSelectedMessage] = useState<ClientMessage | null>(null);

    const filteredMessages = messages.filter(msg => {
        const matchesSearch =
            msg.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (msg.clientPhone && msg.clientPhone.includes(searchQuery));

        const matchesStatus = filterStatus === 'all' || msg.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || msg.priority === filterPriority;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'whatsapp': return <MessageSquare size={16} />;
            case 'phone': return <Phone size={16} />;
            case 'email': return <Mail size={16} />;
            case 'web-form': return <Globe size={16} />;
            default: return <MessageSquare size={16} />;
        }
    };

    const getStatusColor = (status: MessageStatus) => {
        switch (status) {
            case 'new': return 'text-blue-400 bg-blue-500/10';
            case 'ai-responded': return 'text-green-400 bg-green-500/10';
            case 'escalated': return 'text-amber-400 bg-amber-500/10';
            case 'resolved': return 'text-emerald-400 bg-emerald-500/10';
            case 'archived': return 'text-slate-400 bg-slate-500/10';
            default: return 'text-slate-400 bg-slate-500/10';
        }
    };

    const getPriorityColor = (priority: MessagePriority) => {
        switch (priority) {
            case 'urgent': return 'text-red-400 bg-red-500/20';
            case 'high': return 'text-orange-400 bg-orange-500/20';
            case 'medium': return 'text-yellow-400 bg-yellow-500/20';
            case 'low': return 'text-slate-400 bg-slate-500/20';
            default: return 'text-slate-400 bg-slate-500/20';
        }
    };

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Messages"
                    value={stats.totalMessages.toString()}
                    sub={`${stats.newMessages} new`}
                    icon={<MessageSquare size={24} />}
                    color="#3b82f6"
                />
                <StatCard
                    title="AI Responded"
                    value={stats.aiResponded.toString()}
                    sub={`${Math.round((stats.aiResponded / stats.totalMessages) * 100)}% auto-handled`}
                    icon={<Bot size={24} />}
                    color="#10b981"
                />
                <StatCard
                    title="Needs Review"
                    value={stats.escalated.toString()}
                    sub="Requires attention"
                    icon={<AlertTriangle size={24} />}
                    color="#f59e0b"
                />
                <StatCard
                    title="Avg Response Time"
                    value={`${stats.averageResponseTime}m`}
                    sub="Minutes"
                    icon={<Clock size={24} />}
                    color="#8b5cf6"
                />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="relative group flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search messages, clients, phone numbers..."
                        className="pl-12 pr-6 py-3 bg-white/5 border border-white/5 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all focus:bg-white/10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as MessageStatus | 'all')}
                        className="px-4 py-3 bg-white/5 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                    >
                        <option value="all">All Status</option>
                        <option value="new">New</option>
                        <option value="ai-responded">AI Responded</option>
                        <option value="escalated">Escalated</option>
                        <option value="resolved">Resolved</option>
                        <option value="archived">Archived</option>
                    </select>

                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value as MessagePriority | 'all')}
                        className="px-4 py-3 bg-white/5 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                    >
                        <option value="all">All Priority</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>

                    <button
                        onClick={onOpenSettings}
                        className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        <Settings size={20} className="text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Messages List */}
            <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Client</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Message</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Source</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Priority</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Time</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredMessages.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                        No messages found
                                    </td>
                                </tr>
                            ) : (
                                filteredMessages.map((message) => (
                                    <tr
                                        key={message.id}
                                        className="hover:bg-white/5 transition-colors cursor-pointer"
                                        onClick={() => setSelectedMessage(message)}
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-white">{message.clientName}</p>
                                                {message.clientPhone && (
                                                    <p className="text-sm text-slate-400">{message.clientPhone}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-300 line-clamp-2 max-w-md">
                                                {message.content}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                {getSourceIcon(message.source)}
                                                <span className="text-sm capitalize">{message.source}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                                                {message.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                                                {message.status.replace('-', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-400">
                                                {new Date(message.timestamp).toLocaleString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {message.status === 'new' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onMessageStatusChange(message.id, 'resolved');
                                                        }}
                                                        className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                                                        title="Mark as resolved"
                                                    >
                                                        <CheckCircle2 size={16} className="text-green-400" />
                                                    </button>
                                                )}
                                                {message.requiresHumanReview && (
                                                    <span className="p-2 bg-amber-500/20 rounded-lg" title="Requires review">
                                                        <User size={16} className="text-amber-400" />
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Message Detail Modal */}
            {selectedMessage && (
                <MessageDetailModal
                    message={selectedMessage}
                    onClose={() => setSelectedMessage(null)}
                    onStatusChange={(status) => {
                        onMessageStatusChange(selectedMessage.id, status);
                        setSelectedMessage(null);
                    }}
                />
            )}
        </div>
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

interface MessageDetailModalProps {
    message: ClientMessage;
    onClose: () => void;
    onStatusChange: (status: MessageStatus) => void;
}

function MessageDetailModal({ message, onClose, onStatusChange }: MessageDetailModalProps) {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="glass rounded-2xl max-w-2xl w-full p-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-display font-bold mb-2">{message.clientName}</h2>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                            {message.clientPhone && <span>📱 {message.clientPhone}</span>}
                            {message.clientEmail && <span>✉️ {message.clientEmail}</span>}
                            <span className="capitalize">via {message.source}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-medium text-slate-400 mb-2">Original Message</h3>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <p className="text-white">{message.content}</p>
                            <p className="text-xs text-slate-500 mt-2">{new Date(message.timestamp).toLocaleString()}</p>
                        </div>
                    </div>

                    {message.aiResponse && (
                        <div>
                            <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                                <Bot size={16} className="text-green-400" />
                                AI Response
                            </h3>
                            <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                                <p className="text-white">{message.aiResponse}</p>
                                {message.aiRespondedAt && (
                                    <p className="text-xs text-green-400 mt-2">Sent: {new Date(message.aiRespondedAt).toLocaleString()}</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${message.priority === 'urgent' ? 'bg-red-500/20 text-red-400' : message.priority === 'high' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {message.priority} priority
                        </span>
                        {message.requiresHumanReview && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                                Requires Review
                            </span>
                        )}
                        {message.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                        <button
                            onClick={() => onStatusChange('resolved')}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
                        >
                            Mark as Resolved
                        </button>
                        <button
                            onClick={() => onStatusChange('escalated')}
                            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
                        >
                            Escalate
                        </button>
                        <button
                            onClick={() => onStatusChange('archived')}
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-all"
                        >
                            Archive
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
