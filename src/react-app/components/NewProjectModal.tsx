import React, { useState } from 'react';
import { X, Building2, MapPin, Calendar, DollarSign, FileText } from 'lucide-react';
import { Project, ProjectStatus } from '../types';

interface NewProjectModalProps {
    onClose: () => void;
    onSave: (project: Omit<Project, 'id'>) => void;
    initialData?: Project;
}

export default function NewProjectModal({ onClose, onSave, initialData }: NewProjectModalProps) {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        clientName: initialData?.clientName || '',
        location: initialData?.location || '',
        description: initialData?.description || '',
        status: initialData?.status || 'concept' as ProjectStatus,
        startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
        targetCompletionDate: initialData?.targetCompletionDate || '',
        totalBudget: initialData?.totalBudget?.toString() || '',
        color: initialData?.color || '#dc2626'
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const isEditing = !!initialData;

    const statusOptions: { value: ProjectStatus; label: string; color: string }[] = [
        { value: 'concept', label: 'Concept', color: '#6366f1' },
        { value: 'design-development', label: 'Design Development', color: '#8b5cf6' },
        { value: 'submission-prep', label: 'Submission Prep', color: '#f59e0b' },
        { value: 'submitted', label: 'Submitted', color: '#3b82f6' },
        { value: 'approved', label: 'Approved', color: '#10b981' },
        { value: 'on-hold', label: 'On Hold', color: '#ef4444' },
        { value: 'completed', label: 'Completed', color: '#059669' }
    ];

    const colorOptions = [
        { value: '#dc2626', label: 'Red' },
        { value: '#ea580c', label: 'Orange' },
        { value: '#f59e0b', label: 'Amber' },
        { value: '#10b981', label: 'Green' },
        { value: '#3b82f6', label: 'Blue' },
        { value: '#8b5cf6', label: 'Purple' },
        { value: '#ec4899', label: 'Pink' }
    ];

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Project title is required';
        }
        if (!formData.clientName.trim()) {
            newErrors.clientName = 'Client name is required';
        }
        if (!formData.location.trim()) {
            newErrors.location = 'Location is required';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const newProject: Omit<Project, 'id'> = {
            title: formData.title,
            clientName: formData.clientName,
            location: formData.location,
            description: formData.description,
            status: formData.status,
            startDate: formData.startDate,
            targetCompletionDate: formData.targetCompletionDate || undefined,
            totalBudget: formData.totalBudget ? parseFloat(formData.totalBudget) : undefined,
            submissions: initialData?.submissions || [],
            color: formData.color
        };

        try {
            console.log('Saving project:', newProject);
            onSave(newProject);
            console.log('Project saved successfully');
            onClose();
        } catch (error) {
            console.error('Error saving project:', error);
            // Still close modal to prevent stuck state? Or show error?
            // For now, let's assume valid data and just log.
            // If critical, maybe set a form level error.
            setErrors(prev => ({ ...prev, submit: 'Failed to create project. Please try again.' }));
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="glass rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-display font-bold mb-2">{isEditing ? 'Edit Project' : 'Create New Project'}</h2>
                        <p className="text-slate-400">{isEditing ? 'Update project details' : 'Add a new architecture project to your tracker'}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors text-2xl"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Project Title */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                            <Building2 size={16} />
                            Project Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="e.g., Modern Residential Villa"
                            className={`w-full px-4 py-3 bg-white/5 border ${errors.title ? 'border-red-500' : 'border-white/10'} rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all`}
                        />
                        {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
                    </div>

                    {/* Client Name & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                <Building2 size={16} />
                                Client Name *
                            </label>
                            <input
                                type="text"
                                value={formData.clientName}
                                onChange={(e) => handleChange('clientName', e.target.value)}
                                placeholder="e.g., Ahmad bin Hassan"
                                className={`w-full px-4 py-3 bg-white/5 border ${errors.clientName ? 'border-red-500' : 'border-white/10'} rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all`}
                            />
                            {errors.clientName && <p className="text-red-400 text-sm mt-1">{errors.clientName}</p>}
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                <MapPin size={16} />
                                Location *
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                                placeholder="e.g., Kuala Lumpur"
                                className={`w-full px-4 py-3 bg-white/5 border ${errors.location ? 'border-red-500' : 'border-white/10'} rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all`}
                            />
                            {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                            <FileText size={16} />
                            Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Describe the project scope, requirements, and key features..."
                            rows={4}
                            className={`w-full px-4 py-3 bg-white/5 border ${errors.description ? 'border-red-500' : 'border-white/10'} rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all resize-none`}
                        />
                        {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
                    </div>

                    {/* Status & Color */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">
                                Project Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-white"
                                style={{ colorScheme: 'dark' }}
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value} className="bg-[#1a1a1c] text-white">
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">
                                Project Color
                            </label>
                            <div className="flex gap-2">
                                {colorOptions.map(color => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => handleChange('color', color.value)}
                                        className={`w-10 h-10 rounded-lg transition-all ${formData.color === color.value
                                            ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0c] scale-110'
                                            : 'hover:scale-105'
                                            }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.label}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                <Calendar size={16} />
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => handleChange('startDate', e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                <Calendar size={16} />
                                Target Completion Date
                            </label>
                            <input
                                type="date"
                                value={formData.targetCompletionDate}
                                onChange={(e) => handleChange('targetCompletionDate', e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Budget */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                            <DollarSign size={16} />
                            Total Budget (RM)
                        </label>
                        <input
                            type="number"
                            value={formData.totalBudget}
                            onChange={(e) => handleChange('totalBudget', e.target.value)}
                            placeholder="e.g., 500000"
                            min="0"
                            step="1000"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                        />
                    </div>

                    {/* Action Buttons */}
                    {errors.submit && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-4">
                            {errors.submit}
                        </div>
                    )}
                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                        <button
                            type="submit"
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl font-medium transition-all shadow-lg shadow-red-600/20 active:scale-95"
                        >
                            {isEditing ? 'Save Changes' : 'Create Project'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
