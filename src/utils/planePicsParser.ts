/**
 * MyPlanePics Filename Parser Utility
 * Implements full specifications according to the MyPlanePics Supported Filename Formats documentation.
 * Parses registrations, special liveries, dates (MM.DD.YY / MM.DD.YYYY), shot numbers, range patterns, and auto-corrections.
 */

import { ParsedFilenameResult } from '../types';

/**
 * Format month, day, year numbers into a human readable date string like "July 30, 2025"
 */
export function formatPlaneDate(monthStr: string, dayStr: string, yearStr: string): string {
  const m = parseInt(monthStr.trim(), 10);
  const d = parseInt(dayStr.trim(), 10);
  let y = parseInt(yearStr.trim(), 10);

  if (isNaN(m) || isNaN(d) || isNaN(y)) return 'Invalid Date';
  if (m < 1 || m > 12 || d < 1 || d > 31) return 'Invalid Date';

  // Convert 2-digit year to 20YY format
  if (y < 100) {
    y = 2000 + y;
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return `${months[m - 1]} ${d}, ${y}`;
}

/**
 * Main Filename Parser Function
 */
export function parsePlaneFilename(filenameInput: string): ParsedFilenameResult {
  const cleanInput = filenameInput.trim();

  // Extract extension
  const lastDotIdx = cleanInput.lastIndexOf('.');
  if (lastDotIdx === -1) {
    return {
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
  }

  const extension = cleanInput.slice(lastDotIdx + 1).toLowerCase();
  const baseName = cleanInput.slice(0, lastDotIdx).trim();

  const supportedExtensions = ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'tif', 'gif', 'webp', 'heic', 'heif', 'raw', 'dng', 'svg', 'avif', 'jxl', 'mp4', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'webm', 'm4v', '3gp'];
  if (!supportedExtensions.includes(extension)) {
    return {
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
  }

  // Regex patterns to test in priority order

  // Check if it's a range format: PREFIX.NUMBER-RANGE[SUFFIX] e.g. HU.26-31A or AB.1-5
  const rangePatternCheck = /^([A-Z0-9]+\.[0-9]+-[0-9]+[A-Z0-9]*)/i;
  const isRangeFormat = rangePatternCheck.test(baseName);

  // 1. With Parentheses & optional shot number:
  // e.g. "G-NLPD (7.30.25).jpg", "G-NLPD Honami (7.31.25).png", "G-NLPD (7.30.25) 1.jpg", "A6-FMR (7. 30. 25) 2.jpg", "HU.26-31A Special Livery (7.30.2025).jpg"
  const parenRegex = /^(.+?)\s*\(\s*(\d{1,2})\s*\.\s*(\d{1,2})\s*\.\s*(\d{2,4})\s*\)(?:\s+(\d+))?$/;
  const parenMatch = baseName.match(parenRegex);

  if (parenMatch) {
    const leftPart = parenMatch[1].trim();
    const monthStr = parenMatch[2];
    const dayStr = parenMatch[3];
    const yearStr = parenMatch[4];
    const shotNumStr = parenMatch[5];

    const formattedDate = formatPlaneDate(monthStr, dayStr, yearStr);
    const rawDate = `${monthStr}.${dayStr}.${yearStr}`;
    const shotNumber = shotNumStr ? parseInt(shotNumStr, 10) : null;

    // Split leftPart into registration and livery
    // If leftPart contains spaces and leftPart is not a range format without livery
    let registration = leftPart;
    let specialLivery = 'None';

    // If there's a space in leftPart:
    // e.g., "G-NLPD Honami" -> Reg: G-NLPD, Livery: Honami
    // e.g., "HU.26-31A Special Livery" -> Reg: HU.26-31A, Livery: Special Livery
    const spaceIdx = leftPart.indexOf(' ');
    if (spaceIdx !== -1) {
      registration = leftPart.slice(0, spaceIdx).trim();
      specialLivery = leftPart.slice(spaceIdx + 1).trim();
    }

    // Determine specific pattern format
    let formatPattern = '1. Basic Format';
    let isAutoCorrected = false;

    // Check if extra spaces inside date e.g. (7. 30. 25)
    if (parenMatch[0].includes('. ') || parenMatch[0].includes(' .')) {
      formatPattern = '6. Extra Spaces Format';
      isAutoCorrected = true;
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

    // Construct corrected filename
    const cleanDateStr = `${parseInt(monthStr, 10)}.${parseInt(dayStr, 10)}.${yearStr}`;
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

  // 2. Missing Parentheses Format e.g. "A6-FMR 7.30.25.jpg" or "HU.26-31A 7.30.25.jpg"
  const noParenRegex = /^(.+?)\s+(\d{1,2})\s*\.\s*(\d{1,2})\s*\.\s*(\d{2,4})(?:\s+(\d+))?$/;
  const noParenMatch = baseName.match(noParenRegex);

  if (noParenMatch) {
    const leftPart = noParenMatch[1].trim();
    const monthStr = noParenMatch[2];
    const dayStr = noParenMatch[3];
    const yearStr = noParenMatch[4];
    const shotNumStr = noParenMatch[5];

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

    const formatPattern = isRangeFormat
      ? '8. Range Format without Parentheses (Auto-Corrected)'
      : '5. Missing Parentheses Format (Auto-Corrected)';

    const cleanDateStr = `${parseInt(monthStr, 10)}.${parseInt(dayStr, 10)}.${yearStr}`;
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
      isAutoCorrected: true,
      correctedFilename,
      isValid: formattedDate !== 'Invalid Date',
      errorMessage: formattedDate === 'Invalid Date' ? 'Date numbers out of valid range.' : undefined,
    };
  }

  // If match fails:
  return {
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
}
