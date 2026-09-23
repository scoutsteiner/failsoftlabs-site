import { describe, expect, it } from "vitest";
import { calculateSubnet } from "../lib/subnet";

describe("calculateSubnet", () => {
  it("calculates a typical private /24 network", () => {
    const result = calculateSubnet("192.168.10.42", "24");

    expect(result.networkAddress).toBe("192.168.10.0");
    expect(result.broadcastAddress).toBe("192.168.10.255");
    expect(result.firstUsableAddress).toBe("192.168.10.1");
    expect(result.lastUsableAddress).toBe("192.168.10.254");
    expect(result.usableHosts).toBe(254);
    expect(result.addressType).toBe("private");
  });

  it("accepts subnet mask notation", () => {
    const result = calculateSubnet("10.42.7.19", "255.255.255.240");

    expect(result.cidrPrefix).toBe(28);
    expect(result.networkAddress).toBe("10.42.7.16");
    expect(result.broadcastAddress).toBe("10.42.7.31");
  });

  it("handles /31 point-to-point networks", () => {
    const result = calculateSubnet("203.0.113.8", "31");

    expect(result.totalAddresses).toBe(2);
    expect(result.usableHosts).toBe(2);
    expect(result.firstUsableAddress).toBe("203.0.113.8");
    expect(result.lastUsableAddress).toBe("203.0.113.9");
    expect(result.specialBehavior).toContain("/31");
  });

  it("handles /32 host routes", () => {
    const result = calculateSubnet("8.8.8.8/32", "");

    expect(result.totalAddresses).toBe(1);
    expect(result.usableHosts).toBe(1);
    expect(result.firstUsableAddress).toBe("8.8.8.8");
    expect(result.lastUsableAddress).toBe("8.8.8.8");
  });

  it("rejects malformed addresses", () => {
    expect(() => calculateSubnet("192.168.1", "24")).toThrow();
    expect(() => calculateSubnet("192.168.1.999", "24")).toThrow();
    expect(() => calculateSubnet("192.168.001.1", "24")).toThrow();
  });
});
