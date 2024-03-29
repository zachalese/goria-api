/** @format */

import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

import { BaseController } from "../BaseController";
import { Address, User, Roles, IUser } from "../../models";

export class UserController extends BaseController {
  private static populates = "billing_address shipping_address image";

  public async create(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const validation = [];
    if (!req.body.firstName) validation.push("firstName");
    if (!req.body.lastName) validation.push("lastName");
    if (!req.body.password) validation.push("password");
    if (!req.body.email) validation.push("email");
    if (req.body.username) validation.push("!username");
    if (req.body.role) validation.push("!role");
    if (req.body.twilio) validation.push("!twilio");
    if (req.body.billing_address) validation.push("!billing_address");
    if (req.body.shipping_address) validation.push("!shipping_address");
    if (req.body.image) validation.push("!image");

    if (validation.length !== 0)
      return res
        .status(400)
        .send({ error: { validation: validation.toLocaleString() } });

    try {
      let user = await User.create({
        ...req.body,
        role: Roles.USER,
        username: req.body.email,
      });
      user = await User.findById(user._id);
      return res.status(201).send(user);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  public async read(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req?.params?.id;

    if (!id) return res.status(400).send({ error: "id not found." });

    try {
      const user = await User.findById(id).populate(UserController.populates);
      if (user) delete user.password;
      return user
        ? res.status(200).send(user)
        : res.status(404).send({ error: "not found" });
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  public async read_all(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const query: Partial<IUser> = {};

    for (const index in req.query)
      query[index] =
        typeof req.query === "object" // is Array
          ? {
              $in: req.query[index],
            }
          : req.query[index];

    try {
      const users = await User.find(query).populate(UserController.populates);
      return res.status(200).send(users);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  public async update(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    const validation = [];
    if (req.body._id) validation.push("!_id");
    if (req.body.username) validation.push("!username");
    if (req.body.role) validation.push("!role");
    if (req.body.twilio) validation.push("!twilio");
    if (req.body.billing_address) validation.push("!billing_address");
    if (req.body.shipping_address) validation.push("!shipping_address");
    if (req.body.image) validation.push("!image");

    if (validation.length !== 0)
      return res
        .status(400)
        .send({ error: { validation: validation.toLocaleString() } });

    try {
      let user = await User.findById(id);
      for (const record in req.body) user[record] = req.body[record];
      user = await user.save();
      return res.status(200).send(user);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  public async delete(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    try {
      await Address.deleteMany({
        user: id,
      });
      const response = await User.deleteOne({
        _id: id,
      });
      return res.status(200).send(response);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
}

export const userController = new UserController();
