const Router = require('koa-router');
const koaBody = require('koa-body')({
  multipart: true,
  parsedMethods: ['POST', 'PATCH', 'DELETE'],
});

const user = require('../controllers/user.controller');
const session = require('../controllers/session.controller');
const userValidator = require('../middleware/validators/user.params.validator');
const tokenValidator = require('../middleware/validators/token.validator');
const isAdmin = require('../middleware/isAdmin');

const router = new Router({ prefix: '/api/mauth/admin' });

router.post(
  '/user/signup',
  tokenValidator.accessToken,
  isAdmin,
  koaBody,
  userValidator.params,
  user.signup,
);
router.delete(
  '/user/signout',
  tokenValidator.accessToken,
  isAdmin,
  koaBody,
  userValidator.email,
  session.destroyUserSession,
);
router.patch(
  '/user/password',
  tokenValidator.accessToken,
  isAdmin,
  koaBody,
  userValidator.email,
  userValidator.password,
  user.changepassUser,
);

module.exports = router.routes();
