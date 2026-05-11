module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts?(x)'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/$1',
    '^@visiblefix/database$': '<rootDir>/../../libs/database/src/index.ts',
    '^@visiblefix/database/schema$': '<rootDir>/../../libs/database/src/schema.ts',
    '^@visiblefix/shared/config$': '<rootDir>/../../libs/shared/config/src/index.ts',
    '^@visiblefix/shared/types$': '<rootDir>/../../libs/shared/types/src/index.ts',
  },
};
