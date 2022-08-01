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
router.put(
  '/signout',
  koaBody(),
  userValidator.signout,
  auth.signout,
);
router.get(
  '/confirm/:token',
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
router.get(
  '/me',
  auth.me,
);

module.exports = router.routes();
