import React, { useState } from "react";
import { Authform } from "../Authform/Authform";
import { Regform } from "../Regform/Regform";
import styles from "./styles.module.css";

export const Main = () => {
  return (
    <div className={styles.root}>
      <Authform />
    </div>
  );
};
