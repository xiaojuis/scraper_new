import moment from 'moment';

export class DateHelper {
  static isValidDate(dateStr, format = 'YYYY-MM-DD') {
    return moment(dateStr, format).isValid();
  }

  static isAfterDate(dateStr, compareDate, format = 'YYYY-MM-DD') {
    const date = moment(dateStr, format);
    return date.isValid() && date.isAfter(compareDate);
  }

  static formatDate(dateStr, inputFormat = 'YYYY-MM-DD', outputFormat = 'YYYY-MM-DD') {
    return moment(dateStr, inputFormat).format(outputFormat);
  }

  static getDateYearsAgo(years) {
    return moment().subtract(years, 'years');
  }
}