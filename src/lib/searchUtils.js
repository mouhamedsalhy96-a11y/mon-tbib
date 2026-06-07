// lib/searchUtils.js

export const normalizeText = (value) => {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const onlyDigits = (value) => {
  return String(value || "").replace(/\D/g, "");
};

export const getPatientFirstName = (patient) => {
  return patient.first_name || patient.firstname || patient.firstName || patient.name || patient.nom || "";
};

export const getPatientLastName = (patient) => {
  return patient.last_name || patient.lastname || patient.lastName || patient.surname || patient.prenom || "";
};

const parseDateParts = (dateString) => {
  if (!dateString) return null;
  const value = String(dateString).trim();
  const isoMatch = value.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) return { day: isoMatch[3].padStart(2, "0"), month: isoMatch[2].padStart(2, "0"), year: isoMatch[1] };

  const europeanMatch = value.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if (europeanMatch) {
    let year = europeanMatch[3];
    if (year.length === 2) {
      const numericYear = Number(year);
      year = numericYear <= 30 ? `20${year}` : `19${year}`;
    }
    return { day: europeanMatch[1].padStart(2, "0"), month: europeanMatch[2].padStart(2, "0"), year };
  }
  return null;
};

export const formatDateForDisplay = (dateString) => {
  const parts = parseDateParts(dateString);
  if (!parts) return "N/A";
  return `${parts.day}/${parts.month}/${parts.year}`;
};

const getDateSearchValues = (dateString) => {
  const parts = parseDateParts(dateString);
  if (!parts) return [];
  const { day, month, year } = parts;
  const shortYear = year.slice(-2);
  const dayNoZero = String(Number(day));
  const monthNoZero = String(Number(month));

  return [
    `${day}/${month}/${year}`, `${day}/${month}/${shortYear}`, `${dayNoZero}/${monthNoZero}/${year}`, `${dayNoZero}/${monthNoZero}/${shortYear}`,
    `${day}-${month}-${year}`, `${day}-${month}-${shortYear}`, `${dayNoZero}-${monthNoZero}-${year}`, `${dayNoZero}-${monthNoZero}-${shortYear}`,
    `${day}.${month}.${year}`, `${day}.${month}.${shortYear}`, `${dayNoZero}.${monthNoZero}.${year}`, `${dayNoZero}.${monthNoZero}.${shortYear}`,
    `${day}${month}${year}`, `${day}${month}${shortYear}`, `${dayNoZero}${monthNoZero}${year}`, `${dayNoZero}${monthNoZero}${shortYear}`,
  ].map(normalizeText);
};

const levenshteinDistance = (a, b) => {
  const first = normalizeText(a);
  const second = normalizeText(b);
  if (!first) return second.length;
  if (!second) return first.length;
  const matrix = Array.from({ length: first.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= second.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= first.length; i++) {
    for (let j = 1; j <= second.length; j++) {
      const cost = first[i - 1] === second[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[first.length][second.length];
};

const wordMatches = (searchWord, targetWord) => {
  const search = normalizeText(searchWord);
  const target = normalizeText(targetWord);
  if (!search || !target) return false;
  if (target.includes(search)) return true;
  if (search.length < 3) return false;
  const distance = levenshteinDistance(search, target);
  if (search.length <= 4) return distance <= 1;
  if (search.length <= 7) return distance <= 2;
  return distance <= 3;
};

export const isNameMatch = (searchTerm, patient) => {
  const search = normalizeText(searchTerm);
  if (!search) return true;
  const firstName = normalizeText(getPatientFirstName(patient));
  const lastName = normalizeText(getPatientLastName(patient));
  const fullName = normalizeText(`${firstName} ${lastName}`);
  const reversedName = normalizeText(`${lastName} ${firstName}`);

  if (firstName.includes(search) || lastName.includes(search) || fullName.includes(search) || reversedName.includes(search)) return true;

  const searchWords = search.split(" ").filter(Boolean);
  const patientWords = [...firstName.split(" "), ...lastName.split(" "), ...fullName.split(" "), ...reversedName.split(" ")].filter(Boolean);
  return searchWords.every((searchWord) => patientWords.some((patientWord) => wordMatches(searchWord, patientWord)));
};

export const isDobMatch = (searchTerm, patient) => {
  const search = normalizeText(searchTerm);
  const searchDigits = onlyDigits(searchTerm);
  if (!search && !searchDigits) return false;
  const dobValue = patient.dob || patient.date_of_birth || patient.birth_date;
  if (!dobValue) return false;
  const dateValues = getDateSearchValues(dobValue);
  const textDateMatch = dateValues.some((dateValue) => dateValue.includes(search));
  const digitDateMatch = searchDigits.length > 0 && dateValues.some((dateValue) => onlyDigits(dateValue).includes(searchDigits));
  return textDateMatch || digitDateMatch;
};

export const isPhoneMatch = (searchTerm, patient) => {
  const phone = onlyDigits(patient.phone || patient.telephone || patient.mobile);
  const searchPhone = onlyDigits(searchTerm);
  if (!phone || !searchPhone) return false;
  return phone.includes(searchPhone);
};

// THE MASTER FUNCTION WE WILL EXPORT AND USE EVERYWHERE
export const patientMatchesSearch = (patient, searchTerm) => {
  const search = normalizeText(searchTerm);
  if (!search) return true;
  return isNameMatch(searchTerm, patient) || isPhoneMatch(searchTerm, patient) || isDobMatch(searchTerm, patient);
};