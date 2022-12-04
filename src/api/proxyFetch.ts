export const proxyFetch =
  (host: string) =>
  (path: string, options: RequestInit = {}) =>
    fetch(
      `http://localhost:5174${path}`,
      (options = {
        ...options,
        headers: {
          ...(options.headers || {}),
          "X-Host": host,
        },
      })
    ).then((response) => {
      if (!response.ok) {
        throw response
      }

      return response
    })
