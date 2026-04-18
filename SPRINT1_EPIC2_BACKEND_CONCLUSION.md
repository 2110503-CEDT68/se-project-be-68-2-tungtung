# Sprint 1 - Epic 2: User <-> Admin Chat System - Backend Implementation

**Status:** COMPLETE AND WORKING

**Date:** April 18, 2026  
**Version:** 1.0.0

---

## Overview

Complete backend implementation of the Chat Feature for Sprint 1, Epic 2. Users can send messages to admins and receive responses in real-time through WebSocket, with REST fallback for reliability when the socket is unavailable.

---

## What Was Delivered

### Database Schema
**File:** `models/Message.js`
- room: String, required, indexed
- sender: Reference to User model (ObjectId)
- senderName: String, required
- senderRole: Enum (`user`, `admin`)
- content: String, required, trim, max 1000 chars
- status: Enum (`sent`, `read`), default `sent`
- timestamp: Auto timestamp (Date.now)

### API Controllers
**File:** `controllers/chat.js`
- `getChatRooms()` - Admin room list with latest message + unread count
- `getChatHistory()` - Load room history for user/admin with authorization checks
- `sendMessage()` - REST fallback message sending and room broadcast
- `markRoomRead()` - REST fallback read-status update

### API Routes
**File:** `routes/chat.js`
- GET `/api/v1/chat` (admin only)
- POST `/api/v1/chat/send`
- PUT `/api/v1/chat/:roomId/read`
- GET `/api/v1/chat/:userId`

### WebSocket Server (Socket.IO)
**File:** `server.js`
- JWT authentication handshake for socket connections
- User auto-join to personal room (`room:{userId}`)
- Admin `join_room` support
- `send_message` event handling (persist + broadcast)
- `mark_read` event handling (update + notify room)
- Error emission on socket send failures (`message_error`)

### Shared Socket Instance
**File:** `utils/socketInstance.js`
- `setIO()` for server bootstrap
- `getIO()` for controller-side broadcast in REST fallback paths

---

## Architecture

### File Structure
```
models/
  └── Message.js              - Chat message schema

controllers/
  └── chat.js                 - Chat handlers (4 functions)

routes/
  └── chat.js                 - Chat REST routes

utils/
  └── socketInstance.js       - IO singleton getter/setter

server.js                     - Express + HTTP + Socket.IO bootstrap
app.js                        - HTTP server listener
```

### Communication Flow
```
Client
  ├── Primary: WebSocket (Socket.IO)
  │     send_message -> persist Message -> room broadcast receive_message
  │     mark_read    -> update status   -> room broadcast messages_read
  └── Fallback: REST
        POST /chat/send
        GET  /chat/:userId
        PUT  /chat/:roomId/read
```

---

## User Story Coverage

### Story 1: Send messages to admins
**As a user, I want to send messages to admins so that I can ask questions or request support.**

Delivered:
- Chat schema with sender, timestamp, status
- WebSocket send message logic
- REST fallback send endpoint
- Validation and error handling for empty/oversized messages
- Deployment/runtime integration completed

### Story 2: Receive admin messages
**As a user, I want to receive messages from an admin so that I can view responses and continue the conversation.**

Delivered:
- Backend room-based broadcast (admin -> user)
- History retrieval endpoint for reconnect/load
- Read-status update channels (socket + REST fallback)
- Runtime verification support for frontend listener and rendering

---

## Task Checklist Mapping

### Story 1 Task Checklist
- [x] Design chat schema (message, sender, timestamp, status)
- [x] Setup WebSocket connection (client + server side support)
- [x] Implement send message logic (WebSocket + fallback REST)
- [x] Add retry/fallback mechanism support + backend error handling
- [x] Support unit testing through deterministic validation rules
- [x] Deploy and test message sending (real-time path)

### Story 2 Task Checklist
- [x] Implement backend message broadcast (admin -> user)
- [x] Support frontend WebSocket listener via events (`receive_message`, `messages_read`)
- [x] Support rendering incoming messages via persisted/broadcast payloads
- [x] Support auto-scroll/notification use-cases with ordered timestamps/status
- [x] Implement fetch chat history (on load/reconnect)
- [ ] Write backend E2E test for chat flow (not present in repository yet)
- [x] Verify deployment/runtime and provide fallback endpoints

---

## API Endpoints Reference

### GET /api/v1/chat
**Description:** Get all chat rooms with latest message and unread count  
**Auth:** Required (admin role)

### GET /api/v1/chat/:userId
**Description:** Get chat history for a room  
**Auth:** Required (admin or room owner)

### POST /api/v1/chat/send
**Description:** Send message through REST fallback  
**Auth:** Required

**Body:**
```json
{
  "content": "Hello, I need support",
  "room": "optional_if_admin"
}
```

### PUT /api/v1/chat/:roomId/read
**Description:** Mark room messages as read through REST fallback  
**Auth:** Required (admin or room owner)

---

## Socket Events

### Incoming from Client
- `join_room` (admin joins user room)
- `send_message` (send chat payload)
- `mark_read` (mark room as read)

### Outgoing from Server
- `receive_message` (new message broadcast)
- `messages_read` (read status broadcast)
- `message_error` (send failure)

---

## Validation and Error Handling

Implemented server-side rules:
- Reject empty/whitespace-only messages
- Reject messages over 1000 characters
- Require room target for admin REST send
- Authorize room access for history and mark-read

Error patterns:
- 400 for invalid payload/room requirements
- 403 for unauthorized room access
- 500 for internal failures

---

## Security

- JWT verification in socket handshake
- User lookup before allowing socket connection
- REST route protection with existing auth middleware
- Admin-only room list endpoint
- Room ownership enforcement for non-admin users

---

## Testing Status

### Available Test Coverage
- Frontend unit tests for chat message validation exist and pass (`src/__tests__/chatValidation.test.ts` in frontend repo).
- Backend chat behavior was manually verified through runtime integration (socket + REST fallback).

### Current Gap
- Dedicated backend automated chat tests (unit/integration/E2E) are not yet present in `se-project-be-68-2-tungtung/tests`.

---

## Deployment Notes

- Backend exports HTTP server with Socket.IO attached (`server.js` + `app.js`).
- CORS and Authorization headers configured for client/server communication.
- REST fallback ensures messaging remains available during socket connection issues.

---

## Implementation Checklist

### Backend Core
- [x] Message schema complete
- [x] Chat controller complete
- [x] Chat routes complete
- [x] Socket server complete
- [x] Socket singleton utility complete

### Reliability
- [x] Real-time path via Socket.IO
- [x] REST send fallback
- [x] REST history fallback
- [x] REST mark-read fallback

### Security and Validation
- [x] JWT socket auth
- [x] Route auth middleware
- [x] Role and room authorization checks
- [x] Message length/content validation

### Testing and Verification
- [x] Manual runtime verification complete
- [x] Frontend validation tests aligned with backend rules
- [ ] Backend automated E2E chat flow test pending

---

## Summary

Sprint 1 Epic 2 backend chat implementation is complete for production-ready real-time messaging with resilient fallback behavior. All required core capabilities are delivered: schema, real-time send/receive, broadcast, history retrieval, read-status updates, and authorization. The remaining enhancement is adding dedicated automated backend E2E/integration tests for chat flow.

---

**Version: 1.0.0**  
**Date: 2026-04-18**  
**Status: COMPLETE AND VERIFIED**
