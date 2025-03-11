import "./ui/VideoSnap.css";
import { createElement, useRef, useState, useEffect } from "react";
import classNames from "classnames";

import { VideoRecorder } from "./components/VideoRecorder";

export const executeAction = (action) => {
    if (action && action.canExecute && !action.isExecuting) {
        action.execute();
    }
};

export function VideoSnap({ className, style, onRecordingComplete, onRecordingStart, onError }) {
    // 处理 Mendix 事件包装
    const [isRecording, setIsRecording] = useState(false);
    const [recordedVideo, setRecordedVideo] = useState(null);

    const handleRecordingStart = () => {
        setIsRecording(true);
        executeAction(onRecordingStart);
    };

    const handleRecordingStop = (videoBlob) => {
        setIsRecording(false);
        setRecordedVideo(videoBlob);
        executeAction(onRecordingComplete);
    };
    
    const handleError = (errorMessage) => {
        console.error("VideoSnap error:", errorMessage);
        executeAction(onError);
    };
    
    return (
        <div className={classNames("widget-videosnap", className)} style={style}>
            <VideoRecorder 
                onStart={handleRecordingStart}
                onStop={handleRecordingStop}
                onError={handleError}
                isRecording={isRecording}
            />
        </div>
    );
}
