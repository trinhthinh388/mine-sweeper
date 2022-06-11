export const mergeClassname = (...args: any[]): string => {
  const cleanClasses = args.map(classname => {
    if (
      classname === undefined ||
      classname === null ||
      (typeof classname === 'number' && isNaN(classname))
    )
      return '';
    return classname;
  });
  return cleanClasses.join(' ').trim();
};

export const generateSearchParams = (
  argObj: Record<string, string | number>
) => {
  const obj = Object.keys(argObj).reduce<Record<string, string>>(
    (strObj, key) => {
      if (typeof argObj[key] === 'number' || typeof argObj[key] === 'string') {
        strObj[key] = argObj[key].toString();
      }
      return strObj;
    },
    {}
  );
  const searchParams = new URLSearchParams(obj);
  return searchParams.toString();
};
