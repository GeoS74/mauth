import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";

function textError(jsonData) {
    if (jsonData === "invalid email") {
        const param_text = "Почта не корректна";
        return param_text;
    } else if (jsonData === "user not found") {
        const param_text = "Пользователь не найден";
        return param_text;
    } else if (jsonData === "email is not unique") {
        const param_text = "Пользователь с такой почтой уже создан";
        return param_text;
    } else {
        const param_text = "";
        return param_text;
    }
}

export const Email = ({ jsonData }) => {
    return (
        <div className={classNames(styles.email, styles.foo)}>
            <label htmlFor="Email">Email</label>
            <input type="text" id="Email" name="email" placeholder="email" />
            <p style={{ color: "red" }}>{textError(jsonData)}</p>
        </div>
    );
};
