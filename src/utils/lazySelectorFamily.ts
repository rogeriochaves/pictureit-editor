import {
  atomFamily,
  Loadable,
  RecoilState,
  RecoilValue,
  RecoilValueReadOnly,
  selectorFamily,
  SerializableParam,
  useRecoilCallback,
  useRecoilValueLoadable,
  useSetRecoilState,
} from "recoil"

type LazySelector<T, P> = {
  id: string | undefined
  get: RecoilValueReadOnly<T | undefined>
  call: (opts: {
    id: string | undefined
    refresh: (recoilValue: RecoilValue<any>) => void
    set: <T>(recoilVal: RecoilState<T>, valOrUpdater: ((currVal: T) => T) | T) => void
  }) => (params: P) => Promise<T>
  requests: RecoilState<Promise<T> | undefined>
}

export const lazySelector = <T, P>(props: {
  key: string
  get: (opts: {
    id: string | undefined
    refresh: (recoilValue: RecoilValue<any>) => void
    set: <T>(recoilVal: RecoilState<T>, valOrUpdater: ((currVal: T) => T) | T) => void
  }) => (params: P) => Promise<T>
}) => lazySelectorFamily(props)("fixed")

export const lazySelectorFamily = <T, P>(props: {
  key: string
  get: (opts: {
    id: string | undefined
    refresh: (recoilValue: RecoilValue<any>) => void
    set: <T>(recoilVal: RecoilState<T>, valOrUpdater: ((currVal: T) => T) | T) => void
  }) => (params: P) => Promise<T>
}): ((id: string | undefined) => LazySelector<T, P>) => {
  const requests: (param: SerializableParam) => RecoilState<Promise<T> | undefined> = atomFamily({
    key: props.key,
    default: undefined as Promise<Promise<T>> | undefined,
  })

  const getter = selectorFamily({
    key: `${props.key}Getter`,
    get:
      (id) =>
      async ({ get }) => {
        return await get(requests(id))
      },
  })

  return (id: string | undefined) => ({
    id: id,
    get: getter(id),
    call: props.get,
    requests: requests(id),
  })
}

export const useRecoilLazyLoadable = <T, P>(
  lazySelector: LazySelector<T, P>
): [Loadable<T | undefined>, (params: P) => Promise<T | undefined>] => {
  const setRequestsValue = useSetRecoilState(lazySelector.requests)
  const get = useRecoilValueLoadable(lazySelector.get)

  const call = useRecoilCallback(
    ({ refresh, set }) =>
      (params: P) => {
        const newValue = lazySelector.call({ id: lazySelector.id, refresh, set })(params)
        setRequestsValue(newValue)

        return newValue
        // eslint-disable-next-line react-hooks/exhaustive-deps
      },
    [lazySelector.id, lazySelector.call, setRequestsValue]
  )

  return [get, call]
}

export const useRecoilValueLazyLoadable = <T, P>(lazySelector: LazySelector<T, P>): Loadable<T | undefined> => {
  const [value, _call] = useRecoilLazyLoadable(lazySelector)

  return value
}

export const useCallRecoilLazyLoadable = <T, P>(
  lazySelector: LazySelector<T, P>
): ((params: P) => Promise<T | undefined>) => {
  const [_value, call] = useRecoilLazyLoadable(lazySelector)

  return call
}
