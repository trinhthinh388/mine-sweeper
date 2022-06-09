export const mergeClassname = (...args: (string | undefined)[]): string => {
  const cleanClasses = args.map(classname => {
    if (classname === undefined || classname === null) return '';
    return classname;
  });
  return cleanClasses.join('');
};
