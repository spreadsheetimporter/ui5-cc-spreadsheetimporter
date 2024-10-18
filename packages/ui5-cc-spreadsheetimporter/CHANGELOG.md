# Changelog

## [1.4.2](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v1.4.1...ui5-cc-spreadsheetimporter-v1.4.2) (2024-10-18)


### Bug Fixes

* preview did not show all columns ([#638](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/638)) ([eca1534](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/eca15343c890cb6ab7725baef270d5004681ecec))

## [1.4.1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v1.4.0...ui5-cc-spreadsheetimporter-v1.4.1) (2024-09-21)


### Bug Fixes

* add `nl` language to manifest ([#633](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/633)) ([c9ea8ab](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/c9ea8abb174cfd78c6b7e7642793425071eaa8ea))

## [1.4.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v1.3.0...ui5-cc-spreadsheetimporter-v1.4.0) (2024-09-18)


### Features

* new language dutch (LLM translated) ([#631](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/631)) ([f4a7fae](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/f4a7fae77a113134d31853eebe35eeede1e4537d))

## [1.3.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v1.2.2...ui5-cc-spreadsheetimporter-v1.3.0) (2024-09-16)


### Features

* new parameter `bindingCustom` ([#628](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/628)) ([935ea47](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/935ea47628d098fe45f024f96e85111149a10694))


### Bug Fixes

* in V4 context check if it is possible to execute with `editFlow` ([#630](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/630)) ([c5701a9](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/c5701a918cfc1bb111c1e9b7d4002f4a92031f74))

## [1.2.2](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v1.2.1...ui5-cc-spreadsheetimporter-v1.2.2) (2024-09-10)


### Bug Fixes

* update `SheetJS` dependency to 0.20.3 ([#626](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/626)) ([58000d7](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/58000d7f9f2e17dc8a87b149b07190073dcd22ce))

## [1.2.1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v1.2.0...ui5-cc-spreadsheetimporter-v1.2.1) (2024-09-05)


### Bug Fixes

* get odata version from binding instead of context ([#618](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/618)) ([cf1f3a4](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/cf1f3a48e3139f55e7b4e15c428c158a40b3a417))

## [1.2.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v1.1.1...ui5-cc-spreadsheetimporter-v1.2.0) (2024-08-14)


### Features

* new event `preFileProcessing` ([#612](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/612)) ([966c3b1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/966c3b1f833caaf0c6a7476445ddd535d849937b))


### Bug Fixes

* `Edm.DateTimeOffset` parsing with and without precision ([#603](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/603)) ([6649d53](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/6649d5330ed71f7087818e291fb65c9e30c9eb4c))
* force refresh only for v2 and when refresh failed ([#596](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/596)) ([6f27348](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/6f27348f34409efe584583d3762aa11938dffeee))

## [1.1.1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v1.1.0...ui5-cc-spreadsheetimporter-v1.1.1) (2024-06-18)


### Bug Fixes

* dialog is blocking navigation in FE scenarios ([#579](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/579)) ([5a0b05d](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/5a0b05d051e083d367833da70e33d19464020b74))

## [1.1.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v1.0.0...ui5-cc-spreadsheetimporter-v1.1.0) (2024-06-13)


### Features

* new option `excludeColumns` ([#575](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/575)) ([a639b02](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/a639b0250242870cafa3b500dfd11c2c0c32bd37))
* parse `Edm.Time` when excel data is text ([#573](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/573)) ([cfaeace](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/cfaeace8f53f9ed81cc8f10fc51519ab1e68605e))

## [1.0.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.34.1...ui5-cc-spreadsheetimporter-v1.0.0) (2024-05-23)


### ⚠ BREAKING CHANGES

* release 1.0.0

### Features

* new language portuguese by LLM translation ([#553](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/553)) ([76d246c](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/76d246c55cd0e533d35c6972b8c587bf78a056bc))
* release 1.0.0 ([345b82f](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/345b82fff57f736bd037cfb587ae58e835df3b63))


### Bug Fixes

* dialog margin in `sapUiSizeCozy` mode ([#562](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/562)) ([4104fb9](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/4104fb9869abc61314e4f930e720a09c387dd0a5))

## [0.34.1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.34.0...ui5-cc-spreadsheetimporter-v0.34.1) (2024-05-08)


### Bug Fixes

* add seconds when parsing odata time ([#549](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/549)) ([b5f69bc](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/b5f69bc5e1718e8cc08a22041d3ba08eb11a292a))

## [0.34.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.33.4...ui5-cc-spreadsheetimporter-v0.34.0) (2024-05-08)


### ⚠ BREAKING CHANGES

* enable packaged deployment ([#547](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/547)) ([6d3450b](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/6d3450bc149b12938eaadefeb29771428aa2be18))

because of a bug, it is not possible to do a packaged central deployment of bug in the abap system.  
The Bug was fixed as described in [#490](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/490), but still relevant in older ABAP Systems.  
To make things easier and make the packaged central deployment possible at all, it is necessary to add the version to the metadata name and make the resources path lowercase because abap system can´t handle camel case.  

#### New metadata name
```yml
ui5-cc-spreadsheetimporter-v0-34-0
```

#### New lowercase resourceRoots path
Instead of `thirdparty/customControl/spreadsheetImporter/v0_34_0` it is `thirdparty/customcontrol/spreadsheetimporter/v0_34_0`

## [0.33.4](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.33.3...ui5-cc-spreadsheetimporter-v0.33.4) (2024-04-19)


### Bug Fixes

* make `fireEventAsync` more stable ([#534](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/534)) ([1ab4cd2](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/1ab4cd278a810f743ff0024086a6dde6ef04293a))

## [0.33.3](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.33.2...ui5-cc-spreadsheetimporter-v0.33.3) (2024-04-18)


### Bug Fixes

* design improvements ([#527](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/527)) ([af21d7b](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/af21d7b4daba8060eb071da62c59dd16310299a7))
* make sure payload in `changeBeforeCreate` is used ([#528](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/528)) ([89f3292](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/89f329243a438ffc7bd8a7fec7d6183cfbe46b1b))
* reset context on server error ([#525](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/525)) ([d1dd033](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/d1dd03351787f9bb07f19883f9e92cc93b23dbc3))

## [0.33.2](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.33.1...ui5-cc-spreadsheetimporter-v0.33.2) (2024-04-08)


### Bug Fixes

* special case for Edm.Byte for OData V2 ([#519](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/519)) ([36b5f7c](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/36b5f7c3eb83c8ba02f9bc69405fb68738d49ee8))
* update SheetJS to 0.20.2 ([#521](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/521)) ([29301d2](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/29301d23a7163d267a84532593646b1b4685b2aa))

## [0.33.1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.33.0...ui5-cc-spreadsheetimporter-v0.33.1) (2024-02-29)


### Bug Fixes

* parse Edm.Byte and Edm.SByte ([#506](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/506)) ([1b50aef](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/1b50aef494c21a39674ac1cce871b5e3889b9671))

## [0.33.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.32.0...ui5-cc-spreadsheetimporter-v0.33.0) (2024-02-23)


### Features

* possibility to overwrite i18n texts ([#501](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/501)) ([4c08ed7](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/4c08ed701d994a1e3c8cea60311375a088c430ee))

## [0.32.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.31.6...ui5-cc-spreadsheetimporter-v0.32.0) (2024-02-15)


### Features

* add drag&drop to dialog to upload files ([#496](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/496)) ([ea55361](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/ea5536197d80499ac523bb18fd929cf89a7c4c9f))

## [0.31.6](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.31.5...ui5-cc-spreadsheetimporter-v0.31.6) (2024-02-14)


### Bug Fixes

* turn off `continue anyway` on error dialog after upload button press ([#494](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/494)) ([fb82978](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/fb82978b1dbb4bc9e1d7b660856af4308b93febb))

## [0.31.5](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.31.4...ui5-cc-spreadsheetimporter-v0.31.5) (2024-02-05)


### Bug Fixes

* make sure Edm.Date uses the correct date ([#487](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/487)) ([934fe3b](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/934fe3b7ebce8fd3d4cb44f403421da6850613bd))

## [0.31.4](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.31.3...ui5-cc-spreadsheetimporter-v0.31.4) (2024-02-01)


### Bug Fixes

* show error in standalone mode after upload button press ([#480](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/480)) ([9348694](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/9348694cad5204cfb31188d0db54c9bb0e4fecef))

## [0.31.3](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.31.2...ui5-cc-spreadsheetimporter-v0.31.3) (2024-01-30)


### Bug Fixes

* preventDefault on event `uploadButtonPress` ([#476](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/476)) ([4c6033e](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/4c6033efb80a2b747d86e56273919e4b67f38118))

## [0.31.2](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.31.1...ui5-cc-spreadsheetimporter-v0.31.2) (2024-01-23)


### Bug Fixes

* update sheetjs to 0.20.1 ([#463](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/463)) ([16a2722](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/16a2722dd7858c77a58aca178bbe2b338df0686a))

## [0.31.1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.31.0...ui5-cc-spreadsheetimporter-v0.31.1) (2024-01-03)


### Bug Fixes

* string assignment using nullish coalescing operator ([#450](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/450)) ([530fcbd](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/530fcbdf264f9753818131049e129fdc2e5ed832))

## [0.31.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.30.0...ui5-cc-spreadsheetimporter-v0.31.0) (2024-01-02)


### Features

* add config for btp deployment with managed approuter ([#419](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/419)) ([470b68f](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/470b68f5e873673c3711b91bfc87d81143c40222))
* new checks for maxLength and duplicate columns ([#447](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/447)) ([7d47e28](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/7d47e28d925d103dd894154b862ee6801bd84864))
* new config to define columns in preview ([#443](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/443)) ([b98db12](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/b98db12526503cd72b405bc00b6ce05b942d647b))
* new option `createActiveEntity´ to directly create active entities ([#438](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/438)) ([a3449f7](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/a3449f77c84d9581a39a19c24eb6e21aacbb25b7))


### Bug Fixes

* check if ComponentContainerData is available ([#445](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/445)) ([c484e42](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/c484e42b292831e5884d499b6b6a89060f919626))

## [0.30.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.29.1...ui5-cc-spreadsheetimporter-v0.30.0) (2023-12-21)


### Features

* enable spreadsheet importer for ui5 v2 ([#440](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/440)) ([763c2c7](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/763c2c7d7ceea391e2f0ff5701ecf22fe3a29893))
* new config to continue batch processing on errors ([#441](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/441)) ([25dda51](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/25dda51f42a08b611a67e6d0a4aba69b3ba0b212))
* new config to send the spreadsheet row to the backend ([#439](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/439)) ([44af189](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/44af1890ae7c524ffb4b98962bb0ca670c609c54))
* use events with async attached function s([#435](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/435)) ([2c95615](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/2c956153fd32946bcb491b721847064898472779))

## [0.29.1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.29.0...ui5-cc-spreadsheetimporter-v0.29.1) (2023-12-16)


### Bug Fixes

* add missing row number in excel log file ([#421](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/421)) ([6b05df3](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/6b05df3a6d16d8b46b2a0fc19441cebc172c9d7a))
* avoid error when annotation not found ([#430](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/430)) ([a989e5f](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/a989e5f3ee8552e20badf7d0f440cc76f4c90829))
* better error handling on backend errors ([#426](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/426)) ([7541ab9](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/7541ab98c5f7dbe105a388121a4cf195c2adf285))
* sampleData only if defined ([#428](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/428)) ([dfdacb1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/dfdacb160f3b26bca0772608ed31bb7d503d1d59))
* use sample data in standalone mode ([#429](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/429)) ([3b9b165](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/3b9b165e47cd23cfb7cf1a43b3ccfca7c1565fcc))

## [0.29.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.28.1...ui5-cc-spreadsheetimporter-v0.29.0) (2023-10-30)


### Features

* new config to provide own template file ([#406](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/406)) ([591e284](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/591e28421f213ca515a14f405008d50488806037))
* new config to skip columns check ([#404](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/404)) ([6a14152](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/6a14152df7790830a6a2e3b811d1effa0d87ca93))


### Bug Fixes

* add parsedData to CheckBeforeRead event ([#407](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/407)) ([110933a](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/110933a3b910fb4543f40dc2994049709f30776c))
* hide generateTemplate in standalone ([#409](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/409)) ([b9172db](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/b9172dbbbd2e0c7dbcf15982b0f8a379e8532335))

## [0.28.1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.28.0...ui5-cc-spreadsheetimporter-v0.28.1) (2023-10-18)


### Bug Fixes

* add missing event requestCompleted to eventMethodMap ([#389](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/389)) ([51f5c04](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/51f5c042ce648707ed31a6bd0e4af6e0d4f53cb3))
* add xlsm add upload type ([#395](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/395)) ([0ce65d1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/0ce65d10de4010d50ce6d4c02be110e9aed8513b))

## [0.28.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.27.1...ui5-cc-spreadsheetimporter-v0.28.0) (2023-10-12)


### Features

* new event `requestCompleted` ([#386](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/386)) ([81baaac](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/81baaac94a73fb47f3f42968bf933b54e72961bf))

## [0.27.1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.27.0...ui5-cc-spreadsheetimporter-v0.27.1) (2023-10-10)


### Bug Fixes

* preview ([#382](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/382)) ([8eb8b28](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/8eb8b28c9da5a02d6a241a36c7943276e110a251))

## [0.27.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.26.1...ui5-cc-spreadsheetimporter-v0.27.0) (2023-10-06)


### Features

* add sheet selector if multiple sheets in file ([#376](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/376)) ([94de1b4](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/94de1b4564084931251a64c1c2e30c00c6241511))
* error report can be downloaded as spreadsheet file ([#378](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/378)) ([7fc727e](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/7fc727e1184efc6c8e497b5d5af0f1f19af08a22))


### Bug Fixes

* i18n date parser attribute ([#380](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/380)) ([b0e8279](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/b0e82791347322c7e1c23f1527489c303602348d))

## [0.26.1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.26.0...ui5-cc-spreadsheetimporter-v0.26.1) (2023-09-30)


### Bug Fixes

* event attachment of componentContainer ([#372](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/372)) ([5f71366](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/5f71366838a13638291fa83dcee934dce92bc519))

## [0.26.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.25.4...ui5-cc-spreadsheetimporter-v0.26.0) (2023-09-30)


### ⚠ BREAKING CHANGES

* usage of UIComponent to return button ([#370](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/370))

### Features

* usage of UIComponent to return button ([#370](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/370)) ([6ef0f46](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/6ef0f46493f82697e9d5d56fa4d684070a7e865e))

## [0.25.4](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.25.3...ui5-cc-spreadsheetimporter-v0.25.4) (2023-09-28)


### Bug Fixes

* template generation in standalone mode ([#368](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/368)) ([c0af0d9](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/c0af0d9a40f4abd25319be0a2ae86be5993dce32))

## [0.25.3](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.25.2...ui5-cc-spreadsheetimporter-v0.25.3) (2023-09-11)


### Bug Fixes

* check for odata type config parameter ([#361](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/361)) ([86706cc](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/86706cc56395b3ef74ecd0b90021162144a000e5))
* use label in preview table ([#359](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/359)) ([9a02b30](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/9a02b301ada2e60272e6363ad71c2eabd0e024b1))

## [0.25.2](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.25.1...ui5-cc-spreadsheetimporter-v0.25.2) (2023-09-06)


### Bug Fixes

* readAllSheets Parameter fixed ([#354](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/354)) ([88475fb](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/88475fb46df2b1a41de86ba16d82c2e257b0951c))

## [0.25.1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.25.0...ui5-cc-spreadsheetimporter-v0.25.1) (2023-09-06)


### Bug Fixes

* close busy dialog on backend error ([#348](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/348)) ([e1cc5e6](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/e1cc5e649c92d64cb4c10640a50426ca7cc12816))

## [0.25.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.24.0...ui5-cc-spreadsheetimporter-v0.25.0) (2023-09-06)


### Features

* add sheet name to payload  ([#346](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/346)) ([4af5b47](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/4af5b47b9f860790a53dbc2b8319fb1f77ed2cbc))


### Bug Fixes

* add missing event parameter for uploadButtonPress event ([#344](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/344)) ([93b7613](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/93b7613084b86cfcf8768d036ab359be500baf95))
* make parameter optional ([#341](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/341)) ([d52486d](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/d52486d2053f4e529a0d297b73eb03be589bb1d5))

## [0.24.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.23.1...ui5-cc-spreadsheetimporter-v0.24.0) (2023-08-10)


### Features

* use odataType to create data for other entity ([#334](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/334)) ([7330ebb](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/7330ebbd6ed89db1bf483f3aea97afe735edf821))

## [0.23.1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.23.0...ui5-cc-spreadsheetimporter-v0.23.1) (2023-08-03)


### Bug Fixes

* enable usage of controller extensions ([#330](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/330)) ([f767a5c](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/f767a5c8b1fe2f99f13087c04288364f7db4ade2))

## [0.23.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.22.0...ui5-cc-spreadsheetimporter-v0.23.0) (2023-08-03)


### Features

* add progress indicator for large files ([#327](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/327)) ([3bcfc26](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/3bcfc262dfdc75b8364aadbb37cacf84ad589fa8))
* improve tablechooser ([#326](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/326)) ([268a1a7](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/268a1a7606624c7d5d326a1192c09c4f58b7dc9b))
* new TableChooser if multiple tables in view ([#325](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/325)) ([bfe5096](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/bfe509691e6859f3aeb67a3c74cbe4ab62bd529f))


### Bug Fixes

* rename tableChooser to tableSelector ([#328](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/328)) ([50b21c3](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/50b21c33fa48b44ecaf5b5720ca4775ad8426ba2))

## [0.22.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.21.2...ui5-cc-spreadsheetimporter-v0.22.0) (2023-07-12)


### Features

* new option, add your own `sampleData` ([#318](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/318)) ([24cef4f](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/24cef4f95944cbb2347b3474fe20c09f6ff3cee6))
* parse i18n texts from metadata ([#319](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/319)) ([278447d](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/278447d90fa96de7e2d2a8dcce56bb66fbb9d8f7))


### Bug Fixes

* continue on error did not work ([#316](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/316)) ([5d1d55c](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/5d1d55c9a59bcd30dbfe0ceeaacf696cac9d802f))

## [0.21.2](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.21.1...ui5-cc-spreadsheetimporter-v0.21.2) (2023-07-03)


### Bug Fixes

* update `ui5-tooling-transpile` to use types in apps ([#301](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/301)) ([7e0a35c](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/7e0a35c0e6d3f21721105bccb3def0e76aa59f3c))

## [0.21.1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.21.0...ui5-cc-spreadsheetimporter-v0.21.1) (2023-06-30)


### Bug Fixes

* change texts when records are uploaded to app ([#293](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/293)) ([13555fd](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/13555fdcb0bdedb95db1ccd7dacb3fe04370f0d0))

## [0.21.0](https://github.com/marianfoo/ui5-cc-excelUpload/compare/ui5-cc-spreadsheetimporter-v0.20.0...ui5-cc-spreadsheetimporter-v0.21.0) (2023-06-28)


### ⚠ BREAKING CHANGES

The package was renamed from `ui5-cc-excelupload` to `ui5-cc-spreadsheetimporter`!  

* rename to spreadsheet importer (removing word `excel`) ([#282](https://github.com/marianfoo/ui5-cc-excelUpload/issues/282))

### Features

* rename to spreadsheet importer (removing word `excel`) ([#282](https://github.com/marianfoo/ui5-cc-excelUpload/issues/282)) ([e661c3e](https://github.com/marianfoo/ui5-cc-excelUpload/commit/e661c3ea509c6a8cc5631a24587ea7901eb504a3))

## [0.20.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.19.1...ui5-cc-spreadsheetimporter-v0.20.0) (2023-06-27)


### Features

* added sample data to template including formats and option to hide it ([#275](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/275)) ([3766049](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/3766049fcab72c92d31d87b70826432756789775))
* export ts types and new ts sample app ([#278](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/278)) ([46fbaee](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/46fbaee5c0440cb9ca81c8ba421470169dfb85e4))
* option to define available options for user ([#264](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/264)) ([e6abe2d](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/e6abe2df8afe470ce883be54d472dec32872febe))

## [0.19.1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.19.0...ui5-cc-spreadsheetimporter-v0.19.1) (2023-06-19)


### Bug Fixes

* improve error Message on table discovery ([#270](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/270)) ([0215ba0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/0215ba0789c15626d51f48206fe8591f4e32a273))

## [0.19.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.18.1...ui5-cc-spreadsheetimporter-v0.19.0) (2023-06-10)


### Features

* add debugging option ([#257](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/257)) ([61a5f3f](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/61a5f3f8a3fe1e1e732ca5b1b58ae7a3e5cfbf8a))

## [0.18.1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.18.0...ui5-cc-spreadsheetimporter-v0.18.1) (2023-06-09)


### Bug Fixes

* removed check for nullable fields ([#255](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/255)) ([f4b569a](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/f4b569a41a1580f67a085c14c29250f0865423e6))

## [0.18.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.17.5...ui5-cc-spreadsheetimporter-v0.18.0) (2023-06-02)


### Features

* add new option to show backend error message ([#236](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/236)) ([f2a38dd](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/f2a38dd412cf341c3848b1e422a5c3fce3ceb258))
* show options menu for some configurations ([#241](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/241)) ([8bfae76](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/8bfae768d9971888a3b0519f86b8fe36cf013ee4))


### Bug Fixes

* different format in float and integer for v4 ([#240](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/240)) ([23b1b9a](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/23b1b9acca8ee9ce0dc4d90067d716d29799f4cf))
* improve handling of backend errors ([#213](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/213)) ([5d06db6](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/5d06db6e7183bb3dcf6b71cac3a11fc779bcd2b0))
* send double as string value ([#234](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/234)) ([799a3ef](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/799a3ef4c42da2cbeb3db3eb752ba80f49032aef))
* use busy indicator on opening options menu ([#242](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/242)) ([0151700](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/0151700de0f6e85260b903f59283046de787cee1))

## [0.17.5](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.17.4...ui5-cc-spreadsheetimporter-v0.17.5) (2023-05-22)


### Bug Fixes

* add missing check on option "skip checks mandatory field" in v2 ([#229](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/229)) ([6c7f53b](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/6c7f53bdc72210f9f91a1322a6603846d1fc889e))
* skip sap properties ([#228](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/228)) ([69bbe03](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/69bbe0355169dc129ef288524ee33f274bafa16a))

## [0.17.4](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.17.3...ui5-cc-spreadsheetimporter-v0.17.4) (2023-05-22)


### Bug Fixes

* show raw value on parser error ([#227](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/227)) ([50142bf](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/50142bf61490bf1e302f7150e48157339ed553bc))

## [0.17.3](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.17.2...ui5-cc-spreadsheetimporter-v0.17.3) (2023-05-20)


### Bug Fixes

* remove popup in FE scenario when uploading ([#223](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/223)) ([f7d12b3](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/f7d12b3f63c96dee508d246e0c1f5964fc80331f))

## [0.17.2](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.17.1...ui5-cc-spreadsheetimporter-v0.17.2) (2023-05-20)


### Bug Fixes

* add missing Edm Types (Decimal, Integer) ([#221](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/221)) ([7bda6d5](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/7bda6d5a3801844bad96d4ea47454ddfaabf874c))
* rename option to skip all metadata mandatory field checks ([#220](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/220)) ([a7ac5e4](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/a7ac5e470f4ff2854a87feed89feb86ce29ee30f))

## [0.17.1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.17.0...ui5-cc-spreadsheetimporter-v0.17.1) (2023-05-20)


### Bug Fixes

* messages are not a mandatory field ([#217](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/217)) ([bc20e5c](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/bc20e5cad4cf9e6d234bff70c994f8b08da805fb))
* parsing booleans ([#219](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/219)) ([82777f9](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/82777f90f73a982acf3a3bcd7aef5920ddf16865))

## [0.17.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.16.4...ui5-cc-spreadsheetimporter-v0.17.0) (2023-05-18)


### ⚠ BREAKING CHANGES

* change API to add messages to Error Dialog ([#211](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/211))

### Features

* add option to hide the "preview data" button ([#212](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/212)) ([65bcb5b](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/65bcb5b0c5581f3e8f2ec48ac14bc8dfe9e6a983))
* add option to set decimal seperator ([#199](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/199)) ([ba4a4f2](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/ba4a4f275211af7754d8b11069c26aa666d5fc75))
* add option to skip Fields with `Nullable=false` ([#216](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/216)) ([28ded2d](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/28ded2d5db457a145ec3462f0120482dc631193a))
* change API to add messages to Error Dialog ([#211](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/211)) ([a06ec4e](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/a06ec4e1b845db4636842536c2611c3027798092))
* show faulty value in the error dialog ([#197](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/197)) ([8e09745](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/8e09745310700027f4cf1ee52885fb5525107666))
* warning when numbers are formatted in file ([#205](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/205)) ([701b31e](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/701b31e3e126b25c3a8cde8dcb7b48513498f3fe))

## [0.16.4](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.16.3...ui5-cc-spreadsheetimporter-v0.16.4) (2023-05-09)


### Bug Fixes

* check on mandatory fields ([#192](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/192)) ([05dbcc9](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/05dbcc924109fd0c43302cc875a04e5ba83f14d4))

## [0.16.3](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.16.2...ui5-cc-spreadsheetimporter-v0.16.3) (2023-05-09)


### Bug Fixes

* correct check for mandatory fields ([#190](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/190)) ([83a7d6f](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/83a7d6fa5f5773dc17fbf4d1d0c0b82a71c18f71))

## [0.16.2](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.16.1...ui5-cc-spreadsheetimporter-v0.16.2) (2023-05-09)


### Bug Fixes

* add check if no annotations are found ([#188](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/188)) ([bd440bf](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/bd440bf2ad5838a4d403fd07b2062ab1ab7396cf))

## [0.16.1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.16.0...ui5-cc-spreadsheetimporter-v0.16.1) (2023-05-08)


### Bug Fixes

* remove empty line ([ae7bce8](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/ae7bce8f3cd8962e454e51239d878e1fb2301db5))

## [0.16.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.15.0...ui5-cc-spreadsheetimporter-v0.16.0) (2023-05-08)


### Features

* add `continue on error` button in error dialog ([#182](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/182)) ([40d7d28](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/40d7d2840522be0ed8d2b6edf09ad67268ed7348))
* add options menu for config ([#183](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/183)) ([7533ba9](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/7533ba91072b10fdfa6085117b9be98eef32304a))
* revert removal of option `fieldMatchType` ([#157](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/157)), new default `labelTypeBrackets` ([#173](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/173)) ([7a91c19](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/7a91c194c039f2fc3e5a1dbddeddc897d4fe89ab))


### Bug Fixes

* i18n language codes ([#179](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/179)) ([851a50c](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/851a50c5b986e95789c2dc23f32603ed6ec20379))
* remove ids from options fragment ([#184](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/184)) ([be2e947](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/be2e947e47b75a4b6e3ebe3abe5a41022c415f3e))

## [0.15.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.14.1...ui5-cc-spreadsheetimporter-v0.15.0) (2023-04-18)


### ⚠ BREAKING CHANGES

* removal of option `fieldMatchType` ([#157](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/157))

### Features

* check for mandatory fields annotation ([#162](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/162)) ([6c99324](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/6c9932407c954b31784f24fda0b44d0d5f727a83))
* removal of option `fieldMatchType` ([#157](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/157)) ([4346e1b](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/4346e1bb00473363167b0d24c8ebf14e40b073cb))

## [0.14.1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.14.0...ui5-cc-spreadsheetimporter-v0.14.1) (2023-04-18)


### Bug Fixes

* error message shown twice on listreport ([#152](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/152)) ([d0a3d12](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/d0a3d12b3e562af8e3ae2ee111271b77ed7fe6fc))
* improve UX on upload dialog ([#151](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/151)) ([4ca9e1f](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/4ca9e1f4d6cc319b1c49d297ea104d823443c590))

## [0.14.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.13.0...ui5-cc-spreadsheetimporter-v0.14.0) (2023-04-14)


### Features

* handle backend error ([#110](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/110)) ([3abc24a](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/3abc24a3bdcc6fb201197581a702cbcac42d9a22))
* preview of data uploaded to app and row counter ([#148](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/148)) ([fb57789](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/fb5778954c5897e6e0b054e7d0771eae2c420598))

## [0.13.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.12.3...ui5-cc-spreadsheetimporter-v0.13.0) (2023-04-13)


### Features

* add event `uploadButtonPress` ([#143](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/143)) ([23b918c](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/23b918c42369bc3607a239037beb540b0ec90c60))
* new option to upload in standalone mode ([#145](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/145)) ([ead496f](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/ead496fab2329723df23e40b7873b9e54d481413))

## [0.12.3](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.12.2...ui5-cc-spreadsheetimporter-v0.12.3) (2023-04-11)


### Bug Fixes

* enablement for V4 FPM ([#135](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/135)) ([1bf89ba](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/1bf89bae4375f202ed04113fa183da7fcc0a55ba))

## [0.12.2](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/ui5-cc-spreadsheetimporter-v0.12.1...ui5-cc-spreadsheetimporter-v0.12.2) (2023-04-10)


### Bug Fixes

* update correct versions in code ([#124](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/124)) ([71f106e](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/71f106e908e85f444a8f8a1fe5974d3aedbeca25))

## 0.12.1 (2023-04-07)


### Bug Fixes

* remove unused imports ([#119](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/119)) ([2eea092](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/2eea0929757be965c1011abad4b82aa5f58a0a45))

## [0.12.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/v0.11.4...v0.12.0) (2023-04-04)


### Features

* add Support for OpenUI5 ([#97](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/97)) ([9f1ed6c](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/9f1ed6c471c9d42e70fa265340df7c2dcaaa1ab3))
  * including [Sample App for OpenUI5](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/tree/main/examples/packages/ordersv2freestylenondraftopenui5) and wdi5 Tests
* improve checks for all Edm Types ([#105](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/105)) ([dc91ee2](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/dc91ee252e1b9c2d204a1486ff8cf1f13ec3109e))
  * Documentation for the improved Error Handling can be found [here](https://docs.spreadsheet-importer.com/pages/Checks/)
* improved checks on the data formats and error handling ([#103](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/103)) ([801cfcb](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/801cfcb9b5ed24807144707d03d1db5b0247178e))
  * Improvements for custom error handling. Documentation can be found [here](https://docs.spreadsheet-importer.com/pages/Events/#check-data-before-upload-to-app)
* new automatically translated languages added ([#107](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/107)) ([477e899](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/477e899d0dbd91149b2bad608bc12579e5ef6ac4))
  * the english language was automatic translated to following languages: `Chinese`, `French`, `Spanish`, `Italien`, `Hindi`, `Japanese`

## [0.11.4](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/v0.11.3...v0.11.4) (2023-03-27)


### Bug Fixes

* namespace at manifest was not replaced correctly ([#91](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/91)) ([f60c19b](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/f60c19b99d5e9a6c2607d76386dea7f710a52d31))

## [0.11.3](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/v0.11.2...v0.11.3) (2023-03-20)


### Bug Fixes

* use attribute tableId to get tableObject ([#84](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/84)) ([0860373](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/0860373725854a3bcc613925453933051a4e5a2a))

## [0.11.2](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/v0.11.1...v0.11.2) (2023-03-18)


### Bug Fixes

* missing check for active draft option ([#81](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/81)) ([e15e2eb](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/e15e2ebd79d2f59f6597c7f9923ea3dc95493395))

## [0.11.1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/v0.11.0...v0.11.1) (2023-03-17)


### Bug Fixes

* use batchSize even when payload has less  then 1000 lines ([#77](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/77)) ([c0926d1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/c0926d12d9a224e48d0ca5d1b20f00ada693f89e))

## [0.11.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/v0.10.0...v0.11.0) (2023-03-17)


### Features

* new option `batchSizes` to slice batch calls to backend ([#75](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/75)) ([8f7684f](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/8f7684f8ec9efb840a58bb8e970821f92f0230f5))

## [0.10.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/v0.9.1...v0.10.0) (2023-03-12)


### ⚠ BREAKING CHANGES

* use namespace with underscores ([#72](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/72))


## [0.9.1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/v0.9.0...v0.9.1) (2023-03-02)


### Bug Fixes

* check for binding before open dialog ([#62](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/62)) ([c1f545f](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/c1f545f830c4a6d0ed5ef3be2f07285e4551b926))

## [0.9.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/v0.8.1...v0.9.0) (2023-02-18)


### Features

* check if all columns name in file match metadata ([#57](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/57)) ([7c538a0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/7c538a0d68e1fb7a4ea9d09dff560fccc08a09ec))
* support for UI5 Tooling V3 ([#47](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/47)) ([d9f52e9](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/d9f52e9c02c8060c284f47ef1a12f322879b4169))


### Bug Fixes

* Align Dialogs more with Fiori Guidelines ([#54](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/54)) ([4f74eeb](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/4f74eeb66b6b64e6574632eea6837f88915c28ab))
* horizontal scrollbar in dialog on mobile view ([#55](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/55)) ([3288a25](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/3288a25b28230655c805552ff14ca8d16f57e990))

## [0.8.1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/v0.8.0...v0.8.1) (2023-02-10)

### Bug Fixes

* remove scrollbar from dialog ([#45](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/45)) ([bb1b197](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/bb1b1979ef9a49a8c26477970f6a03d411ba93e8))

## [0.8.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/v0.7.0...v0.8.0) (2023-02-10)

### Features

* setup for central deployment abap ([#41](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/41)) ([54bc904](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/54bc904f1e79faf7639218692b5e7e01a86dd4eb))

## [0.7.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/v0.6.0...v0.7.0) (2023-02-03)

**Breaking Changes**

Changes involving in the manifest and custom code implementation.  
See [Documenation](https://docs.spreadsheet-importer.com/pages/GettingStarted/#general-setup)
### Bug Fixes

* component-preload.js and componentUsages in examples apps ([#40](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/40)) ([33c6e88](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/33c6e880b32b13d36638e6dfaddbf69cd5263701))
* upload same file two times ([#37](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/37)), closes [#36](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/36) ([553e5a8](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/553e5a8f84f12b96f6e6f04f83efef009fc3a23b))
* using component-preload.js ([#31](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/31)) ([4b223bb](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/4b223bbb044ef441435d6733e857574c7e5775d4))


### Features

* add intial csv support ([#33](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/33)) ([f7ec051](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/f7ec051ad20c5304764f97d3d1b89358cee279f1))



## [0.6.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/v0.5.0...v0.6.0) (2023-01-14)


### Bug Fixes

* open  dialog twice again ([#20](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/20)) ([7a37483](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/7a37483d93f07e7b9a9c72ab774a045a06d2766d))


### Features

Created compatibility and wdi5 tests for List Report and Object Page in Draft Mode for OData V2 (Versions 108,96,84,71) and OData V4 (Versions 108,96,84)  
More info see [Supported Versions](https://docs.spreadsheet-importer.com/pages/SupportVersions/)

* compatibility/wdi5 tests with v2 FE 96/84/71 ([3f010d9](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/3f010d9a1a360702972552b647f8f20368d72640))
* support for v4 96/84 ([#16](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/16)) ([109813f](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/109813f8e20acc16d351da04c80b0208b90008c7))
* working in Draft List Report V2/V4 ([#17](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/17)) ([cc07d38](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/cc07d387e8af2afb45877887911a68f726945646))
* works in ListReport/ObjectPage V4/V2 and Freestyle V2([#10](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/10)) ([d9432d2](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/d9432d25142addd8ff7fbe804f9a832692588ef4))



## [0.5.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/v0.4.0...v0.5.0) (2023-01-04)


### Features

* init i18n ([#8](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/8)) ([593b009](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/593b009298bfc61c2bedce1e23573e96e8ff9e3a))
* multiversion support ([#6](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/6)) ([68aa9ca](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/68aa9ca2dab84bac0bcd81406636d87038fc1b2e))
* works in ListReport/ObjectPage V4/V2, V4 FPM and Freestyle V2([#10](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/10)) ([d9432d2](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/d9432d25142addd8ff7fbe804f9a832692588ef4))
* new option for draft Activation ([#10](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/10)) ([d9432d2](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/d9432d25142addd8ff7fbe804f9a832692588ef4))



## [0.4.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/v0.3.4...v0.4.0) (2022-12-23)

**Breaking Changes**

Changes involving in the manifest and custom code implementation.  
See [Documenation](https://docs.spreadsheet-importer.com/pages/GettingStarted/#general-setup)

### Features

* multiversion support ([#6](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/6)) ([68aa9ca](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/68aa9ca2dab84bac0bcd81406636d87038fc1b2e))



## [0.3.4](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/v0.3.3...v0.3.4) (2022-12-09)


### Bug Fixes

* change console output statement to debug ([cd19150](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/cd19150f7b0f816f8b624a9f52eb572b12b15598))
* Type "Edm.DateTime parsed in false format ([8fb6541](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/8fb6541d1fd2a90fc4a40aaf742f7bda14b0eb6e))


### Features

* add dedicated docs with mkdocs ([#3](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/3)) ([77a6e06](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/77a6e065eb1f41adf7cdeccfdd241d513a943451))



## [0.3.3](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/v0.3.2...v0.3.3) (2022-12-07)


### Bug Fixes

* check did not work with fieldMatchType:label ([dde0bf9](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/dde0bf9a83ee159c3e70616d25e288a288b19c4e))


### Features

* convertion for date/time types before creation ([65823aa](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/65823aa3921a272fdd206b2fca2b9837006eef7d))



## [0.3.2](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/v0.3.1...v0.3.2) (2022-12-07)


### Features

* new parsing type of  column header ([713e8a1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/713e8a118334f76e62b21deb9ab9aba625f53cd9))



## [0.3.1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/v0.3.0...v0.3.1) (2022-12-06)


### Bug Fixes

* xlsx not in build ([e3296c0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/e3296c07c31eb17f7ead0e1e5c38a8c78e8a8b02))



## [0.3.0](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/v0.2.2...v0.3.0) (2022-12-06)

### Breaking Changes

- Move to reuse component, change in implementation

## [0.2.2](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/v0.2.1...v0.2.2) (2022-12-01)


### Bug Fixes

* change path, only dist folder for app build ([300e2c5](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/300e2c59734802baf8dc6b5e6fcd59544ec57adc))



## [0.2.1](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/compare/v0.2.0...v0.2.1) (2022-12-01)


### Bug Fixes

* remove wrong apostrophes from string ([b1d31dc](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/b1d31dc52c2f055b3c1b9a74fa7e4a9816de2832))



## [0.2.0](/compare/v0.1.2...v0.2.0) (2022-11-30)


### Features

* check for mandatory fields 0520ada
* try get file name from v4 model fa9a349



## [0.1.2](/compare/v0.1.1...v0.1.2) (2022-11-29)



## [0.1.1](/compare/v0.1.0...v0.1.1) (2022-11-29)



# 0.1.0 (2022-11-29)
