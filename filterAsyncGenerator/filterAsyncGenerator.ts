/** filter completily and then yield */
export async function* filterAsyncGenerator<T, TReturn = any, TNext = unknown>(
    asyncGenerator: AsyncGenerator<T, TReturn, TNext>,
    filter: (value: T) => Promise<boolean>,
) {
    const values: T[] = [];
    for await (const value of asyncGenerator) {
        const isAccepted = await filter(value);
        if (!isAccepted) continue;
        values.push(value);
    }
    for (const value of values) {
        yield value;
    }
}

/** filter yield and then repeat */
export async function* filterAsyncGenerator2<T, TReturn = any, TNext = unknown>(
    asyncGenerator: AsyncGenerator<T, TReturn, TNext>,
    filter: (value: T) => Promise<boolean>,
) {
    const values: T[] = [];
    for await (const value of asyncGenerator) {
        const isAccepted = await filter(value);
        if (!isAccepted) continue;
        yield value;
    }
}
