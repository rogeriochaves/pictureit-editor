export interface Page {
  id: string
  name: string
}

export interface FontItem {
  name: string
  url: string
}

export type RemoteData<T> =
  | { state: "NOT_ASKED" }
  | { state: "LOADING" }
  | { state: "SUCCESS"; data: T }
  | { state: "ERROR" }
