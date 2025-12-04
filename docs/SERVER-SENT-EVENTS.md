# Server-Sent Events (SSE) Implementation Guide

## Overview

This document outlines the Server-Sent Events (SSE) architecture for SAMOP Consulting's real-time notification and update system. SSE provides a unidirectional, persistent connection from server to client, enabling real-time updates without the overhead of WebSockets.

## Use Cases

### 1. Application Status Updates

When an admin reviews, approves, or requests changes to a client's application, the client receives instant notifications.

\`\`\`typescript
// Server: app/api/sse/applications/route.ts
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get('clientId')
  
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      
      // Subscribe to application updates for this client
      const unsubscribe = subscribeToApplicationUpdates(clientId, (update) => {
        const data = `data: ${JSON.stringify(update)}\n\n`
        controller.enqueue(encoder.encode(data))
      })
      
      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        unsubscribe()
        controller.close()
      })
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
\`\`\`

\`\`\`typescript
// Client: hooks/use-application-updates.ts
import { useEffect, useState } from 'react'

interface ApplicationUpdate {
  type: 'status_change' | 'document_request' | 'info_request' | 'review_complete'
  applicationId: string
  message: string
  timestamp: string
}

export function useApplicationUpdates(clientId: string) {
  const [updates, setUpdates] = useState<ApplicationUpdate[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const eventSource = new EventSource(`/api/sse/applications?clientId=${clientId}`)
    
    eventSource.onopen = () => setConnected(true)
    
    eventSource.onmessage = (event) => {
      const update: ApplicationUpdate = JSON.parse(event.data)
      setUpdates(prev => [update, ...prev])
      
      // Show toast notification
      showNotification(update.message)
    }
    
    eventSource.onerror = () => {
      setConnected(false)
      eventSource.close()
    }
    
    return () => eventSource.close()
  }, [clientId])

  return { updates, connected }
}
\`\`\`

### 2. Document Review Notifications

Real-time updates when documents are approved, rejected, or require re-upload.

\`\`\`typescript
// Server: app/api/sse/documents/route.ts
export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get('clientId')
  
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      
      const unsubscribe = subscribeToDocumentUpdates(clientId, (update) => {
        const event = {
          type: update.type, // 'approved' | 'rejected' | 'reupload_required'
          documentId: update.documentId,
          documentName: update.documentName,
          feedback: update.feedback,
          timestamp: new Date().toISOString()
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      })
      
      request.signal.addEventListener('abort', () => {
        unsubscribe()
        controller.close()
      })
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
\`\`\`

### 3. Appointment Reminders & Updates

Real-time notifications for appointment confirmations, cancellations, and reminders.

\`\`\`typescript
// Server: app/api/sse/appointments/route.ts
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')
  const role = request.nextUrl.searchParams.get('role') // 'client' | 'admin'
  
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      
      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'))
      }, 30000)
      
      const unsubscribe = subscribeToAppointmentUpdates(userId, role, (update) => {
        const event = {
          type: update.type, // 'new_booking' | 'cancelled' | 'rescheduled' | 'reminder'
          appointmentId: update.appointmentId,
          clientName: update.clientName,
          dateTime: update.dateTime,
          message: update.message
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      })
      
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        unsubscribe()
        controller.close()
      })
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
\`\`\`

### 4. Admin Dashboard Real-Time Stats

Live updates to admin dashboard metrics without page refresh.

\`\`\`typescript
// Server: app/api/sse/admin/stats/route.ts
export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      
      // Send initial stats
      const initialStats = getAdminStats()
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialStats)}\n\n`))
      
      // Subscribe to stat changes
      const unsubscribe = subscribeToStatChanges((stats) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(stats)}\n\n`))
      })
      
      request.signal.addEventListener('abort', () => {
        unsubscribe()
        controller.close()
      })
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
\`\`\`

\`\`\`typescript
// Client: Admin Dashboard Component
function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  
  useEffect(() => {
    const eventSource = new EventSource('/api/sse/admin/stats')
    
    eventSource.onmessage = (event) => {
      setStats(JSON.parse(event.data))
    }
    
    return () => eventSource.close()
  }, [])
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard title="Pending Applications" value={stats?.pendingApplications} />
      <StatCard title="Documents to Review" value={stats?.documentsToReview} />
      <StatCard title="Today's Appointments" value={stats?.todaysAppointments} />
      <StatCard title="New Messages" value={stats?.newMessages} />
    </div>
  )
}
\`\`\`

### 5. Chat Bot Typing Indicator (Future AI Integration)

When integrating with AI for the chatbot, SSE can stream responses.

\`\`\`typescript
// Server: app/api/sse/chat/route.ts
import { streamText } from 'ai'

export async function POST(request: NextRequest) {
  const { message, conversationId } = await request.json()
  
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      
      // Stream AI response
      const result = await streamText({
        model: 'openai/gpt-4.1',
        messages: [{ role: 'user', content: message }],
        onChunk: ({ chunk }) => {
          if (chunk.type === 'text-delta') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'text', 
              content: chunk.text 
            })}\n\n`))
          }
        }
      })
      
      // Send completion event
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
      controller.close()
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
\`\`\`

## Event Types Reference

| Event Type | Source | Target | Description |
|------------|--------|--------|-------------|
| `application_status_change` | Admin | Client | Application status updated |
| `document_reviewed` | Admin | Client | Document approved/rejected |
| `document_request` | Admin | Client | Additional documents requested |
| `info_request` | Admin | Client | More information requested |
| `appointment_booked` | Client | Admin | New appointment created |
| `appointment_cancelled` | Client/Admin | Admin/Client | Appointment cancelled |
| `appointment_reminder` | System | Client/Admin | Upcoming appointment reminder |
| `new_message` | Client/Admin | Admin/Client | New message received |
| `stats_update` | System | Admin | Dashboard stats changed |

## Implementation Checklist

- [ ] Create SSE route handlers for each event type
- [ ] Implement pub/sub system (Redis recommended for production)
- [ ] Add authentication middleware to SSE endpoints
- [ ] Implement reconnection logic on client side
- [ ] Add heartbeat mechanism to keep connections alive
- [ ] Set up error handling and logging
- [ ] Configure load balancer for sticky sessions (if applicable)
- [ ] Add rate limiting to prevent abuse
- [ ] Implement graceful shutdown handling

## Production Considerations

### Database Integration
\`\`\`typescript
// Using Supabase Realtime as pub/sub
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!)

function subscribeToApplicationUpdates(clientId: string, callback: (update: any) => void) {
  const channel = supabase
    .channel(`applications:${clientId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'applications',
      filter: `client_id=eq.${clientId}`
    }, callback)
    .subscribe()
    
  return () => channel.unsubscribe()
}
\`\`\`

### Redis Pub/Sub (Recommended for Scale)
\`\`\`typescript
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)
const subscriber = new Redis(process.env.REDIS_URL!)

export function publishUpdate(channel: string, data: any) {
  redis.publish(channel, JSON.stringify(data))
}

export function subscribeToUpdates(channel: string, callback: (data: any) => void) {
  subscriber.subscribe(channel)
  subscriber.on('message', (ch, message) => {
    if (ch === channel) {
      callback(JSON.parse(message))
    }
  })
  
  return () => subscriber.unsubscribe(channel)
}
\`\`\`

## Security

1. **Authentication**: All SSE endpoints require valid session tokens
2. **Authorization**: Users can only subscribe to their own events
3. **Rate Limiting**: Maximum 5 concurrent SSE connections per user
4. **Timeout**: Connections auto-close after 1 hour of inactivity

## Monitoring

Track the following metrics:
- Active SSE connections count
- Average connection duration
- Events sent per minute
- Error rate by event type
- Reconnection frequency

---

*Last updated: December 2024*
