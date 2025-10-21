// Valida el esquema para las rutas de autenticacion
export const validateSchema = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body)
        next()
    } catch (error) {
        next(error);
    }
}
