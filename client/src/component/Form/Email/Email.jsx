import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";

export const Email = () => {
  return (
    <div className={classNames(styles.email, styles.foo)}>
      <label htmlFor="Email">Email</label>
      <input type="text" id="Email" name="e-mail" placeholder="email" />
    </div>
  );
};
