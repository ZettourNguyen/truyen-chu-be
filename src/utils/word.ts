export function capitalizeWords(str: string): string {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  export function replaceMultipleSpacesAndTrim(str: string): string {
    return str.replace(/ +/g, " ").trim();
}
