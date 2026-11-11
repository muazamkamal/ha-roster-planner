"""Persistence for one roster, with all-or-nothing mutations and change listeners."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.storage import Store

from .const import DOMAIN, STORAGE_VERSION
from .models import RosterData


class _MigratingStore(Store[dict[str, Any]]):
    """Store with a hook for future schema migrations."""

    async def _async_migrate_func(
        self,
        old_major_version: int,
        old_minor_version: int,
        old_data: dict[str, Any],
    ) -> dict[str, Any]:
        """Migrate older data. Version 1 is the only schema so far."""
        return old_data


class RosterStore:
    """Holds a roster in memory and writes changes to disk."""

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        """Create the store for a config entry."""
        self._store = _MigratingStore(
            hass, STORAGE_VERSION, f"{DOMAIN}.{entry_id}", atomic_writes=True
        )
        self.data = RosterData()
        self._listeners: list[CALLBACK_TYPE] = []

    async def async_load(self) -> None:
        """Load the roster from disk."""
        if (stored := await self._store.async_load()) is not None:
            self.data = RosterData.from_dict(stored)

    async def async_mutate[T](self, operation: Callable[[RosterData], T]) -> T:
        """Apply a change to a copy, then commit it only if it validates."""
        draft = self.data.copy()
        result = operation(draft)
        await self._async_commit(draft)
        return result

    async def async_replace(self, data: RosterData) -> None:
        """Replace the whole roster, e.g. from an import."""
        await self._async_commit(data)

    async def _async_commit(self, data: RosterData) -> None:
        self.data = data
        await self._store.async_save(self.data.to_dict())
        for listener in list(self._listeners):
            listener()

    async def async_remove(self) -> None:
        """Delete the storage file."""
        await self._store.async_remove()

    @callback
    def async_add_listener(self, listener: CALLBACK_TYPE) -> CALLBACK_TYPE:
        """Call a listener on every change. Returns a function to stop."""
        self._listeners.append(listener)

        @callback
        def remove() -> None:
            self._listeners.remove(listener)

        return remove
