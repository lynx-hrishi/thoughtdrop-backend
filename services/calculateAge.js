export function calculateAge(dateOfBirthString) {
    const today = new Date();
    const birthDate = new Date(dateOfBirthString);

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference = today.getMonth() - birthDate.getMonth();

    // If the month difference is negative, or if it's zero but the current day is less than the birth day, 
    // it means the birthday hasn't happened yet this year.
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}