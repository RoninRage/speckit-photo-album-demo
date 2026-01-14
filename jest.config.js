export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  testMatch: [
    '**/tests/unit/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/main.js',
    '!src/styles/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}
