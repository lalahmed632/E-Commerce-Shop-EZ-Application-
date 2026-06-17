export function getCategoryClass(category: string): string {
  const normalized = String(category || '').trim().toLowerCase();
  if (normalized === 'home') {
    return 'cat-light-green';
  }
  if (normalized === 'electronics') {
    return 'cat-light-blue';
  }
  if (normalized === 'accessories') {
    return 'cat-light-yellow';
  }
  if (normalized === 'fashion') {
    return 'cat-light-orange';
  }
  if (normalized === 'fitness') {
    return 'cat-light-red';
  }
  return 'cat-light-blue';
}

export function getToastCategoryClass(category: string): string {
  return `toast-${getCategoryClass(category)}`;
}
