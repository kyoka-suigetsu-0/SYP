// validate missing fields
export const validateRequiredFields = (data, requiredFields) => {
    const missingFields = requiredFields.filter((field) => !data[field]);

    return {
        isValid: missingFields.length === 0,
        missingFields,
    }
}

// validate email format
export const validateEmail = (email) => {
    const emailRegex = /(.+)@(.+){2,}\.(.+){2,}/
    return emailRegex.test(email)
}

// validate password requirements
export const validatePassword = (password, minLength = 6) => {
    if (!password || password.length < minLength) {
        return {
            isPasswordValid: false,
            message: `Password must be at least ${minLength} chars`
        }
    }

    return {
        isPasswordValid: true,
        message: `Password is valid`
    }
}

// validate positive number
export const validatePositiveNumber = (value, fieldName) => {
    if (value === null || value === undefined || value === "") {
        return {
            isValid: false,
            message: `${fieldName} is required`
        }
    }

    const numValue = Number(value);
    if (isNaN(numValue)) {
        return {
            isValid: false,
            message: `${fieldName} must be a valid number`
        }
    }

    if (numValue <= 0) {
        return {
            isValid: false,
            message: `${fieldName} must be a positive number`
        }
    }

    return {
        isValid: true,
        message: `${fieldName} is valid`
    }
}