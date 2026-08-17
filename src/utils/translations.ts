/**
 * Multi-Language Translation Map for 2 Locales (English + French)
 * Includes authentic, localized translations for all app strings.
 */

import { LanguageCode } from '../types';

export interface LanguageMeta {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  parentFamily?: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
];

export interface UIStrings {
  appName: string;
  tagline: string;
  connectHub: string;
  mediaHub: string;
  arcadeHub: string;
  officeHub: string;
  telemetryHub: string;
  login: string;
  signup: string;
  logout: string;
  encrypted: string;
  decrypted: string;
  masterKey: string;
  emergency: string;
  messaging: string;
  socialFeed: string;
  phoneDialer: string;
  stickers: string;
  nightcorePlayer: string;
  iptvPlayer: string;
  rssReader: string;
  gamesArcade: string;
  pdfEditor: string;
  calculator: string;
  cameraRater: string;
  aviationDict: string;
  busTimetable: string;
  telemetry: string;
  language: string;
  error: string;
  success: string;
  home: string;
  bookFlight: string;
  manageBookings: string;
  checkIn: string;
  boardingPass: string;
  brioMiles: string;
  flightSchedules: string;
  inFlightServices: string;
  watchNow: string;
  remindMe: string;
  synopsis: string;
  genre: string;
  rating: string;
  duration: string;
  cast: string;
  tabletMode: string;
  mobileMode: string;
  dashboardMode: string;
  liveWeather: string;
  aqiIndex: string;
  metarTaf: string;
  humidity: string;
  windSpeed: string;
  windDirection: string;
  temperature: string;
  airQuality: string;
  rawMetar: string;
  rawTaf: string;
  searchAirport: string;
  goodAirQuality: string;
  fmTuner: string;
  seekDown: string;
  seekUp: string;
  savePreset: string;
  handsFreePhone: string;
  dialNumber: string;
  endCall: string;
  clear: string;
  cpuLoad: string;
  memoryUsage: string;
  fpsRate: string;
  securityIntegrity: string;
  settingsTitle: string;
  passphrasePrompt: string;
  encryptString: string;
  decryptString: string;
  displayMode: string;
  dayMode: string;
  nightMode: string;
  dashboard: string;
  mapAndTelemetry: string;
  welcomeToBrio: string;
  clock: string;
  stopwatch: string;
  timer: string;
  calendar: string;
  remindersEvents: string;
  weather: string;
  accountSettings: string;
  permanentUpload: string;
  temporaryUpload: string;
  selectFolderMode: string;
  speedPitch: string;
  nightcore: string;
  analogClock: string;
  vaultMasterKey: string;
  createEncryptedAccount: string;
  easyLoginUnlock: string;
  managePBKDF2Passphrase: string;
  aesGCM256Cryptography: string;
  updateMasterPassphrase: string;
  enterNewMasterPassphrase: string;
  reDeriveEncryptionKey: string;
  lockVaultLogout: string;
  usernameOperatorCall: string;
  emailAddressOptional: string;
  vaultMasterPassphrasePBKDF2: string;
  enterMasterSecretPassphrase: string;
  passphraseGeneratesClientSideKey: string;
  createEncryptedVault: string;
  unlockBrioVault: string;
  alreadyHavePassphrase: string;
  firstTimeCreateNewVault: string;
  allApplications: string;
  accountVaultSettings: string;
  operatorGuest: string;
  authenticatedSession: string;
  localEncryptionMode: string;
  loginSignUp: string;
  accountQRCode: string;
  scanToViewAccount: string;
  aes256VaultKey: string;
  masterPassphrase: string;
  verifySetKey: string;
  accountInfoMyPlanePics: string;
  backToHome: string;
  brioDroidAccountActive: string;
  openAppDrawer: string;
  apps: string;
  searchAppsFeatures: string;
  backKey: string;
  menuKey: string;
  homeKey: string;
  searchKey: string;
  accountSecuritySettings: string;
  manageVaultPassphrase: string;
  signOut: string;
  vaultLocked: string;
  sessionTerminated: string;
  vaultActive: string;
  customPassphraseActive: string;
  pleaseEnterValidPassphrase: string;
  vaultSecurityUpdated: string;
  encryptionError: string;
  authRequired: string;
  pleaseSignIn: string;
  launching: string;
  navigationError: string;
  qrError: string;
  failedToGenerateQR: string;
  vaultCheck: string;
  brioDroidMobile: string;
  permanentFolderLinked: string;
  vaultedLinkedMedia: string;
  temporarySessionImport: string;
  importedMediaFiles: string;
  folderImportError: string;
  noMediaFound: string;
  selectedFolderNoImageVideo: string;
  vaultSyncComplete: string;
  successfullyEncryptedVaulted: string;
  noValidMedia: string;
  pleaseSelectImageVideoFiles: string;
  vaultImportFailure: string;
  encryptionReadError: string;
  photoVaulted: string;
  parsedEncryptedAES256: string;
  vaultError: string;
  failedToEncryptPhotoMetadata: string;
  validationWarning: string;
  filenameStringRequired: string;
  filenameParseError: string;
  invalidFormatPattern: string;
  addPhoto: string;
  folderImport: string;
  uploadPhoto: string;
  searchRegistrationLiveryAirline: string;
  format: string;
  allPatterns: string;
  rangeFormatOnly: string;
  autoCorrectedOnly: string;
  airline: string;
  allAirlines: string;
  vault: string;
  parserEngine: string;
  spotterRanks: string;
  analytics: string;
  myplanePics3DVault: string;
  liquidGlassAircraftAlbum: string;
  autoFilenameParser: string;
  spotterRankingsStats: string;
  interactiveFilenameParserTester: string;
  liveExtractionTokens: string;
  formatMatchConfirmed: string;
  parseError: string;
  extractedRegistration: string;
  extractedSpecialLivery: string;
  formattedDate: string;
  matchedSpecificationRule: string;
  shotNumber: string;
  singleShot: string;
  autoCorrectionStatus: string;
  autoCorrectedParenthesesSpacing: string;
  standardCompliantFormat: string;
  normalized: string;
  albumFleetRankings: string;
  airlineAircraftModelRankings: string;
  topSpotterAirlinesRanking: string;
  rankedByPhotoDensity: string;
  registrations: string;
  vaultedPhotos: string;
  albumShare: string;
  rarity: string;
  topAircraftTypesModelsRanking: string;
  rankedByModelFrequency: string;
  sampleRegs: string;
  spotted: string;
  totalVaultedPhotos: string;
  uniqueRegistrations: string;
  militaryRangeFormats: string;
  autoCorrectedMatches: string;
  topAirlinesInVault: string;
  monthlySpottingTrends: string;
  temporarySessionUpload: string;
  permanentFolderLinkSave: string;
  chooseFolderImportStorageMode: string;
  aircraftImagesDetected: string;
  currentSessionOnly: string;
  processesFilesInMemory: string;
  clearedOnAppRestart: string;
  permanentlyLinksFolderLocation: string;
  restoresAutomatically: string;
  media: string;
  video: string;
  aes256: string;
  noValidMediaSelected: string;
  noValidMediaSelectedDesc: string;
  close: string;
  cancel: string;
  confirm: string;
  save: string;
  delete: string;
  edit: string;
  add: string;
  remove: string;
  upload: string;
  import_: string;
  export_: string;
  download: string;
  share: string;
  copy: string;
  paste: string;
  cut: string;
  select: string;
  deselect: string;
  selectAll: string;
  refresh: string;
  reload: string;
  reset: string;
  apply: string;
  submit: string;
  cancel_: string;
  ok: string;
  yes: string;
  no: string;
  confirm_: string;
  warning: string;
  info: string;
  quickDialer: string;
  recentNotes: string;
  nowPlaying: string;
  recentPhotos: string;
  weatherWidget: string;
  newsTicker: string;
  page: string;
  of: string;
  next: string;
  previous: string;
  perPage: string;
  noPhotosYet: string;
  importPhotosToGetStarted: string;
  noPhotosMatchFilters: string;
  tryAdjustingSearchOrUpload: string;
  vaultedPhotosLabel: string;
  autoCorrectedLabel: string;
  registrationsLabel: string;
  viewFullProfile: string;
  scanToOpenBrioProfile: string;
  loggedOut: string;
  userSessionTerminated: string;
  loading: string;
  brioCryptographicAccountActive: string;
  myplanePicsAlbum: string;
  scanQRToAccess: string;
  selectSystemLanguage: string;
  power: string;
  condition: string;
  humidityLabel: string;
  windSpeedLabel: string;
  airQualityLabel: string;
  scanToViewAccountInfo: string;
  qrCodeWillAppearHere: string;
  readingLight: string;
  attendantCall: string;
  headphones: string;
  flightTelemetryProgress: string;
  encryptedVoiceChannelReady: string;
  dialCall: string;
  encryptedCallLogs: string;
  broadcastPost: string;
  send: string;
  online: string;
  bluetooth: string;
  activeChannels: string;
  stickerName: string;
  category: string;
  addToVault: string;
  worldClockMatrix: string;
  start: string;
  pause: string;
  splitLap: string;
  lapSplitsHistory: string;
  hours: string;
  minutes: string;
  seconds: string;
  startCountdown: string;
  sun: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  addEvent: string;
  reminder: string;
  flightSpotting: string;
  meeting: string;
  task: string;
  liveGlobalRssIntelligenceHub: string;
  noArticlesFound: string;
  aircraftFlappy: string;
  takeoffAircraft: string;
  launchGame: string;
  communityCards: string;
  pressDealToStartHand: string;
  yourHoleCards: string;
  minesweeper: string;
  dailyLotteryDraw: string;
  casinoSlots: string;
  classicTetris: string;
  restart: string;
  unoCardsVsAI: string;
  drawDeck: string;
  topDiscard: string;
  girlsUndPanzerTankeryTactical: string;
  fireApheShell: string;
  documentProcessing: string;
  liveCustomIptvStreamTuner: string;
  loadSampleStream: string;
  clearList: string;
  iptvStreamWaitingRoom: string;
  noChannelsLoaded: string;
  customAudioStreamUrl: string;
  encryptedStickersVault: string;
  algorithmicSocialFeed: string;
  tuneFeedAlgorithm: string;
  feedAlgorithmParameters: string;
  officeProductivitySuite: string;
  automotiveSystemLocale: string;
  confirmProceedToHome: string;
  systemLocaleConfigured: string;
  pleaseSignInToAccess: string;
  selectedLabel: string;
  languageIFE: string;
  openLanguageScreen: string;
}

