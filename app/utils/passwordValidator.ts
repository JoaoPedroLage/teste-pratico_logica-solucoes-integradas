/**
 * Utilitário para validação de complexidade de senha no frontend
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: number;
  strengthLabel: string;
}

/**
 * Valida a complexidade de uma senha
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('A senha deve ter no mínimo 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Pelo menos uma letra maiúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Pelo menos uma letra minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Pelo menos um número');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Pelo menos um caractere especial (!@#$%^&*()_+-=[]{}|;:,.<>?)');
  }

  const strength = getPasswordStrength(password);
  const strengthLabel = getPasswordStrengthLabel(strength);

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    strengthLabel,
  };
}

/**
 * Verifica a força da senha (retorna um score de 0 a 4)
 */
function getPasswordStrength(password: string): number {
  if (password.length === 0) return 0;

  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

  return Math.min(strength, 4);
}

/**
 * Retorna uma mensagem descritiva da força da senha
 */
function getPasswordStrengthLabel(strength: number): string {
  switch (strength) {
    case 0:
      return '';
    case 1:
      return 'Muito fraca';
    case 2:
      return 'Fraca';
    case 3:
      return 'Média';
    case 4:
      return 'Forte';
    default:
      return '';
  }
}

/**
 * Retorna a cor baseada na força da senha
 */
export function getPasswordStrengthColor(strength: number): string {
  switch (strength) {
    case 0:
      return 'bg-gray-200';
    case 1:
      return 'bg-red-500';
    case 2:
      return 'bg-orange-500';
    case 3:
      return 'bg-yellow-500';
    case 4:
      return 'bg-green-500';
    default:
      return 'bg-gray-200';
  }
}

