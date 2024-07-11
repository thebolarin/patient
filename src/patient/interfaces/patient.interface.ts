export interface FullName {
  firstName: String;
  middleName?: String;
  lastName: String;
}

export interface Patient {
  fullName: FullName;
  dateOfBirth: String;
  primaryCondition: String;
}