const DEFAULT_EN: UIStrings = {
  appName: 'Brio',
  tagline: 'Encrypted All-In-One Workstation',
  connectHub: 'Connect & Social',
  mediaHub: 'Media & Nightcore',
  arcadeHub: 'Arcade & Games',
  officeHub: 'Office & Productivity',
  telemetryHub: 'Aviation & Telemetry',
  login: 'Easy Login',
  signup: 'Create Vault Account',
  logout: 'Lock Vault',
  encrypted: 'AES-GCM Encrypted',
  decrypted: 'Decrypted Verified',
  masterKey: 'Master Key Active',
  emergency: 'Emergency Dial',
  messaging: 'Encrypted Messaging',
  socialFeed: 'Social Feed',
  phoneDialer: 'Call Dialer',
  stickers: 'Stickers Vault',
  nightcorePlayer: 'Nightcore Player',
  iptvPlayer: 'IPTV Live Streams',
  rssReader: 'RSS News Reader',
  gamesArcade: 'Arcade Games',
  pdfEditor: 'PDF Annotator & Editor',
  calculator: 'Graphic & Sci Calc',
  cameraRater: 'Camera Setup Rater',
  aviationDict: 'Aviation Dictionary',
  busTimetable: 'Bus Schedules',
  telemetry: 'System Telemetry',
  language: 'Language',
  error: 'Operation Error',
  success: 'Encrypted & Saved',
  home: 'Home',
  bookFlight: 'Book a Flight',
  manageBookings: 'Manage My Bookings',
  checkIn: 'Check-In Service',
  boardingPass: 'Retrieve Boarding Pass',
  brioMiles: 'BrioMiles Services',
  flightSchedules: 'Flight Schedules',
  inFlightServices: 'In Flight Services',
  watchNow: 'Watch Now',
  remindMe: 'Remind Me',
  synopsis: 'Synopsis',
  genre: 'Genre',
  rating: 'Rating',
  duration: 'Duration',
  cast: 'Cast',
  tabletMode: 'Tablet IFE',
  mobileMode: 'WP7 Mobile',
  dashboardMode: 'Infotainment GUI',
  liveWeather: 'Live Weather',
  aqiIndex: 'AQI Air Quality',
  metarTaf: 'Aviation METAR / TAF',
  humidity: 'Humidity',
  windSpeed: 'Wind Speed',
  windDirection: 'Wind Direction',
  temperature: 'Temperature',
  airQuality: 'Air Quality',
  rawMetar: 'Raw METAR Report',
  rawTaf: 'Forecast TAF',
  searchAirport: 'Search Airport / ICAO Code...',
  goodAirQuality: 'Good / Clean Air',
  fmTuner: 'FM Radio Tuner',
  seekDown: 'Seek Down',
  seekUp: 'Seek Up',
  savePreset: 'Save Preset',
  handsFreePhone: 'Hands-Free Phone',
  dialNumber: 'Dial Number',
  endCall: 'End Call',
  clear: 'Clear',
  cpuLoad: 'CPU Load',
  memoryUsage: 'Memory Usage',
  fpsRate: 'FPS Rate',
  securityIntegrity: 'AES Integrity',
  settingsTitle: 'Security & System Settings',
  passphrasePrompt: 'Enter Custom Passphrase...',
  encryptString: 'Encrypt String',
  decryptString: 'Decrypt String',
  displayMode: 'Display Mode',
  dayMode: 'Day Mode',
  nightMode: 'Night Mode',
  dashboard: 'Dashboard',
  mapAndTelemetry: 'Map & Telemetry',
  welcomeToBrio: 'Welcome to Brio',
  clock: 'Clock',
  stopwatch: 'Stopwatch',
  timer: 'Timer',
  calendar: 'Calendar',
  remindersEvents: 'Reminders & Events',
  weather: 'Weather',
  accountSettings: 'Account Settings',
  permanentUpload: 'Permanent Folder Link',
  temporaryUpload: 'Temporary Session Upload',
  selectFolderMode: 'Choose Folder Import Storage Mode',
  speedPitch: 'Speed / Pitch Shift',
  nightcore: 'Nightcore',
  analogClock: 'Analog Clock',
  vaultMasterKey: 'Vault Master Key',
  createEncryptedAccount: 'Create Encrypted Account',
  easyLoginUnlock: 'Easy Login & Unlock',
  managePBKDF2Passphrase: 'Manage your PBKDF2 Master Encryption Passphrase',
  aesGCM256Cryptography: 'AES-GCM 256-bit Client Cryptography',
  updateMasterPassphrase: 'Update Master Passphrase',
  enterNewMasterPassphrase: 'Enter new master passphrase...',
  reDeriveEncryptionKey: 'Re-derive Encryption Key',
  lockVaultLogout: 'Lock Vault & Logout',
  usernameOperatorCall: 'Username / Operator Call',
  emailAddressOptional: 'Email Address (Optional)',
  vaultMasterPassphrasePBKDF2: 'Vault Master Passphrase (PBKDF2 Derived)',
  enterMasterSecretPassphrase: 'Enter your master secret passphrase...',
  passphraseGeneratesClientSideKey: 'This passphrase generates your client-side AES-256 GCM key.',
  createEncryptedVault: 'Create Encrypted Vault',
  unlockBrioVault: 'Unlock Brio Vault',
  alreadyHavePassphrase: 'Already have a passphrase? Unlock Vault',
  firstTimeCreateNewVault: 'First time? Create a new Vault Account',
  allApplications: 'All Applications',
  accountVaultSettings: 'Account & Vault Settings',
  operatorGuest: 'Operator-01 (Guest)',
  authenticatedSession: 'Authenticated Session',
  localEncryptionMode: 'Local Encryption Mode',
  loginSignUp: 'Login / Sign Up',
  accountQRCode: 'Account QR Code',
  scanToViewAccount: 'Scan to view account info & MyPlanePics album',
  aes256VaultKey: 'AES-256 Vault Key',
  masterPassphrase: 'Master Passphrase',
  verifySetKey: 'Verify & Set Key',
  accountInfoMyPlanePics: 'Account Info & MyPlanePics',
  backToHome: 'Back to Home',
  brioDroidAccountActive: 'BRIO DROID Account Active',
  openAppDrawer: 'Open App Drawer',
  apps: 'Apps',
  searchAppsFeatures: 'Search Apps & Features',
  backKey: 'Back Key',
  menuKey: 'Menu Key',
  homeKey: 'Home Key',
  searchKey: 'Search Key',
  accountSecuritySettings: 'Account & Security Settings',
  manageVaultPassphrase: 'Manage Vault Passphrase',
  signOut: 'Sign Out',
  vaultLocked: 'Vault Locked',
  sessionTerminated: 'Session terminated. Data secured.',
  vaultActive: 'Vault Active • AES-256',
  customPassphraseActive: 'Custom Passphrase Active • Encrypted',
  pleaseEnterValidPassphrase: 'Please enter a valid master passphrase',
  vaultSecurityUpdated: 'Master passphrase successfully set and verified.',
  encryptionError: 'Encryption Error',
  authRequired: 'Authentication Required',
  pleaseSignIn: 'Please sign in to access Brio features.',
  launching: 'Launching',
  navigationError: 'Navigation Error',
  qrError: 'QR Error',
  failedToGenerateQR: 'Failed to generate QR code',
  vaultCheck: 'Vault check',
  brioDroidMobile: 'BRIO DROID Mobile',
  permanentFolderLinked: 'Permanent Folder Linked',
  vaultedLinkedMedia: 'Vaulted & linked media files permanently to account',
  temporarySessionImport: 'Temporary Session Import',
  importedMediaFiles: 'Imported media files for current session.',
  folderImportError: 'Folder Import Error',
  noMediaFound: 'No Media Found',
  selectedFolderNoImageVideo: 'Selected folder does not contain image or video files.',
  vaultSyncComplete: 'Vault Sync Complete',
  successfullyEncryptedVaulted: 'Successfully encrypted and vaulted media files.',
  noValidMedia: 'No Valid Media',
  pleaseSelectImageVideoFiles: 'Please select image or video files.',
  vaultImportFailure: 'Vault Import Failure',
  encryptionReadError: 'Encryption/read error',
  photoVaulted: 'Photo Vaulted',
  parsedEncryptedAES256: 'Parsed registration. Encrypted AES-256.',
  vaultError: 'Vault Error',
  failedToEncryptPhotoMetadata: 'Failed to encrypt photo metadata',
  validationWarning: 'Validation Warning',
  filenameStringRequired: 'Filename string is required.',
  filenameParseError: 'Filename Parse Error',
  invalidFormatPattern: 'Invalid format pattern.',
  addPhoto: 'Upload Photo',
  folderImport: 'Folder Import',
  uploadPhoto: 'Upload Photo',
  searchRegistrationLiveryAirline: 'Search registration, livery, airline, airport...',
  format: 'Format',
  allPatterns: 'All Patterns (10/10)',
  rangeFormatOnly: 'Range Format Only',
  autoCorrectedOnly: 'Auto-Corrected Only',
  airline: 'Airline',
  allAirlines: 'All Airlines',
  vault: 'Vault',
  parserEngine: 'Parser Engine',
  spotterRanks: 'Spotter Ranks',
  analytics: 'Analytics',
  myplanePics3DVault: 'MyPlanePics 3D Vault',
  liquidGlassAircraftAlbum: 'Liquid glass aircraft album, auto-filename parser (10 MD rules), spotter rankings & stats',
  autoFilenameParser: 'Auto-filename parser',
  spotterRankingsStats: 'Spotter rankings & stats',
  interactiveFilenameParserTester: 'Interactive Filename Parser Tester',
  liveExtractionTokens: 'Live Extraction Tokens',
  formatMatchConfirmed: 'Format Match Confirmed',
  parseError: 'Parse Error',
  extractedRegistration: 'Extracted Registration',
  extractedSpecialLivery: 'Extracted Special Livery',
  formattedDate: 'Formatted Date',
  matchedSpecificationRule: 'Matched Specification Rule',
  shotNumber: 'Shot Number',
  singleShot: 'Single Shot',
  autoCorrectionStatus: 'Auto-Correction Status',
  autoCorrectedParenthesesSpacing: 'Auto-Corrected (Parentheses & Spacing sanitized)',
  standardCompliantFormat: 'Standard Compliant Format',
  normalized: 'Normalized',
  albumFleetRankings: 'Album Fleet Rankings',
  airlineAircraftModelRankings: 'Airline & Aircraft Model Rankings',
  topSpotterAirlinesRanking: 'Top Spotter Airlines Ranking',
  rankedByPhotoDensity: 'Ranked by photo density',
  registrations: 'Registrations',
  vaultedPhotos: 'Vaulted Photos',
  albumShare: 'Album Share',
  rarity: 'Rarity',
  topAircraftTypesModelsRanking: 'Top Aircraft Types / Models Ranking',
  rankedByModelFrequency: 'Ranked by model frequency',
  sampleRegs: 'Sample Regs',
  spotted: 'Spotted',
  totalVaultedPhotos: 'Total Vaulted Photos',
  uniqueRegistrations: 'Unique Registrations',
  militaryRangeFormats: 'Military Range Formats',
  autoCorrectedMatches: 'Auto-Corrected Matches',
  topAirlinesInVault: 'Top Airlines in Vault',
  monthlySpottingTrends: 'Monthly Spotting Trends',
  temporarySessionUpload: 'Temporary Session Upload',
  permanentFolderLinkSave: 'Permanent Folder Link & Save',
  chooseFolderImportStorageMode: 'Choose Folder Import Storage Mode',
  aircraftImagesDetected: 'aircraft image(s) detected',
  currentSessionOnly: 'Current Session Only',
  processesFilesInMemory: 'Processes files in memory for current view. Cleared on app restart.',
  permanentlyLinksFolderLocation: 'Permanently links folder location & metadata to user account. Restores automatically!',
  media: 'Media',
  video: 'Video',
  aes256: 'AES-256',
  noValidMediaSelected: 'No Valid Media',
  noValidMediaSelectedDesc: 'Please select image or video files.',
  close: 'Close',
  cancel: 'Cancel',
  confirm: 'Confirm',
  save: 'Save',
  delete: 'Delete',
  edit: 'Edit',
  add: 'Add',
  remove: 'Remove',
  upload: 'Upload',
  import_: 'Import',
  export_: 'Export',
  download: 'Download',
  share: 'Share',
  copy: 'Copy',
  paste: 'Paste',
  cut: 'Cut',
  select: 'Select',
  deselect: 'Deselect',
  selectAll: 'Select All',
  refresh: 'Refresh',
  reload: 'Reload',
  reset: 'Reset',
  apply: 'Apply',
  submit: 'Submit',
  cancel_: 'Cancel',
  ok: 'OK',
  yes: 'Yes',
  no: 'No',
  confirm_: 'Confirm',
  warning: 'Warning',
  info: 'Info',
  brioCryptographicAccountActive: 'Brio Cryptographic Account Active',
  myplanePicsAlbum: 'MyPlanePics Album',
  scanQRToAccess: 'Scan this QR code to access account info and MyPlanePics album',
  selectSystemLanguage: 'SELECT SYSTEM LANGUAGE',
  power: 'POWER',
  condition: 'Condition',
  humidityLabel: 'Humidity',
  windSpeedLabel: 'Wind Speed',
  airQualityLabel: 'Air Quality',
  scanToViewAccountInfo: 'Scan to view account info & MyPlanePics album',
  qrCodeWillAppearHere: 'QR Code will appear here',
  readingLight: 'Reading Light',
  attendantCall: 'Attendant Call',
  headphones: 'Headphones',
  flightTelemetryProgress: 'Flight Telemetry Progress',
  encryptedVoiceChannelReady: 'Encrypted Voice Channel Ready',
  dialCall: 'Dial Call',
  encryptedCallLogs: 'Encrypted Call Logs',
  broadcastPost: 'Broadcast Post',
  send: 'Send',
  online: 'Online',
  bluetooth: 'Bluetooth',
  activeChannels: 'Active Channels',
  stickerName: 'Sticker Name',
  category: 'Category',
  addToVault: 'Add to Vault',
  worldClockMatrix: 'World Clock Matrix',
  start: 'Start',
  pause: 'Pause',
  splitLap: 'Split Lap',
  lapSplitsHistory: 'Lap Splits History',
  hours: 'Hours',
  minutes: 'Minutes',
  seconds: 'Seconds',
  startCountdown: 'Start Countdown',
  sun: 'Sun',
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  addEvent: 'Add Event',
  reminder: 'Reminder',
  flightSpotting: 'Flight Spotting',
  meeting: 'Meeting',
  task: 'Task',
  liveGlobalRssIntelligenceHub: 'Live Global RSS Intelligence Hub',
  noArticlesFound: 'No Articles Found',
  aircraftFlappy: 'Aircraft Flappy',
  takeoffAircraft: 'Takeoff Aircraft',
  launchGame: 'Launch Game',
  communityCards: 'Community Cards',
  pressDealToStartHand: 'Press Deal to start hand',
  yourHoleCards: 'Your Hole Cards',
  minesweeper: 'Minesweeper',
  dailyLotteryDraw: 'Daily Lottery Draw',
  casinoSlots: 'Casino Slots',
  classicTetris: 'Classic Tetris',
  restart: 'Restart',
  unoCardsVsAI: 'UNO Cards vs AI',
  drawDeck: 'Draw Deck',
  topDiscard: 'Top Discard',
  girlsUndPanzerTankeryTactical: 'Girls und Panzer Tankery Tactical',
  fireApheShell: 'FIRE APHE SHELL',
  documentProcessing: 'Document Processing',
  liveCustomIptvStreamTuner: 'Live Custom IPTV Stream Tuner',
  loadSampleStream: 'Load Sample Stream',
  clearList: 'Clear List',
  iptvStreamWaitingRoom: 'IPTV Stream Waiting Room',
  noChannelsLoaded: 'No Channels Loaded',
  customAudioStreamUrl: 'Custom Audio Stream URL',
  encryptedStickersVault: 'Encrypted Stickers Vault',
  algorithmicSocialFeed: 'Algorithmic Social Feed',
  tuneFeedAlgorithm: 'Tune Feed Algorithm',
  feedAlgorithmParameters: 'Feed Algorithm Parameters',
  officeProductivitySuite: 'Office Productivity Suite',
  automotiveSystemLocale: 'Automotive System Locale',
  confirmProceedToHome: 'Confirm & Proceed to Home',
  systemLocaleConfigured: 'System Locale Configured',
  pleaseSignInToAccess: 'Please sign in to access encrypted Brio Home.',
  selectedLabel: 'Selected:',
  languageIFE: 'Language IFE',
  openLanguageScreen: 'Open 5x5 Language Welcome Screen',
  clearedOnAppRestart: 'Cleared on app restart.',
  restoresAutomatically: 'Restores automatically!',
  quickDialer: 'Quick Dialer',
  recentNotes: 'Recent Notes',
  nowPlaying: 'Now Playing',
  recentPhotos: 'Recent Photos',
  weatherWidget: 'Weather Widget',
  newsTicker: 'News Ticker',
  page: 'Page',
  of: 'of',
  next: 'Next',
  previous: 'Previous',
  perPage: 'per page',
  noPhotosYet: 'No photos yet',
  importPhotosToGetStarted: 'Import photos to get started',
  noPhotosMatchFilters: 'No photos match your filters',
  tryAdjustingSearchOrUpload: 'Try adjusting your search or upload new media',
  vaultedPhotosLabel: 'Vaulted Photos',
  autoCorrectedLabel: 'Auto-Corrected',
  registrationsLabel: 'Registrations',
  viewFullProfile: 'View Full Profile',
  scanToOpenBrioProfile: 'Scan to open Brio profile',
  loggedOut: 'Logged Out',
  userSessionTerminated: 'User session terminated',
  loading: 'Loading',
};

