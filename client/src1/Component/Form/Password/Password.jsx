import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";
import { useState } from "react";
import { Eye } from "../Eye/Eye";

export const Password = ({ valueType }) => {
  const [valueEyeSlash, setValueEyeSlash] = useState("Slash");

  const eyeSlash = () => {
    if (valueEyeSlash === "Slash") {
      setValueEyeSlash("NotSlash");
    } else {
      setValueEyeSlash("Slash");
    }
  };

  const dateForm = {
    typePassword: "Password",
    typeText: "Text",
  };

  return (
    <div
      className={classNames(styles.foo, styles.pass, {
        [styles.hidden]: valueType === "Forgot",
      })}
    >
      <div className={styles.password}>
        <input
          id="Password"
          name="passw"
          type={
            valueEyeSlash === "Slash"
              ? dateForm.typePassword
              : dateForm.typeText
          }
          placeholder="password"
        />
        <button onClick={() => eyeSlash()}>
          <Eye valueSlash={valueEyeSlash} />
        </button>
      </div>
    </div>
  );
};
