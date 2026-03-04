export const SUPPORTED_COMPANY_TIMEZONES = [
  "America/St_Johns",
  "America/Halifax",
  "America/Moncton",
  "America/Toronto",
  "America/Detroit",
  "America/New_York",
  "America/Winnipeg",
  "America/Regina",
  "America/Chicago",
  "America/Edmonton",
  "America/Denver",
  "America/Phoenix",
  "America/Vancouver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
] as const;

export function isSupportedCompanyTimezone(value: string): boolean {
  return SUPPORTED_COMPANY_TIMEZONES.includes(
    value as (typeof SUPPORTED_COMPANY_TIMEZONES)[number],
  );
}
