export interface SavedAddress {
  id: string;
  label: string;
  name: string;
  street: string;
  city: string;
  state: string;
  isDefault: boolean;
}

export type NewSavedAddress = Omit<SavedAddress, "id" | "isDefault">;

const LEGACY_STORAGE_KEY = "elshalom-addresses";

function storageKey(userId: string) {
  return `${LEGACY_STORAGE_KEY}:${userId}`;
}

function normalizeAddresses(value: unknown): SavedAddress[] {
  if (!Array.isArray(value)) return [];

  const addresses = value
    .filter((address): address is Record<string, unknown> => Boolean(address) && typeof address === "object")
    .map((address) => ({
      id: typeof address.id === "string" ? address.id : crypto.randomUUID(),
      label: typeof address.label === "string" && address.label.trim() ? address.label : "Home",
      name: typeof address.name === "string" ? address.name.trim() : "",
      street: typeof address.street === "string" ? address.street.trim() : "",
      city: typeof address.city === "string" ? address.city.trim() : "",
      state: typeof address.state === "string" ? address.state.trim() : "",
      isDefault: address.isDefault === true,
    }))
    .filter((address) => address.name && address.street && address.city && address.state);

  if (addresses.length > 0 && !addresses.some((address) => address.isDefault)) {
    addresses[0].isDefault = true;
  }

  let foundDefault = false;
  return addresses.map((address) => {
    if (!address.isDefault) return address;
    if (foundDefault) return { ...address, isDefault: false };
    foundDefault = true;
    return address;
  });
}

export function readSavedAddresses(userId: string): SavedAddress[] {
  if (typeof window === "undefined") return [];

  const key = storageKey(userId);
  const scopedValue = window.localStorage.getItem(key);

  try {
    if (scopedValue) {
      return normalizeAddresses(JSON.parse(scopedValue));
    }

    // Move addresses saved by the previous account screen into this user's
    // address book the first time they visit after this update.
    const legacyValue = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyValue) return [];

    const migrated = normalizeAddresses(JSON.parse(legacyValue));
    writeSavedAddresses(userId, migrated);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    return migrated;
  } catch {
    window.localStorage.removeItem(key);
    return [];
  }
}

export function writeSavedAddresses(userId: string, addresses: SavedAddress[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(userId), JSON.stringify(normalizeAddresses(addresses)));
}

export function createSavedAddress(address: NewSavedAddress, isDefault = false): SavedAddress {
  return {
    ...address,
    id: crypto.randomUUID(),
    isDefault,
  };
}
