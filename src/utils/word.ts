export function capitalizeWords(str: string): string {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  export function replaceMultipleSpacesAndTrim(str: string): string {
    return str.replace(/ +/g, " ").trim();
}

export function formatString(str) {
  const lowerCaseStr = str.toLowerCase();

  const formattedStr = lowerCaseStr.charAt(0).toUpperCase() + lowerCaseStr.slice(1);

  return formattedStr;
}
