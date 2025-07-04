const Router = require('koa-router');
const koaBody = require('koa-body')({ multipart: true });

const user = require('../controllers/user.controller');
const session = require('../controllers/session.controller');
const userValidator = require('../middleware/validators/user.params.validator');
const tokenValidator = require('../middleware/validators/token.validator');
const checkPossibilityRegistration = require('../middleware/check.possibility.registration');

const router = new Router({ prefix: '/api/mauth' });

router.post(
  '/signup',
  checkPossibilityRegistration,
  koaBody,
  userValidator.params,
  user.signup,
  user.firstUserMustBeAdmin,
);
router.post(
  '/signin',
  koaBody,
  userValidator.params,
  user.signin,
  session.start,
);
router.delete(
  '/signout',
  tokenValidator.refreshToken,
  session.destroy,
);
router.get(
  '/confirm/:token',
  tokenValidator.confirmToken,
  user.confirm,
  user.firstUserMustBeAdmin,
);
router.get(
  '/access',
  tokenValidator.accessToken,
  user.me,
);
router.get(
  '/refresh',
  tokenValidator.refreshToken,
  session.refresh,
);
router.patch(
  '/forgot',
  koaBody,
  userValidator.email,
  user.forgot,
);
router.get(
  '/forgot/:token',
  tokenValidator.forgotToken,
  user.resetPassword,
);
router.patch(
  '/password',
  koaBody,
  tokenValidator.accessToken,
  userValidator.password,
  user.changepass,
);

module.exports = router.routes();
