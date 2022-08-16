import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";

export const Footer = ({ valueType, setValueType }) => {
  const button = () => {
    if (valueType === "SignIn") {
      setValueType("CreateAccount");
    } else {
      setValueType("SignIn");
    }
  };

  const dateForm = {
    notReg: "Not registered?",
    already: "Already have an account?",
    nameLink1: "Create an account",
    sign_in: "Sign in",
  };

  return (
    <div>
      <div className={classNames(styles.foo, styles.pandlink)}>
        <p>
          {valueType === "SignIn" ? dateForm.notReg : dateForm.already}
          <button onClick={() => button()}>
            {valueType === "SignIn" ? dateForm.nameLink1 : dateForm.sign_in}
          </button>
        </p>
      </div>
    </div>
  );
};
