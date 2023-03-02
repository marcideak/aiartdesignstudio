const menus = [
    {
        id: 1,
        name: 'Főoldal',
        links: '',
    },
    {
        id: 2,
        name: 'Rólunk',
        links: '#',
        namesub: [
            {
                id: 1,
                sub: 'About 01',
                links: '/about-v1'
            },
            {
                id: 2,
                sub: 'About 02',
                links: '/about-v2'
            },
            {
                id: 3,
                sub: 'Coming Soon',
                links: '/coming-soon'
            },
            {
                id: 4,
                sub: 'Community',
                links: '/community'
            },
            {
                id: 5,
                sub: 'Team Details',
                links: '/team-details'
            },
            {
                id: 6,
                sub: 'FAQ',
                links: '/faq'
            },
            {
                id: 7,
                sub: '404',
                links: '/404'
            },

        ]
    },
    {
        id: 4,
        name: 'Munkáink',
        links: '#',
        namesub: [
            {
                id: 1,
                sub: 'Nft Item',
                links: '/nft-item'
            },
            {
                id: 2,
                sub: 'Nft Item Details',
                links: '/nft-item-details'
            },
        ],
    },
    {
        id: 5,
        name: 'Blog',
        links: '#',
        namesub: [
            {
                id: 1,
                sub: 'Our Blog',
                links: '/blog'
            },
            {
                id: 2,
                sub: 'Blog Details',
                links: '/blog-details'
            },
        ],
    },
    {
        id: 6,
        name: 'Kapcsolat',
        links: '/contact'
    },
    
]

export default menus;