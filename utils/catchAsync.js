module.exports = (fn) => {
  //this is the function that express will call
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
