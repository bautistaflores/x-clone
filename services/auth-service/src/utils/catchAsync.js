// devuelve una nueva funcion con un .catch() para enviar cualquier error al middleware
const catchAsync = (fn) => {
    return (req, res, next) => {
      // ejecuta la funcion del controlador y si es rechazada pasa el error a 'errorHandler'.
      fn(req, res, next).catch(err => next(err));
    };
  };
  
  export default catchAsync;