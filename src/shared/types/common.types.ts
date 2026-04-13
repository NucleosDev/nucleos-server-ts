export type UUID = string;
export type ISODateString = string;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
