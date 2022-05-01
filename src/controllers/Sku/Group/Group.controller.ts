/** @format */

import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

import { BaseController } from "../../BaseController";
import { Group } from "../../../models";

export class GroupController extends BaseController {
  private static populates = "";

  public async create(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    const validation = [];
    if (!req.body.name) validation.push("name");
    if (!req.body.sku_shortcode) validation.push("sku_shortcode");
    if (!req.body.display) validation.push("display");

    if (validation.length !== 0)
      return res.status(400).send({
        error: { validation: validation.toLocaleString() },
      });

    try {
      const user: any = req.user;
      if (!user.admin() && String(user._id) !== id)
        return res.status(400).send({ error: "not authorized" });

      let group = await new Group({
        ...req.body,
      }).save();
      group = await Group.findById(group._id).populate(
        GroupController.populates
      );
      return res.status(201).send(group);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  public async read(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    try {
      const group = await Group.findById(id).populate(
        GroupController.populates
      );

      return group
        ? res.status(200).send(group)
        : res.status(404).send({ error: "not found" });
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  public async read_all(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    try {
      const groups = await Group.find({}).populate(GroupController.populates);
      return res.status(200).send(groups);
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

    if (validation.length !== 0)
      return res.status(400).send({
        error: { validation: validation.toLocaleString() },
      });

    try {
      let group = await Group.findById(id);

      if (!group) return res.status(404).send({ error: "not found" });

      for (const index in req.body) group[index] = req.body[index];
      group = await group.save();
      group = await Group.findById(group._id).populate(
        GroupController.populates
      );
      return res.status(200).send(group);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  public async delete(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    const validation = [];

    if (validation.length !== 0)
      return res
        .status(400)
        .send({ error: { validation: validation.toLocaleString() } });

    try {
      let user: any = req.user;
      if (!user.admin())
        if (!user) return res.status(400).send({ error: "not authorized" });

      const response = await Group.deleteOne({
        _id: id,
      });
      return res.status(200).send(response);
    } catch (error) {
      return res.status(400).send({ error });
    }
  }
}

export const groupController = new GroupController();