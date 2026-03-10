from datetime import datetime
from typing import Any, Dict

from db import db


async def log_event(actor_user_id: Any, action: str, target_type: str, target_id: Any, metadata: Dict | None = None, ip: str | None = None, user_agent: str | None = None) -> None:
    await db.audit_logs.insert_one(
        {
            "actor_user_id": actor_user_id,
            "action": action,
            "target_type": target_type,
            "target_id": target_id,
            "metadata": metadata or {},
            "ip": ip,
            "user_agent": user_agent,
            "created_at": datetime.utcnow(),
        }
    )