const DEFAULT_FR: UIStrings = {
  appName: 'Brio',
  tagline: 'Station de travail chiffrée tout-en-un',
  connectHub: 'Connexion & Social',
  mediaHub: 'Média & Nightcore',
  arcadeHub: 'Jeux & Arcade',
  officeHub: 'Bureautique & Productivité',
  telemetryHub: 'Aviation & Télémétrie',
  login: 'Connexion',
  signup: 'Créer un compte',
  logout: 'Verrouiller le coffre',
  encrypted: 'Chiffré AES-GCM',
  decrypted: 'Déchiffré vérifié',
  masterKey: 'Clé maître active',
  emergency: 'Appel d\'urgence',
  messaging: 'Messagerie chiffrée',
  socialFeed: 'Fil social',
  phoneDialer: 'Composeur téléphonique',
  stickers: 'Coffre à stickers',
  nightcorePlayer: 'Lecteur Nightcore',
  iptvPlayer: 'Flux IPTV en direct',
  rssReader: 'Lecteur RSS',
  gamesArcade: 'Jeux d\'arcade',
  pdfEditor: 'Annotateur PDF',
  calculator: 'Calculatrice scientifique',
  cameraRater: 'Évaluateur de configuration photo',
  aviationDict: 'Dictionnaire d\'aviation',
  busTimetable: 'Horaires de bus',
  telemetry: 'Télémétrie système',
  language: 'Langue',
  error: 'Erreur d\'opération',
  success: 'Chiffré et enregistré',
  home: 'Accueil',
  bookFlight: 'Réserver un vol',
  manageBookings: 'Gérer mes réservations',
  checkIn: 'Enregistrement',
  boardingPass: 'Carte d\'embarquement',
  brioMiles: 'Services BrioMiles',
  flightSchedules: 'Horaires des vols',
  inFlightServices: 'Services à bord',
  watchNow: 'Regarder',
  remindMe: 'Me rappeler',
  synopsis: 'Synopsis',
  genre: 'Genre',
  rating: 'Évaluation',
  duration: 'Durée',
  cast: 'Distribution',
  tabletMode: 'Mode Tablette',
  mobileMode: 'Mobile Windows Phone',
  dashboardMode: 'Interface Infotainment',
  liveWeather: 'Météo en direct',
  aqiIndex: 'Qualité de l\'air AQI',
  metarTaf: 'METAR / TAF aviation',
  humidity: 'Humidité',
  windSpeed: 'Vitesse du vent',
  windDirection: 'Direction du vent',
  temperature: 'Température',
  airQuality: 'Qualité de l\'air',
  rawMetar: 'Rapport METAR brut',
  rawTaf: 'Prévision TAF',
  searchAirport: 'Rechercher aéroport / code ICAO...',
  goodAirQuality: 'Bonne / Air pur',
  fmTuner: 'Tuner FM',
  seekDown: 'Rechercher vers le bas',
  seekUp: 'Rechercher vers le haut',
  savePreset: 'Enregistrer la présélection',
  handsFreePhone: 'Téléphone mains libres',
  dialNumber: 'Composer le numéro',
  endCall: 'Raccrocher',
  clear: 'Effacer',
  cpuLoad: 'Charge CPU',
  memoryUsage: 'Utilisation mémoire',
  fpsRate: 'Taux FPS',
  securityIntegrity: 'Intégrité AES',
  settingsTitle: 'Paramètres de sécurité et système',
  passphrasePrompt: 'Entrez une phrase secrète personnalisée...',
  encryptString: 'Chiffrer la chaîne',
  decryptString: 'Déchiffrer la chaîne',
  displayMode: 'Mode d\'affichage',
  dayMode: 'Mode jour',
  nightMode: 'Mode nuit',
  dashboard: 'Tableau de bord',
  mapAndTelemetry: 'Carte et télémétrie',
  welcomeToBrio: 'Bienvenue dans Brio',
  clock: 'Horloge',
  stopwatch: 'Chronomètre',
  timer: 'Minuteur',
  calendar: 'Calendrier',
  remindersEvents: 'Rappels et événements',
  weather: 'Météo',
  accountSettings: 'Paramètres du compte',
  permanentUpload: 'Lien permanent de dossier',
  temporaryUpload: 'Importation temporaire',
  selectFolderMode: 'Choisir le mode de stockage du dossier',
  speedPitch: 'Vitesse / hauteur tonale',
  nightcore: 'Nightcore',
  analogClock: 'Horloge analogique',
  vaultMasterKey: 'Clé maître du coffre',
  createEncryptedAccount: 'Créer un compte chiffré',
  easyLoginUnlock: 'Connexion facile et déverrouillage',
  managePBKDF2Passphrase: 'Gérer votre phrase secrète de chiffrement PBKDF2',
  aesGCM256Cryptography: 'Cryptographie client AES-GCM 256 bits',
  updateMasterPassphrase: 'Mettre à jour la phrase secrète maître',
  enterNewMasterPassphrase: 'Entrez une nouvelle phrase secrète maître...',
  reDeriveEncryptionKey: 'Recalculer la clé de chiffrement',
  lockVaultLogout: 'Verrouiller le coffre et se déconnecter',
  usernameOperatorCall: 'Nom d\'utilisateur / Indicatif opérateur',
  emailAddressOptional: 'Adresse e-mail (facultative)',
  vaultMasterPassphrasePBKDF2: 'Phrase secrète maître du coffre (dérivée PBKDF2)',
  enterMasterSecretPassphrase: 'Entrez votre phrase secrète maître...',
  passphraseGeneratesClientSideKey: 'Cette phrase secrète génère votre clé AES-256 côté client.',
  createEncryptedVault: 'Créer un coffre chiffré',
  unlockBrioVault: 'Déverrouiller le coffre Brio',
  alreadyHavePassphrase: 'Vous avez déjà une phrase secrète ? Déverrouiller le coffre',
  firstTimeCreateNewVault: 'Première fois ? Créer un nouveau compte coffre',
  allApplications: 'Toutes les applications',
  accountVaultSettings: 'Compte et paramètres du coffre',
  operatorGuest: 'Opérateur-01 (Invité)',
  authenticatedSession: 'Session authentifiée',
  localEncryptionMode: 'Mode de chiffrement local',
  loginSignUp: 'Connexion / Inscription',
  accountQRCode: 'QR Code du compte',
  scanToViewAccount: 'Scanner pour voir les infos du compte et l\'album MyPlanePics',
  aes256VaultKey: 'Clé de coffre AES-256',
  masterPassphrase: 'Phrase secrète maître',
  verifySetKey: 'Vérifier et définir la clé',
  accountInfoMyPlanePics: 'Infos du compte et MyPlanePics',
  backToHome: 'Retour à l\'accueil',
  brioDroidAccountActive: 'Compte BRIO DROID actif',
  openAppDrawer: 'Ouvrir le tiroir d\'applications',
  apps: 'Applications',
  searchAppsFeatures: 'Rechercher applications et fonctionnalités',
  backKey: 'Retour',
  menuKey: 'Menu',
  homeKey: 'Accueil',
  searchKey: 'Recherche',
  accountSecuritySettings: 'Paramètres du compte et sécurité',
  manageVaultPassphrase: 'Gérer la phrase secrète du coffre',
  signOut: 'Se déconnecter',
  vaultLocked: 'Coffre verrouillé',
  sessionTerminated: 'Session terminée. Données sécurisées.',
  vaultActive: 'Coffre actif • AES-256',
  customPassphraseActive: 'Phrase secrète personnalisée active • Chiffré',
  pleaseEnterValidPassphrase: 'Veuillez entrer une phrase secrète maître valide',
  vaultSecurityUpdated: 'Phrase secrète maître définie et vérifiée avec succès.',
  encryptionError: 'Erreur de chiffrement',
  authRequired: 'Authentification requise',
  pleaseSignIn: 'Veuillez vous connecter pour accéder aux fonctionnalités de Brio.',
  launching: 'Lancement',
  navigationError: 'Erreur de navigation',
  qrError: 'Erreur QR',
  failedToGenerateQR: 'Échec de la génération du code QR',
  vaultCheck: 'Vérification du coffre',
  brioDroidMobile: 'BRIO DROID Mobile',
  permanentFolderLinked: 'Dossier lié en permanence',
  vaultedLinkedMedia: 'Médias chiffrés et liés en permanence au compte',
  temporarySessionImport: 'Importation de session temporaire',
  importedMediaFiles: 'Fichiers multimédias importés pour la session en cours.',
  folderImportError: 'Erreur d\'importation de dossier',
  noMediaFound: 'Aucun média trouvé',
  selectedFolderNoImageVideo: 'Le dossier sélectionné ne contient pas d\'images ou de vidéos.',
  vaultSyncComplete: 'Synchronisation du coffre terminée',
  successfullyEncryptedVaulted: 'Médias chiffrés et stockés avec succès.',
  noValidMedia: 'Aucun média valide',
  pleaseSelectImageVideoFiles: 'Veuillez sélectionner des images ou des vidéos.',
  vaultImportFailure: 'Échec de l\'importation du coffre',
  encryptionReadError: 'Erreur de chiffrement/lecture',
  photoVaulted: 'Photo stockée',
  parsedEncryptedAES256: 'Analysé. Chiffré AES-256.',
  vaultError: 'Erreur de coffre',
  failedToEncryptPhotoMetadata: 'Échec du chiffrement des métadonnées de la photo',
  validationWarning: 'Avertissement de validation',
  filenameStringRequired: 'Le nom de fichier est requis.',
  filenameParseError: 'Erreur d\'analyse du nom de fichier',
  invalidFormatPattern: 'Format de modèle invalide.',
  addPhoto: 'Ajouter une photo',
  folderImport: 'Importer un dossier',
  uploadPhoto: 'Télécharger une photo',
  searchRegistrationLiveryAirline: 'Rechercher immatriculation, livrée, compagnie, aéroport...',
  format: 'Format',
  allPatterns: 'Tous les modèles (10/10)',
  rangeFormatOnly: 'Format plage uniquement',
  autoCorrectedOnly: 'Auto-corrigé uniquement',
  airline: 'Compagnie aérienne',
  allAirlines: 'Toutes les compagnies',
  vault: 'Coffre',
  parserEngine: 'Moteur d\'analyse',
  spotterRanks: 'Classements des observateurs',
  analytics: 'Analytiques',
  myplanePics3DVault: 'Coffre 3D MyPlanePics',
  liquidGlassAircraftAlbum: 'Album aéronautique en verre liquide, analyseur automatique de noms de fichiers (10 règles), classements et statistiques',
  autoFilenameParser: 'Analyseur automatique de noms de fichiers',
  spotterRankingsStats: 'Classements et statistiques des observateurs',
  interactiveFilenameParserTester: 'Testeur interactif du moteur d\'analyse de noms de fichiers',
  liveExtractionTokens: 'Jetons d\'extraction en direct',
  formatMatchConfirmed: 'Correspondance de format confirmée',
  parseError: 'Erreur d\'analyse',
  extractedRegistration: 'Immatriculation extraite',
  extractedSpecialLivery: 'Livrée spéciale extraite',
  formattedDate: 'Date formatée',
  matchedSpecificationRule: 'Règle de spécification correspondante',
  shotNumber: 'Numéro de prise',
  singleShot: 'Prise unique',
  autoCorrectionStatus: 'État de l\'auto-correction',
  autoCorrectedParenthesesSpacing: 'Auto-corrigé (parenthèses et espaces assainis)',
  standardCompliantFormat: 'Format conforme aux normes',
  normalized: 'Normalisé',
  albumFleetRankings: 'Classements de la flotte de l\'album',
  airlineAircraftModelRankings: 'Classements par compagnie et modèle d\'aéronef',
  topSpotterAirlinesRanking: 'Classement des meilleures compagnies d\'observateurs',
  rankedByPhotoDensity: 'Classé par densité de photos',
  registrations: 'Immatriculations',
  vaultedPhotos: 'Photos stockées',
  albumShare: 'Part dans l\'album',
  rarity: 'Rareté',
  topAircraftTypesModelsRanking: 'Classement des types/modèles d\'aéronefs',
  rankedByModelFrequency: 'Classé par fréquence de modèle',
  sampleRegs: 'Immatriculations exemples',
  spotted: 'Observé',
  totalVaultedPhotos: 'Total de photos stockées',
  uniqueRegistrations: 'Immatriculations uniques',
  militaryRangeFormats: 'Formats de plage militaire',
  autoCorrectedMatches: 'Correspondances auto-corrigées',
  topAirlinesInVault: 'Meilleures compagnies dans le coffre',
  monthlySpottingTrends: 'Tendances d\'observation mensuelles',
  temporarySessionUpload: 'Importation de session temporaire',
  permanentFolderLinkSave: 'Lien permanent de dossier et enregistrement',
  chooseFolderImportStorageMode: 'Choisir le mode de stockage de l\'importation de dossier',
  aircraftImagesDetected: 'image(s) aéronautique(s) détectée(s)',
  currentSessionOnly: 'Session en cours uniquement',
  processesFilesInMemory: 'Traite les fichiers en mémoire pour la vue actuelle. Effacé au redémarrage.',
  permanentlyLinksFolderLocation: 'Lie en permanence l\'emplacement du dossier et les métadonnées au compte utilisateur. Restaure automatiquement !',
  clearedOnAppRestart: 'Effacé au redémarrage de l\'application.',
  restoresAutomatically: 'Restaure automatiquement !',
  media: 'Média',
  video: 'Vidéo',
  aes256: 'AES-256',
  noValidMediaSelected: 'Aucun média valide sélectionné',
  noValidMediaSelectedDesc: 'Veuillez sélectionner des images ou des vidéos.',
  close: 'Fermer',
  cancel: 'Annuler',
  confirm: 'Confirmer',
  save: 'Enregistrer',
  delete: 'Supprimer',
  edit: 'Modifier',
  add: 'Ajouter',
  remove: 'Retirer',
  upload: 'Télécharger',
  import_: 'Importer',
  export_: 'Exporter',
  download: 'Télécharger',
  share: 'Partager',
  copy: 'Copier',
  paste: 'Coller',
  cut: 'Couper',
  select: 'Sélectionner',
  deselect: 'Désélectionner',
  selectAll: 'Tout sélectionner',
  refresh: 'Actualiser',
  reload: 'Recharger',
  reset: 'Réinitialiser',
  apply: 'Appliquer',
  submit: 'Soumettre',
  cancel_: 'Annuler',
  ok: 'OK',
  yes: 'Oui',
  no: 'Non',
  confirm_: 'Confirmer',
  warning: 'Avertissement',
  info: 'Info',
  brioCryptographicAccountActive: 'Compte cryptographique Brio actif',
  myplanePicsAlbum: 'Album MyPlanePics',
  scanQRToAccess: 'Scannez ce code QR pour accéder aux informations du compte et à l\'album MyPlanePics',
  selectSystemLanguage: 'SÉLECTIONNER LA LANGUE DU SYSTÈME',
  power: 'ALIMENTATION',
  condition: 'Condition',
  humidityLabel: 'Humidité',
  windSpeedLabel: 'Vitesse du vent',
  airQualityLabel: 'Qualité de l\'air',
  scanToViewAccountInfo: 'Scanner pour voir les infos du compte et l\'album MyPlanePics',
  qrCodeWillAppearHere: 'Le code QR apparaîtra ici',
  readingLight: 'Lumière de lecture',
  attendantCall: 'Appel steward',
  headphones: 'Casques audio',
  flightTelemetryProgress: 'Progression de la télémétrie de vol',
  encryptedVoiceChannelReady: 'Canal vocal chiffré prêt',
  dialCall: 'Composer',
  encryptedCallLogs: 'Journal d\'appels chiffré',
  broadcastPost: 'Publier',
  send: 'Envoyer',
  online: 'En ligne',
  bluetooth: 'Bluetooth',
  activeChannels: 'Canaux actifs',
  stickerName: 'Nom du sticker',
  category: 'Catégorie',
  addToVault: 'Ajouter au coffre',
  worldClockMatrix: 'Matrice d\'horloge mondiale',
  start: 'Démarrer',
  pause: 'Pause',
  splitLap: 'Tour intermédiaire',
  lapSplitsHistory: 'Historique des tours intermédiaires',
  hours: 'Heures',
  minutes: 'Minutes',
  seconds: 'Secondes',
  startCountdown: 'Démarrer le compte à rebours',
  sun: 'Dim',
  mon: 'Lun',
  tue: 'Mar',
  wed: 'Mer',
  thu: 'Jeu',
  fri: 'Ven',
  sat: 'Sam',
  addEvent: 'Ajouter un événement',
  reminder: 'Rappel',
  flightSpotting: 'Observation aérienne',
  meeting: 'Réunion',
  task: 'Tâche',
  liveGlobalRssIntelligenceHub: 'Hub de renseignement RSS mondial en direct',
  noArticlesFound: 'Aucun article trouvé',
  aircraftFlappy: 'Aircraft Flappy',
  takeoffAircraft: 'Décollage avion',
  launchGame: 'Lancer le jeu',
  communityCards: 'Cartes communes',
  pressDealToStartHand: 'Appuyez sur Distribuer pour commencer la main',
  yourHoleCards: 'Vos cartes fermées',
  minesweeper: 'Démineur',
  dailyLotteryDraw: 'Tirage quotidien',
  casinoSlots: 'Machines à sous',
  classicTetris: 'Tetris classique',
  restart: 'Redémarrer',
  unoCardsVsAI: 'UNO contre IA',
  drawDeck: 'Pioche',
  topDiscard: 'Défausse du dessus',
  girlsUndPanzerTankeryTactical: 'Girls und Panzer Tankery Tactique',
  fireApheShell: 'TIRER OBUS APHE',
  documentProcessing: 'Traitement de documents',
  liveCustomIptvStreamTuner: 'Tuner IPTV personnalisé en direct',
  loadSampleStream: 'Charger un flux de démo',
  clearList: 'Vider la liste',
  iptvStreamWaitingRoom: 'Salle d\'attente flux IPTV',
  noChannelsLoaded: 'Aucune chaîne chargée',
  customAudioStreamUrl: 'URL de flux audio personnalisé',
  encryptedStickersVault: 'Coffre à stickers chiffré',
  algorithmicSocialFeed: 'Fil social algorithmique',
  tuneFeedAlgorithm: 'Ajuster l\'algorithme du fil',
  feedAlgorithmParameters: 'Paramètres de l\'algorithme du fil',
  officeProductivitySuite: 'Suite bureautique',
  automotiveSystemLocale: 'Paramètres régionaux du système automobile',
  confirmProceedToHome: 'Confirmer et accéder à l\'accueil',
  systemLocaleConfigured: 'Paramètres régionaux configurés',
  pleaseSignInToAccess: 'Veuillez vous connecter pour accéder à l\'accueil chiffré de Brio.',
  selectedLabel: 'Sélectionné :',
  languageIFE: 'Langue IFE',
  openLanguageScreen: 'Ouvrir l\'écran de bienvenue des langues 5x5',
  quickDialer: 'Composeur rapide',
  recentNotes: 'Notes récentes',
  nowPlaying: 'En cours de lecture',
  recentPhotos: 'Photos récentes',
  weatherWidget: 'Widget météo',
  newsTicker: 'Fil d\'actualités',
  page: 'Page',
  of: 'de',
  next: 'Suivant',
  previous: 'Précédent',
  perPage: 'par page',
  noPhotosYet: 'Aucune photo pour le moment',
  importPhotosToGetStarted: 'Importez des photos pour commencer',
  noPhotosMatchFilters: 'Aucune photo ne correspond à vos filtres',
  tryAdjustingSearchOrUpload: 'Essayez d\'ajuster votre recherche ou d\'importer de nouveaux médias',
  vaultedPhotosLabel: 'Photos stockées',
  autoCorrectedLabel: 'Auto-corrigé',
  registrationsLabel: 'Immatriculations',
  viewFullProfile: 'Voir le profil complet',
  scanToOpenBrioProfile: 'Scanner pour ouvrir le profil Brio',
  loggedOut: 'Déconnecté',
  userSessionTerminated: 'Session utilisateur terminée',
  loading: 'Chargement',
};

export const TRANSLATIONS: Record<LanguageCode, UIStrings> = {
  en: DEFAULT_EN,
  fr: DEFAULT_FR,
};

export function detectSystemLanguage(): LanguageCode {
  if (typeof navigator === 'undefined') return 'en';
  const navLang = (navigator.language || (navigator.languages && navigator.languages[0]) || 'en').toLowerCase();
  if (navLang.startsWith('fr')) return 'fr';
  return 'en';
}

export function getUIStrings(lang: LanguageCode): UIStrings {
  if (lang === 'auto') {
    const detected = detectSystemLanguage();
    return TRANSLATIONS[detected] || DEFAULT_EN;
  }
  return TRANSLATIONS[lang] || DEFAULT_EN;
}
