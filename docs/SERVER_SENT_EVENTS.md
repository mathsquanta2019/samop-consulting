# Server-Sent Events (SSE) Implementation Guide

## Overview

This document outlines the Server-Sent Events (SSE) architecture for SAMOP Consulting's real-time notification and update system. SSE provides a unidirectional communication channel from server to client, ideal for pushing updates without the overhead of WebSockets.

## Use Cases

### 1. Application Status Updates

Real-time notifications when application status changes:

- Application submitted confirmation
- Document review status changes
- Application approved/rejected notifications
- Request for additional information alerts

\`\`\`typescript
// Example SSE endpoint: /api/sse/applications
interface ApplicationStatusEvent {
  type: 'status_change' | 'document_update' | 'review_complete';
  applicationId: string;
  clientId: string;
  status: string;
  message: string;
  timestamp: string;
}
\`\`\`

### 2. Document Processing Notifications

Real-time updates during document processing:

- Document upload confirmation
- Document review started
- Document approved/rejected with feedback
- Request for document re-upload

\`\`\`typescript
// Example SSE endpoint: /api/sse/documents
interface DocumentEvent {
  type: 'uploaded' | 'processing' | 'approved' | 'rejected' | 'reupload_required';
  documentId: string;
  documentName: string;
  feedback?: string;
  timestamp: string;
}
\`\`\`

### 3. Appointment Reminders

Push notifications for appointments:

- Upcoming appointment reminders (24h, 1h before)
- Appointment confirmation
- Appointment rescheduled notifications
- Cancellation notifications with refund status

\`\`\`typescript
// Example SSE endpoint: /api/sse/appointments
interface AppointmentEvent {
  type: 'reminder' | 'confirmed' | 'rescheduled' | 'cancelled';
  appointmentId: string;
  dateTime: string;
  consultantName: string;
  refundStatus?: 'full' | 'partial' | 'none';
  timestamp: string;
}
\`\`\`

### 4. Admin Dashboard Live Updates

Real-time dashboard updates for administrators:

- New client registrations
- New application submissions
- Document upload notifications
- Appointment booking alerts
- Message inbox updates

\`\`\`typescript
// Example SSE endpoint: /api/sse/admin
interface AdminEvent {
  type: 'new_client' | 'new_application' | 'new_document' | 'new_appointment' | 'new_message';
  entityId: string;
  summary: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
}
\`\`\`

### 5. Chat Bot Streaming Responses

Stream AI-generated responses for the chat bot:

- Progressive text rendering
- Typing indicators
- Response completion signals

\`\`\`typescript
// Example SSE endpoint: /api/sse/chat
interface ChatStreamEvent {
  type: 'chunk' | 'complete' | 'error';
  messageId: string;
  content?: string;
  timestamp: string;
}
\`\`\`

## Implementation

### Server-Side (Next.js Route Handler)

\`\`\`typescript
// app/api/sse/notifications/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const userId = request.nextUrl.searchParams.get('userId');

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection confirmation
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`)
      );

      // Set up event listener for this user's notifications
      const sendEvent = (event: any) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        );
      };

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, 30000);

      // Clean up on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
\`\`\`

### Client-Side Hook

\`\`\`typescript
// hooks/use-sse.ts
import { useEffect, useState, useCallback } from 'react';

interface SSEOptions {
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
}

export function useSSE(url: string, options: SSEOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<any>(null);

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      setIsConnected(true);
      options.onOpen?.();
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLastEvent(data);
      options.onMessage?.(event);
    };

    eventSource.onerror = (error) => {
      setIsConnected(false);
      options.onError?.(error);
    };

    return () => {
      eventSource.close();
    };
  }, [url]);

  return { isConnected, lastEvent };
}
\`\`\`

### Usage Example

\`\`\`typescript
// components/notification-listener.tsx
'use client';

import { useSSE } from '@/hooks/use-sse';
import { useToast } from '@/hooks/use-toast';

export function NotificationListener({ userId }: { userId: string }) {
  const { toast } = useToast();

  useSSE(`/api/sse/notifications?userId=${userId}`, {
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'application_update':
          toast({
            title: 'Application Update',
            description: data.message,
          });
          break;
        case 'document_status':
          toast({
            title: 'Document Status Changed',
            description: data.message,
          });
          break;
        case 'appointment_reminder':
          toast({
            title: 'Appointment Reminder',
            description: data.message,
          });
          break;
      }
    },
  });

  return null; // This component only listens, doesn't render anything
}
\`\`\`

## Event Types Reference

| Event Category | Event Types | Description |
|---------------|-------------|-------------|
| Applications | `submitted`, `under_review`, `approved`, `rejected`, `info_requested` | Application lifecycle events |
| Documents | `uploaded`, `approved`, `rejected`, `reupload_required` | Document processing events |
| Appointments | `booked`, `reminder`, `rescheduled`, `cancelled` | Appointment management events |
| Admin | `new_client`, `new_application`, `urgent_action` | Admin dashboard events |
| Chat | `chunk`, `complete`, `typing` | Chat bot streaming events |

## Security Considerations

1. **Authentication**: Validate user session before establishing SSE connection
2. **Authorization**: Only send events the user is authorized to receive
3. **Rate Limiting**: Implement connection limits per user
4. **Heartbeat**: Send periodic heartbeats to detect stale connections
5. **Reconnection**: Client should implement exponential backoff for reconnection

## Performance Best Practices

1. Use connection pooling for multiple clients
2. Implement event batching for high-frequency updates
3. Set appropriate timeout values
4. Monitor connection counts and memory usage
5. Use Redis or similar for pub/sub in multi-server deployments

## Browser Support

SSE is supported in all modern browsers. For older browsers, consider using a polyfill or falling back to polling.

---

*Last Updated: December 2024*
*SAMOP Consulting - Technical Documentation*
