export function hasUsableData<T>(data: T | null | undefined): data is T {
    if (data == null) return false;
    if (Array.isArray(data)) return data.length > 0;
    if (typeof data === 'object') return Object.keys(data).length > 0;
    return true;
}
