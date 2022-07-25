import React, { useState } from "react";
import { Authform } from "../Authform/Authform";
import styles from "./styles.module.css";

export const Main = () => {
  return (
    <div className={styles.root}>
      <Authform />
    </div>
  );
};
