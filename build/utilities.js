export default class Utilities {
  static formatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  static log = (message, prefix = 'Make') => {
    console.log(
      `[${prefix} - ${Utilities.formatter.format(new Date())}] ${message}`
    );
  };

  static slugify(text) {
    if (!text) {
      return text;
    }
    return text // Cast to string (optional)
      .normalize('NFKD') // Normalize() using NFKD method returns the Unicode Normalization Form of a given string.
      .toLowerCase() // Convert the string to lowercase letters
      .trim() // Remove whitespace from both sides of a string (optional)
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/--+/g, '-'); // Replace multiple - with single -
  }
}
