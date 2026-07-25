export function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/(es|s)$/, "");
}

export function inPantry(ingredientName: string, pantryNames: string[]): boolean {
  const ing = normalize(ingredientName);
  if (!ing) return false;
  return pantryNames.some((p) => {
    const pn = normalize(p);
    return pn.length > 0 && (ing.includes(pn) || pn.includes(ing));
  });
}
