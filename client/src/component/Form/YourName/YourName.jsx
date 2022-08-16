import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";

export const YourName = ({ valueType }) => {
  return (
    <div>
      <div
        className={classNames(
          { [styles.name]: valueType === "signup" },
          { [styles.hidden]: valueType !== "signup" },
          styles.foo
        )}
      >
        <label htmlFor="YourName">Your name - optional</label>
        <input type="text" id="YourName" name="name" placeholder="name" />
      </div>
    </div>
  );
};
