
export const emailRule = t => value => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return pattern.test(value) || t('invalid_email');
};

// Required field validation rule
export const requiredRule = t => value => {
    return (!!value && value.trim() !== '') || t('required_field');
};