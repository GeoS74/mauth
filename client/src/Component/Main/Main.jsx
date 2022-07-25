import React, { useState } from "react";
import { Authform } from "../Authform/Authform";
import { Regform } from "../Regform/Regform";
import styles from "./styles.module.css";

export const Main = () => {
  const [valueDiv, setValeuDiv] = useState(0)


  return (
    <div className={styles.root}>
      <Authform div={valueDiv} set={setValeuDiv} />
      <Regform div={valueDiv} set={setValeuDiv} />
    </div>
  );
};
