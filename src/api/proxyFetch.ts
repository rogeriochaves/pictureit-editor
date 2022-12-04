export const proxyFetch =
  (host: string) =>
  (path: string, options: RequestInit = {}) => {
    const fetchPromise =
      import.meta.env.VITE_ENV_PROXY == "disable"
        ? fetch(path, options)
        : fetch(
            `http://localhost:5174${path}`,
            (options = {
              ...options,
              headers: {
                ...(options.headers || {}),
                "X-Host": host,
              },
            })
          )

    return fetchPromise.then((response) => {
      if (!response.ok) {
        throw response
      }

      return response
    })
  }
