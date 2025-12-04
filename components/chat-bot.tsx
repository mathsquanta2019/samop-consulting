"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { MessageCircleIcon, XIcon, SendIcon, BotIcon, UserIcon, MinimizeIcon } from "@/components/icons"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: "1",
    content:
      "Hello! Welcome to SAMOP Consulting. I'm here to help you with any questions about our educational and visa services. How can I assist you today?",
    sender: "bot",
    timestamp: new Date(),
  },
]

const botResponses: Record<string, string> = {
  admission:
    "We offer comprehensive admission consulting for Bachelor's, Master's, and PhD programs in the USA, UK, Canada, Australia, Germany, and more. Our services include application review, SOP guidance, and interview preparation. Would you like to book a consultation?",
  visa: "Our visa processing service includes document checklist preparation, application support, and interview coaching. We have a 98% success rate for student visas. Would you like to learn more about our visa services?",
  sevis:
    "We can help you with SEVIS I-901 fee payment for US-bound students. The process is quick and hassle-free. Would you like assistance with your SEVIS registration?",
  credential:
    "We assist with credential evaluation services including WES and ECE. These are required for many universities and immigration processes. Need help getting started?",
  cost: "Our consultation is free! Service fees vary based on the type of assistance you need. Book a free consultation to get a personalized quote based on your requirements.",
  appointment:
    'You can book a free consultation directly on our website. Click the "Book Consultation" button or visit the booking section. Would you like me to guide you there?',
  contact:
    "You can reach us at info@samopconsulting.com or through the contact form on our website. Our team typically responds within 24 hours.",
  success:
    "We're proud of our 100% success rate in immigration consulting! We achieve this by thoroughly assessing eligibility before taking on cases, ensuring we only proceed when success is certain.",
  default:
    "Thank you for your message. For detailed assistance, I recommend booking a free consultation with one of our expert advisors. They can provide personalized guidance for your specific situation. Is there anything specific about our services you'd like to know?",
}

function getBotResponse(userMessage: string): string {
  const message = userMessage.toLowerCase()

  if (
    message.includes("admission") ||
    message.includes("university") ||
    message.includes("study") ||
    message.includes("program") ||
    message.includes("master") ||
    message.includes("bachelor") ||
    message.includes("phd")
  ) {
    return botResponses["admission"]
  }
  if (message.includes("visa") || message.includes("immigration")) {
    return botResponses["visa"]
  }
  if (message.includes("sevis") || message.includes("i-901")) {
    return botResponses["sevis"]
  }
  if (
    message.includes("credential") ||
    message.includes("wes") ||
    message.includes("ece") ||
    message.includes("evaluation")
  ) {
    return botResponses["credential"]
  }
  if (
    message.includes("cost") ||
    message.includes("price") ||
    message.includes("fee") ||
    message.includes("how much")
  ) {
    return botResponses["cost"]
  }
  if (
    message.includes("appointment") ||
    message.includes("book") ||
    message.includes("consultation") ||
    message.includes("schedule")
  ) {
    return botResponses["appointment"]
  }
  if (
    message.includes("contact") ||
    message.includes("email") ||
    message.includes("phone") ||
    message.includes("reach")
  ) {
    return botResponses["contact"]
  }
  if (message.includes("success") || message.includes("rate") || message.includes("guarantee")) {
    return botResponses["success"]
  }

  return botResponses["default"]
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getBotResponse(inputValue),
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl z-[9999] bg-primary hover:bg-primary/90 text-primary-foreground border-4 border-background"
        size="icon"
      >
        <MessageCircleIcon className="h-6 w-6" />
        <span className="sr-only">Open chat</span>
      </Button>
    )
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[9999] shadow-2xl transition-all duration-300 rounded-xl overflow-hidden bg-card",
        isMinimized ? "w-72 h-14" : "w-[380px] h-[500px]",
      )}
    >
      <div className="flex flex-row items-center justify-between p-4 bg-primary text-primary-foreground">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border-2 border-primary-foreground/20">
            <AvatarFallback className="bg-primary-foreground text-primary">
              <BotIcon className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium">SAMOP Assistant</h3>
            {!isMinimized && <p className="text-xs text-primary-foreground/70">Online | Typically replies instantly</p>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <MinimizeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setIsOpen(false)}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 h-[360px] bg-muted/30">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex items-end gap-2", message.sender === "user" ? "flex-row-reverse" : "flex-row")}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback
                      className={cn(
                        message.sender === "user"
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-primary text-primary-foreground",
                      )}
                    >
                      {message.sender === "user" ? <UserIcon className="h-4 w-4" /> : <BotIcon className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2",
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card text-foreground rounded-bl-sm shadow-sm",
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p
                      className={cn(
                        "text-[10px] mt-1",
                        message.sender === "user" ? "text-primary-foreground/60" : "text-muted-foreground",
                      )}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-end gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <BotIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-card rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!inputValue.trim() || isTyping}
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">Powered by SAMOP Consulting</p>
          </div>
        </>
      )}
    </div>
  )
}
