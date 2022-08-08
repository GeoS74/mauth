import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";
import { useState } from "react";
import { Eye } from "../../Eye/Eye";

export const PasswordForm = ({ valueType, setValueType }) => {
  const [valueEyeSlash, setValueEyeSlash] = useState(0);

  const dateForm = {
    typeInput1: "Password",
    typeInput2: "Text",
  };

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
      <div className={styles.password}>
        <input
          id="Password"
          name="passw"
          type={valueEyeSlash === 0 ? dateForm.typeInput1 : dateForm.typeInput2}
          placeholder="password"
        />
        <button
          onClick={() =>
            setValueEyeSlash(
              valueEyeSlash === 0 ? valueEyeSlash + 1 : valueEyeSlash - 1
            )
          }
        >
          <Eye valueSlash={valueEyeSlash} />
        </button>
      </div>
    </div>
  );
};
