import { createElement } from "react";
import classNames from "classnames";

export function BadgeSample(props) {
    const { type, defaultValue, className, style, value, bootstrapStyle, clickable, onClickAction, getRef } = props;
    return (
        <span
            className={classNames("widget-videosnap", type, className, {
                [`label-${bootstrapStyle}`]: !!bootstrapStyle,
                "widget-videosnap-clickable": clickable
            })}
            onClick={onClickAction}
            ref={getRef}
            style={style}
        >
            {value || defaultValue}
        </span>
    );
}
