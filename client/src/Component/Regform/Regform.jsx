import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";
import { useState } from "react";
import { Email } from "../Form/Email/Email";
import { Password } from "../Form/Password/Password";
import { Button } from "../Form/Button/Button";
import { LabelForgot } from "../Form/LabelForgot/LabelForgot";

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
        <Email />
        <LabelForgot valueType={valueType} setValueType={setValueType} />
        <Password valueType={valueType} setValueType={setValueType} />
        <Button valueType={valueType} setValueType={setValueType} />
      </div>
    </div>
  );
};
