import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";

export const Button = ({ valueType }) => {
  const url = `http://localhost:3001`;
  
  //вызов этой функции вынесен в компоненту Regform
  //
  // function query() {
   
  //   if (valueType === "SignIn") {

  //     //этот код работает
  //    fetch(url + "/signin", {
  //       method: `POST`,
  //       body: new FormData()
  //     })
  //     .then(async req => {
  //       const res = await req.json();
  //       console.log(res)
  //     });

  //   } else if (valueType === "CreateAccount") {
  //     console.log(2);
  //   } else if (valueType === "Forgot") {
  //     console.log(3);
  //   }
  // }
  const dateForm = {
    signin: "Sign in",
    signup: "Create an account",
    forgot: "Reset password",
  };
  return (
    <div>
      <button className={classNames(styles.foo)}>
        {dateForm[valueType]}
      </button>
    </div>
  );
};
