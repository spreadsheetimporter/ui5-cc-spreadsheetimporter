/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test/unit'],
  testMatch: ['**/*.test.js', '**/*.test.ts'],
  moduleNameMapper: {
    // Map SAP UI5 modules to local mocks
    '^sap/ui/model/Filter$': '<rootDir>/test/unit/__mocks__/sap/ui/model/Filter',
    '^sap/ui/model/FilterOperator$': '<rootDir>/test/unit/__mocks__/sap/ui/model/FilterOperator',
    '^sap/ui/model/odata/v2/ODataModel$': '<rootDir>/test/unit/__mocks__/sap/ui/model/odata/v2/ODataModel',
    '^sap/ui/model/odata/v2/ODataListBinding$': '<rootDir>/test/unit/__mocks__/sap/ui/model/odata/v2/ODataListBinding',
    '^sap/ui/model/odata/ODataMetaModel$': '<rootDir>/test/unit/__mocks__/sap/ui/model/odata/ODataMetaModel',
    '^sap/base/Log$': '<rootDir>/test/unit/__mocks__/sap/base/Log',
    // Map internal module paths
    '^../../enums$': '<rootDir>/test/unit/__mocks__/enums',
    '^./MetadataHandlerV2$': '<rootDir>/test/unit/__mocks__/MetadataHandlerV2',
    '^../MessageHandler$': '<rootDir>/test/unit/__mocks__/MessageHandler',
    '^../Util$': '<rootDir>/test/unit/__mocks__/Util'
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          target: 'es2022',
          module: 'commonjs',
          moduleResolution: 'node',
          esModuleInterop: true,
          allowJs: true,
          strict: true,
          strictNullChecks: false,
          strictPropertyInitialization: false,
          skipLibCheck: true,
          rootDir: './',
          baseUrl: './'
        }
      }
    ]
  }
};
