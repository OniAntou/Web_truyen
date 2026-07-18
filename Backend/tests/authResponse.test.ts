import assert from "node:assert/strict";
import test from "node:test";
import { buildAdminAuthResponse, buildUserAuthResponse } from "../src/utils/authResponse";

test("browser auth responses expose identity data without serializing a JWT", () => {
  const userResponse = buildUserAuthResponse("Welcome", {
    id: "user-1",
    username: "reader",
    email: "reader@example.com",
    role: "user",
  });
  const adminResponse = buildAdminAuthResponse("Welcome", "admin");

  assert.deepEqual(userResponse, {
    message: "Welcome",
    user: {
      id: "user-1",
      username: "reader",
      email: "reader@example.com",
      role: "user",
    },
  });
  assert.deepEqual(adminResponse, { message: "Welcome", admin: { username: "admin" } });
  assert.equal("token" in userResponse, false);
  assert.equal("token" in adminResponse, false);
});
