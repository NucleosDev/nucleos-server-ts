import { body, param } from "express-validator";

export const createNucleoValidator = [
  body("nome").isString().notEmpty().withMessage("Nome é obrigatório"),
  body("descricao").optional().isString(),
  body("tipo").optional().isString(),
  body("corDestaque").optional().isString(),
  body("imagemCapa").optional().isString().isURL(),
];

export const updateNucleoValidator = [
  param("id").isUUID().withMessage("ID inválido"),
  body("nome").optional().isString(),
  body("descricao").optional().isString(),
  body("tipo").optional().isString(),
  body("corDestaque").optional().isString(),
  body("imagemCapa").optional().isString().isURL(),
];

export const getNucleoByIdValidator = [
  param("id").isUUID().withMessage("ID inválido"),
];

export const deleteNucleoValidator = [
  param("id").isUUID().withMessage("ID inválido"),
];