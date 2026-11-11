"""Websocket API tests: happy path, validation, permissions."""

from homeassistant.core import HomeAssistant
import pytest

from custom_components.roster_planner.const import CONF_OWNER, DOMAIN

SHIFT = {"name": "Open", "start": "07:00", "end": "15:30", "colour": "#4caf50"}
MONDAY = "2026-11-16"


class Api:
    """A thin client that fills in the command prefix and entry id."""

    def __init__(self, client, entry_id):
        self.client = client
        self.entry_id = entry_id

    async def raw(self, command, **fields):
        await self.client.send_json_auto_id(
            {"type": f"{DOMAIN}/{command}", "entry_id": self.entry_id, **fields}
        )
        return await self.client.receive_json()

    async def call(self, command, **fields):
        response = await self.raw(command, **fields)
        assert response["success"], response
        return response["result"]

    async def error(self, command, **fields):
        response = await self.raw(command, **fields)
        assert not response["success"], response
        return response["error"]


@pytest.fixture
async def api(hass: HomeAssistant, entry, hass_ws_client) -> Api:
    return Api(await hass_ws_client(hass), entry.entry_id)


@pytest.fixture
async def read_only_api(
    hass: HomeAssistant, entry, hass_ws_client, hass_read_only_access_token
) -> Api:
    client = await hass_ws_client(hass, hass_read_only_access_token)
    return Api(client, entry.entry_id)


async def seed(api: Api) -> dict:
    shift_type = await api.call("shift_type/create", item=SHIFT)
    pattern = await api.call(
        "pattern/create",
        item={
            "name": "A",
            "days": {"mon": {"type": "shift", "shift_type_id": shift_type["id"]}},
        },
    )
    rotation = await api.call(
        "rotation/create",
        item={
            "name": "Main",
            "anchor": MONDAY,
            "cycle_weeks": 1,
            "slots": [pattern["id"]],
        },
    )
    return {"shift_type": shift_type, "pattern": pattern, "rotation": rotation}


async def test_list(hass: HomeAssistant, api: Api):
    await api.client.send_json_auto_id({"type": f"{DOMAIN}/list"})
    response = await api.client.receive_json()
    assert response["result"] == [
        {"entry_id": api.entry_id, "title": "Work", "owner": None, "can_edit": True}
    ]


async def test_get_empty(api: Api):
    result = await api.call("get")
    assert result["shift_types"] == []
    assert result["version"] == 1


async def test_unknown_roster(api: Api):
    api.entry_id = "nope"
    assert (await api.error("get"))["code"] == "not_found"


async def test_shift_type_crud(api: Api):
    created = await api.call("shift_type/create", item=SHIFT)
    updated = await api.call(
        "shift_type/update", item_id=created["id"], item={"name": "Early"}
    )
    assert updated["name"] == "Early"
    await api.call("shift_type/delete", item_id=created["id"])
    assert (await api.call("get"))["shift_types"] == []


async def test_pattern_crud(api: Api):
    created = await api.call("pattern/create", item={"name": "A", "days": {}})
    updated = await api.call(
        "pattern/update",
        item_id=created["id"],
        item={"days": {"mon": {"type": "off"}}},
    )
    assert updated["days"] == {"mon": {"type": "off"}}
    await api.call("pattern/delete", item_id=created["id"])
    assert (await api.call("get"))["patterns"] == []


async def test_rotation_crud(api: Api):
    seeded = await seed(api)
    rotation_id = seeded["rotation"]["id"]
    updated = await api.call(
        "rotation/update",
        item_id=rotation_id,
        item={"cycle_weeks": 2, "slots": [seeded["pattern"]["id"], None]},
    )
    assert updated["cycle_weeks"] == 2
    await api.call("rotation/delete", item_id=rotation_id)
    assert (await api.call("get"))["rotations"] == []


async def test_variation_crud(api: Api):
    item = {
        "name": "Xmas",
        "start_date": "2026-12-14",
        "end_date": "2026-12-27",
        "mode": "days",
        "days": {"mon": {"type": "off"}},
    }
    created = await api.call("variation/create", item=item)
    updated = await api.call(
        "variation/update", item_id=created["id"], item={"name": "Holiday"}
    )
    assert updated["name"] == "Holiday"
    await api.call("variation/delete", item_id=created["id"])
    assert (await api.call("get"))["variations"] == []


