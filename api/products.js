const products = require('../products.json');

module.exports = (req, res) => {
  res.status(200).json(products);
};
