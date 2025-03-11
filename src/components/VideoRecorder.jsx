import { createElement, useRef, useState, useEffect } from "react";
import classNames from "classnames";
import "../ui/VideoRecorder.css";

export function VideoRecorder({ onStart, onStop, onError, isRecording: externalIsRecording }) {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [recording, setRecording] = useState(externalIsRecording || false);
    const [videoURL, setVideoURL] = useState("");
    const [recordingType, setRecordingType] = useState("camera"); // "camera" or "screen"
    const [error, setError] = useState("");
    const chunksRef = useRef([]);

    useEffect(() => {
        // 清理函数
        return () => {
            if (videoURL) {
                URL.revokeObjectURL(videoURL);
            }
        };
    }, [videoURL]);

    const startMediaStream = async () => {
        try {
            if (mediaRecorderRef.current) {
                stopMediaStream();
            }

            let stream;
            if (recordingType === "camera") {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
            } else {
                stream = await navigator.mediaDevices.getDisplayMedia({
                    video: {
                        cursor: "always"
                    },
                    audio: true
                });
            }

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "video/webm" });
                const url = URL.createObjectURL(blob);
                setVideoURL(url);

                // 停止所有轨道
                if (videoRef.current && videoRef.current.srcObject) {
                    const tracks = videoRef.current.srcObject.getTracks();
                    tracks.forEach(track => track.stop());
                    videoRef.current.srcObject = null;
                }

                // 调用外部的 onStop 回调，传递 blob
                if (onStop) onStop(blob);
            };

            setError("");
            return mediaRecorder;
        } catch (err) {
            console.error("Error accessing media device:", err);
            setError(`Unable to access ${recordingType === "camera" ? "camera" : "screen"}: ${err.message}`);
            return null;
        }
    };

    const stopMediaStream = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }

        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    // 在 useEffect 中监听外部 isRecording 变化
    useEffect(() => {
        if (externalIsRecording !== undefined && externalIsRecording !== recording) {
            if (externalIsRecording) {
                handleStartRecording();
            } else {
                handleStopRecording();
            }
        }
    }, [externalIsRecording]);

    // 修改错误处理
    useEffect(() => {
        if (error && onError) {
            onError(error);
        }
    }, [error, onError]);

    // 修改 handleStartRecording
    const handleStartRecording = async () => {
        const mediaRecorder = await startMediaStream();
        if (mediaRecorder) {
            mediaRecorder.start();
            setRecording(true);
            if (onStart) onStart();
        }
    };

    // 修改 handleStopRecording
    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setRecording(false);

            // 在 onstop 事件中已经创建了 blob，需要在那里调用 onStop
            // 这里不直接调用 onStop，因为需要等待 blob 创建完成
        }
    };

    const handleSwitchRecordingType = () => {
        if (recording) {
            handleStopRecording();
        }
        setRecordingType(prevType => prevType === "camera" ? "screen" : "camera");
        setVideoURL("");
    };

    const handleDownload = () => {
        if (videoURL) {
            const a = document.createElement("a");
            a.href = videoURL;
            a.download = `recording-${new Date().toISOString()}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    return (
        <div className="video-recorder">
            <div className="video-container">
                {videoURL ? (
                    <video
                        ref={videoRef}
                        src={videoURL}
                        controls
                        className="recorded-video"
                    />
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="preview-video"
                    />
                )}
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="controls">
                <button
                    onClick={handleSwitchRecordingType}
                    disabled={recording}
                    className="control-button type-button"
                >
                    {recordingType === "camera" ? "Switch to Screen Recording" : "Switch to Camera Recording"}
                </button>

                {!recording ? (
                    <button
                        onClick={handleStartRecording}
                        className="control-button start-button"
                    >
                        Start Recording
                    </button>
                ) : (
                    <button
                        onClick={handleStopRecording}
                        className="control-button stop-button"
                    >
                        Stop Recording
                    </button>
                )}

                {videoURL && (
                    <button
                        onClick={handleDownload}
                        className="control-button download-button"
                    >
                        Download Video
                    </button>
                )}
            </div>
        </div>
    );
}