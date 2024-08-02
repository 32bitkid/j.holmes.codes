export function blogSorting(a, b) {
  const aDate = a.data.authorDate ?? 0;
  const bDate = b.data.authorDate ?? 0;
  if (!aDate && !bDate) return 0;
  if (!aDate) return 1;
  if (!bDate) return -1;
  return bDate.getTime() - aDate.getTime();
}
