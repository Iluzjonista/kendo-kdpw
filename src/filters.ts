export type FilterValues = Readonly<Record<string, string>>;

export function normalizeFilters(values: FilterValues): FilterValues {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(values)) {
        const trimmed = value.trim();
        if (trimmed) {
            result[key] = trimmed;
        }
    }
    return result;
}

export function sameFilters(a: FilterValues, b: FilterValues): boolean {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    return aKeys.length === bKeys.length && aKeys.every((key) => a[key] === b[key]);
}