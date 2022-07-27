import React, { useState } from "react";
import { Authform } from "../Authform/Authform";
import { Regform } from "../Regform/Regform";
import styles from "./styles.module.css";

export const Main = () => {
  const [valueDiv, setValueDiv] = useState(0);
  // console.log(valueDiv);

  return (
    <div className={styles.root}>
      <Authform div1={valueDiv} set={setValueDiv} />
      <Regform div1={valueDiv} set={setValueDiv} />
    </div>
  );
};
