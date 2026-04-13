export const CONFIG = {
  BCRYPT_ROUNDS:            10,
  MAX_LOGIN_ATTEMPTS:       5,
  PASSWORD_RESET_TTL_HOURS: 2,
  FREE_PLAN_MAX_NUCLEOS:    3,
  XP: {
    TAREFA_CONCLUIDA:       10,
    HABITO_REGISTRADO:      5,
    NUCLEO_CRIADO:          20,
    LOGIN_DIARIO:           2,
  },
  STREAK: {
    TYPES: {
      GLOBAL:   'global',
      NUCLEO:   'nucleo',
      HABITO:   'habito',
    },
  },
} as const;
