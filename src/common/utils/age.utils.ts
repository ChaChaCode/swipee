/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Date | null | undefined): number | null {
  if (!birthDate) return null;

  const today = new Date();
  const birth = new Date(birthDate);

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  // If birthday hasn't occurred this year yet, subtract 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Calculate birth date from age (approximate - sets to January 1st)
 */
export function birthDateFromAge(age: number): Date {
  const today = new Date();
  return new Date(today.getFullYear() - age, 0, 1);
}

/**
 * Get min birth date for age filter (for maxAge)
 * Example: maxAge=30 means birthDate >= (today - 30 years)
 */
export function getMinBirthDateForAge(maxAge: number): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - maxAge - 1);
  date.setDate(date.getDate() + 1);
  return date;
}

/**
 * Get max birth date for age filter (for minAge)
 * Example: minAge=18 means birthDate <= (today - 18 years)
 */
export function getMaxBirthDateForAge(minAge: number): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - minAge);
  return date;
}
