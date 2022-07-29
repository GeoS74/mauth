const Router = require('koa-router');
const koaBody = require('koa-body');

const authController = require('../controllers/auth.controller');
const userValidator = require('../libs/validators/user.params.validator');

const router = new Router({ prefix: '' });

router.post(
  '/signup',
  koaBody(),
  userValidator.signup,
  authController.signup,
);
router.post(
  '/signin',
  koaBody(),
  userValidator.signin,
  authController.signin,
  authController.resetRecoveryToken,
);
router.put(
  '/signout',
  koaBody(),
  userValidator.signout,
  authController.signout,
);
router.get('/confirm/:token', authController.confirm);

module.exports = router.routes();
