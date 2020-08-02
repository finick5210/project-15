const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const { getCards, createCard, deleteCard } = require('../controllers/cards');
const {
  ValidationError,
} = require('../errors');

router.get('/', getCards);

router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().custom((value) => {
      if (validator.isURL(value)) {
        return value;
      }
      throw new ValidationError(`${value} is not a valid url!`);
    }),
  }),
}), createCard);

router.delete('/:id', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24),
  }),
}), deleteCard);

module.exports = router;
