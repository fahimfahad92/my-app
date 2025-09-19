function getArrayFromLocalStorage<T = string[]>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T[]) : [];
  } catch {
    return [];
  }
}

function setItemInLocalStorageAsArray<T = string[]>(
  key: string,
  value: T
): void {
  if (typeof window === "undefined") return;
  const itemsArray = getArrayFromLocalStorage<T>(key);
  try {
    localStorage.setItem(key, JSON.stringify([value, ...itemsArray]));
  } catch {
    // no-op
  }
}

function removeItemFromLocalStorageArray<T = string[]>(
  key: string,
  valueToBeRemoved: T
): void {
  if (typeof window === "undefined") return;
  const itemArray = getArrayFromLocalStorage<T>(key);
  const updatedItemArray = itemArray.filter(
    (currentValue) => currentValue !== valueToBeRemoved
  );
  try {
    localStorage.setItem(key, JSON.stringify(updatedItemArray));
  } catch {
    // no-op
  }
}

export {
  getArrayFromLocalStorage,
  removeItemFromLocalStorageArray,
  setItemInLocalStorageAsArray,
};
