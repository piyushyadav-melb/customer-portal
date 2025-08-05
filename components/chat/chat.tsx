import React, { useState, useEffect } from "react";
import { getChatRooms, getChatHistory, getChattedExperts, createOrGetChatRoom } from "@/service/chat.service";
import ChatSidebar from "./chat-sidebar";
import ChatBox from "./chat-box";
import ExpertProfile from "./expert-profile";
import { useSocket } from "@/hooks/use-socket";
import { useSearchParams } from "next/navigation";

const Chat: React.FC = () => {
    const [experts, setExperts] = useState([]);
    const [chatRooms, setChatRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [expert, setExpert] = useState(null);
    const socket = useSocket();
    const searchParams = useSearchParams();

    const handleSelectExpert = async (expert) => {
        // Find or create chat room for this expert
        let room = chatRooms.find(r => r.expertId === expert.id);
        if (!room) {
            room = await createOrGetChatRoom(expert.id);
            setChatRooms(prev => [...prev, room]);
        }
        setSelectedRoom(room);
        setExpert(expert);
        getChatHistory(room.id).then(setMessages);
    };

    useEffect(() => {
        // Fetch experts and chat rooms on mount
        const fetchData = async () => {
            try {
                const expertsData = await getChattedExperts();
                setExperts(expertsData);

                // Check if there's an expertId in URL params
                const expertId = searchParams.get('expertId');
                if (expertId) {
                    // Find expert in the fetched data
                    const targetExpert = expertsData.find(exp => exp.id === expertId);
                    if (targetExpert) {
                        // Automatically select this expert
                        await handleSelectExpert(targetExpert);
                    } else {
                        // If expert not found in chatted experts, fetch expert data and create chat room
                        try {
                            const room = await createOrGetChatRoom(expertId);
                            setChatRooms(prev => [...prev, room]);
                            setSelectedRoom(room);
                            if (room.expert) {
                                setExpert(room.expert);
                                const history = await getChatHistory(room.id);
                                setMessages(history);
                            }
                        } catch (error) {
                            console.error('Error creating chat room for expert:', expertId, error);
                            // Could add user notification here if needed
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching experts:', error);
            }
        };

        fetchData();
        // getChatRooms().then(setChatRooms);
    }, [searchParams]);

    // Listen for global user status changes
    useEffect(() => {
        if (!socket) return;

        const handleUserStatusChanged = (data: { userId: string; isOnline: boolean }) => {
            console.log("Global user status changed:", data);

            // Update the customers array with the new status
            setExperts(prevExperts =>
                prevExperts.map(expert =>
                    expert.id === data.userId
                        ? {
                            ...expert,
                            is_online: data.isOnline,
                            last_seen: data.isOnline ? expert.last_seen : new Date().toISOString()
                        }
                        : expert
                )
            );

            // Also update the selected customer if it matches
            if (expert?.id === data.userId) {
                setExpert(prev => prev ? {
                    ...prev,
                    is_online: data.isOnline,
                    last_seen: data.isOnline ? prev.last_seen : new Date().toISOString()
                } : prev);
            }
        };

        socket.on("userStatusChanged", handleUserStatusChanged);

        return () => {
            socket.off("userStatusChanged");
        };
    }, [socket, expert?.id]);

    return (
        <div className="mx-auto sm:px-5 sm:mt-8  px-4 pb-5 bg-gray-100 min-h-[calc(90vh-100px)]">
            <div className="lg:flex gap-4 lg:gap-0">
                {/* Chat Sidebar */}
                <div className="w-full md:flex-1 order-2 md:order-1">
                    <ChatSidebar
                        experts={experts}
                        selectedRoom={selectedRoom}
                        onSelectExpert={handleSelectExpert}
                    />
                </div>

                {/* Chat Box */}
                <div className="w-full md:w-96 lg:w-[500px] xl:w-[600px] flex-shrink-0 order-1 md:order-2 min-h-0">
                    <ChatBox
                        roomId={selectedRoom?.id}
                        expert={expert}
                    />
                </div>

                {/* Customer Profile */}
                <div className="w-full md:flex-1 lg:block order-3">
                    <ExpertProfile expert={expert} chatRoomId={selectedRoom?.id} />
                </div>
            </div>
        </div>

    );
};

export default Chat;