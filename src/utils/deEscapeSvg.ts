export const deEscapeSvg = (svg: string) =>
  svg.trim().replace(`\\"`, `"`).replace(/&/g, "&amp;");
