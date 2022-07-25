import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";
import { useState } from "react";

export const Authform = () => {
  const [valueType, setValueType] = useState("password");

  return (
    <div className={styles.root}>
      <div className={styles.border}>
        <div className={classNames(styles.email, styles.foo)}>
          <label htmlFor="Email">Email</label>
          <input type="text" id="Email" placeholder="email" />
        </div>
        <div className={classNames(styles.pass, styles.foo)}>
          <div className={styles.paslink}>
            <label htmlFor="Password">Password</label>
            <a href="#">Forgot password?</a>
          </div>
          <div className={styles.password}>
            <input type={valueType} placeholder="password" />
            <a
              href="#"
              onClick={() =>
                setValueType(
                  console.log(valueType),
                  valueType == "password" ? '"text"' : '"password"'
                )
              }
            ></a>
          </div>
        </div>
        <button className={classNames(styles.foo)}>Sign in</button>
        <div className={classNames(styles.foo, styles.pandlink)}>
          <p>
            Not registered?<a href="#">Create an account</a>
          </p>
        </div>
      </div>
    </div>
  );
};
