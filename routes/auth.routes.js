const Router = require('koa-router');
const koaBody = require('koa-body');

const authController = require('../controllers/auth.controller');
const userValidator = require('../libs/validators/user.params.validator');

const router = new Router({ prefix: '' });

router.post('/signup', 
  koaBody(), 
  userValidator.signup, 
  authController.signup);
router.post('/signin', 
  koaBody(), 
  userValidator.signin, 
  authController.signin, 
  authController.
  resetRecoveryToken);
router.put('/signout', 
  koaBody(), 
  userValidator.signout, 
  authController.signout);
router.get('/confirm/:token', authController.confirm);





const { types } = require('pg');
const db = require('../libs/db');
const mapper = require('../mappers/user.mapper');
const validate = require('../libs/validators/uuid.validator');

router.get('/', async (ctx) => {
  // console.log(types.getTypeParser("214a85b8-ba76-457d-a33e-acd710cf619c"));
  // types.getTypeParser("214a85b8-ba76-457d-a33e-acd710cf619c")

  const rows = await db.query('SELECT * FROM users').then((res) => res.rows);
  ctx.body = rows.map((row) => mapper(row));
});
router.get('/:id', validate, async (ctx) => {
  try {
    const rows = await db.query('SELECT * FROM users WHERE id=$1', [ctx.params.id]).then((res) => res.rows);
    ctx.body = mapper(rows[0]);
  } catch (error) {
    console.log(error.code);
    console.log(error.message);
  }
});

module.exports = router.routes();
