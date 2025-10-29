/**
 * Modelo de Usuário
 * Representa a estrutura de dados de um usuário
 */
export interface User {
  id: number;
  uid: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  avatar: string;
  gender: string;
  phone_number: string;
  social_insurance_number: string;
  date_of_birth: string;
  employment: {
    title: string;
    key_skill: string;
  };
  address: {
    city: string;
    street_name: string;
    street_address: string;
    zip_code: string;
    state: string;
    country: string;
    lng: number;
    lat: number;
  };
  credit_card: {
    cc_number: string;
  };
  subscription: {
    plan: string;
    status: string;
    payment_method: string;
    term: string;
  };
}
