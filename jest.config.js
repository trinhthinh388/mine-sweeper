module.exports = {
  preset: 'ts-jest',
  moduleDirectories: ['node_modules', 'src'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
};
