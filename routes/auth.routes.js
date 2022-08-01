const Router = require('koa-router');
const koaBody = require('koa-body');

const auth = require('../controllers/auth.controller');
const userValidator = require('../libs/validators/user.params.validator');
const session = require('../controllers/session.controller');
const sessionValidator = require('../libs/validators/session.params.validator');

const router = new Router({ prefix: '' });

router.post(
  '/signup',
  koaBody(),
  userValidator.signup,
  auth.signup,
);
router.post(
  '/signin',
  koaBody(),
  userValidator.signin,
  auth.signin,
  session.start,
);
router.delete(
  '/signout',
  koaBody(),
  sessionValidator.refreshToken,
  session.destroy,
);
router.get(
  '/confirm/:token',
  userValidator.uuid,
  auth.confirm,
);
router.get(
  '/access',
  session.access,
);
router.get(
  '/refresh',
  sessionValidator.refreshToken,
  session.refresh,
);
router.patch(
  '/forgot',
  koaBody(),
  userValidator.forgot,
  auth.forgot,
);
router.get(
  '/forgot/:token',
  userValidator.uuid,
  auth.resetPassword,
);
router.patch(
  '/change/password',
  koaBody(),
  sessionValidator.accessToken,
  auth.changepass,
);

module.exports = router.routes();
