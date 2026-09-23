export type AddressType =
  | "private"
  | "public"
  | "loopback"
  | "link-local"
  | "multicast"
  | "reserved";

export interface SubnetResult {
  normalizedIp: string;
  cidrPrefix: number;
  subnetMask: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableAddress: string;
  lastUsableAddress: string;
  totalAddresses: number;
  usableHosts: number;
  addressType: AddressType;
  binaryIp: string;
  binaryMask: string;
  specialBehavior?: string;
}

const OCTET_PATTERN = /^(0|[1-9]\d{0,2})$/;

export function calculateSubnet(ipInput: string, prefixInput: string): SubnetResult {
  const parsed = parseInputs(ipInput, prefixInput);
  const mask = prefixToMask(parsed.prefix);
  const wildcard = (~mask) >>> 0;
  const network = (parsed.ipNumber & mask) >>> 0;
  const size = 2 ** (32 - parsed.prefix);
  const broadcast = (network + size - 1) >>> 0;
  const usable = usableRange(network, broadcast, parsed.prefix);

  return {
    normalizedIp: numberToIp(parsed.ipNumber),
    cidrPrefix: parsed.prefix,
    subnetMask: numberToIp(mask),
    wildcardMask: numberToIp(wildcard),
    networkAddress: numberToIp(network),
    broadcastAddress: numberToIp(broadcast),
    firstUsableAddress: numberToIp(usable.first),
    lastUsableAddress: numberToIp(usable.last),
    totalAddresses: size,
    usableHosts: usable.count,
    addressType: classifyAddress(parsed.ipNumber),
    binaryIp: toBinary(parsed.ipNumber),
    binaryMask: toBinary(mask),
    specialBehavior: usable.note,
  };
}

export function parseIp(ip: string): number {
  const trimmed = ip.trim();
  const parts = trimmed.split(".");

  if (parts.length !== 4 || parts.some((part) => !OCTET_PATTERN.test(part))) {
    throw new Error("Enter a valid IPv4 address with four octets from 0 to 255.");
  }

  const octets = parts.map(Number);
  if (octets.some((octet) => octet > 255)) {
    throw new Error("IPv4 octets must be between 0 and 255.");
  }

  return (
    ((octets[0] << 24) >>> 0) +
    (octets[1] << 16) +
    (octets[2] << 8) +
    octets[3]
  ) >>> 0;
}

export function numberToIp(value: number): string {
  return [
    (value >>> 24) & 255,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255,
  ].join(".");
}

function parseInputs(ipInput: string, prefixInput: string) {
  const [addressPart, inlinePrefix, extra] = ipInput.trim().split("/");
  if (extra !== undefined) {
    throw new Error("Use only one CIDR slash in the IPv4 address field.");
  }

  const prefixValue = inlinePrefix ?? prefixInput;
  if (!prefixValue || !prefixValue.trim()) {
    throw new Error("Enter a CIDR prefix or subnet mask.");
  }

  return {
    ipNumber: parseIp(addressPart),
    prefix: parsePrefix(prefixValue),
  };
}

function parsePrefix(value: string): number {
  const trimmed = value.trim().replace(/^\//, "");

  if (trimmed.includes(".")) {
    return maskToPrefix(parseIp(trimmed));
  }

  if (!/^(0|[1-9]\d?)$/.test(trimmed)) {
    throw new Error("CIDR prefix must be a number from 0 to 32 or a valid subnet mask.");
  }

  const prefix = Number(trimmed);
  if (prefix < 0 || prefix > 32) {
    throw new Error("CIDR prefix must be between 0 and 32.");
  }

  return prefix;
}

function maskToPrefix(mask: number): number {
  const bits = mask.toString(2).padStart(32, "0");
  if (!/^1*0*$/.test(bits)) {
    throw new Error("Subnet mask must use contiguous one bits followed by zero bits.");
  }

  return bits.indexOf("0") === -1 ? 32 : bits.indexOf("0");
}

function prefixToMask(prefix: number): number {
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
}

function usableRange(network: number, broadcast: number, prefix: number) {
  if (prefix === 32) {
    return {
      first: network,
      last: network,
      count: 1,
      note: "/32 describes one single host address.",
    };
  }

  if (prefix === 31) {
    return {
      first: network,
      last: broadcast,
      count: 2,
      note: "/31 networks are commonly used for point-to-point links, so both addresses can be usable.",
    };
  }

  return {
    first: (network + 1) >>> 0,
    last: (broadcast - 1) >>> 0,
    count: Math.max(0, 2 ** (32 - prefix) - 2),
  };
}

function classifyAddress(ip: number): AddressType {
  const first = (ip >>> 24) & 255;
  const second = (ip >>> 16) & 255;

  if (first === 10 || (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168)) {
    return "private";
  }

  if (first === 127) return "loopback";
  if (first === 169 && second === 254) return "link-local";
  if (first >= 224 && first <= 239) return "multicast";
  if (first === 0 || first >= 240 || (first === 192 && second === 0)) return "reserved";

  return "public";
}

function toBinary(value: number): string {
  return [24, 16, 8, 0]
    .map((shift) => ((value >>> shift) & 255).toString(2).padStart(8, "0"))
    .join(".");
}
