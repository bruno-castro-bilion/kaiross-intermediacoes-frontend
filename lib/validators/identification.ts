export const onlyDigits = (s: string) => s.replace(/\D/g, "");

export function isValidCpf(cpfRaw: string) {
  const cpf = onlyDigits(cpfRaw);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (t: number) => {
    let sum = 0;
    for (let i = 0; i < t; i++) { sum += parseInt(cpf.charAt(i)) * (t + 1 - i); }
    const res = (sum * 10) % 11;
    return res === 10 ? 0 : res;
  };
  const v1 = calc(9); const v2 = calc(10);
  return v1 === parseInt(cpf.charAt(9)) && v2 === parseInt(cpf.charAt(10));
}

export function isValidCnpj(cnpjRaw: string) {
  const cnpj = onlyDigits(cnpjRaw);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  const calc = (pos: number) => {
    let sum = 0; let weights = pos - 7;
    for (let i = pos; i >= 1; i--) { sum += parseInt(cnpj.charAt(pos - i)) * weights; weights = weights === 2 ? 9 : weights - 1; }
    const res = sum % 11;
    return res < 2 ? 0 : 11 - res;
  };
  const v1 = calc(12); const v2 = calc(13);
  return v1 === parseInt(cnpj.charAt(12)) && v2 === parseInt(cnpj.charAt(13));
}
