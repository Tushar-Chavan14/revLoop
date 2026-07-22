export function capitalize(value: string): string {
  return value.length > 0 ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
}

// Proper-cases free-text user input (names, cities, countries, bike brands,
// ride titles) regardless of how the user typed it — "tony stark" / "TONY
// STARK" both become "Tony Stark". Mirrors Postgres's initcap(): runs of
// alphanumeric characters are treated as words, only their first letter is
// uppercased, and non-alphanumeric characters (spaces, hyphens, apostrophes)
// are left untouched as word separators.
export function toTitleCase(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[A-Za-z0-9]+/g, (word) => {
      const first = word.charAt(0);
      const rest = word.slice(1).toLowerCase();
      return /[a-z]/i.test(first) ? first.toUpperCase() + rest : first + rest;
    });
}
