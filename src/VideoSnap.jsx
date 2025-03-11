import "./ui/VideoSnap.css";
import { createElement, useRef, useState, useEffect } from "react";
import classNames from "classnames";

import { VideoRecorder } from "./components/VideoRecorder";


export function VideoSnap({ className, style }) {
    return (
        <div className={classNames("widget-videosnap", className)} style={style}>
            <VideoRecorder />
        </div>
    );
}
