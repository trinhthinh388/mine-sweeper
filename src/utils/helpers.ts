export const mergeClassname = (...args: (string | undefined)[]): string => {
  const cleanClasses = args.map(classname => {
    if (classname === undefined || classname === null) return '';
    return classname;
  });
  return cleanClasses.join('');
};

export const generateSearchParams = (argObj: Record<string, string>) => {
  const searchParams = new URLSearchParams(argObj);
  return searchParams.toString();
};
