/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useCallback, useRef, useState } from "react";
import "./App.scss";
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import SidePanel from "./components/side-panel/SidePanel";
import { Altair } from "./components/altair/Altair";
import ControlTray from "./components/control-tray/ControlTray";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set REACT_APP_GEMINI_API_KEY in .env");
}

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

function App() {
  const [avatarSrc, setAvatarSrc] = useState<string>("assets/idle.mp4");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const isSpeakingRef = useRef(false);
  const silentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasVideoStream, setHasVideoStream] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleGeminiSpeaking = useCallback(() => {
    if (isSpeakingRef.current) return;
    isSpeakingRef.current = true;
    const rand = Math.random() < 0.5 ? "talk-1.mp4" : "talk-2.mp4";
    setAvatarSrc(`assets/${rand}`);
    setIsSpeaking(true);
  }, []);

  const handleGeminiSilent = useCallback(() => {
    if (silentTimerRef.current) clearTimeout(silentTimerRef.current);
    silentTimerRef.current = setTimeout(() => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      setAvatarSrc("assets/idle.mp4");
    }, 1000);
  }, []);

  return (
    <div className="App">
      <LiveAPIProvider url={uri} apiKey={API_KEY}>
        <div className="streaming-console">
          <SidePanel />
          <main>
            <div className="main-app-area">
              {/*<img src="assets/logo.png" alt="Logo" className="logo" />*/}
              {/* APP goes here */}
              <Altair
                onGeminiSpeaking={handleGeminiSpeaking}
                onGeminiSilent={handleGeminiSilent}
              />
              {/* Avatar */}
              <div
                className="avatar-container"
                style={{
                  backgroundImage: 'url("/assets/nurse.png")',
                  backgroundSize: 'contain',       // ✅ เปลี่ยนเป็น contain
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden'
                }}
              >
                <video
                  key={avatarSrc}
                  className="avatar-video"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                  autoPlay
                  playsInline
                  muted
                  loop={isSpeaking || avatarSrc.includes("idle")}
                  src={avatarSrc}
                />
              </div>


              {/* Video from webcam */}
              <div className="self-video-container">
                {!hasVideoStream && (
                  <div className="self-video-placeholder">
                    Allow camera access to show realtime preview
                  </div>
                )}
                <video
                  className="stream-video"
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                />
              </div>
            </div>

            <ControlTray
              videoRef={videoRef}
              supportsVideo={true}
              onVideoStreamChange={(stream) => setHasVideoStream(Boolean(stream))}
            >
              {/* put your own buttons here */}
            </ControlTray>
          </main>
        </div>
      </LiveAPIProvider>
    </div>
  );
}

export default App;

