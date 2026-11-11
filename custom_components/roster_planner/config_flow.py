"""Config and options flows: one config entry is one roster."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlowWithReload,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.selector import (
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
)
import probatio as vol

from .const import CONF_LOCATION, CONF_NAME, CONF_OWNER, CONF_PREFIX, DOMAIN
from .helpers import entry_settings

NO_OWNER = "none"


async def _schema(hass: HomeAssistant, defaults: dict[str, Any]) -> vol.Schema:
    users = [
        SelectOptionDict(value=user.id, label=user.name or user.id)
        for user in await hass.auth.async_get_users()
        if user.is_active and not user.system_generated
    ]
    # A previous owner may have been deleted or deactivated since.
    owner = defaults.get(CONF_OWNER)
    if owner not in {user["value"] for user in users}:
        owner = NO_OWNER
    return vol.Schema(
        {
            vol.Required(
                CONF_NAME, default=defaults.get(CONF_NAME, vol.UNDEFINED)
            ): TextSelector(),
            vol.Optional(
                CONF_PREFIX,
                description={"suggested_value": defaults.get(CONF_PREFIX, "")},
            ): TextSelector(),
            vol.Optional(
                CONF_LOCATION,
                description={"suggested_value": defaults.get(CONF_LOCATION, "")},
            ): TextSelector(),
            vol.Required(CONF_OWNER, default=owner): SelectSelector(
                SelectSelectorConfig(
                    options=[
                        SelectOptionDict(
                            value=NO_OWNER, label="No owner (admins only)"
                        ),
                        *users,
                    ],
                    mode=SelectSelectorMode.DROPDOWN,
                )
            ),
        }
    )


def _clean(user_input: dict[str, Any]) -> dict[str, Any]:
    """Normalise form input for storage."""
    owner = user_input.get(CONF_OWNER)
    return {
        CONF_NAME: user_input[CONF_NAME].strip(),
        # A prefix keeps its trailing space: "Work: " + "Open".
        CONF_PREFIX: user_input.get(CONF_PREFIX, ""),
        CONF_LOCATION: user_input.get(CONF_LOCATION, "").strip(),
        CONF_OWNER: None if owner == NO_OWNER else owner,
    }


class RosterPlannerConfigFlow(ConfigFlow, domain=DOMAIN):
    """Create a roster."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Ask for the roster's settings."""
        errors: dict[str, str] = {}
        if user_input is not None:
            data = _clean(user_input)
            if not data[CONF_NAME]:
                errors[CONF_NAME] = "name_required"
            elif any(
                entry.title == data[CONF_NAME]
                for entry in self._async_current_entries()
            ):
                errors[CONF_NAME] = "name_exists"
            else:
                return self.async_create_entry(title=data[CONF_NAME], data=data)
        return self.async_show_form(
            step_id="user",
            data_schema=await _schema(self.hass, user_input or {}),
            errors=errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> RosterPlannerOptionsFlow:
        """Return the options flow."""
        return RosterPlannerOptionsFlow()


class RosterPlannerOptionsFlow(OptionsFlowWithReload):
    """Edit a roster's settings."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Show the current settings."""
        errors: dict[str, str] = {}
        if user_input is not None:
            data = _clean(user_input)
            others = self.hass.config_entries.async_entries(DOMAIN)
            if not data[CONF_NAME]:
                errors[CONF_NAME] = "name_required"
            elif any(
                entry.title == data[CONF_NAME]
                and entry.entry_id != self.config_entry.entry_id
                for entry in others
            ):
                errors[CONF_NAME] = "name_exists"
            else:
                self.hass.config_entries.async_update_entry(
                    self.config_entry, title=data[CONF_NAME]
                )
                return self.async_create_entry(data=data)
        return self.async_show_form(
            step_id="init",
            data_schema=await _schema(
                self.hass, user_input or entry_settings(self.config_entry)
            ),
            errors=errors,
        )
