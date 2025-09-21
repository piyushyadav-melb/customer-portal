import React, { useState, useEffect } from "react";
import { getChatRooms, getChatHistory, getChattedExperts, createOrGetChatRoom } from "@/service/chat.service";
import ChatSidebar from "./chat-sidebar";
import ChatBox from "./chat-box";
import ExpertProfile from "./expert-profile";
import { useSocket } from "@/hooks/use-socket";
import { useSearchParams } from "next/navigation";
import { fetchProfile } from "@/service/profile.service";

const Chat: React.FC = () => {
    const [experts, setExperts] = useState([]);
    const [chatRooms, setChatRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [expert, setExpert] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [customerId, setCustomerId] = useState(null);
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
        const loadProfile = async () => {
            const response: any = await fetchProfile();
            setCustomerId(response.data.id);
        };
        loadProfile();
    }, []);

    useEffect(() => {
        // Fetch experts and chat rooms on mount
        const fetchData = async () => {
            try {
                setIsLoading(true);
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
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
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

    const handleChatDeleted = (deletedExpertId: string) => {
        // Remove the customer from the customers list
        setExperts(prevCustomers =>
            prevCustomers.filter(expert => expert.id !== deletedExpertId)
        );

        // Remove the chat room from the chat rooms list
        setChatRooms(prevRooms =>
            prevRooms.filter(room => room.expertId !== deletedExpertId)
        );

        // If the deleted customer was selected, clear the selection
        if (expert?.id === deletedExpertId) {
            setSelectedRoom(null);
            setExpert(null);
            setMessages([]);
        }
    };

    return (
        isLoading ? (
            <div className="flex justify-center items-center min-h-[calc(90vh-100px)]">
                <div className="flex items-center space-x-2 bg-white rounded-full px-6 py-3 shadow-lg">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></div>
                </div>
            </div>
        ) : (
            <div className="mx-auto sm:px-5 sm:mt-8  px-4 pb-5 bg-gray-100 min-h-[calc(90vh-100px)]">
                <div className="lg:flex gap-4 lg:gap-0">
                    {/* Chat Sidebar */}
                    <div className="w-full md:flex-1 order-2 md:order-1">
                        <ChatSidebar
                            experts={experts}
                            selectedRoom={selectedRoom}
                            onSelectExpert={handleSelectExpert}
                            onChatDeleted={handleChatDeleted}
                            customerId={customerId}
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
        )
    );
};

export default Chat;