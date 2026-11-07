/** Exige "Authorization: Bearer <token>" em toda rota que passar por aqui. */
export function autenticar(authService) {
  return (req, res, next) => {
    const [tipo, token] = String(req.headers.authorization ?? '').split(' ');
    req.usuario = authService.validar(tipo === 'Bearer' ? token : '');
    next();
  };
}
