/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    '<rootDir>/controllers/**/*.js',
    '<rootDir>/middleware/**/*.js',
    '<rootDir>/utils/**/*.js',
  ],
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
    },
  },
};
