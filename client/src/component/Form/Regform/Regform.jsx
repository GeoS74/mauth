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


function _query(event, route) {
  event.preventDefault();

  fetch(`http://localhost:3001/${route}`, {
    method: `POST`,
    body: new FormData(event.target)
  })
    .then(async req => {
      const res = await req.json();
      console.log(res)
    });
}


export const Regform = () => {
  const [valueType, setValueType] = useState("signin");
  console.log(`valueType: ${valueType}`)
  
  return (
    <div className={classNames(styles.root)}>
      <form onSubmit={event => _query(event, valueType)}
        className={classNames(
          { [styles.border]: valueType === "signin" },
          { [styles.borderReg]: valueType === "signup" },
          { [styles.borderForgot]: valueType === "forgot" }
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
