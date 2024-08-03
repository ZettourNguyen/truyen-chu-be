// upppercase first character foreach word
export function capitalizeWords(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
// replace multi space -> 1 space
export function replaceMultipleSpacesAndTrim(str: string): string {
  return str.replace(/ +/g, " ").trim();
}

// only uppercáe first character
export function formatString(str) {
  const lowerCaseStr = str.toLowerCase();

  const formattedStr = lowerCaseStr.charAt(0).toUpperCase() + lowerCaseStr.slice(1);

  return replaceMultipleSpacesAndTrim(formattedStr);
}
