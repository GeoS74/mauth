import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";
import { useState } from "react";
import { Email } from "../Email/Email";
import { Password } from "../Password/Password";
import { Button } from "../Button/Button";
import { LabelForgot } from "../LabelForgot/LabelForgot";
import { Footer } from "../Footer/Footer";
import { YourName } from "../YourName/YourName";

function _query(event, route, setJsonData, setValueType) {
    event.preventDefault();
    fetch(`http://localhost:3001/${route}`, {
        method: route === "forgot" ? `PATCH` : `POST`,
        body: new FormData(event.target),
    }).then(async (req) => {
        if (req.ok) {
            setValueType("signin");

            return;
        }
        const res = await req.json();
        setJsonData(res.error);
    });
    // if (route === "forgot") {
    //     event.preventDefault();
    //     fetch(`http://localhost:3001/${route}`, {
    //         method: `PATCH`,
    //         body: new FormData(event.target),
    //     }).then(async (req) => {
    //         const res = await req.json();
    //         setJsonData(res.error);
    //     });
    // } else {
    //     event.preventDefault();
    //     fetch(`http://localhost:3001/${route}`, {
    //         method: `POST`,
    //         body: new FormData(event.target),
    //     }).then(async (req) => {
    //         if (req.ok) {
    //             setValueType("signin");

    //             return;
    //         }
    //         const res = await req.json();
    //         setJsonData(res.error);
    //     });
    // }
}

export const Regform = () => {
    const [valueType, setValueType] = useState("signin");
    const [jsonData, setJsonData] = useState("0");

    return (
        <div className={classNames(styles.root)}>
            <form
                onSubmit={(event) => _query.call(this, event, valueType, setJsonData, setValueType)}
                className={classNames({ [styles.border]: valueType === "signin" }, { [styles.borderReg]: valueType === "signup" }, { [styles.borderForgot]: valueType === "forgot" })}
            >
                <Email jsonData={jsonData} />
                <LabelForgot valueType={valueType} setValueType={setValueType} />
                <Password valueType={valueType} jsonData={jsonData} />
                <YourName valueType={valueType} jsonData={jsonData} />
                <Button valueType={valueType} />
                <Footer valueType={valueType} setValueType={setValueType} />
            </form>
        </div>
    );
};
