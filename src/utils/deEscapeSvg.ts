export const deEscapeSvg = (svg: string) =>
  svg.trim().replace(`\\"`, `"`).replaceAll("&", "&amp;");
