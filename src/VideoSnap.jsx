import { createElement, useCallback } from "react";

import { BadgeSample } from "./components/BadgeSample";
import "./ui/VideoSnap.css";

export function VideoSnap(props) {
    const { videosnapType, videosnapValue, valueAttribute, onClickAction, style, bootstrapStyle } = props;
    const onClickHandler = useCallback(() => {
        if (onClickAction && onClickAction.canExecute) {
            onClickAction.execute();
        }
    }, [onClickAction]);

    return (
        <BadgeSample
            type={videosnapType}
            bootstrapStyle={bootstrapStyle}
            className={props.class}
            clickable={!!onClickAction}
            defaultValue={videosnapValue ? videosnapValue : ""}
            onClickAction={onClickHandler}
            style={style}
            value={valueAttribute ? valueAttribute.displayValue : ""}
        />
    );
}
