import {
  atom,
  RecoilState,
  selectorFamily,
  RecoilValueReadOnly,
  useRecoilValueLoadable,
  useRecoilValue,
  Loadable,
  RecoilValue,
} from "recoil"

type LazySelector<T, P> = {
  get: RecoilValueReadOnly<T | undefined>
  call: RecoilValueReadOnly<(params: P) => void>
}

export const lazySelectorFamily = <T, P>(props: {
  key: string
  get: (opts: { id: string | undefined; refresh: (recoilValue: RecoilValue<any>) => void }) => (params: P) => Promise<T>
}): ((id: string | undefined) => LazySelector<T, P>) => {
  const requests: RecoilState<{ [key: string]: Promise<T> }> = atom({
    key: props.key,
    default: {} as { [key: string]: Promise<T> },
  })

  const getter = selectorFamily({
    key: `${props.key}Getter`,
    get:
      (id) =>
      async ({ get }) => {
        return id ? await get(requests)[id.toString()] : undefined
      },
  })

  const caller = selectorFamily({
    key: `${props.key}Caller`,
    get:
      (id) =>
      async ({ get, getCallback }) => {
        const currentRequests = get(requests)

        return getCallback(({ set, refresh }) => (params: P) => {
          if (!id) return
          const newValue = props.get({ id: id.toString(), refresh })(params)

          set(requests, {
            ...currentRequests,
            [id.toString()]: newValue,
          })
        })
      },
  })

  return (id: string | undefined) => ({ get: getter(id), call: caller(id) })
}

export const useRecoilLazyLoadable = <T, P>(
  lazySelector: LazySelector<T, P>
): [Loadable<T | undefined>, (params: P) => void] => {
  const get = useRecoilValueLoadable(lazySelector.get)
  const call = useRecoilValue(lazySelector.call)

  return [get, call]
}
