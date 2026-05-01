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
import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { memo, useEffect, useRef, useState } from "react";
import vegaEmbed from "vega-embed";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { ToolCall } from "../../multimodal-live-types";

interface AltairProps {
  onGeminiSpeaking?: () => void;
  onGeminiSilent?: () => void;
}

const declaration: FunctionDeclaration = {
  name: "render_altair",
  description: "Displays an altair graph in json format.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      json_graph: {
        type: SchemaType.STRING,
        description:
          "JSON STRING representation of the graph to render. Must be a string, not a json object",
      },
    },
    required: ["json_graph"],
  },
};

function AltairComponent({ onGeminiSpeaking, onGeminiSilent }: AltairProps) {
  const speakingTimeout = useRef<NodeJS.Timeout | null>(null);
  const embedRef = useRef<HTMLDivElement>(null);
  const [jsonString, setJSONString] = useState<string>("");
  const { client, setConfig } = useLiveAPIContext();

  useEffect(() => {
    setConfig({
      model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
      generationConfig: {
        responseModalities: "audio",
        candidateCount: 1,
        maxOutputTokens: 192,
        thinkingConfig: {
          thinkingBudget: 0,
        },
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Leda" } },
        },
      },
      systemInstruction: {
        parts: [
          {
            text:
              'ตอบเป็นภาษาไทยสุภาพแบบผู้หญิงไทย ลงท้ายด้วย "ค่ะ" หรือ "คะ" ให้เหมาะสม ตอบสั้น กระชับ และเริ่มตอบทันทีโดยไม่เกริ่นยาว',
          },
        ],
      },
      tools: [{ functionDeclarations: [declaration] }],
    });
  }, [setConfig]);

  useEffect(() => {
    const onToolCall = (toolCall: ToolCall) => {
      const fc = toolCall.functionCalls.find(
        (functionCall) => functionCall.name === declaration.name,
      );

      if (fc) {
        const str = (fc.args as { json_graph?: string }).json_graph;
        if (str) {
          setJSONString(str);
        }
      }

      if (toolCall.functionCalls.length) {
        client.sendToolResponse({
          functionResponses: toolCall.functionCalls.map((functionCall) => ({
            response: { output: { success: true } },
            id: functionCall.id,
          })),
        });
      }
    };

    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]);

  useEffect(() => {
    if (embedRef.current && jsonString) {
      vegaEmbed(embedRef.current, JSON.parse(jsonString));
    }
  }, [jsonString]);

  useEffect(() => {
    const onAudio = () => {
      onGeminiSpeaking?.();
      if (speakingTimeout.current) clearTimeout(speakingTimeout.current);
      speakingTimeout.current = setTimeout(() => {
        onGeminiSilent?.();
      }, 2000);
    };

    client.on("audio", onAudio);
    return () => {
      client.off("audio", onAudio);
      if (speakingTimeout.current) clearTimeout(speakingTimeout.current);
    };
  }, [client, onGeminiSpeaking, onGeminiSilent]);

  return <div className="vega-embed" ref={embedRef} />;
}

export const Altair = memo(AltairComponent);
