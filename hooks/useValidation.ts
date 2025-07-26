import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  email?: boolean;
  password?: boolean;
  match?: string;
}

interface FieldState {
  value: string;
  error: string | null;
  touched: boolean;
}

interface FormField {
  [key: string]: FieldState;
}

export const useFormValidation = (initialValues: { [key: string]: string }) => {
  const [fields, setFields] = useState<FormField>(() => {
    const initialFields: FormField = {};
    Object.keys(initialValues).forEach(key => {
      initialFields[key] = {
        value: initialValues[key],
        error: null,
        touched: false,
      };
    });
    return initialFields;
  });

  const validateField = useCallback((fieldName: string, value: string, rules: ValidationRules): string | null => {
    // Required validation
    if (rules.required && (!value || value.trim().length === 0)) {
      return 'Este campo es obligatorio';
    }

    // If field is empty and not required, no further validation needed
    if (!value || value.trim().length === 0) {
      return null;
    }

    // Email validation
    if (rules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Ingresa un email válido';
      }
    }

    // Password validation
    if (rules.password) {
      if (value.length < 8) {
        return 'La contraseña debe tener al menos 8 caracteres';
      }
      if (!/(?=.*[a-z])/.test(value)) {
        return 'La contraseña debe incluir al menos una letra minúscula';
      }
      if (!/(?=.*[A-Z])/.test(value)) {
        return 'La contraseña debe incluir al menos una letra mayúscula';
      }
      if (!/(?=.*\d)/.test(value)) {
        return 'La contraseña debe incluir al menos un número';
      }
    }

    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      return `Debe tener al menos ${rules.minLength} caracteres`;
    }

    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      return `No puede tener más de ${rules.maxLength} caracteres`;
    }

    // Match validation (for password confirmation)
    if (rules.match && value !== fields[rules.match]?.value) {
      return 'Las contraseñas no coinciden';
    }

    return null;
  }, [fields]);

  const setFieldValue = useCallback((fieldName: string, value: string, rules?: ValidationRules) => {
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,
        error: rules ? validateField(fieldName, value, rules) : prev[fieldName]?.error || null,
        touched: true,
      },
    }));
  }, [validateField]);

  const setFieldError = useCallback((fieldName: string, error: string | null) => {
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        error,
      },
    }));
  }, []);

  const validateForm = useCallback((validationRules: { [key: string]: ValidationRules }): boolean => {
    let isValid = true;
    const newFields = { ...fields };

    Object.keys(validationRules).forEach(fieldName => {
      const value = fields[fieldName]?.value || '';
      const error = validateField(fieldName, value, validationRules[fieldName]);
      
      newFields[fieldName] = {
        ...newFields[fieldName],
        error,
        touched: true,
      };

      if (error) {
        isValid = false;
      }
    });

    setFields(newFields);
    return isValid;
  }, [fields, validateField]);

  const resetForm = useCallback(() => {
    const resetFields: FormField = {};
    Object.keys(fields).forEach(key => {
      resetFields[key] = {
        value: initialValues[key] || '',
        error: null,
        touched: false,
      };
    });
    setFields(resetFields);
  }, [fields, initialValues]);

  const getFieldProps = useCallback((fieldName: string) => ({
    value: fields[fieldName]?.value || '',
    error: fields[fieldName]?.error,
    touched: fields[fieldName]?.touched,
  }), [fields]);

  const hasErrors = useCallback((): boolean => {
    return Object.values(fields).some(field => field.error !== null);
  }, [fields]);

  const getFormValues = useCallback(() => {
    const values: { [key: string]: string } = {};
    Object.keys(fields).forEach(key => {
      values[key] = fields[key].value;
    });
    return values;
  }, [fields]);

  return {
    fields,
    setFieldValue,
    setFieldError,
    validateForm,
    resetForm,
    getFieldProps,
    hasErrors,
    getFormValues,
  };
};

export const usePasswordStrength = (password: string) => {
  const getPasswordStrength = useCallback((): { score: number; text: string; color: string } => {
    if (!password) {
      return { score: 0, text: '', color: '#E5E7EB' };
    }

    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    const strengthMap = {
      0: { text: '', color: '#E5E7EB' },
      1: { text: 'Muy débil', color: '#EF4444' },
      2: { text: 'Débil', color: '#F59E0B' },
      3: { text: 'Regular', color: '#F59E0B' },
      4: { text: 'Fuerte', color: '#10B981' },
      5: { text: 'Muy fuerte', color: '#10B981' },
      6: { text: 'Excelente', color: '#10B981' },
    };

    return {
      score: Math.min(score, 6),
      text: strengthMap[Math.min(score, 6) as keyof typeof strengthMap].text,
      color: strengthMap[Math.min(score, 6) as keyof typeof strengthMap].color,
    };
  }, [password]);

  return getPasswordStrength();
};

export const useAuthValidation = () => {
  const validateLoginForm = useCallback((email: string, password: string): string | null => {
    if (!email.trim()) {
      return 'El email es obligatorio';
    }
    
    if (!password.trim()) {
      return 'La contraseña es obligatoria';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Ingresa un email válido';
    }
    
    return null;
  }, []);

  const validateRegistrationForm = useCallback((
    email: string, 
    password: string, 
    confirmPassword: string, 
    name: string,
    acceptTerms: boolean
  ): string | null => {
    if (!name.trim()) {
      return 'El nombre es obligatorio';
    }
    
    if (!email.trim()) {
      return 'El email es obligatorio';
    }
    
    if (!password.trim()) {
      return 'La contraseña es obligatoria';
    }
    
    if (!confirmPassword.trim()) {
      return 'Confirma tu contraseña';
    }
    
    if (!acceptTerms) {
      return 'Debes aceptar los términos y condiciones';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Ingresa un email válido';
    }
    
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    
    if (password !== confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    
    return null;
  }, []);

  const showValidationAlert = useCallback((message: string) => {
    Alert.alert('Error de Validación', message);
  }, []);

  return {
    validateLoginForm,
    validateRegistrationForm,
    showValidationAlert,
  };
};
