// Formatting utilities for physical quantities

export function fmt(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return value.toFixed(decimals);
}

export function fmtUnit(value, unit, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `${value.toFixed(decimals)} ${unit}`;
}

export function fmtDeg(value, decimals = 1) {
  return fmtUnit(value, '°', decimals);
}

export function fmtMs(value, decimals = 2) {
  return fmtUnit(value, 'm/s', decimals);
}

export function fmtM(value, decimals = 2) {
  return fmtUnit(value, 'm', decimals);
}

export function fmtS(value, decimals = 2) {
  return fmtUnit(value, 's', decimals);
}

export function fmtHz(value, decimals = 3) {
  return fmtUnit(value, 'Hz', decimals);
}

export function fmtJ(value, decimals = 3) {
  return fmtUnit(value, 'J', decimals);
}

export function fmtRadS(value, decimals = 3) {
  return fmtUnit(value, 'rad/s', decimals);
}

export function fmtMs2(value, decimals = 2) {
  return fmtUnit(value, 'm/s²', decimals);
}
