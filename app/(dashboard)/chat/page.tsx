"use client";
import Chat from "@/components/chat/chat";
import { Suspense } from "react";

function ChatPageContent() {
    return <Chat />;
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <ChatPageContent />
        </Suspense>
    );
}
