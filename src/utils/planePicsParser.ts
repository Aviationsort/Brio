/**
 * MyPlanePics Filename Parser Utility
 * Implements full specifications according to the MyPlanePics Supported Filename Formats documentation.
 * Parses registrations, special liveries, dates (MM.DD.YY / MM.DD.YYYY), shot numbers, range patterns, and auto-corrections.
 */

import { ParsedFilenameResult } from '../types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

const SUPPORTED_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'bmp', 'tiff', 'tif', 'gif', 'webp', 'heic', 'heif',
  'raw', 'dng', 'svg', 'avif', 'jxl', 'mp4', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'webm', 'm4v', '3gp'
]);

const PAREN_REGEX = /^(.+?)\s*\(\s*(\d{1,2})\s*\.\s*(\d{1,2})\s*\.\s*(\d{2,4})\s*\)(?:\s+(\d+))?$/;
const NO_PAREN_REGEX = /^(.+?)\s+(\d{1,2})\s*\.\s*(\d{1,2})\s*\.\s*(\d{2,4})(?:\s+(\d+))?$/;
const RANGE_REGEX = /^([A-Z0-9]+\.[0-9]+-[0-9]+[A-Z0-9]*)/i;

const parseCache = new Map<string, ParsedFilenameResult>();

export function formatPlaneDate(monthStr: string, dayStr: string, yearStr: string): string {
  const m = parseInt(monthStr.trim(), 10);
  const d = parseInt(dayStr.trim(), 10);
  let y = parseInt(yearStr.trim(), 10);

  if (isNaN(m) || isNaN(d) || isNaN(y)) return 'Invalid Date';
  if (m < 1 || m > 12 || d < 1 || d > 31) return 'Invalid Date';

  if (y < 100) {
    y = 2000 + y;
  }

  return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
}

function buildResult(
  cleanInput: string,
  leftPart: string,
  monthStr: string,
  dayStr: string,
  yearStr: string,
  shotNumStr: string | undefined,
  extension: string,
  isRangeFormat: boolean,
  isAutoCorrected: boolean
): ParsedFilenameResult {
  const formattedDate = formatPlaneDate(monthStr, dayStr, yearStr);
  const rawDate = `${monthStr}.${dayStr}.${yearStr}`;
  const shotNumber = shotNumStr ? parseInt(shotNumStr, 10) : null;

  let registration = leftPart;
  let specialLivery = 'None';

  const spaceIdx = leftPart.indexOf(' ');
  if (spaceIdx !== -1) {
    registration = leftPart.slice(0, spaceIdx).trim();
    specialLivery = leftPart.slice(spaceIdx + 1).trim();
  }

  let formatPattern = '1. Basic Format';
  if (isAutoCorrected) {
    formatPattern = isRangeFormat ? '8. Range Format without Parentheses (Auto-Corrected)' : '5. Missing Parentheses Format (Auto-Corrected)';
  } else if (isRangeFormat) {
    if (specialLivery !== 'None') {
      formatPattern = '9. Range Format with Special Livery';
    } else if (yearStr.length === 4) {
      formatPattern = '10. Range Format with Four-Digit Year';
    } else {
      formatPattern = '7. Range Format with Parentheses';
    }
  } else if (specialLivery !== 'None') {
    formatPattern = '2. Special Livery Format';
  } else if (shotNumber !== null) {
    formatPattern = '3. Multiple Shots Format';
  } else if (yearStr.length === 4) {
    formatPattern = '4. Four-Digit Year Format';
  }

  const cleanMonth = parseInt(monthStr, 10);
  const cleanDay = parseInt(dayStr, 10);
  const cleanDateStr = `${cleanMonth}.${cleanDay}.${yearStr}`;
  const liveryPart = specialLivery !== 'None' ? ` ${specialLivery}` : '';
  const shotPart = shotNumber !== null ? ` ${shotNumber}` : '';
  const correctedFilename = `${registration}${liveryPart} (${cleanDateStr})${shotPart}.${extension}`;

  return {
    filename: cleanInput,
    registration,
    specialLivery,
    dateCaptured: rawDate,
    formattedDate,
    rawDate,
    shotNumber,
    extension,
    formatPattern,
    isRangeFormat,
    isAutoCorrected,
    correctedFilename,
    isValid: formattedDate !== 'Invalid Date',
    errorMessage: formattedDate === 'Invalid Date' ? 'Date numbers out of valid range (MM 1-12, DD 1-31).' : undefined,
  };
}

