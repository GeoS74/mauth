import React from "react";
import { Regform } from "../Regform/Regform";
import { Authform } from "../Authform/Authform";
import styles from "./styles.module.css";

export const Main = () => {
  return (
    <div className={styles.root}>
      <Regform />
    </div>
  );
};
