/** @format */

import mongoose, { Schema, model, NativeError } from "mongoose";
import mongooseDeepPopulate from "mongoose-deep-populate";
import { Document } from "mongodb";
import { IUser, User } from "..";

// 1. Create an interface representing a document in MongoDB.
export interface IAddress {
  _id: Schema.Types.ObjectId;
  name: string;
  address1: string;
  address2?: string;
  zip: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  twilio?: string;
  instructions?: string;
  user: Schema.Types.ObjectId | IUser;
  billing?: boolean;
  shipping?: boolean;
  _createdAt?: string;
  _updatedAt?: string;
  save(): IAddress | PromiseLike<IAddress>;
}

// 2. Create a Schema corresponding to the document interface.
const AddressSchema = new Schema(
  {
    name: { type: String, required: true },
    address1: { type: String, required: true },
    address2: { type: String, required: false },
    zip: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    twilio: { type: String, required: false },
    instructions: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    billing: { type: Boolean, required: false, default: false },
    shipping: { type: Boolean, required: false, default: false },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "_createdAt", updatedAt: "_updatedAt" },
  }
);

AddressSchema.plugin(mongooseDeepPopulate(mongoose), {});

AddressSchema.pre(
  "save",
  async function (
    this: Document,
    next: (err?: NativeError) => void,
    data: any
  ) {
    if (this.isModified("billing")) {
      if (this.billing === true) {
        await Address.updateMany(
          {
            user: this.user,
          },
          {
            billing: false,
          }
        );
        await User.updateOne(
          {
            _id: this.user,
          },
          {
            billing_address: this._id,
          }
        );
      } else {
        const user = await User.findById(this.user);
        if (String(user.billing_address) === String(this._id)) {
          user.billing_address = null;
          await this.user.save();
        }
      }
    }

    if (this.isModified("shipping")) {
      if (this.shipping === true) {
        await Address.updateMany(
          {
            user: this.user,
          },
          {
            shipping: false,
          }
        );
        await User.updateOne(
          {
            _id: this.user,
          },
          {
            shipping_address: this._id,
          }
        );
      } else {
        const user = await User.findById(this.user);
        if (String(user.shipping_address) === String(this._id)) {
          user.shipping_address = null;
          await this.user.save();
        }
      }
    }

    if (this.isModified("phone")) {
      let twilio = this.phone.replace(/\D/g, "");
      if (twilio.length === 10) twilio = "1" + twilio;
      this.twilio = twilio;
    }

    return next();
  }
);

// AddressSchema.post("deleteOne", async (reponse) => {});

// AddressSchema.post("deleteMany", async (reponse) => {});

// 3. Create a Model.
export const Address = model<IAddress>("Address", AddressSchema);
