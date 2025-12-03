"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Clock, Reply, Trash2 } from "lucide-react"
import type { ContactMessage } from "@/lib/types"
import { markMessageAsRead } from "@/lib/api"

interface MessagesManagerProps {
  messages: ContactMessage[]
}

export function MessagesManager({ messages }: MessagesManagerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  const filteredMessages = messages.filter(
    (msg) =>
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleMarkAsRead = async (id: string) => {
    await markMessageAsRead(id)
  }

  const unreadCount = messages.filter((m) => !m.isRead).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground">Contact form submissions and inquiries.</p>
        </div>
        {unreadCount > 0 && <Badge variant="destructive">{unreadCount} Unread</Badge>}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Messages List */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Inbox</CardTitle>
            <CardDescription>
              {filteredMessages.length} message{filteredMessages.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No messages found.</div>
            ) : (
              <div className="divide-y divide-border">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedMessage?.id === msg.id ? "bg-muted/50" : ""
                    } ${!msg.isRead ? "border-l-4 border-l-primary" : ""}`}
                    onClick={() => {
                      setSelectedMessage(msg)
                      if (!msg.isRead) handleMarkAsRead(msg.id)
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`font-medium truncate ${!msg.isRead ? "text-card-foreground" : "text-muted-foreground"}`}
                          >
                            {msg.name}
                          </p>
                          {!msg.isRead && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                        </div>
                        <p className="text-sm font-medium text-card-foreground truncate mt-1">{msg.subject}</p>
                        <p className="text-sm text-muted-foreground truncate">{msg.message.substring(0, 60)}...</p>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-4">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Detail */}
        <Card className="bg-card">
          <CardContent className="pt-6">
            {selectedMessage ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">{selectedMessage.subject}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {selectedMessage.email}
                    </span>
                    {selectedMessage.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {selectedMessage.phone}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-card-foreground whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                <div className="flex gap-2">
                  <Button className="bg-primary text-primary-foreground">
                    <Reply className="mr-2 h-4 w-4" />
                    Reply via Email
                  </Button>
                  <Button variant="ghost" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a message to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