@pytest.mark.parametrize(
    ("command", "item", "code", "field"),
    [
        (
            "shift_type/create",
            {**SHIFT, "start": "99:00"},
            "invalid_time",
            "start",
        ),
        ("pattern/create", {"name": ""}, "invalid_name", "name"),
        (
            "rotation/create",
            {"name": "R", "anchor": "2026-11-17", "cycle_weeks": 1, "slots": [None]},
            "anchor_not_monday",
            "anchor",
        ),
        (
            "variation/create",
            {
                "name": "V",
                "start_date": "2026-12-14",
                "end_date": "2026-12-01",
                "mode": "days",
            },
            "invalid_date_range",
            "end_date",
        ),
    ],
)
async def test_validation_errors_are_structured(api: Api, command, item, code, field):
    error = await api.error(command, item=item)
    assert error["code"] == code
    assert error["field"] == field


async def test_schema_rejects_unknown_keys(api: Api):
    error = await api.error("shift_type/create", item={**SHIFT, "bogus": 1})
    assert error["code"] == "invalid_format"


async def test_failed_mutation_changes_nothing(api: Api):
    seeded = await seed(api)
    error = await api.error("shift_type/delete", item_id=seeded["shift_type"]["id"])
    assert error["code"] == "in_use"
    assert len((await api.call("get"))["shift_types"]) == 1


async def test_delete_with_replacement(api: Api):
    seeded = await seed(api)
    other = await api.call("shift_type/create", item={**SHIFT, "name": "Other"})
    await api.call(
        "shift_type/delete",
        item_id=seeded["shift_type"]["id"],
        replace_with=other["id"],
    )
    pattern = (await api.call("get"))["patterns"][0]
    assert pattern["days"]["mon"]["shift_type_id"] == other["id"]


async def test_resolve_includes_days_off(api: Api):
    await seed(api)
    days = await api.call("resolve", start=MONDAY, end="2026-11-17")
    assert days[0]["shift"]["title"] == "Open"
    assert days[0]["shift"]["source_name"] == "Main"
    assert days[0]["shift"]["week"] == 1
    assert days[1]["date"] == "2026-11-17"
    assert days[1]["shift"] is None


async def test_resolve_range_limits(api: Api):
    assert (await api.error("resolve", start=MONDAY, end="2026-11-15"))[
        "code"
    ] == "invalid_date_range"
    assert (await api.error("resolve", start=MONDAY, end="2030-01-01"))[
        "code"
    ] == "range_too_large"


async def test_exception_set_and_clear(api: Api):
    await seed(api)
    await api.call("exception/set", date=MONDAY, assignment={"type": "off"}, note="x")
    days = await api.call("resolve", start=MONDAY, end=MONDAY)
    assert days[0]["shift"] is None
    assert days[0]["base"]["title"] == "Open"
    assert days[0]["exception"]["note"] == "x"
    await api.call("exception/clear", date=MONDAY)
    days = await api.call("resolve", start=MONDAY, end=MONDAY)
    assert days[0]["shift"]["title"] == "Open"


async def test_exception_invalid_times(api: Api):
    error = await api.error(
        "exception/set",
        date=MONDAY,
        assignment={"type": "custom", "start": "09:00", "end": "09:00"},
    )
    assert error["code"] == "invalid_time_range"


async def test_preview_does_not_save(api: Api):
    seeded = await seed(api)
    draft = {
        "name": "Draft",
        "anchor": "2026-11-09",
        "cycle_weeks": 1,
        "slots": [seeded["pattern"]["id"]],
        "active_from": "2026-11-09",
        "priority": -1,
    }
    days = await api.call("preview", start=MONDAY, end=MONDAY, rotation=draft)
    assert days[0]["shift"]["source_name"] == "Draft"
    assert len((await api.call("get"))["rotations"]) == 1


