import { Project } from '../types';

export const MOCK_PROJECTS: Project[] = [
    {
        id: '1',
        title: 'Residential Villa - Damansara Heights',
        clientName: 'Mr. Ahmad bin Abdullah',
        location: 'Damansara Heights, Kuala Lumpur',
        description: 'Modern 3-story residential villa with sustainable design features',
        status: 'submitted',
        startDate: '2024-01-15',
        targetCompletionDate: '2024-12-30',
        totalBudget: 2500000,
        color: '#dc2626',
        submissions: [
            {
                id: 's1',
                type: 'planning-permission',
                authority: 'DBKL - Kuala Lumpur City Hall',
                submittedDate: '2024-02-20',
                expectedApprovalDate: '2024-04-20',
                status: 'pending',
                consultantFee: 15000,
                notes: 'Awaiting feedback on setback requirements'
            },
            {
                id: 's2',
                type: 'structural-approval',
                authority: 'JKR - Public Works Department',
                submittedDate: '2024-03-01',
                expectedApprovalDate: '2024-04-15',
                status: 'approved',
                consultantFee: 8000,
                approvalDate: '2024-04-10'
            }
        ]
    },
    {
        id: '2',
        title: 'Commercial Office Building - KLCC',
        clientName: 'Synergy Holdings Sdn Bhd',
        location: 'KLCC, Kuala Lumpur',
        description: '12-story commercial office building with green building certification',
        status: 'design-development',
        startDate: '2024-02-01',
        targetCompletionDate: '2025-06-30',
        totalBudget: 15000000,
        color: '#2563eb',
        submissions: [
            {
                id: 's3',
                type: 'environmental-impact',
                authority: 'DOE - Department of Environment',
                submittedDate: '2024-03-15',
                expectedApprovalDate: '2024-05-15',
                status: 'resubmission-required',
                consultantFee: 25000,
                notes: 'Need to revise drainage system design'
            }
        ]
    },
    {
        id: '3',
        title: 'Boutique Hotel Renovation - Georgetown',
        clientName: 'Heritage Hospitality Group',
        location: 'Georgetown, Penang',
        description: 'Heritage building conversion to 20-room boutique hotel',
        status: 'approved',
        startDate: '2023-10-01',
        targetCompletionDate: '2024-08-31',
        totalBudget: 5000000,
        color: '#059669',
        submissions: [
            {
                id: 's4',
                type: 'planning-permission',
                authority: 'MPPP - Penang Island City Council',
                submittedDate: '2023-11-10',
                expectedApprovalDate: '2024-01-10',
                approvalDate: '2024-01-05',
                status: 'approved',
                consultantFee: 12000
            },
            {
                id: 's5',
                type: 'fire-safety',
                authority: 'Bomba - Fire Department',
                submittedDate: '2023-12-01',
                expectedApprovalDate: '2024-02-01',
                approvalDate: '2024-01-28',
                status: 'approved',
                consultantFee: 6000
            }
        ]
    }
];
