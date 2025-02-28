"use client";

import React, { useState } from "react";
import { AudioManager } from "./whisper/AudioManager";
import { useTranscriber } from "../hooks/useTranscriber";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Graphics } from "./Graphics";
import { SearchTitle } from "./Title";
import { AspectRatio } from "./ui/aspect-ratio";
import Image from "next/image";
import Transcript from "./whisper/Transcript";
import chalk from "chalk";
import { cn } from "@/lib/utils";
import textToSpeech from "@/elevenlabs";
import AudioPlayer from "./ConvertEleven";

type Message = {
    type: string;
    message: string;
    fromUser: boolean;
};

const wsClient = new WebSocket("ws://localhost:7000");

let idk = false;

const ChatInput = () => {
    const transcriber = useTranscriber();
    const [message, setMessage] = useState("");
    const [serverMessages, setServerMessages] = useState<Message[]>([
        {
            type: "info",
            message:
                "Hey there! I'm BotX, your personal assistant. \n Start by giving me an action.",
            fromUser: false,
        },
    ]);

    // const playAudio = (audioBuffer: ArrayBuffer) => {
    //     // Decode the ArrayBuffer into an AudioBuffer
    //     const audioContext = new (window.AudioContext || window.AudioContext)();

    //     audioContext.decodeAudioData(audioBuffer, function (decodedData) {
    //         // Create a buffer source node
    //         const source = audioContext.createBufferSource();

    //         // Set the buffer to the decoded audio data
    //         source.buffer = decodedData;

    //         // Connect the source to the audio context's destination (speakers)
    //         source.connect(audioContext.destination);

    //         // Start playing the audio
    //         source.start();
    //     });
    // };

    const handleAudio = async (message: string) => {
        var msg = new SpeechSynthesisUtterance();
        msg.text = "Hello World";
        window.speechSynthesis.speak(msg);
        // const data = await textToSpeech(message);
        // console.log(data);
        // playAudio(data);
        // console.log('bruh'+ data);
        // var blob = new Blob([data], { type: "audio/mpeg" });
        // var url = URL.createObjectURL(blob);
        // console.log('URL: ' + url);
        // var audio = new Audio(url);
        // audio.play();
    };

    if (!idk) {
        wsClient.addEventListener("open", async function open() {
            console.log("Connected to server");
        });

        wsClient.addEventListener(
            "message",
            function incoming(message: MessageEvent) {
                console.log(chalk.cyan("Server raw response:"), message.data);
                let parsed = JSON.parse(message.data);
                if (parsed.type === "msg") {
                    console.log(chalk.yellow("MESSAGE TO USER:"), parsed.msg);

                    setServerMessages((pastServerMessages) => [
                        ...pastServerMessages,
                        {
                            type: "msg",
                            message: parsed.msg,
                            fromUser: false,
                        },
                    ]);
                } else if (parsed.type === "info") {
                    console.log(chalk.blue("INFO:"), parsed.msg);
                    setServerMessages((pastServerMessages) => [
                        ...pastServerMessages,
                        {
                            type: "info",
                            message: parsed.msg,
                            fromUser: false,
                        },
                    ]);
                } else if (parsed.type === "action") {
                    console.log(chalk.gray(parsed.msg));
                    setServerMessages((pastServerMessages) => [
                        ...pastServerMessages,
                        {
                            type: "action",
                            message: parsed.msg,
                            fromUser: false,
                        },
                    ]);
                } else if (parsed.type === "complete") {
                    console.log(chalk.green(parsed.msg));
                    // setServerMessages((pastServerMessages) => [
                    //     ...pastServerMessages,
                    //     {
                    //         type: "complete",
                    //         message: parsed.msg,
                    //         fromUser: false,
                    //     },
                    // ]);
                }
                const messageContainer =
                    document.getElementById("messageContainer");
                messageContainer!.scrollTop = messageContainer!.scrollHeight;
            }
        );
        idk = true;
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key == "Enter" && !event.shiftKey) {
            console.log("Sending message:", message);
            serverMessages.push({
                type: "msg",
                message: message,
                fromUser: true,
            });
            wsClient.send(JSON.stringify({ type: "msg", msg: message }));
            event.preventDefault();
            setMessage("");
            const messageContainer =
                document.getElementById("messageContainer");
            messageContainer!.scrollTop = messageContainer!.scrollHeight;
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(event.target.value);
    };

    return (
        <>
            {false ? (
                <>
                    <SearchTitle />
                    <Graphics />
                </>
            ) : (
                <>
                    <div className="w-[600px] flex flex-col justify-between">
                        {/* <img
                            src="https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?cs=srgb&dl=pexels-chevanon-photography-1108099.jpg&fm=jpg"
                            alt="Image"
                            className="rounded-md object-cover w-[700px]"
                        /> */}

                        <div
                            id="messageContainer"
                            className="max-h-[500px] overflow-y-scroll"
                        >
                            {serverMessages &&
                                serverMessages.map((message, index) => (
                                    <div
                                        key={message.message + index}
                                        className={cn(
                                            "flex flex-row",
                                            message.fromUser
                                                ? "justify-end"
                                                : "justify-start"
                                        )}
                                    >
                                        <div
                                            className={`${
                                                message.fromUser
                                                    ? "bg-blue-200"
                                                    : "bg-gray-100"
                                            } rounded-xl p-2 m-2`}
                                            style={{
                                                maxWidth: "80%",
                                                color:
                                                    message.type === "action"
                                                        ? "gray"
                                                        : message.type ===
                                                            "info"
                                                          ? "#8091ba"
                                                          : "black",
                                            }}
                                        >
                                            {message.message}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </>
            )}

            <div className="w-full mt-auto flex-center mx-36 gap-2 flex flex-col">
                <div className="flex justify-center flex-col items-center">
                    <div className="container flex flex-col text-base justify-center items-center">
                        <Transcript transcribedData={transcriber.output} />
                    </div>
                </div>

                <Tabs
                    defaultValue="speech"
                    className="w-[300px] xs:w-[350px] sm:w-[600px] lg:w-[900px] mb-20"
                >
                    <TabsContent value="text">
                        <Textarea
                            value={message}
                            className="border-2 min-h-0 h-[52px] rounded-xl text-lg text-wrap resize-none"
                            placeholder="Ask BotX to do anything..."
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            disabled={
                                (serverMessages[serverMessages.length - 1]
                                    .type !== "msg" ||
                                    serverMessages[serverMessages.length - 1]
                                        .fromUser) &&
                                serverMessages.length != 1
                            }
                        />
                    </TabsContent>

                    <TabsContent value="speech">
                        <AudioManager
                            transcriber={transcriber}
                            wsClient={wsClient}
                            setServerMessages={setServerMessages}
                        />
                    </TabsContent>

                    <TabsList className="mt-2">
                        <TabsTrigger value="speech">Speech</TabsTrigger>
                        <TabsTrigger value="text">Text</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {serverMessages[serverMessages.length - 1].type == "msg" && (
                <AudioPlayer
                    message={serverMessages[serverMessages.length - 1].message}
                    key={serverMessages.length}
                />
            )}
        </>
    );
};

export default ChatInput;
