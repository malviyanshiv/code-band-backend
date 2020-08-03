import request from "supertest";
import app from "../src/app";
import Users from "../src/models/Users";

beforeEach(async () => {
    await Users.deleteMany();
});

test("Should create a new user", async () => {
    await request(app)
        .post("/api/users")
        .send({
            username: "malviyanshiv",
            email: "malviyanshiv@gmail.com",
            password: "welcome@codeband",
            name: "Shiv Shankar Singh",
        })
        .expect(201);
});
