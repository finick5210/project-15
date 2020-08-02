const Card = require('../models/card');
const {
  NotFoundError, AuthorizationError, ServerError, ValidationError,
} = require('../errors');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((err) => next(new ServerError(err.message)));
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const { _id } = req.user;

  Card.create({ name, link, owner: _id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      next(err.name === 'ValidationError' ? new ValidationError(err.message) : new ServerError(err.message));
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.id)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Нет карточки с таким id');
      } if (card.owner.toString() !== req.user._id) {
        throw new AuthorizationError('Недостаточно прав для удаления карточки');
      }

      Card.deleteOne({ _id: card._id })
        .then(() => {
          res.send({ data: card });
        });
    })
    .catch((error) => next(error.message));
};
