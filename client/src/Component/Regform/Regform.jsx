import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";
import { Eye } from "../Eye/Eye";
import { useState } from "react";

export const Regform = () => {
  const [valueEyeSlash, setValueEyeSlash] = useState(0);

  const [valueType, setValueType] = useState({
    value: 1,
    border: styles.border,
    passw: styles.pass,
    name: styles.noneName,
    buttonName: "Sing in",
    pName: "Not registered?",
    aName: "Create an account",
  });  

  const passwordEye = (valueType) => {
    switch (valueType.value) {
      case 1:
        valueEyeSlash.value = 1;
        valueEyeSlash.passw = styles.pass;
        valueEyeSlash.name = styles.noneName;
        valueEyeSlash.buttonName = "Sing in";
        valueEyeSlash.pName = "Not registered?";
        valueEyeSlash.aName = "Create an account";
        break;
      case 2:
        valueEyeSlash.value = 2;
        valueEyeSlash.passw = styles.pass;
        valueEyeSlash.name = styles.noneName;
        valueEyeSlash.buttonName = "Sing in";
        valueEyeSlash.pName = "Not registered?";
        valueEyeSlash.aName = "Create an account";
        break;
      default:
        valueEyeSlash.value = 0;
        valueEyeSlash.passw = styles.pass;
        valueEyeSlash.name = styles.noneName;
        valueEyeSlash.buttonName = "Sing in";
        valueEyeSlash.pName = "Not registered?";
        valueEyeSlash.aName = "Create an account";
    }
  };

  return (
    <div className={classNames(styles.root)}>
      <div className={classNames(valueType.border)}>
        <div className={classNames(styles.email, styles.foo)}>
          <label htmlFor="Email">Email</label>
          <input type="text" id="Email" placeholder="email" />
        </div>
        <div className={classNames(valueType.passw, styles.foo)}>
          <div className={styles.paslink}>
            <label htmlFor="Password">Password</label>
            <a className={classNames(styles.)}
              onClick={() => setValueType(passwordEye((valueType.value = 1)))}
              href="#"
            >
              Forgot password?
            </a>
          </div>
          <div className={styles.password}>
            <input type={valueType} placeholder="password" />
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
        <div className={classNames(valueType.name, styles.foo)}>
          <label htmlFor="Name">Your name - optional</label>
          <input type="text" id="Name" placeholder="name" />
        </div>
        <button className={classNames(styles.foo)}>
          {valueType.buttonName}
        </button>
        <div className={classNames(styles.foo, styles.pandlink)}>
          <p>
            {valueType.pName}
            <a
              href="#"
              onClick={() =>
                setValueEyeSlash(passwordEye((valueType.value = 2)))
              }
            >
              {valueType.aName}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
