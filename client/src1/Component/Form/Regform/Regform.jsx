import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";
import { useState } from "react";
import { Email } from "../Email/Email";
import { Password } from "../Password/Password";
import { Button } from "../Button/Button";
import { LabelForgot } from "../LabelForgot/LabelForgot";
import { Footer } from "../Footer/Footer";
import { YourName } from "../YourName/YourName";

export const Regform = () => {
  const [valueType, setValueType] = useState("SignIn");

  return (
    <div className={classNames(styles.root)}>
      <form
        action="#"
        method="GET"
        className={classNames(
          { [styles.border]: valueType === "SignIn" },
          { [styles.borderReg]: valueType === "CreateAccount" },
          { [styles.borderForgot]: valueType === "Forgot" }
        )}
      >
        <Email />
        <LabelForgot valueType={valueType} setValueType={setValueType} />
        <Password valueType={valueType} />
        <YourName valueType={valueType} />
        <Button valueType={valueType} />
        <Footer valueType={valueType} setValueType={setValueType} />
      </form>
    </div>
  );
};
