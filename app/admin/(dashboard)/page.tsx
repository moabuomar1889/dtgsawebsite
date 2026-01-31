import { getClients, getProjects, getNews, getContactMessages } from '@/lib/actions';

export default async function AdminDashboardPage() {
    const [clients, projects, news, messages] = await Promise.all([
        getClients(),
        getProjects(),
        getNews(),
        getContactMessages(),
    ]);

    const stats = [
        { label: 'Clients', value: clients.length, href: '/admin/clients', color: 'bg-blue-500' },
        { label: 'Projects', value: projects.length, href: '/admin/projects', color: 'bg-green-500' },
        { label: 'News Articles', value: news.length, href: '/admin/news', color: 'bg-purple-500' },
        { label: 'Messages', value: messages.length, href: '/admin/messages', color: 'bg-orange-500' },
    ];

    const recentMessages = messages.slice(0, 5);

    return (
        <div>
            <h1 className="text-3xl font-bold text-text mb-8">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <a
                        key={stat.label}
                        href={stat.href}
                        className="bg-card-bg border border-border rounded-lg p-6 hover:border-accent transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                <span className="text-2xl font-bold text-white">{stat.value}</span>
                            </div>
                            <div>
                                <p className="text-text-muted text-sm">{stat.label}</p>
                                <p className="text-text font-medium">Total</p>
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            {/* Recent Messages */}
            <div className="bg-card-bg border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-text">Recent Messages</h2>
                    <a href="/admin/messages" className="text-accent text-sm hover:underline">
                        View all →
                    </a>
                </div>

                {recentMessages.length === 0 ? (
                    <p className="text-text-muted">No messages yet.</p>
                ) : (
                    <div className="space-y-4">
                        {recentMessages.map((msg) => (
                            <div key={msg.id} className="border-b border-border pb-4 last:border-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-text">{msg.name}</span>
                                    <span className="text-xs text-text-muted">
                                        {new Date(msg.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-text-muted">{msg.email}</p>
                                <p className="text-sm text-text mt-1 line-clamp-2">{msg.message}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
