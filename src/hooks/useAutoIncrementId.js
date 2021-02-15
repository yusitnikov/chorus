import {useState} from "react";

let autoIncrementId = 0;

export const useAutoIncrementId = () => useState(() => ++autoIncrementId)[0];
