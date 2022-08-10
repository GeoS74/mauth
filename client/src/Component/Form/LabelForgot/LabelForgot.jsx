import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";

export const LabelForgot = ({ valueType, setValueType }) => {
  return (
    <div
      className={classNames(styles.foo, styles.pass, {
        [styles.hidden]: valueType === 2,
      })}
    >
      <div className={styles.paslink}>
        <label htmlFor="Password">Password</label>
        <button
          className={classNames(styles.passButton, {
            [styles.hidden]: valueType === 1,
          })}
          onClick={() => setValueType(valueType + 2)}
        >
          Forgot password?
        </button>
      </div>
    </div>
  );
};
