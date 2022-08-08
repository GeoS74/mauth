import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";
import { useState } from "react";
import { EmailForm } from "../Form/EmailForm/EmailForm";
import { PasswordForm } from "../Form/PasswordForm/PasswordForm";
import { ButtonForm } from "../Form/ButtonForm/ButtonForm";

export const Regform = () => {
  const [valueType, setValueType] = useState(0);

  return (
    <div className={classNames(styles.root)}>
      <div
        className={classNames(
          { [styles.border]: valueType === 0 },
          { [styles.borderReg]: valueType === 1 },
          { [styles.borderForgot]: valueType === 2 }
        )}
      >
        <EmailForm />
        <PasswordForm valueType={valueType} setValueType={setValueType} />
        <ButtonForm valueType={valueType} setValueType={setValueType} />
      </div>
    </div>
  );
};
