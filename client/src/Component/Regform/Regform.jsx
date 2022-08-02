import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";
import { Eye } from "../Eye/Eye";
import { useState } from "react";

export const Regform = () => {
  const [valueEyeSlash, setValueEyeSlash] = useState(0);

  const [valueType, setValueType] = useState(0);

  const dateForm = {
    typeInput1: "Password",
    typeInput2: "Text",
    namebutton1: "Sign in",
    namebutton2: "Create an account",
    namebutton3: "Reset password",
    nameP1: "Not registered?",
    nameP2: "Already have an account?",
    nameLink1: "Create an account",
    nameLink2: "Sign in",
  };

  return (
    <div className={classNames(styles.root)}>
      <div
        className={classNames(
          { [styles.border]: valueType === 0 },
          { [styles.borderReg]: valueType === 1 },
          { [styles.borderForgot]: valueType === 2 }
        )}
      >
        <div className={classNames(styles.email, styles.foo)}>
          <label htmlFor="Email">Email</label>
          <input type="text" id="Email" name="e-mail" placeholder="email" />
        </div>
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
              type={
                valueEyeSlash === 0 ? dateForm.typeInput1 : dateForm.typeInput2
              }
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
        <div
          className={classNames(
            { [styles.name]: valueType === 1 },
            { [styles.hidden]: valueType !== 1 },
            styles.foo
          )}
        >
          <label htmlFor="YourName">Your name - optional</label>
          <input type="text" id="YourName" name="yourName" placeholder="name" />
        </div>
        <button
          className={classNames(styles.foo)}
          onClick={() => console.log(valueType)}
        >
          {valueType === 0
            ? dateForm.namebutton1
            : valueType === 2
            ? dateForm.namebutton3
            : dateForm.namebutton2}
        </button>
        <div className={classNames(styles.foo, styles.pandlink)}>
          <p>
            {valueType === 0 ? dateForm.nameP1 : dateForm.nameP2}
            <button
              onClick={() =>
                setValueType(
                  valueType === 0
                    ? valueType + 1
                    : valueType === 2
                    ? valueType - 2
                    : valueType - 1
                )
              }
            >
              {valueType === 0 ? dateForm.nameLink1 : dateForm.nameLink2}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
