import { parsePhoneNumberFromString } from 'libphonenumber-js'
console.log(parsePhoneNumberFromString('+919876543210')?.formatInternational())
