import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";

export const ButtonForm = ({ valueType, setValueType }) => {
  const url = `http://localhost:3001`;
  async function aaa() {
    let response = await fetch(url, { mode: `no-cors` });
  }
  const dateForm = {
    namebutton1: "Sign in",
    namebutton2: "Create an account",
    namebutton3: "Reset password",
    nameP1: "Not registered?",
    nameP2: "Already have an account?",
    nameLink1: "Create an account",
    nameLink2: "Sign in",
  };
  return (
    <div>
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
      <button className={classNames(styles.foo)} onClick={() => aaa(`signin`)}>
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
  );
};
