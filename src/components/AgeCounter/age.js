// Not all years are the same length!
const leapYearLength = new Date('January 1, 2001 12:00 am') - new Date('January 1, 2000 12:00 am');
const normalYearLength = new Date('January 1, 2002 12:00 am') - new Date('January 1, 2001 12:00 am');

function isLeapYear(year) {
  // If february 29 doesn't overflow to march, the given year is a leap year
  return new Date(year, 1, 29).getMonth() === 1;
}

// When I was born
const birthday = new Date('November 3, 2001 5:24 PM EST');


// Get the date/time of my birthday on a given year. It's exactly 5:24 PM eastern time
function getBirthdayOnYear(year) {
  // What's the timezone offset from UTC for my birthday that year? (on some years, my birthday is
  // during daylight savings time)
  const birthdayOffsetThatYear = new Date(`November 3, ${year} 5:24 PM EST`).getTimezoneOffset();

  const birthdayThatYear = new Date();
  birthdayThatYear.setUTCFullYear(year);
  birthdayThatYear.setUTCMonth(10); // November
  birthdayThatYear.setUTCDate(3); // Third
  birthdayThatYear.setUTCHours(17); // 5 PM
  birthdayThatYear.setUTCMinutes(24 + birthdayOffsetThatYear); // 24 minutes; adjust for time zone
  birthdayThatYear.setUTCSeconds(0);
  birthdayThatYear.setUTCMilliseconds(0);

  return birthdayThatYear;
}


export default function age(now = new Date()) {
  // Calculate some things about now
  const thisYear = now.getFullYear();

  const birthdayThisYear = getBirthdayOnYear(thisYear);
  const birthdayLastYear = getBirthdayOnYear(thisYear - 1);

  /*
   * 1. Calculate my age in full years.
   * This is based on year subtraction, and whether my birthday has passed this year
   */

  const birthdayPassed = (now - birthdayThisYear) >= 0;
  const yearsAge = (thisYear - birthday.getFullYear()) - (birthdayPassed ? 0 : 1);

  /*
   * 2. Calculate my age in decimal years
   * This is based on how much of the year that follows my most recent birthday has passed
   */

  // My most recent birthday is this year's birthday if it's passed this year, otherwise it's last
  // year's birthday
  const mostRecentBirthday = birthdayPassed ? birthdayThisYear : birthdayLastYear;
  const deltaFromBirthday = now - mostRecentBirthday;
  // The leap year day occurs between two of my birthdays, in February. Therefore, the factor that
  // affects the length of my birthday year is whether or not the leap year falls on the year that
  // follows my last birthday
  const birthdayLeapYear = isLeapYear(mostRecentBirthday.getFullYear() + 1);
  const birthdayYearLength = birthdayLeapYear ? leapYearLength : normalYearLength;

  const decimalYears = deltaFromBirthday / birthdayYearLength;

  /*
   * 3. Combine my full year age and my decimal year age for the final result
   */
  return yearsAge + decimalYears;
}
