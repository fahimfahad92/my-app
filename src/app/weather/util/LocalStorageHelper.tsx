function getArrayFromLocalStorage<T = unknown>(key: string): T[] {
  const item = localStorage.getItem(key);
  return item ? (JSON.parse(item) as T[]) : [];
}

function setItemInLocalStorageAsArray<T = unknown>(
  key: string,
  value: T
): void {
  const itemsArray = getArrayFromLocalStorage<T>(key);
  localStorage.setItem(key, JSON.stringify([...itemsArray, value]));
}

function removeItemFromLocalStorageArray<T = unknown>(
  key: string,
  valueToBeRemoved: T
): void {
  const itemArray = getArrayFromLocalStorage<T>(key);
  const updatedItemArray = itemArray.filter(
    (currentValue) => currentValue !== valueToBeRemoved
  );
  localStorage.setItem(key, JSON.stringify(updatedItemArray));
}

export {
  getArrayFromLocalStorage,
  removeItemFromLocalStorageArray,
  setItemInLocalStorageAsArray,
};
