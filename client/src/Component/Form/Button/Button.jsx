import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";

export const Button = ({ valueType }) => {
  const url = `http://localhost:3001`;
  async function aaa() {
    let response = await fetch(url + "/signin", {
      method: `POST`,
      mode: `no-cors`,
    });
  }
  const dateForm = {
    sign_in: "Sign in",
    createAccount: "Create an account",
    forgot: "Reset password",
  };
  return (
    <div>
      <div
        className={classNames(
          { [styles.name]: valueType === "CreateAccount" },
          { [styles.hidden]: valueType !== "CreateAccount" },
          styles.foo
        )}
      >
        <label htmlFor="YourName">Your name - optional</label>
        <input type="text" id="YourName" name="yourName" placeholder="name" />
      </div>
      <button className={classNames(styles.foo)} onClick={() => aaa()}>
        {valueType === "SignIn"
          ? dateForm.sign_in
          : valueType === "Forgot"
          ? dateForm.forgot
          : dateForm.createAccount}
      </button>
    </div>
  );
};
