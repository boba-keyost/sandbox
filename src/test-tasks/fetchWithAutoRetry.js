async function fetchWithAutoRetry(fetcher, count) {
    console.log(`attempt ${count}`)
    try {
        return await fetcher();
    } catch (e) {
        console.warn(`Got error: ${e}`)
        if (count > 0) {
            return fetchWithAutoRetry(fetcher, --count)
        }
        throw e
    }
}

const createFetcherMock = (responses) => {
    let counter = 0;
    let isLoading = false;

    return async () => {
        if (isLoading) {
            throw new Error('429 Too Many Requests');
        }

        const response = responses[counter % responses.length];
        isLoading = true;

        await new Promise((resolve) => setTimeout(resolve, 10 * Math.random()));

        isLoading = false;
        counter++;

        return response.error
            ? Promise.reject(response.error)
            : Promise.resolve(response.data);
    };
};

const fetcher = createFetcherMock([
    {'error': '504 Gateway Timeout'},
    {'error': '503 Service Unavailable'},
    {'error': '502 Bad Gateway'},
    {'error': '500 Internal Server Error'},
    {'data': 'Hello, world!'},
    {'data': 'Yandex'}
]);

fetchWithAutoRetry(fetcher, 2)
    .then((data) => console.log('Success:', data))
    .catch((error) => console.error('Error:', error));