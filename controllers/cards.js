const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const { _id } = req.user;

  Card.create({ name, link, owner: _id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: err.message });
        return;
      }
      res.status(500).send({ message: err.message });
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findById(req.params.id)
    .then((card) => {
      if (!card) {
        res.status('404');
        res.send({ message: 'Нет карточки с таким id' });
        return;
        // eslint-disable-next-line no-underscore-dangle
      } if (card.owner.toString() !== req.user._id) {
        res.status('401');
        res.send({ message: 'Недостаточно прав для удаления карточки' });
        return;
      }
      // eslint-disable-next-line no-underscore-dangle
      Card.deleteOne({ _id: card._id })
        .then(() => {
          res.send({ data: card });
        });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};
