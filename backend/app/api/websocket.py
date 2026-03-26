"""
SwarLipi AI — WebSocket Handlers
Real-time processing status and collaborative score editing.
"""

import json
import logging
from collections import defaultdict

from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for real-time features."""

    def __init__(self):
        # project_id -> set of connected websockets
        self.active_connections: dict[str, set[WebSocket]] = defaultdict(set)
        # Status subscribers: project_id -> set of connected websockets
        self.status_subscribers: dict[str, set[WebSocket]] = defaultdict(set)

    async def connect(self, websocket: WebSocket, project_id: str, channel: str = "score"):
        """Accept a WebSocket connection."""
        await websocket.accept()
        if channel == "status":
            self.status_subscribers[project_id].add(websocket)
        else:
            self.active_connections[project_id].add(websocket)
        logger.info(f"WebSocket connected: project={project_id}, channel={channel}")

    def disconnect(self, websocket: WebSocket, project_id: str, channel: str = "score"):
        """Remove a WebSocket connection."""
        if channel == "status":
            self.status_subscribers[project_id].discard(websocket)
        else:
            self.active_connections[project_id].discard(websocket)
        logger.info(f"WebSocket disconnected: project={project_id}, channel={channel}")

    async def broadcast_to_project(self, project_id: str, message: dict):
        """Broadcast a message to all connections for a project."""
        dead_connections = set()
        for connection in self.active_connections[project_id]:
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.add(connection)

        # Clean up dead connections
        self.active_connections[project_id] -= dead_connections

    async def send_status_update(self, project_id: str, status_data: dict):
        """Send processing status update to all subscribers."""
        dead_connections = set()
        for connection in self.status_subscribers[project_id]:
            try:
                await connection.send_json(status_data)
            except Exception:
                dead_connections.add(connection)

        self.status_subscribers[project_id] -= dead_connections

    async def send_personal(self, websocket: WebSocket, message: dict):
        """Send a message to a specific connection."""
        try:
            await websocket.send_json(message)
        except Exception:
            pass


# Global connection manager
manager = ConnectionManager()


async def websocket_status_endpoint(websocket: WebSocket, project_id: str):
    """WebSocket endpoint for real-time processing status updates.

    Route: /ws/status/{project_id}
    """
    await manager.connect(websocket, project_id, channel="status")
    try:
        while True:
            # Keep connection alive; client can also send heartbeats
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket, project_id, channel="status")


async def websocket_score_endpoint(websocket: WebSocket, project_id: str):
    """WebSocket endpoint for real-time collaborative score editing.

    Route: /ws/score/{project_id}
    Phase 4 feature.
    """
    await manager.connect(websocket, project_id, channel="score")
    try:
        while True:
            data = await websocket.receive_json()

            # Handle different message types
            msg_type = data.get("type", "")

            if msg_type == "cursor_move":
                # Broadcast cursor position to other users
                await manager.broadcast_to_project(project_id, {
                    "type": "cursor_update",
                    "user_id": data.get("user_id"),
                    "position": data.get("position"),
                })

            elif msg_type == "note_edit":
                # Broadcast note edits to other users
                await manager.broadcast_to_project(project_id, {
                    "type": "note_edit",
                    "user_id": data.get("user_id"),
                    "edit": data.get("edit"),
                })

            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        manager.disconnect(websocket, project_id, channel="score")
