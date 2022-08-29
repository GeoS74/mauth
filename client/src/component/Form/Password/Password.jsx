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
        [styles.hidden]: valueType === "forgot",
      })}
    >
      <div className={styles.password}>
        <input
          id="Password"
          name="password"
          type={
            valueEyeSlash === "Slash"
              ? dateForm.typePassword
              : dateForm.typeText
          }
          placeholder="password"
        />
        <p onClick={eyeSlash}>
          <Eye valueSlash={valueEyeSlash} />
        </p>
      </div>
    </div>
  );
};
