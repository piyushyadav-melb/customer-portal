import { handleGeneralNotification } from "@/redux/slice/notification.slice";
import { getCookie } from "@/utils/cookie";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

let globalSocket: Socket | null = null;


export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    if (!socketRef.current) {
      const token = getCookie("token"); // Get your JWT token

      globalSocket = io(
        "https://expert-customer-backend.onrender.com",
        {
          withCredentials: true,
          autoConnect: true,
          transports: ["websocket", "polling"],
          auth: {
            token, // Pass the token in auth
          },
          extraHeaders: {
            Authorization: `Bearer ${token}`, // Also include in headers
          },
        }
      );

      // Handle connection events
      globalSocket.on("connect", () => {
        console.log("Socket connected");
      });

      globalSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      globalSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });

      globalSocket.on("error", (error) => {
        console.error("Socket error:", error);
      });

      globalSocket.on("notification", (data) => {
        console.log("General notification received:", data);
      });

      globalSocket.on("bookingNotification", (data) => {
        console.log("Booking notification received:", data);
      });

      globalSocket.on("meetingNotification", (data) => {
        console.log("Meeting notification received:", data);
      });

      // Handle general notifications
      globalSocket.on('notification', (data: any) => {
        handleGeneralNotification(data);
      });

    }

    socketRef.current = globalSocket;


    // Cleanup on unmount
    // return () => {
    //   if (socketRef.current) {
    //     socketRef.current.disconnect();
    //     socketRef.current = null;
    //   }
    // };
  }, []);

  return socketRef.current;
};

export const disconnectSocket = () => {
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
  }
};
