import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";

export const Button = ({ valueType }) => {
  const url = `http://localhost:3001`;
  async function aaa() {
    if (valueType === "SignIn") {
      let response = await fetch(url + "/signin", {
        method: `POST`,
        mode: `no-cors`,
      });
    }
    // } else if (valueType === "CreateAccount") {
    //   console.log(2);
    // } else if (valueType === "Forgot") {
    //   console.log(3);
    // }
  }
  const dateForm = {
    sign_in: "Sign in",
    createAccount: "Create an account",
    forgot: "Reset password",
  };
  return (
    <div>
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
