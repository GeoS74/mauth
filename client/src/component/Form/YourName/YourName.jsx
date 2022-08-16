import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";

export const YourName = ({ valueType }) => {
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
    </div>
  );
};
