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

import { FormEvent, useRef, useState } from "react";
import "./App.scss";
import {
  LiveAPIProvider,
  useLiveAPIContext,
} from "./contexts/LiveAPIContext";
import SidePanel from "./components/side-panel/SidePanel";
import { Altair } from "./components/altair/Altair";
import ControlTray from "./components/control-tray/ControlTray";
import cn from "classnames";
import { LiveClientOptions } from "./types";

const API_KEY_STORAGE_KEY = "aideeptalk.googleAiStudioApiKey";

function TalkingAvatar() {
  const { speaking } = useLiveAPIContext();

  return (
    <div
      className="avatar-stage"
      style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/assets/bot.png)` }}
      aria-label="assistant avatar"
    >
      <video
        key={speaking ? "talk" : "idle"}
        className="avatar-video"
        src={speaking ? "/assets/talk.mp4" : "/assets/idle.mp4"}
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  );
}

function WelcomeScreen({ onSubmit }: { onSubmit: (apiKey: string) => void }) {
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedKey = apiKey.trim();

    if (trimmedKey) {
      localStorage.setItem(API_KEY_STORAGE_KEY, trimmedKey);
      onSubmit(trimmedKey);
    }
  };

  return (
    <main
      className="welcome-screen"
      style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/assets/bot.png)` }}
    >
      <section className="welcome-panel">
        <div className="welcome-copy">
          <p className="welcome-kicker">AI Deeptalk Technology</p>
          <h1>Welcome</h1>
          <p>
            Enter your own Google AI Studio API key to start talking with the
            assistant. The app will remember this key on this device until you
            remove it from Settings.
          </p>
        </div>

        <form className="api-key-form" onSubmit={handleSubmit}>
          <label htmlFor="api-key">Google AI Studio API Key</label>
          <input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="Paste your API key"
            autoComplete="off"
            autoFocus
          />
          <button type="submit" disabled={!apiKey.trim()}>
            Start Program
          </button>
        </form>

        <div className="api-key-help">
          <h2>How to get your key</h2>
          <ol>
            <li>
              Go to{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
              >
                Google AI Studio API keys
              </a>
              .
            </li>
            <li>Sign in with your Google account and accept the terms.</li>
            <li>Create or copy an API key, then paste it here.</li>
          </ol>
          <p>
            Keep your key private. If it has been exposed, create a new one and
            revoke the old key.
          </p>
        </div>
      </section>
    </main>
  );
}

function Workspace({
  apiKey,
  onRemoveApiKey,
}: {
  apiKey: string;
  onRemoveApiKey: () => void;
}) {
  // this video reference is used for displaying the active stream, whether that is the webcam or screen capture
  // feel free to style as you see fit
  const videoRef = useRef<HTMLVideoElement>(null);
  // either the screen capture, the video or null, if null we hide it
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const apiOptions: LiveClientOptions = {
    apiKey,
  };

  return (
    <LiveAPIProvider options={apiOptions}>
      <div className="streaming-console">
        <SidePanel />
        <main>
          <div className="main-app-area">
            {/* APP goes here */}
            <TalkingAvatar />
            <Altair />
            <video
              className={cn("stream", {
                hidden: !videoRef.current || !videoStream,
              })}
              ref={videoRef}
              autoPlay
              playsInline
            />
          </div>

          <ControlTray
            videoRef={videoRef}
            supportsVideo={true}
            onVideoStreamChange={setVideoStream}
            enableEditingSettings={true}
            onRemoveApiKey={onRemoveApiKey}
          >
            {/* put your own buttons here */}
          </ControlTray>
        </main>
      </div>
    </LiveAPIProvider>
  );
}

function App() {
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem(API_KEY_STORAGE_KEY) || ""
  );

  const removeApiKey = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setApiKey("");
  };

  return (
    <div className="App">
      {apiKey ? (
        <Workspace apiKey={apiKey} onRemoveApiKey={removeApiKey} />
      ) : (
        <WelcomeScreen onSubmit={setApiKey} />
      )}
    </div>
  );
}

export default App;
