export interface Status {
    id: number;
    type: 'image' | 'video' | 'text';
    content: string; // URL for image/video, text content for text status
    backgroundColor?: string; // For text statuses
    timestamp: Date;
    duration?: number; // Duration in seconds for video
}

export interface StatusUpdate {
    id: number;
    name: string;
    image: string;
    time: string;
    isRecent: boolean;
    statuses: Status[];
}

export const statuses: StatusUpdate[] = [
    {
        id: 1,
        name: 'Alex Rivera',
        image: 'https://randomuser.me/api/portraits/men/32.jpg',
        time: '5 minutes ago',
        isRecent: true,
        statuses: [
            {
                id: 1,
                type: 'image',
                content: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                timestamp: new Date(Date.now() - 5 * 60 * 1000),
            },
            {
                id: 2,
                type: 'text',
                content: 'Beautiful day at the mountains! 🏔️',
                backgroundColor: '#667eea',
                timestamp: new Date(Date.now() - 3 * 60 * 1000),
            }
        ]
    },
    {
        id: 2,
        name: 'Sarah Chen',
        image: 'https://randomuser.me/api/portraits/women/44.jpg',
        time: '15 minutes ago',
        isRecent: true,
        statuses: [
            {
                id: 3,
                type: 'image',
                content: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
                timestamp: new Date(Date.now() - 15 * 60 * 1000),
            }
        ]
    },
    {
        id: 3,
        name: 'Marcus Johnson',
        image: 'https://randomuser.me/api/portraits/men/67.jpg',
        time: '30 minutes ago',
        isRecent: true,
        statuses: [
            {
                id: 4,
                type: 'text',
                content: 'Coding is life 💻',
                backgroundColor: '#f093fb',
                timestamp: new Date(Date.now() - 30 * 60 * 1000),
            }
        ]
    },
    {
        id: 4,
        name: 'Elena Rodriguez',
        image: 'https://randomuser.me/api/portraits/women/12.jpg',
        time: '45 minutes ago',
        isRecent: true,
        statuses: [
            {
                id: 5,
                type: 'image',
                content: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=800',
                timestamp: new Date(Date.now() - 45 * 60 * 1000),
            },
            {
                id: 6,
                type: 'image',
                content: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
                timestamp: new Date(Date.now() - 40 * 60 * 1000),
            },
            {
                id: 7,
                type: 'text',
                content: 'Adventure awaits! 🌍',
                backgroundColor: '#4facfe',
                timestamp: new Date(Date.now() - 35 * 60 * 1000),
            }
        ]
    },
    {
        id: 5,
        name: 'David Wilson',
        image: 'https://randomuser.me/api/portraits/men/85.jpg',
        time: '1 hour ago',
        isRecent: true,
        statuses: [
            {
                id: 8,
                type: 'image',
                content: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
                timestamp: new Date(Date.now() - 60 * 60 * 1000),
            }
        ]
    },
    {
        id: 6,
        name: 'Sophie Martin',
        image: 'https://randomuser.me/api/portraits/women/65.jpg',
        time: '2 hours ago',
        isRecent: false,
        statuses: [
            {
                id: 9,
                type: 'text',
                content: 'Living my best life ✨',
                backgroundColor: '#fa709a',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            }
        ]
    },
    {
        id: 7,
        name: 'James Anderson',
        image: 'https://randomuser.me/api/portraits/men/1.jpg',
        time: '3 hours ago',
        isRecent: false,
        statuses: [
            {
                id: 10,
                type: 'image',
                content: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
                timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            },
            {
                id: 11,
                type: 'image',
                content: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
                timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
            }
        ]
    },
    {
        id: 8,
        name: 'Maya Patel',
        image: 'https://randomuser.me/api/portraits/women/28.jpg',
        time: '5 hours ago',
        isRecent: false,
        statuses: [
            {
                id: 12,
                type: 'image',
                content: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
            }
        ]
    },
    {
        id: 9,
        name: 'Liam Smith',
        image: 'https://randomuser.me/api/portraits/men/9.jpg',
        time: '8 hours ago',
        isRecent: false,
        statuses: [
            {
                id: 13,
                type: 'text',
                content: 'Game time! 🎮',
                backgroundColor: '#764ba2',
                timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
            }
        ]
    },
    {
        id: 10,
        name: 'Emma Johnson',
        image: 'https://randomuser.me/api/portraits/women/10.jpg',
        time: '12 hours ago',
        isRecent: false,
        statuses: [
            {
                id: 14,
                type: 'image',
                content: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
                timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
            }
        ]
    },
    {
        id: 11,
        name: 'Noah Williams',
        image: 'https://randomuser.me/api/portraits/men/11.jpg',
        time: '18 hours ago',
        isRecent: false,
        statuses: [
            {
                id: 15,
                type: 'text',
                content: 'Tech is amazing! 🚀',
                backgroundColor: '#43e97b',
                timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
            },
            {
                id: 16,
                type: 'image',
                content: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
                timestamp: new Date(Date.now() - 17 * 60 * 60 * 1000),
            }
        ]
    },
    {
        id: 12,
        name: 'Olivia Brown',
        image: 'https://randomuser.me/api/portraits/women/12.jpg',
        time: '20 hours ago',
        isRecent: false,
        statuses: [
            {
                id: 17,
                type: 'image',
                content: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
                timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
            }
        ]
    },
    {
        id: 13,
        name: 'William Jones',
        image: 'https://randomuser.me/api/portraits/men/13.jpg',
        time: '22 hours ago',
        isRecent: false,
        statuses: [
            {
                id: 18,
                type: 'text',
                content: 'Music is my therapy 🎵',
                backgroundColor: '#f857a6',
                timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000),
            }
        ]
    }
];
