import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";

export const Footer = ({ valueType, setValueType }) => {
  const button = () => {
    if (valueType === "signin") {
      setValueType("signup");
    } else {
      setValueType("signin");
    }
  };

  const dateForm = {
    notReg: "Not registered?",
    already: "Already have an account?",
    nameLink1: "Create an account",
    signin: "Sign in",
  };

  return (
    <div>
      <div className={classNames(styles.foo, styles.pandlink)}>
        <p>
          {valueType === "signin" ? dateForm.notReg : dateForm.already}
          <button onClick={event => {
            event.preventDefault();
            setValueType(valueType === 'signin' ? 'signup' : 'signin');
            }}>
            {valueType === "signin" ? dateForm.nameLink1 : dateForm.signin}
          </button>
        </p>
      </div>
    </div>
  );
};
