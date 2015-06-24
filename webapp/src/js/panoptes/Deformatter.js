let DateTime2JD = function(date) {
  return date.getTime()/(24.0*60*60*1000) + 2440587.5;
};


module.exports = function(property, string) {
  if (property.isBoolean) {
    return _.indexOf(['Yes', 'yes', '1', 'true', 'True'], string) !== -1;
  }

  if (property.isDate) {
    var year = parseInt(string.substring(0,4));
    var month = parseInt(string.substring(5,7));
    var day = parseInt(string.substring(8,10));
    if (isNaN(year)) year=2000;
    if (isNaN(month)) month=1;
    if (isNaN(day)) day=1;
    return DateTime2JD(new Date(year, month-1, day, 6, 0, 0));
  }

  if (property.isFloat) {
    if ((string == ''))
      return '';
    else {
      let value = parseFloat(string);
      if (isNaN(value))
        return '';
      else
        return value.toFixed(property.settings.decimDigits);
    }
  }
  return string;
};
