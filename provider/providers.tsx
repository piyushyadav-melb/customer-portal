"use client";
import { Inter } from "next/font/google";
import { useThemeStore } from "@/store";
import { ThemeProvider } from "next-themes";
import { cn } from "@/lib/utils";
import { Toaster as ReactToaster } from "@/components/ui/toaster";
import { Toaster } from "react-hot-toast";
import { SonnToaster } from "@/components/ui/sonner";
import { usePathname } from "next/navigation";
import React, { createContext, useContext, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { getCookie } from "@/utils/cookie";
import { useSocket } from "@/hooks/use-socket";

const inter = Inter({ subsets: ["latin"] });
const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  const socket = useSocket();
  console.log("HELLO");
  console.log("socket", socket);
  console.log("socketRef.current", socketRef.current);


  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);

const Providers = ({ children }: { children: React.ReactNode }) => {
  const { theme, radius } = useThemeStore();
  const location = usePathname();

  if (location === "/") {
    return (
      <body className={cn("dash-tail-app ", inter.className)}>
        <ThemeProvider
          attribute="class"
          enableSystem={false}
          defaultTheme="light"
        >
          <div className={cn("h-full  ")}>
            {children}
            <ReactToaster />
          </div>
          <Toaster />
          <SonnToaster />
        </ThemeProvider>
      </body>
    );
  }
  return (
    <body
      className={cn("dash-tail-app ", inter.className, "theme-" + theme)}
      style={
        {
          "--radius": `${radius}rem`,
        } as React.CSSProperties
      }
    >
      <ThemeProvider
        attribute="class"
        enableSystem={false}
        defaultTheme="light"
      >
        <div className={cn("h-full  ")}>
          {children}
          <ReactToaster />
        </div>
        <Toaster />
        <SonnToaster />
      </ThemeProvider>
    </body>
  );
};

export default Providers;
