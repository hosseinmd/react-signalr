function removeDuplicates(arr: string[]) {
  const s = new Set(arr);
  const it = s.values();
  return Array.from(it);
}

export { removeDuplicates };
