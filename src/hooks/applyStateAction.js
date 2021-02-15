export const applyStateAction = (stateAction, prevState, nullOnNoChange = false) => {
    const newState = typeof stateAction === "function" ? stateAction(prevState) : stateAction;
    return (nullOnNoChange && newState === prevState) ? null : newState;
};
