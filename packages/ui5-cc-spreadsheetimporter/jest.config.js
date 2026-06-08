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
    '^sap/ui/base/ManagedObject$': '<rootDir>/test/unit/__mocks__/sap/ui/base/ManagedObject',
    '^sap/ui/base/ObjectPool$': '<rootDir>/test/unit/__mocks__/sap/ui/base/ObjectPool',
    '^sap/ui/base/Event$': '<rootDir>/test/unit/__mocks__/sap/ui/base/Event',
    '^sap/m/MessageBox$': '<rootDir>/test/unit/__mocks__/sap/m/MessageBox',
    '^sap/ui/model/odata/v4/ts$': '<rootDir>/test/unit/__mocks__/sap/ui/model/odata/v4/ts',
    // Map internal module paths
    '^../../enums$': '<rootDir>/test/unit/__mocks__/enums',
    '^./MetadataHandlerV2$': '<rootDir>/test/unit/__mocks__/MetadataHandlerV2',
    '^../MessageHandler$': '<rootDir>/test/unit/__mocks__/MessageHandler',
    '^../Util$': '<rootDir>/test/unit/__mocks__/Util',
    // controller/-level relative imports (e.g. Parser.ts) map to the same mocks
    '^./MessageHandler$': '<rootDir>/test/unit/__mocks__/MessageHandler',
    '^./Util$': '<rootDir>/test/unit/__mocks__/Util',
    '^../enums$': '<rootDir>/test/unit/__mocks__/enums'
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        // The project ships via babel-based ui5-tooling-transpile and never type-checks
        // (tsc --noEmit reports ~50 pre-existing errors by design). Transpile-only here too,
        // so unit tests don't fail on pre-existing source type errors unrelated to the test.
        diagnostics: false,
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
