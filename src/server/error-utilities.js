export function createError(error) {
    return {
        stacktrace: new Error(error),
        error
    }
}