export function parsePlaneFilename(filenameInput: string): ParsedFilenameResult {
  const cleanInput = filenameInput.trim();

  const cached = parseCache.get(cleanInput);
  if (cached) return cached;

  const lastDotIdx = cleanInput.lastIndexOf('.');
  if (lastDotIdx === -1) {
    const result: ParsedFilenameResult = {
      filename: cleanInput,
      registration: 'UNKNOWN',
      specialLivery: 'None',
      dateCaptured: 'Unknown',
      formattedDate: 'Unknown',
      rawDate: '',
      shotNumber: null,
      extension: '',
      formatPattern: 'Invalid Format',
      isRangeFormat: false,
      isAutoCorrected: false,
      correctedFilename: cleanInput,
      isValid: false,
      errorMessage: 'Missing file extension (.jpg, .png, etc.)',
    };
    parseCache.set(cleanInput, result);
    return result;
  }

  const extension = cleanInput.slice(lastDotIdx + 1).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    const result: ParsedFilenameResult = {
      filename: cleanInput,
      registration: 'UNKNOWN',
      specialLivery: 'None',
      dateCaptured: 'Unknown',
      formattedDate: 'Unknown',
      rawDate: '',
      shotNumber: null,
      extension,
      formatPattern: 'Unsupported Extension',
      isRangeFormat: false,
      isAutoCorrected: false,
      correctedFilename: cleanInput,
      isValid: false,
      errorMessage: `Extension .${extension} is not supported. Use JPG, PNG, WEBP, HEIC, RAW, MP4, MOV, etc.`,
    };
    parseCache.set(cleanInput, result);
    return result;
  }

  const baseName = cleanInput.slice(0, lastDotIdx).trim();

  const isRangeFormat = RANGE_REGEX.test(baseName);

  const parenMatch = baseName.match(PAREN_REGEX);
  if (parenMatch) {
    const leftPart = parenMatch[1].trim();
    const monthStr = parenMatch[2];
    const dayStr = parenMatch[3];
    const yearStr = parenMatch[4];
    const shotNumStr = parenMatch[5];

    const hasExtraSpaces = parenMatch[0].includes('. ') || parenMatch[0].includes(' .');
    const autoCorrected = hasExtraSpaces;

    const result = buildResult(cleanInput, leftPart, monthStr, dayStr, yearStr, shotNumStr, extension, isRangeFormat, autoCorrected);
    parseCache.set(cleanInput, result);
    return result;
  }

  const noParenMatch = baseName.match(NO_PAREN_REGEX);
  if (noParenMatch) {
    const leftPart = noParenMatch[1].trim();
    const monthStr = noParenMatch[2];
    const dayStr = noParenMatch[3];
    const yearStr = noParenMatch[4];
    const shotNumStr = noParenMatch[5];

    const result = buildResult(cleanInput, leftPart, monthStr, dayStr, yearStr, shotNumStr, extension, isRangeFormat, true);
    parseCache.set(cleanInput, result);
    return result;
  }

  const result: ParsedFilenameResult = {
    filename: cleanInput,
    registration: 'INVALID',
    specialLivery: 'None',
    dateCaptured: 'Unknown',
    formattedDate: 'Unknown',
    rawDate: '',
    shotNumber: null,
    extension,
    formatPattern: 'Unrecognized Format',
    isRangeFormat,
    isAutoCorrected: false,
    correctedFilename: cleanInput,
    isValid: false,
    errorMessage: 'Filename does not match standard MyPlanePics patterns. Check documentation for expected date format e.g. (MM.DD.YY).',
  };
  parseCache.set(cleanInput, result);
  return result;
}
