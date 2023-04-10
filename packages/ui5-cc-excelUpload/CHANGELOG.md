# Changelog

## [0.12.2](https://github.com/marianfoo/ui5-cc-excelUpload/compare/ui5-cc-excelupload-v0.12.1...ui5-cc-excelupload-v0.12.2) (2023-04-10)


### Bug Fixes

* update correct versions in code ([#124](https://github.com/marianfoo/ui5-cc-excelUpload/issues/124)) ([71f106e](https://github.com/marianfoo/ui5-cc-excelUpload/commit/71f106e908e85f444a8f8a1fe5974d3aedbeca25))

## [0.12.1](https://github.com/marianfoo/ui5-cc-excelUpload/compare/ui5-cc-excelupload-v0.12.0...ui5-cc-excelupload-v0.12.1) (2023-04-07)


### Bug Fixes

* remove unused imports ([#119](https://github.com/marianfoo/ui5-cc-excelUpload/issues/119)) ([2eea092](https://github.com/marianfoo/ui5-cc-excelUpload/commit/2eea0929757be965c1011abad4b82aa5f58a0a45))

## [0.12.0](https://github.com/marianfoo/ui5-cc-excelUpload/compare/v0.11.4...v0.12.0) (2023-04-04)


### Features

* add Support for OpenUI5 ([#97](https://github.com/marianfoo/ui5-cc-excelUpload/issues/97)) ([9f1ed6c](https://github.com/marianfoo/ui5-cc-excelUpload/commit/9f1ed6c471c9d42e70fa265340df7c2dcaaa1ab3))
  * including [Sample App for OpenUI5](https://github.com/marianfoo/ui5-cc-excelUpload/tree/main/examples/packages/ordersv2freestylenondraftopenui5) and wdi5 Tests
* improve checks for all Edm Types ([#105](https://github.com/marianfoo/ui5-cc-excelUpload/issues/105)) ([dc91ee2](https://github.com/marianfoo/ui5-cc-excelUpload/commit/dc91ee252e1b9c2d204a1486ff8cf1f13ec3109e))
  * Documentation for the improved Error Handling can be found [here](https://marianfoo.github.io/ui5-cc-excelUpload/pages/Checks/)
* improved checks on the data formats and error handling ([#103](https://github.com/marianfoo/ui5-cc-excelUpload/issues/103)) ([801cfcb](https://github.com/marianfoo/ui5-cc-excelUpload/commit/801cfcb9b5ed24807144707d03d1db5b0247178e))
  * Improvements for custom error handling. Documentation can be found [here](https://marianfoo.github.io/ui5-cc-excelUpload/pages/Events/#check-data-before-upload-to-app)
* new automatically translated languages added ([#107](https://github.com/marianfoo/ui5-cc-excelUpload/issues/107)) ([477e899](https://github.com/marianfoo/ui5-cc-excelUpload/commit/477e899d0dbd91149b2bad608bc12579e5ef6ac4))
  * the english language was automatic translated to following languages: `Chinese`, `French`, `Spanish`, `Italien`, `Hindi`, `Japanese`

## [0.11.4](https://github.com/marianfoo/ui5-cc-excelUpload/compare/v0.11.3...v0.11.4) (2023-03-27)


### Bug Fixes

* namespace at manifest was not replaced correctly ([#91](https://github.com/marianfoo/ui5-cc-excelUpload/issues/91)) ([f60c19b](https://github.com/marianfoo/ui5-cc-excelUpload/commit/f60c19b99d5e9a6c2607d76386dea7f710a52d31))

## [0.11.3](https://github.com/marianfoo/ui5-cc-excelUpload/compare/v0.11.2...v0.11.3) (2023-03-20)


### Bug Fixes

* use attribute tableId to get tableObject ([#84](https://github.com/marianfoo/ui5-cc-excelUpload/issues/84)) ([0860373](https://github.com/marianfoo/ui5-cc-excelUpload/commit/0860373725854a3bcc613925453933051a4e5a2a))

## [0.11.2](https://github.com/marianfoo/ui5-cc-excelUpload/compare/v0.11.1...v0.11.2) (2023-03-18)


### Bug Fixes

* missing check for active draft option ([#81](https://github.com/marianfoo/ui5-cc-excelUpload/issues/81)) ([e15e2eb](https://github.com/marianfoo/ui5-cc-excelUpload/commit/e15e2ebd79d2f59f6597c7f9923ea3dc95493395))

## [0.11.1](https://github.com/marianfoo/ui5-cc-excelUpload/compare/v0.11.0...v0.11.1) (2023-03-17)


### Bug Fixes

* use batchSize even when payload has less  then 1000 lines ([#77](https://github.com/marianfoo/ui5-cc-excelUpload/issues/77)) ([c0926d1](https://github.com/marianfoo/ui5-cc-excelUpload/commit/c0926d12d9a224e48d0ca5d1b20f00ada693f89e))

## [0.11.0](https://github.com/marianfoo/ui5-cc-excelUpload/compare/v0.10.0...v0.11.0) (2023-03-17)


### Features

* new option `batchSizes` to slice batch calls to backend ([#75](https://github.com/marianfoo/ui5-cc-excelUpload/issues/75)) ([8f7684f](https://github.com/marianfoo/ui5-cc-excelUpload/commit/8f7684f8ec9efb840a58bb8e970821f92f0230f5))

## [0.10.0](https://github.com/marianfoo/ui5-cc-excelUpload/compare/v0.9.1...v0.10.0) (2023-03-12)


### ⚠ BREAKING CHANGES

* use namespace with underscores ([#72](https://github.com/marianfoo/ui5-cc-excelUpload/issues/72))


## [0.9.1](https://github.com/marianfoo/ui5-cc-excelUpload/compare/v0.9.0...v0.9.1) (2023-03-02)


### Bug Fixes

* check for binding before open dialog ([#62](https://github.com/marianfoo/ui5-cc-excelUpload/issues/62)) ([c1f545f](https://github.com/marianfoo/ui5-cc-excelUpload/commit/c1f545f830c4a6d0ed5ef3be2f07285e4551b926))

## [0.9.0](https://github.com/marianfoo/ui5-cc-excelUpload/compare/v0.8.1...v0.9.0) (2023-02-18)


### Features

* check if all columns name in file match metadata ([#57](https://github.com/marianfoo/ui5-cc-excelUpload/issues/57)) ([7c538a0](https://github.com/marianfoo/ui5-cc-excelUpload/commit/7c538a0d68e1fb7a4ea9d09dff560fccc08a09ec))
* support for UI5 Tooling V3 ([#47](https://github.com/marianfoo/ui5-cc-excelUpload/issues/47)) ([d9f52e9](https://github.com/marianfoo/ui5-cc-excelUpload/commit/d9f52e9c02c8060c284f47ef1a12f322879b4169))


### Bug Fixes

* Align Dialogs more with Fiori Guidelines ([#54](https://github.com/marianfoo/ui5-cc-excelUpload/issues/54)) ([4f74eeb](https://github.com/marianfoo/ui5-cc-excelUpload/commit/4f74eeb66b6b64e6574632eea6837f88915c28ab))
* horizontal scrollbar in dialog on mobile view ([#55](https://github.com/marianfoo/ui5-cc-excelUpload/issues/55)) ([3288a25](https://github.com/marianfoo/ui5-cc-excelUpload/commit/3288a25b28230655c805552ff14ca8d16f57e990))

## [0.8.1](https://github.com/marianfoo/ui5-cc-excelUpload/compare/v0.8.0...v0.8.1) (2023-02-10)

### Bug Fixes

* remove scrollbar from dialog ([#45](https://github.com/marianfoo/ui5-cc-excelUpload/issues/45)) ([bb1b197](https://github.com/marianfoo/ui5-cc-excelUpload/commit/bb1b1979ef9a49a8c26477970f6a03d411ba93e8))

## [0.8.0](https://github.com/marianfoo/ui5-cc-excelUpload/compare/v0.7.0...v0.8.0) (2023-02-10)

### Features

* setup for central deployment abap ([#41](https://github.com/marianfoo/ui5-cc-excelUpload/issues/41)) ([54bc904](https://github.com/marianfoo/ui5-cc-excelUpload/commit/54bc904f1e79faf7639218692b5e7e01a86dd4eb))

## [0.7.0](https://github.com/marianfoo/ui5-cc-excelUpload/compare/v0.6.0...v0.7.0) (2023-02-03)

**Breaking Changes**

Changes involving in the manifest and custom code implementation.  
See [Documenation](https://marianfoo.github.io/ui5-cc-excelUpload/pages/GettingStarted/#general-setup)
### Bug Fixes

* component-preload.js and componentUsages in examples apps ([#40](https://github.com/marianfoo/ui5-cc-excelUpload/issues/40)) ([33c6e88](https://github.com/marianfoo/ui5-cc-excelUpload/commit/33c6e880b32b13d36638e6dfaddbf69cd5263701))
* upload same file two times ([#37](https://github.com/marianfoo/ui5-cc-excelUpload/issues/37)), closes [#36](https://github.com/marianfoo/ui5-cc-excelUpload/issues/36) ([553e5a8](https://github.com/marianfoo/ui5-cc-excelUpload/commit/553e5a8f84f12b96f6e6f04f83efef009fc3a23b))
* using component-preload.js ([#31](https://github.com/marianfoo/ui5-cc-excelUpload/issues/31)) ([4b223bb](https://github.com/marianfoo/ui5-cc-excelUpload/commit/4b223bbb044ef441435d6733e857574c7e5775d4))


### Features

* add intial csv support ([#33](https://github.com/marianfoo/ui5-cc-excelUpload/issues/33)) ([f7ec051](https://github.com/marianfoo/ui5-cc-excelUpload/commit/f7ec051ad20c5304764f97d3d1b89358cee279f1))



## [0.6.0](https://github.com/marianfoo/ui5-cc-excelUpload/compare/v0.5.0...v0.6.0) (2023-01-14)


### Bug Fixes

* open excel dialog twice again ([#20](https://github.com/marianfoo/ui5-cc-excelUpload/issues/20)) ([7a37483](https://github.com/marianfoo/ui5-cc-excelUpload/commit/7a37483d93f07e7b9a9c72ab774a045a06d2766d))


### Features

Created compatibility and wdi5 tests for List Report and Object Page in Draft Mode for OData V2 (Versions 108,96,84,71) and OData V4 (Versions 108,96,84)  
More info see [Supported Versions](https://marianfoo.github.io/ui5-cc-excelUpload/pages/SupportVersions/)

* compatibility/wdi5 tests with v2 FE 96/84/71 ([3f010d9](https://github.com/marianfoo/ui5-cc-excelUpload/commit/3f010d9a1a360702972552b647f8f20368d72640))
* support for v4 96/84 ([#16](https://github.com/marianfoo/ui5-cc-excelUpload/issues/16)) ([109813f](https://github.com/marianfoo/ui5-cc-excelUpload/commit/109813f8e20acc16d351da04c80b0208b90008c7))
* working in Draft List Report V2/V4 ([#17](https://github.com/marianfoo/ui5-cc-excelUpload/issues/17)) ([cc07d38](https://github.com/marianfoo/ui5-cc-excelUpload/commit/cc07d387e8af2afb45877887911a68f726945646))
* works in ListReport/ObjectPage V4/V2 and Freestyle V2([#10](https://github.com/marianfoo/ui5-cc-excelUpload/issues/10)) ([d9432d2](https://github.com/marianfoo/ui5-cc-excelUpload/commit/d9432d25142addd8ff7fbe804f9a832692588ef4))



## [0.5.0](https://github.com/marianfoo/ui5-cc-excelUpload/compare/v0.4.0...v0.5.0) (2023-01-04)


### Features

* init i18n ([#8](https://github.com/marianfoo/ui5-cc-excelUpload/issues/8)) ([593b009](https://github.com/marianfoo/ui5-cc-excelUpload/commit/593b009298bfc61c2bedce1e23573e96e8ff9e3a))
* multiversion support ([#6](https://github.com/marianfoo/ui5-cc-excelUpload/issues/6)) ([68aa9ca](https://github.com/marianfoo/ui5-cc-excelUpload/commit/68aa9ca2dab84bac0bcd81406636d87038fc1b2e))
* works in ListReport/ObjectPage V4/V2, V4 FPM and Freestyle V2([#10](https://github.com/marianfoo/ui5-cc-excelUpload/issues/10)) ([d9432d2](https://github.com/marianfoo/ui5-cc-excelUpload/commit/d9432d25142addd8ff7fbe804f9a832692588ef4))
* new option for draft Activation ([#10](https://github.com/marianfoo/ui5-cc-excelUpload/issues/10)) ([d9432d2](https://github.com/marianfoo/ui5-cc-excelUpload/commit/d9432d25142addd8ff7fbe804f9a832692588ef4))



## [0.4.0](https://github.com/marianfoo/ui5-cc-excelUpload/compare/v0.3.4...v0.4.0) (2022-12-23)

**Breaking Changes**

Changes involving in the manifest and custom code implementation.  
See [Documenation](https://marianfoo.github.io/ui5-cc-excelUpload/pages/GettingStarted/#general-setup)

### Features

* multiversion support ([#6](https://github.com/marianfoo/ui5-cc-excelUpload/issues/6)) ([68aa9ca](https://github.com/marianfoo/ui5-cc-excelUpload/commit/68aa9ca2dab84bac0bcd81406636d87038fc1b2e))



## [0.3.4](https://github.com/marianfoo/ui5-cc-excelUpload/compare/v0.3.3...v0.3.4) (2022-12-09)


### Bug Fixes

* change console output statement to debug ([cd19150](https://github.com/marianfoo/ui5-cc-excelUpload/commit/cd19150f7b0f816f8b624a9f52eb572b12b15598))
* Type "Edm.DateTime parsed in false format ([8fb6541](https://github.com/marianfoo/ui5-cc-excelUpload/commit/8fb6541d1fd2a90fc4a40aaf742f7bda14b0eb6e))


### Features

* add dedicated docs with mkdocs ([#3](https://github.com/marianfoo/ui5-cc-excelUpload/issues/3)) ([77a6e06](https://github.com/marianfoo/ui5-cc-excelUpload/commit/77a6e065eb1f41adf7cdeccfdd241d513a943451))



## [0.3.3](https://github.com/marianfoo/ui5-cc-excelUpload/compare/v0.3.2...v0.3.3) (2022-12-07)


### Bug Fixes

* check did not work with fieldMatchType:label ([dde0bf9](https://github.com/marianfoo/ui5-cc-excelUpload/commit/dde0bf9a83ee159c3e70616d25e288a288b19c4e))


### Features

* convertion for date/time types before creation ([65823aa](https://github.com/marianfoo/ui5-cc-excelUpload/commit/65823aa3921a272fdd206b2fca2b9837006eef7d))



## [0.3.2](https://github.com/marianfoo/ui5-cc-excelUpload/compare/v0.3.1...v0.3.2) (2022-12-07)


### Features

* new parsing type of excel column header ([713e8a1](https://github.com/marianfoo/ui5-cc-excelUpload/commit/713e8a118334f76e62b21deb9ab9aba625f53cd9))



## [0.3.1](https://github.com/marianfoo/ui5-cc-excelUpload/compare/v0.3.0...v0.3.1) (2022-12-06)


### Bug Fixes

* xlsx not in build ([e3296c0](https://github.com/marianfoo/ui5-cc-excelUpload/commit/e3296c07c31eb17f7ead0e1e5c38a8c78e8a8b02))



## [0.3.0](https://github.com/marianfoo/ui5-cc-excelUpload/compare/v0.2.2...v0.3.0) (2022-12-06)

### Breaking Changes

- Move to reuse component, change in implementation

## [0.2.2](https://github.com/marianfoo/ui5-cc-excelUpload/compare/v0.2.1...v0.2.2) (2022-12-01)


### Bug Fixes

* change path, only dist folder for app build ([300e2c5](https://github.com/marianfoo/ui5-cc-excelUpload/commit/300e2c59734802baf8dc6b5e6fcd59544ec57adc))



## [0.2.1](https://github.com/marianfoo/ui5-cc-excelUpload/compare/v0.2.0...v0.2.1) (2022-12-01)


### Bug Fixes

* remove wrong apostrophes from string ([b1d31dc](https://github.com/marianfoo/ui5-cc-excelUpload/commit/b1d31dc52c2f055b3c1b9a74fa7e4a9816de2832))



## [0.2.0](/compare/v0.1.2...v0.2.0) (2022-11-30)


### Features

* check for mandatory fields 0520ada
* try get file name from v4 model fa9a349



## [0.1.2](/compare/v0.1.1...v0.1.2) (2022-11-29)



## [0.1.1](/compare/v0.1.0...v0.1.1) (2022-11-29)



# 0.1.0 (2022-11-29)
