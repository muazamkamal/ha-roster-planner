import type {
  DayAssignment,
  DayDetail,
  HassConnection,
  RosterConfig,
  RosterException,
  RosterSummary,
} from "./types";

const PREFIX = "roster_planner/";

export type ItemKind = "shift_type" | "pattern" | "rotation" | "variation";

export class RosterApi {
  constructor(
    private readonly connection: HassConnection,
    readonly entryId: string,
  ) {}

  static list(connection: HassConnection): Promise<RosterSummary[]> {
    return connection.sendMessagePromise({ type: `${PREFIX}list` });
  }

  private send<T>(
    command: string,
    fields: Record<string, unknown> = {},
  ): Promise<T> {
    return this.connection.sendMessagePromise<T>({
      type: `${PREFIX}${command}`,
      entry_id: this.entryId,
      ...fields,
    });
  }

  subscribe(callback: (config: RosterConfig) => void) {
    return this.connection.subscribeMessage<RosterConfig>(callback, {
      type: `${PREFIX}subscribe`,
      entry_id: this.entryId,
    });
  }

  resolve(start: string, end: string) {
    return this.send<DayDetail[]>("resolve", { start, end });
  }

  preview(
    kind: "rotation" | "variation",
    draft: object,
    start: string,
    end: string,
  ) {
    return this.send<DayDetail[]>("preview", { start, end, [kind]: draft });
  }

  create<T>(kind: ItemKind, item: object) {
    return this.send<T>(`${kind}/create`, { item });
  }

  update<T>(kind: ItemKind, itemId: string, item: object) {
    return this.send<T>(`${kind}/update`, { item_id: itemId, item });
  }

  remove(kind: ItemKind, itemId: string, replaceWith?: string) {
    return this.send<void>(`${kind}/delete`, {
      item_id: itemId,
      ...(replaceWith ? { replace_with: replaceWith } : {}),
    });
  }

  setException(date: string, assignment: DayAssignment, note?: string) {
    return this.send<RosterException>("exception/set", {
      date,
      assignment,
      note: note || null,
    });
  }

  clearException(date: string) {
    return this.send<void>("exception/clear", { date });
  }

  exportData() {
    return this.send<RosterConfig>("export");
  }

  importData(data: unknown) {
    return this.send<RosterConfig>("import", { data });
  }
}
