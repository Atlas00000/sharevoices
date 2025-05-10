import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database';
import { Notification } from '../models/Notification';

export class NotificationController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(Notification);
      const notifications = await repo.find();
      res.json(notifications);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(Notification);
      const notification = await repo.findOneBy({ id: req.params.id });
      if (!notification) return res.status(404).json({ message: 'Notification not found' });
      res.json(notification);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(Notification);
      const notification = repo.create(req.body);
      await repo.save(notification);
      res.status(201).json(notification);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(Notification);
      let notification = await repo.findOneBy({ id: req.params.id });
      if (!notification) return res.status(404).json({ message: 'Notification not found' });
      repo.merge(notification, req.body);
      await repo.save(notification);
      res.json(notification);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(Notification);
      const notification = await repo.findOneBy({ id: req.params.id });
      if (!notification) return res.status(404).json({ message: 'Notification not found' });
      await repo.remove(notification);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
} 