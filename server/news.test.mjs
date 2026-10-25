import test from "node:test";
import assert from "node:assert/strict";
import { stableNewsId } from "./news.mjs";

test("news cache IDs are stable for the same canonical URL", () => {
  assert.equal(
    stableNewsId("https://example.com/story"),
    stableNewsId("https://example.com/story"),
  );
});

test("different canonical URLs receive different database IDs", () => {
  assert.notEqual(
    stableNewsId("https://example.com/story-a"),
    stableNewsId("https://example.com/story-b"),
  );
});

test("news cache IDs use the complete SHA-256 digest", () => {
  assert.match(
    stableNewsId("https://example.com/story"),
    /^news:[a-f0-9]{64}$/,
  );
});

test("items without a URL use a deterministic title fallback", () => {
  assert.equal(stableNewsId("", "Robotics update"), stableNewsId("", "Robotics update"));
  assert.notEqual(stableNewsId("", "Robotics update"), stableNewsId("", "AI update"));
});
