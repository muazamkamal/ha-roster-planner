"""Shared helpers: config entry settings and the edit permission rule."""

from __future__ import annotations

from typing import Any

from homeassistant.auth.models import User
from homeassistant.config_entries import ConfigEntry

from .const import CONF_OWNER
from .store import RosterStore

type RosterConfigEntry = ConfigEntry[RosterStore]


def entry_settings(entry: ConfigEntry) -> dict[str, Any]:
    """Return the entry's settings, with options overriding the initial data."""
    return {**entry.data, **entry.options}


def can_edit(entry: ConfigEntry, user: User) -> bool:
    """Admins can edit every roster; an owner can edit their own."""
    return user.is_admin or entry_settings(entry).get(CONF_OWNER) == user.id
