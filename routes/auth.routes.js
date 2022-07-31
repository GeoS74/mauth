const Router = require('koa-router');
const koaBody = require('koa-body');

const authController = require('../controllers/auth.controller');
const userValidator = require('../libs/validators/user.params.validator');
const session = require('../controllers/session.controller');

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
  session.start,
);
router.put(
  '/signout',
  koaBody(),
  userValidator.signout,
  authController.signout,
);
router.get(
  '/confirm/:token',
  authController.confirm,
);
router.get(
  '/access',
  session.access,
);
router.get(
  '/me',
  authController.me,
);

module.exports = router.routes();
