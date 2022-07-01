import { DefaultContext } from 'koa';
import Joi from 'joi';
import User from '../../models/user';

const exerciseSchema = Joi.object().keys({
  exercise: Joi.string().required(),
  weight: Joi.number().min(1),
  numberOfTimes: Joi.number().min(1),
  numberOfSets: Joi.number().min(1).max(20),
});

export const addRoutine = async (ctx: DefaultContext) => {
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(20).required(),
    routineId: Joi.string().required(),
    title: Joi.string().required(),
    weekRoutine: Joi.array().items(Joi.array().items(exerciseSchema)),
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { username, routineId, title, weekRoutine } = ctx.request.body;
  try {
    const user = await User.findByUsername(username);
    if (!user) {
      ctx.status = 401;
      return;
    }
    user.routine.push({
      routineId,
      title,
      weekRoutine,
    });
    await user.save();
    ctx.body = user.serialize();
  } catch (e) {
    ctx.throw(500, e as Error);
  }
};

export const removeRoutine = async (ctx: DefaultContext) => {
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(20).required(),
    routineId: Joi.string().required(),
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { username, routineId } = ctx.request.body;
  try {
    const user = await User.findByUsername(username);
    if (!user) {
      ctx.status = 401;
      return;
    }
    user.routine = user.routine.filter((item) => item.routineId !== routineId);
    await user.save();
    ctx.body = user.serialize();
  } catch (e) {
    ctx.throw(500, e as Error);
  }
};
