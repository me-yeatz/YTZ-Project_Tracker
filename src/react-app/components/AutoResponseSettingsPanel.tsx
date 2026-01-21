import { useState } from 'react';
import { Save, TestTube, CheckCircle2, XCircle, Bot, Clock, Calendar, Shield, Key } from 'lucide-react';
import { AutoResponseSettings } from '../types';
import { ClaudeAIService } from '../services/claudeService';

interface AutoResponseSettingsPanelProps {
    settings: AutoResponseSettings;
    onSave: (settings: AutoResponseSettings) => void;
    onClose: () => void;
}

export default function AutoResponseSettingsPanel({
    settings: initialSettings,
    onSave,
    onClose
}: AutoResponseSettingsPanelProps) {
    const [settings, setSettings] = useState<AutoResponseSettings>(initialSettings);
    const [testingConnection, setTestingConnection] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [showApiKey, setShowApiKey] = useState(false);

    const handleTestConnection = async () => {
        if (!settings.claudeApiKey) {
            alert('Please enter your Claude API key first');
            return;
        }

        setTestingConnection(true);
        setConnectionStatus('idle');

        try {
            const service = new ClaudeAIService(settings.claudeApiKey);
            const isConnected = await service.testConnection();
            setConnectionStatus(isConnected ? 'success' : 'error');
        } catch (error) {
            setConnectionStatus('error');
        } finally {
            setTestingConnection(false);
        }
    };

    const handleSave = () => {
        onSave(settings);
        onClose();
    };

    const weekDays = [
        { value: 0, label: 'Sun' },
        { value: 1, label: 'Mon' },
        { value: 2, label: 'Tue' },
        { value: 3, label: 'Wed' },
        { value: 4, label: 'Thu' },
        { value: 5, label: 'Fri' },
        { value: 6, label: 'Sat' }
    ];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="glass rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-display font-bold mb-2">AI Auto-Response Settings</h2>
                        <p className="text-slate-400">Configure your intelligent client communication manager</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-2xl">
                        ✕
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Enable/Disable */}
                    <div className="glass p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center">
                                    <Bot size={24} className="text-red-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">AI Auto-Response</h3>
                                    <p className="text-sm text-slate-400">Automatically respond to client messages using Claude AI</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.enabled}
                                    onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-white/10 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>
                    </div>

                    {/* Claude API Key */}
                    <div className="glass p-6 rounded-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                                <Key size={20} className="text-purple-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Claude API Key</h3>
                                <p className="text-sm text-slate-400">Get your API key from console.anthropic.com</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    type={showApiKey ? 'text' : 'password'}
                                    value={settings.claudeApiKey || ''}
                                    onChange={(e) => setSettings({ ...settings, claudeApiKey: e.target.value })}
                                    placeholder="sk-ant-..."
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-mono text-sm"
                                />
                                <button
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-sm"
                                >
                                    {showApiKey ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleTestConnection}
                                    disabled={testingConnection || !settings.claudeApiKey}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <TestTube size={16} />
                                    {testingConnection ? 'Testing...' : 'Test Connection'}
                                </button>
                                {connectionStatus === 'success' && (
                                    <span className="flex items-center gap-2 text-green-400 text-sm">
                                        <CheckCircle2 size={16} />
                                        Connected successfully!
                                    </span>
                                )}
                                {connectionStatus === 'error' && (
                                    <span className="flex items-center gap-2 text-red-400 text-sm">
                                        <XCircle size={16} />
                                        Connection failed. Check your API key.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Working Hours */}
                    <div className="glass p-6 rounded-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                                <Clock size={20} className="text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Working Hours</h3>
                                <p className="text-sm text-slate-400">Define your availability</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Start Time</label>
                                <input
                                    type="time"
                                    value={settings.workingHours.start}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        workingHours: { ...settings.workingHours, start: e.target.value }
                                    })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">End Time</label>
                                <input
                                    type="time"
                                    value={settings.workingHours.end}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        workingHours: { ...settings.workingHours, end: e.target.value }
                                    })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Working Days */}
                    <div className="glass p-6 rounded-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                                <Calendar size={20} className="text-green-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Working Days</h3>
                                <p className="text-sm text-slate-400">Select your working days</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {weekDays.map(day => (
                                <button
                                    key={day.value}
                                    onClick={() => {
                                        const isSelected = settings.workingDays.includes(day.value);
                                        setSettings({
                                            ...settings,
                                            workingDays: isSelected
                                                ? settings.workingDays.filter(d => d !== day.value)
                                                : [...settings.workingDays, day.value].sort()
                                        });
                                    }}
                                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${settings.workingDays.includes(day.value)
                                            ? 'bg-green-600 text-white'
                                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                        }`}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Auto-Response Options */}
                    <div className="glass p-6 rounded-xl space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-amber-600/20 rounded-lg flex items-center justify-center">
                                <Shield size={20} className="text-amber-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Boundary Protection</h3>
                                <p className="text-sm text-slate-400">Protect your personal time</p>
                            </div>
                        </div>

                        <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                            <span className="text-sm">Auto-respond outside working hours</span>
                            <input
                                type="checkbox"
                                checked={settings.autoRespondOutsideHours}
                                onChange={(e) => setSettings({ ...settings, autoRespondOutsideHours: e.target.checked })}
                                className="w-5 h-5 rounded bg-white/10 border-white/20 text-red-600 focus:ring-2 focus:ring-red-500/50"
                            />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                            <span className="text-sm">Auto-respond on weekends</span>
                            <input
                                type="checkbox"
                                checked={settings.autoRespondOnWeekends}
                                onChange={(e) => setSettings({ ...settings, autoRespondOnWeekends: e.target.checked })}
                                className="w-5 h-5 rounded bg-white/10 border-white/20 text-red-600 focus:ring-2 focus:ring-red-500/50"
                            />
                        </label>
                    </div>

                    {/* Response Templates */}
                    <div className="glass p-6 rounded-xl space-y-4">
                        <h3 className="font-semibold mb-4">Response Templates</h3>

                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Weekend Message</label>
                            <textarea
                                value={settings.responseTemplates.weekendMessage}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    responseTemplates: { ...settings.responseTemplates, weekendMessage: e.target.value }
                                })}
                                rows={3}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-2">After Hours Message</label>
                            <textarea
                                value={settings.responseTemplates.afterHoursMessage}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    responseTemplates: { ...settings.responseTemplates, afterHoursMessage: e.target.value }
                                })}
                                rows={3}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Escalation Keywords */}
                    <div className="glass p-6 rounded-xl">
                        <h3 className="font-semibold mb-2">Escalation Keywords</h3>
                        <p className="text-sm text-slate-400 mb-4">Messages containing these keywords will be flagged for human review</p>
                        <input
                            type="text"
                            value={settings.escalationKeywords.join(', ')}
                            onChange={(e) => setSettings({
                                ...settings,
                                escalationKeywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                            })}
                            placeholder="urgent, emergency, deadline, legal, safety"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                        <button
                            onClick={handleSave}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl font-medium transition-all shadow-lg shadow-red-600/20"
                        >
                            <Save size={20} />
                            Save Settings
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
