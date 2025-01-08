import moment from 'moment-timezone';


export function formatComma(value, minimumFractionDigits = 2) {
    value = value ? parseFloat(value) : 0;
    return value.toLocaleString('en-US', { minimumFractionDigits: minimumFractionDigits, maximumFractionDigits: Math.max(2, minimumFractionDigits) });
}


export function sum(arr = [], prop = "") {
    return arr?.reduce((accumulator, object) => {
        return accumulator + (prop ? +object[prop] : object);
    }, 0)
}


// Utility function to calculate percentage change
export const calculatePercentageChange = (previousValue, currentValue) => {
    if (previousValue === 0) {
        return formatComma(currentValue > 0 ? 100 : 0);
    }
    return formatComma(((currentValue - previousValue) / previousValue) * 100);
};


export const getDateRange = (startDate, endDate, timezone) => {
    const start = moment.tz(startDate, timezone).startOf("day").toDate();
    const end = moment.tz(endDate, timezone).endOf("day").toDate();
    return { start, end };
};



// utils.js
export const getRole = (session, role) => session && session.user?.role == role



export const findSelectedOption = (options, id) => options.find(option => option.id === id) || null;


export function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
}


export const isValidString = (value) => typeof value === 'string' && value.trim() !== '';


export function groupBy(arr = [], groupByProperty, sumByProperty) {
    let helper = {};
    let result = arr.reduce(function (r, o) {
        let key = o[groupByProperty]?.value || o[groupByProperty];

        if (!helper[key]) {
            helper[key] = Object.assign({}, o); // create a copy of o
            r.push(helper[key]);
        } else {
            helper[key][sumByProperty] += o[sumByProperty];
        }

        return r;
    }, []);

    return result;
}