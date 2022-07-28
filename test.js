const db = require('./libs/db');

; (async _ => {
  try {
    const foo = await db.query('SELECT *, NOW() as today FROM users WHERE age < $2 AND age > $1', [30, 50]);
    console.log(foo.rows)
  } catch (error) {
    console.log(error.message)
  }
})()