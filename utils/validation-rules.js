
let dirtyChecking = [];
export const validationRules = {
  common: {
    required: true,
    message: {
      empty: 'This field is required.'
    }
  },
  firstName: {
    pattern: /^[a-z ,'-]+$/i, //Alphanumeric string 
    required: true,
    message: {
      empty: 'We need your first name.',
      invalid: 'Invalid first name.'
    }
  },
  lastName: {
    pattern: /^[a-z ,'-]+$/i, //Alphanumeric string 
    required: true,
    message: {
      empty: 'We need your last name.',
      invalid: 'Invalid last name.'
    }
  },
  name: {
    pattern: /^[a-z ,.'-]+$/i, //Alphanumeric string 
    required: false,
    message: {
      invalid: 'Invalid value'
    }
  },
  username: {
    pattern: /^[a-z0-9_-]{3,16}$/, //Alphanumeric string that may include _ and – having a length of 3 to 16 characters.
    required: true,
    message: {
      empty: 'Username is required',
      invalid: 'Username is invalid'
    }
  },
  password: {
    pattern: new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[~!@#$%^&*_\-+=`|\\(){}\[\]:;"'<>,.?\/]).{8,}$/),
    required: true,
    message: {
      invalid: 'Password must be at least 8 characters long and contain at least one number, letter and special character'
    }
  },
  password_optional: {
    pattern: new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[~!@#$%^&*_\-+=`|\\(){}\[\]:;"'<>,.?\/]).{8,}$/),
    required: false,
    message: {
      invalid: 'Password must be at least 8 characters long and contain at least one number, letter and special character'
    }
  },
  email: {
    pattern: new RegExp(/^[-!#-'*+/-9=?^-~]+(?:\.[-!#-'*+/-9=?^-~]+)*@[-!#-'*+/-9=?^-~]+(?:\.[-!#-'*+/-9=?^-~]{2,20})+$/i),
    required: false,
    message: {
      empty: 'Email field required',
      invalid: "Please enter a valid email address like name@example.com"
    }
  },
  phone: {
    pattern: /^\d{4,14}$/,
    required: false,
    message: {
      empty: 'Phone number is required',
      invalid: 'Invalid phone number'
    }
  },
  phoneControl: {
    pattern: /^((?!(0))[0-9]+)$/,
    required: false,
    message: {
      empty: 'Phone number is required',
      invalid: 'Invalid phone number'
    }
  },
  checked: {
    required: false,
    check: true,
    message: {
      empty: 'You need to read and accept'
    }
  },
  select: {
    required: true,
    check: true
  },
  date: {
    date: true,
    required: false,
    message: {
      empty: 'Date is required',
      invalid: 'Date is invalid'
    }
  },
  textInput: {
    pattern: /[A-Za-z0-9]/
  },
  numberInput: {
    pattern: /^\d*\.?\d*$/,
    message: {
      invalid: 'Value is invalid'
    }
  },
  positiveNumber: {
    pattern: /^\+?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?$/,
    message: {
      invalid: 'Value is invalid'
    }
  },
  number: {
    pattern: /^\d*\.?\d*$/,
    message: {
      invalid: 'Value is invalid'
    }
  },
  positiveInteger: {
    pattern: /^\d*$/,
    message: {
      invalid: 'Value is invalid'
    }
  },
  uniqueIdentifier: {
    required: false
  }
}

const isDate = (str) => !isNaN(Date.parse(str));
export const isString = (str) => typeof str === 'string';

const prepareValidationObj = (rule) => {
  let validationRuleObj = '';

  if (typeof rule === 'object' && rule !== null) {
    if (rule.type && validationRules[rule.type]) {
      validationRuleObj = { ...validationRules[rule.type], ...rule };
    } else {
      validationRuleObj = rule;
    }
  } else {
    validationRuleObj = validationRules[rule];
  }

  return validationRuleObj;
}

export default function (rule, value, reset = false) {
  let message = null, valid = true, required = false;

  const validationRuleObj = prepareValidationObj(rule);

  if (validationRuleObj && !reset) {
    let defaultConstraints = validationRules.common;
    let constraints = validationRuleObj;
    let checkValue = value;
    required = constraints.required;

    if (constraints.pattern) {
      const trimmedValue = isString(value) ? value.trim() : value;
      valid = constraints.pattern.test(trimmedValue);
    } else if (constraints.check && constraints.required) {
      valid = isString(value) ? value.trim() !== '' : !!value;
    } else if (constraints.date) {
      valid = isDate(value);
    } else if (rule === 'fileReq') {
      valid = value.length > 0;
      checkValue = value.length;
    }

    if (constraints.min) {
      valid = constraints.pattern.test(value) && value >= constraints.min;
    }

    if (constraints.max) {
      valid = constraints.pattern.test(value) && value <= constraints.max;
    }

    if (constraints.min && constraints.max) {
      valid = constraints.pattern.test(value) && value >= constraints.min && value <= constraints.max;
    }

    if (checkValue) {
      message = (constraints.message && constraints.message.invalid) || defaultConstraints.message.invalid;
      !dirtyChecking.includes(rule) && dirtyChecking.push(rule);
    } else {
      if (!required) {
        valid = true;
      } else if (required && !constraints.check && !checkValue) {
        valid = false;
      }
      message = (constraints.message && constraints.message.empty) || defaultConstraints.message.empty;
    }
  }

  return {
    message,
    valid,
    required,
    dirty: dirtyChecking.includes(rule)
  }
}