export function createIdGenerator(prefix: string) {
  let counter = 0;
  return () => {
    return prefix + counter++;
  }
}