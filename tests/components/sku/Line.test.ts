/** @format */
import { connect, disconnect } from "mongoose";
import request from "supertest";

import { User, IUser, Roles, Line } from "../../../src/models";
import { app } from "../../../src/server";
import { JWT_AUTH_HEADER } from "../../../src/config";

const admin_body = {
  firstName: "Munchkin",
  lastName: "Confidential",
  password: "password",
  email: "munchkinconfidential@munchkin.com",
  role: Roles.ADMIN,
  username: "munchkinconfidential",
};

const user_body = {
  firstName: "John",
  lastName: "Doe",
  password: "password",
  email: "johndoe@email.com",
  role: Roles.USER,
  username: "johndoe@email.com",
};

const line_body = {
  name: "Group",
  sku_shortcode: "GR",
  display: true,
};

describe("Line Tests", () => {
  let admin: IUser;
  let user: IUser;
  let jwt_admin: string;
  let jwt_user: string;

  const setup = async () => {
    await User.deleteMany({});
    await Line.deleteMany({});

    admin = new User(admin_body);
    admin = await admin.save();

    user = new User(user_body);
    user = await user.save();

    let res = await request(app).post("/authorization").send({
      username: user_body.username,
      password: user_body.password,
    });

    jwt_user = res.header[JWT_AUTH_HEADER];

    res = await request(app).post("/authorization").send({
      username: admin_body.username,
      password: admin_body.password,
    });

    jwt_admin = res.header[JWT_AUTH_HEADER];
  };

  beforeAll(async () => {
    await connect(global.__MONGO_URI__, { autoIndex: true });
  });

  afterAll(async () => {
    await disconnect();
  });

  test("0. setup", async () => {
    await setup();

    expect(user).toBeDefined();
    expect(jwt_user).toBeDefined();
    expect(admin).toBeDefined();
    expect(jwt_admin).toBeDefined();
  });

  test("1. line create endpoint performs correctly", async () => {
    let res = await request(app)
      .post("/sku/line")
      .set(JWT_AUTH_HEADER, jwt_admin)
      .send(line_body);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body).toEqual({
      ...line_body,
      _id: res.body._id,
      createdAt: res.body.createdAt,
      updatedAt: res.body.updatedAt,
    });
  });

  test("2. line create endpoint security check", async () => {
    let res = await request(app)
      .post("/sku/line")
      .set(JWT_AUTH_HEADER, jwt_user)
      .send(line_body);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ error: "unauthorized" });
  });
});
