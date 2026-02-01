import { zodiacConstants } from "../constants/allConstants.js";

export function getZodiacSign(dob) {
    const date = new Date(dob);

    if (isNaN(date)) {
        throw new Error("Invalid date of birth");
    }

    const day = date.getDate();
    const month = date.getMonth() + 1;

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return zodiacConstants.Aries;
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return zodiacConstants.Taurus;
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return zodiacConstants.Gemini;
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return zodiacConstants.Cancer;
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return zodiacConstants.Leo;
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return zodiacConstants.Virgo;
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return zodiacConstants.Libra;
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return zodiacConstants.Scorpio;
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return zodiacConstants.Sagittarius;
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return zodiacConstants.Capricorn;
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return zodiacConstants.Aquarius;
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return zodiacConstants.Pisces;

    throw new Error("Unable to determine zodiac sign");
}
