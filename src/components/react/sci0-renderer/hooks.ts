import {
  type Dispatch,
  type SetStateAction,
  type ChangeEventHandler,
  useCallback,
} from 'react';

export const useCheckboxCallback = (
  setter: Dispatch<SetStateAction<boolean>>,
): ChangeEventHandler<HTMLInputElement> =>
  useCallback((e) => setter(e.target.checked), [setter]);

export const useNumericCallback = (
  setter: Dispatch<SetStateAction<number>>,
  mapFn: (n: number) => number = (n) => n,
): ChangeEventHandler<HTMLInputElement> =>
  useCallback(
    (e) => setter(mapFn(parseInt(e.target.value, 10))),
    [setter, mapFn],
  );

export const useEnumCallback = <T extends string>(
  setter: Dispatch<SetStateAction<T>>,
): ChangeEventHandler<HTMLSelectElement> =>
  useCallback((e) => setter(e.target.value as T), [setter]);
