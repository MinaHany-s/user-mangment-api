import { Request, Response, NextFunction } from "express";
import { FilterQuery } from "mongoose";
import { User, UserFields } from "../models/User";
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema,
  userIdSchema,
} from "../validators/user.validator";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseUserId(value: string): string {
  return userIdSchema.parse(value);
}

export async function listUsers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = listUsersQuerySchema.parse(req.query);
    const filter: FilterQuery<UserFields> = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      const search = new RegExp(escapeRegex(query.search), "i");
      filter.$or = [
        { firstName: search },
        { lastName: search },
        { email: search },
      ];
    }

    const skip = (query.page - 1) * query.limit;
    const sortOrder = query.order === "asc" ? 1 : -1;
    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ [query.sortBy]: sortOrder })
        .skip(skip)
        .limit(query.limit)
        .exec(),
      User.countDocuments(filter).exec(),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseUserId(req.params.id);
    const user = await User.findById(id).exec();

    if (!user) {
      res.status(404).json({ success: false, error: { message: "User not found" } });
      return;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = createUserSchema.parse(req.body);
    const user = await User.create(input);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseUserId(req.params.id);
    const input = updateUserSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(id, { $set: input }, {
      new: true,
      runValidators: true,
    }).exec();

    if (!user) {
      res.status(404).json({ success: false, error: { message: "User not found" } });
      return;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseUserId(req.params.id);
    const user = await User.findByIdAndDelete(id).exec();

    if (!user) {
      res.status(404).json({ success: false, error: { message: "User not found" } });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
