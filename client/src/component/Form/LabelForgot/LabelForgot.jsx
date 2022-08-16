import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";

export const LabelForgot = ({ valueType, setValueType }) => {
  return (
    <div
      className={classNames(styles.foo, styles.pass, {
        [styles.hidden]: valueType === "forgot",
      })}
    >
      <div className={styles.paslink}>
        <label htmlFor="Password">Password</label>
        <button
          className={classNames(styles.passButton, {
            [styles.hidden]: valueType === "forgot",
          })}
          onClick={() => setValueType("forgot")}
        >
          Forgot password?
        </button>
      </div>
    </div>
  );
};
