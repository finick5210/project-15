const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getUsers, getUser } = require('../controllers/users');

router.get('/', getUsers);
router.get('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().hex().length(24),
  }),
}), getUser);

module.exports = router;