async def test_preview_validation_error(api: Api):
    draft = {"name": "D", "anchor": "2026-11-17", "cycle_weeks": 1, "slots": [None]}
    error = await api.error("preview", start=MONDAY, end=MONDAY, rotation=draft)
    assert error["field"] == "anchor"


async def test_export_import_round_trip(api: Api):
    await seed(api)
    exported = await api.call("export")
    await api.call("rotation/delete", item_id=exported["rotations"][0]["id"])
    await api.call("import", data=exported)
    assert await api.call("get") == exported


async def test_import_rejects_invalid_and_keeps_data(api: Api):
    await seed(api)
    before = await api.call("get")
    error = await api.error("import", data={"rotations": [{"name": "x"}]})
    assert error["code"] == "required"
    assert await api.call("get") == before


async def test_subscribe_pushes_changes(api: Api):
    await api.client.send_json_auto_id(
        {"type": f"{DOMAIN}/subscribe", "entry_id": api.entry_id}
    )
    assert (await api.client.receive_json())["success"]
    event = await api.client.receive_json()
    assert event["event"]["shift_types"] == []

    await api.client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/shift_type/create",
            "entry_id": api.entry_id,
            "item": SHIFT,
        }
    )
    messages = [await api.client.receive_json() for _ in range(2)]
    pushed = next(m for m in messages if m["type"] == "event")
    assert pushed["event"]["shift_types"][0]["name"] == "Open"


async def test_subscription_survives_entry_reload(hass: HomeAssistant, api: Api, entry):
    await api.client.send_json_auto_id(
        {"type": f"{DOMAIN}/subscribe", "entry_id": api.entry_id}
    )
    await api.client.receive_json()
    await api.client.receive_json()
    await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    await entry.runtime_data.async_mutate(lambda d: d.create_shift_type(SHIFT))
    event = await api.client.receive_json()
    assert event["event"]["shift_types"][0]["name"] == "Open"


MUTATIONS = [
    ("shift_type/create", {"item": SHIFT}),
    ("shift_type/update", {"item_id": "x", "item": {}}),
    ("shift_type/delete", {"item_id": "x"}),
    ("pattern/create", {"item": {"name": "A"}}),
    ("pattern/update", {"item_id": "x", "item": {}}),
    ("pattern/delete", {"item_id": "x"}),
    ("rotation/create", {"item": {"name": "A"}}),
    ("rotation/update", {"item_id": "x", "item": {}}),
    ("rotation/delete", {"item_id": "x"}),
    ("variation/create", {"item": {"name": "A"}}),
    ("variation/update", {"item_id": "x", "item": {}}),
    ("variation/delete", {"item_id": "x"}),
    ("exception/set", {"date": MONDAY, "assignment": {"type": "off"}}),
    ("exception/clear", {"date": MONDAY}),
    ("import", {"data": {}}),
]


@pytest.mark.parametrize(("command", "fields"), MUTATIONS)
async def test_non_owner_cannot_mutate(read_only_api: Api, command, fields):
    error = await read_only_api.error(command, **fields)
    assert error["code"] == "unauthorized"


@pytest.mark.parametrize(
    ("command", "fields"),
    [
        ("get", {}),
        ("export", {}),
        ("resolve", {"start": MONDAY, "end": MONDAY}),
    ],
)
async def test_non_owner_can_read(read_only_api: Api, command, fields):
    await read_only_api.call(command, **fields)


async def test_non_owner_list_shows_read_only(read_only_api: Api):
    await read_only_api.client.send_json_auto_id({"type": f"{DOMAIN}/list"})
    response = await read_only_api.client.receive_json()
    assert response["result"][0]["can_edit"] is False


async def test_owner_can_mutate_without_admin(
    hass: HomeAssistant, entry, read_only_api: Api, hass_read_only_user
):
    hass.config_entries.async_update_entry(
        entry, data={**entry.data, CONF_OWNER: hass_read_only_user.id}
    )
    created = await read_only_api.call("shift_type/create", item=SHIFT)
    assert created["name"] == "Open"


async def test_preview_needs_a_draft(api: Api):
    error = await api.error("preview", start=MONDAY, end=MONDAY)
    assert error["code"] == "required"
