declare module '*.json' {
  const res: string;
  export default res;
}

declare module '*.css' {
  const res: Record<string, string>;
  export default res;
}