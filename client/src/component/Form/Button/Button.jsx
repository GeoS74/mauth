import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";

export const Button = ({ valueType }) => {
  const url = `http://localhost:3001`;
  
  function query() {
   
    if (valueType === "SignIn") {

      //этот код работает
     fetch(url + "/signin", {
        method: `POST`,
        body: new FormData()
      })
      .then(async req => {
        const res = await req.json();
        console.log(res)
      });

    } else if (valueType === "CreateAccount") {
      console.log(2);
    } else if (valueType === "Forgot") {
      console.log(3);
    }
  }
  const dateForm = {
    sign_in: "Sign in",
    createAccount: "Create an account",
    forgot: "Reset password",
  };
  return (
    <div>
      <button className={classNames(styles.foo)} onClick={query}>
        {valueType === "SignIn"
          ? dateForm.sign_in
          : valueType === "Forgot"
          ? dateForm.forgot
          : dateForm.createAccount}
      </button>
    </div>
  );
};
