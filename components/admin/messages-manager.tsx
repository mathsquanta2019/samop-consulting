"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MailIcon, PhoneIcon, ClockIcon, SendIcon, TrashIcon, CheckCircleIcon } from "@/components/icons"
import type { ContactMessage } from "@/lib/types"
import { markMessageAsRead, replyToMessage, deleteMessage } from "@/lib/api"

interface MessagesManagerProps {
  messages: ContactMessage[]
  onRefresh?: () => void
}

export function MessagesManager({ messages, onRefresh }: MessagesManagerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false)
  const [replySubject, setReplySubject] = useState("")
  const [replyBody, setReplyBody] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replySuccess, setReplySuccess] = useState(false)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)

  const filteredMessages = messages.filter(
    (msg) =>
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleMarkAsRead = async (id: string) => {
    await markMessageAsRead(id)
  }

  const handleOpenReply = () => {
    if (!selectedMessage) return
    setReplySubject(`Re: ${selectedMessage.subject}`)
    setReplyBody("")
    setIsReplyDialogOpen(true)
  }

  const handleSendReply = async () => {
    if (!selectedMessage || !replySubject || !replyBody) return
    setIsSubmitting(true)

    const result = await replyToMessage({
      messageId: selectedMessage.id,
      toEmail: selectedMessage.email,
      subject: replySubject,
      body: replyBody,
    })

    if (result.success) {
      setReplySuccess(true)
      setTimeout(() => {
        setIsReplyDialogOpen(false)
        setReplySubject("")
        setReplyBody("")
        setReplySuccess(false)
      }, 2000)
    }
    setIsSubmitting(false)
  }

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return
    setIsSubmitting(true)

    const result = await deleteMessage(selectedMessage.id)

    if (result.success) {
      setDeleteSuccess(true)
      setTimeout(() => {
        setIsDeleteDialogOpen(false)
        setSelectedMessage(null)
        setDeleteSuccess(false)
        onRefresh?.()
      }, 1500)
    }
    setIsSubmitting(false)
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
        <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                      <MailIcon className="h-3 w-3" />
                      {selectedMessage.email}
                    </span>
                    {selectedMessage.phone && (
                      <span className="flex items-center gap-1">
                        <PhoneIcon className="h-3 w-3" />
                        {selectedMessage.phone}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <ClockIcon className="h-3 w-3" />
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-card-foreground whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                <div className="flex gap-2">
                  <Button className="bg-primary text-primary-foreground" onClick={handleOpenReply}>
                    <SendIcon className="mr-2 h-4 w-4" />
                    Reply via Email
                  </Button>
                  <Button variant="ghost" className="text-destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MailIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a message to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="bg-card max-w-lg">
          {replySuccess ? (
            <div className="py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Email Sent!</h3>
              <p className="text-muted-foreground">Your reply has been sent to {selectedMessage?.name}.</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-card-foreground">Reply to Message</DialogTitle>
                <DialogDescription>
                  Send a reply to {selectedMessage?.name} ({selectedMessage?.email})
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input value={replySubject} onChange={(e) => setReplySubject(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Write your reply..."
                    rows={6}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setIsReplyDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-primary text-primary-foreground"
                    onClick={handleSendReply}
                    disabled={isSubmitting || !replyBody}
                  >
                    <SendIcon className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Sending..." : "Send Reply"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card">
          {deleteSuccess ? (
            <div className="py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Message Deleted</h3>
              <p className="text-muted-foreground">The message has been removed.</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-card-foreground">Delete Message</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this message from {selectedMessage?.name}? This action cannot be
                  undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteMessage} disabled={isSubmitting}>
                  {isSubmitting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
