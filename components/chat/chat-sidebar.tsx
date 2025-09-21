import React, { useState, useEffect, useCallback } from "react";
import { Search, MoreVertical, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { deleteChat } from "@/service/chat.service";
import { getExperts } from "@/service/expert.service";
import { Expert } from "@/types/expert.types";
import { useAppDispatch } from "@/hooks";
import { useSocket } from "@/hooks/use-socket";
import { getChatRoomById } from "@/service/chat.service";

const ChatSidebar = ({ experts, selectedRoom, onSelectExpert, onChatDeleted, customerId }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [currentDropdownExpert, setCurrentDropdownExpert] = useState(null);
    const [filteredExperts, setFilteredExperts] = useState([]);
    const [deletingExpertId, setDeletingExpertId] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    const [customerUnreadCounts, setCustomerUnreadCounts] = useState<any>({});
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);

    const dispatch = useAppDispatch();
    const socket = useSocket();

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const hasValidProfilePicture = (url) => {
        return url && url !== '' && url !== 'null' && url !== 'undefined';
    };

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce(async (query: string) => {
            if (query.trim().length < 2) {
                setSearchResults([]);
                return;
            }

            try {
                setIsSearching(true);
                const response = await getExperts({
                    searchText: query.trim(),
                    perPage: 10 // Limit results for better UX
                });

                if (response.status && response.data?.result) {
                    setSearchResults(response.data.result);
                } else {
                    setSearchResults([]);
                }
            } catch (error) {
                console.error("Error searching experts:", error);
                toast.error("Failed to search experts");
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300),
        []
    );

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        debouncedSearch(value);
    };

    // Legacy local search for existing experts (fallback)
    const onSearch = () => {
        if (searchQuery.trim()) {
            const filtered = experts.filter(expert =>
                expert.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredExperts(filtered);
        } else {
            setFilteredExperts([]);
        }
    };

    const clearSearch = () => {
        setSearchQuery("");
        setFilteredExperts([]);
        setSearchResults([]);
    };

    const selectExpert = (expert: Expert) => {
        onSelectExpert(expert);
        clearSearch();
    };

    const handleExpertSelect = (expert) => {
        // Only handle selection, no deletion logic here
        onSelectExpert(expert);
    };

    const toggleDropdown = (event, expert) => {
        event.stopPropagation();
        if (currentDropdownExpert === expert && isDropdownOpen) {
            setIsDropdownOpen(false);
            setCurrentDropdownExpert(null);
        } else {
            setCurrentDropdownExpert(expert);
            setIsDropdownOpen(true);
        }
    };

    const closeCurrentExpertDropdown = () => {
        setIsDropdownOpen(false);
        setCurrentDropdownExpert(null);
    };

    const handleDeleteChat = async (expertId, event) => {
        // Stop event propagation to prevent expert selection
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (!customerId) {
            toast.error("Customer ID is required to delete chat");
            return;
        }

        // Show confirmation first
        const confirmed = window.confirm("Are you sure you want to delete this chat? This action cannot be undone.");
        if (!confirmed) {
            closeCurrentExpertDropdown();
            return;
        }

        try {
            // Set deleting state to prevent interactions
            setDeletingExpertId(expertId);
            closeCurrentExpertDropdown();

            // Clear chat selection IMMEDIATELY to prevent race conditions
            if (onChatDeleted) {
                onChatDeleted(expertId);
            }

            // Make the API call
            await deleteChat(expertId, customerId);

            toast.success("Chat deleted successfully");

        } catch (error) {
            console.error("Failed to delete chat:", error);
            toast.error("Failed to delete chat. Please try again.");
        } finally {
            // Always reset the deleting state
            setDeletingExpertId(null);
        }
    };

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.search-container')) {
                setSearchResults([]);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!socket) return;

        // Listen for total unread count updates
        const handleUnreadCountUpdate = (data: { userId: string; userType: string; unreadCount: number }) => {
            setTotalUnreadCount(data.unreadCount);
        };

        // Listen for total unread count response
        const handleUnreadCountResponse = (data: { unreadCount: number; userId: string; userType: string }) => {
            setTotalUnreadCount(data.unreadCount);
        };

        // Listen for specific chat unread count updates
        const handleChatUnreadCountUpdate = async (data: { chatRoomId: string; userId: string; userType: string; unreadCount: number }) => {

            try {
                // Get chat room details to extract customer ID
                const roomData = await getChatRoomById(data.chatRoomId);

                if (roomData && roomData.expert) {
                    const expertId = roomData.expert.id;

                    setCustomerUnreadCounts(prev => ({
                        ...prev,
                        [expertId]: data.unreadCount,
                        userType: data.userType
                    }));
                }
            } catch (error) {
                console.error("Error fetching chat room data:", error);
                // Fallback to old method if API call fails
                const expert = experts.find(c => c.id === data.chatRoomId);
                if (expert) {
                    setCustomerUnreadCounts(prev => ({
                        ...prev,
                        [expert.id]: data.unreadCount,
                        userType: data.userType
                    }));
                }
            }
        };

        // Listen for all chat unread counts response
        const handleAllChatUnreadCountsResponse = (data: { userId: string; userType: string; chatUnreadCounts: Array<{ chatRoomId: string; unreadCount: number; otherUser: any }> }) => {

            // Update customer unread counts using otherUser data directly
            const newCounts: any = {};
            data.chatUnreadCounts.forEach(chat => {
                // Use otherUser.id as the customer ID directly
                if (chat.otherUser && chat.otherUser.id) {
                    newCounts[chat.otherUser.id] = chat.unreadCount;
                    newCounts["userType"] = data.userType

                }
            });
            setCustomerUnreadCounts(newCounts);
        };

        // Listen for messages read events
        const handleMessagesRead = (data: { chatRoomId: string; readBy: string }) => {

            // Find the customer ID for this chat room
            const expert = experts.find(c => c.id === data.chatRoomId);
            if (expert) {
                setCustomerUnreadCounts(prev => ({
                    ...prev,
                    [expert.id]: 0
                }));
            }
        };

        // Listen for new messages
        const handleNewMessage = (message: any) => {

            // Find the customer ID for this chat room
            const expert = experts.find(c => c.id === message.chatRoomId);
            if (expert) {
                setCustomerUnreadCounts(prev => ({
                    ...prev,
                    [expert.id]: (prev[expert.id] || 0) + 1
                }));
            }
        };

        // Listen for unread count errors
        const handleUnreadCountError = (error: { error: string }) => {
            console.error('Unread count error:', error);
        };

        // Set up event listeners
        socket.on('unreadCountUpdated', handleUnreadCountUpdate);
        socket.on('unreadCountResponse', handleUnreadCountResponse);
        socket.on('chatUnreadCountUpdated', handleChatUnreadCountUpdate);
        socket.on('allChatUnreadCountsResponse', handleAllChatUnreadCountsResponse);
        socket.on('messagesRead', handleMessagesRead);
        socket.on('newMessage', handleNewMessage);
        socket.on('unreadCountError', handleUnreadCountError);

        // Request initial unread counts
        socket.emit('getUnreadCount');
        socket.emit('getAllChatUnreadCounts');

        // Cleanup
        return () => {
            socket.off('unreadCountUpdated', handleUnreadCountUpdate);
            socket.off('unreadCountResponse', handleUnreadCountResponse);
            socket.off('chatUnreadCountUpdated', handleChatUnreadCountUpdate);
            socket.off('allChatUnreadCountsResponse', handleAllChatUnreadCountsResponse);
            socket.off('messagesRead', handleMessagesRead);
            socket.off('newMessage', handleNewMessage);
            socket.off('unreadCountError', handleUnreadCountError);
        };
    }, [socket, experts]);

    return (
        <div className="w-full bg-white border border-gray-200 p-4 lg:mt-6 rounded-xl overflow-y-auto h-[calc(90vh-100px)]">
            <div className="block items-center justify-between mb-4">
                <div className="flex justify-between">
                    <h5 className="font-semibold mb-5 text-lg">Chats</h5>
                </div>

                {/* Search Bar */}
                <div className="relative w-full search-container">
                    <div className="inline-flex w-full relative items-center bg-gray-50 rounded-full overflow-hidden mb-2">
                        <button className="absolute left-3 text-gray-400">
                            {isSearching ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Search className="w-5 h-5" />
                            )}
                        </button>
                        <div className="overflow-hidden w-full">
                            <input
                                type="text"
                                placeholder="Search experts..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="py-3 px-12 bg-gray-50 w-full placeholder:text-gray-600 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Search Results Dropdown */}
                    {searchQuery && (searchResults.length > 0 || isSearching) && (
                        <ul className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {isSearching ? (
                                <li className="flex items-center justify-center p-4">
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    <span className="text-gray-500">Searching experts...</span>
                                </li>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((expert) => (
                                    <li
                                        key={expert.id}
                                        className="border-b last:border-b-0 flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => selectExpert(expert)}
                                    >
                                        <div className="relative mr-3 flex-shrink-0">
                                            <div className="relative w-8 h-8">
                                                {hasValidProfilePicture(expert.profile_picture_url) ? (
                                                    <img
                                                        src={expert.profile_picture_url}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                        alt="Expert"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                                                        {getInitials(expert.name)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium text-gray-900 block truncate pb-1">{expert.name}</span>
                                            {expert.email && (
                                                <span className="text-xs text-gray-500 block truncate pb-1">{expert.email}</span>
                                            )}
                                            {expert.job_title && (
                                                <span className="text-xs text-blue-600 block truncate">{expert.job_title}</span>
                                            )}
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="flex items-center justify-center p-4 text-gray-500">
                                    No experts found
                                </li>
                            )}
                        </ul>
                    )}
                </div>
            </div>

            {/* Expert List */}
            <div className="overflow-y-auto flex-1">
                {experts.map((expert) => (
                    <div key={expert.id} className="relative group">
                        {/* Main Expert Row - Only handles selection */}
                        <div
                            className={`flex items-center p-3 rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${selectedRoom?.expertId === expert.id ? "bg-gray-100" : ""
                                } ${deletingExpertId === expert.id ? 'opacity-50 pointer-events-none' : ''
                                }`}
                            onClick={() => handleExpertSelect(expert)}
                        >
                            <div className="flex items-center flex-1 min-w-0">
                                <div className="relative mr-3 flex-shrink-0">
                                    <div className="relative w-10 h-10">
                                        {hasValidProfilePicture(expert.profile_picture_url) ? (
                                            <img
                                                src={expert.profile_picture_url}
                                                className="w-10 h-10 rounded-full object-cover"
                                                alt="Expert"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                                                {getInitials(expert.name)}
                                            </div>
                                        )}
                                    </div>
                                    {/* Online indicator */}
                                    {expert.is_online && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h6 className="text-sm font-semibold text-gray-900 truncate">{expert.name}</h6>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Unread Count */}
                                {customerUnreadCounts[expert.id] > 0 && customerUnreadCounts.userType === 'CUSTOMER' && (
                                    <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs text-center font-medium leading-5">
                                        {customerUnreadCounts[expert.id]}
                                    </span>
                                )}

                                {/* Time */}
                                <span className="text-xs text-gray-400 text-nowrap">
                                    {/* {expert.lastMessageTime || "10:56 AM"} */}
                                </span>
                            </div>
                        </div>

                        {/* Delete Button - Separate from selection area */}
                        <div className="absolute top-2 right-2 z-10">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleDropdown(e, expert);
                                }}
                                disabled={deletingExpertId === expert.id}
                                className={`flex items-center justify-center rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-center w-6 h-6 text-sm text-gray-500 hover:text-gray-700 focus:outline-none shadow-sm opacity-0 group-hover:opacity-100 transition-opacity ${deletingExpertId === expert.id ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown */}
                            {isDropdownOpen && currentDropdownExpert === expert && (
                                <div className="origin-top-right absolute right-0 mt-1 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                                    <div className="py-1">
                                        <button
                                            onClick={(e) => handleDeleteChat(expert.id, e)}
                                            disabled={deletingExpertId === expert.id}
                                            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {deletingExpertId === expert.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export default ChatSidebar;