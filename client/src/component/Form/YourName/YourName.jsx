import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";

export const YourName = ({ valueType, jsonData }) => {
    const textError = (jsonData) => {
        if (jsonData === "incorrect name") {
            const param = "Имя не корректно";
            return param;
        } else {
            const param = "";
            return param;
        }
    };
    return (
        <div className={styles.root}>
            <div className={classNames({ [styles.name]: valueType === "signup" }, { [styles.hidden]: valueType !== "signup" }, styles.foo)}>
                <label htmlFor="YourName">Your name - optional</label>
                <input type="text" id="YourName" name="name" placeholder="name" />
            </div>
            <p style={{ color: "red", fontSize: "13px", margin: "-7px 0 5px 30px" }}>{textError(jsonData)}</p>
        </div>
    );
};
