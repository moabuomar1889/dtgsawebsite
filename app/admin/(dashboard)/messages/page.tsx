import { getContactMessages } from '@/lib/actions';

export default async function AdminMessagesPage() {
    const messages = await getContactMessages();

    return (
        <div>
            <h1 className="text-3xl font-bold text-text mb-8">Contact Messages</h1>

            <div className="bg-card-bg border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-bg border-b border-border">
                        <tr>
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Date</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Name</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Email</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        {messages.map((msg) => (
                            <tr key={msg.id} className="border-b border-border last:border-0 hover:bg-bg/50">
                                <td className="px-6 py-4 text-text-muted text-sm whitespace-nowrap">
                                    {new Date(msg.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-text font-medium">{msg.name}</td>
                                <td className="px-6 py-4">
                                    <a href={`mailto:${msg.email}`} className="text-accent hover:underline">
                                        {msg.email}
                                    </a>
                                </td>
                                <td className="px-6 py-4 text-text-muted text-sm">
                                    <details>
                                        <summary className="cursor-pointer hover:text-text">
                                            {msg.message.slice(0, 50)}{msg.message.length > 50 ? '...' : ''}
                                        </summary>
                                        <p className="mt-2 whitespace-pre-wrap">{msg.message}</p>
                                    </details>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {messages.length === 0 && (
                    <div className="text-center py-8 text-text-muted">No messages yet.</div>
                )}
            </div>
        </div>
    );
}
