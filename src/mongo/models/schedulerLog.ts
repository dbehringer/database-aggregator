import { IChangeData } from 'process-scheduler';
import { ISchedulerStatus } from '../../internalTypes';
import { getSchedulerLog } from '../model';

const Model = getSchedulerLog();

function sortState(a: ISchedulerStatus, b: ISchedulerStatus) {
  const byDate = Number(b.date) - Number(a.date);
  if (byDate !== 0) {
    return byDate;
  } else {
    // @ts-ignore
    return String(b._id).localeCompare(String(a._id));
  }
}

export async function getLastState(taskId: string) {
  const doc = await getLastTask(taskId, {
    'state.stdout': 0,
    'state.stderr': 0
  });
  if (!doc) {
    return doc;
  }
  const state = doc.state.sort(sortState)[0];

  return state;
}

export async function updateOutstandingTasks() {
  return Model.updateMany(
    {
      state: {
        $not: {
          $elemMatch: { status: { $in: ['success', 'error', 'interrupted'] } }
        }
      }
    },
    {
      $push: {
        state: {
          status: 'interrupted',
          date: new Date()
        }
      }
    }
  ).exec();
}

export function getLastTask(taskId: string, select?: any) {
  return Model.findOne({ taskId })
    .sort('-date')
    .select(select)
    .exec();
}

interface ITaskOptions {
  from: number;
  to: number;
}

export async function getTasks(
  taskId: string | string[],
  options: ITaskOptions
) {
  if (Number.isNaN(options.to) || Number.isNaN(options.from)) {
    throw new Error('to and from must be numbers');
  }

  if (options.to && options.from && options.to < options.from) {
    throw new Error('to must be greater than from');
  }
  const dateParams: any = {};
  if (options.from) {
    dateParams.$gt = new Date(options.from);
  }
  if (options.to) {
    dateParams.$lt = new Date(options.to);
  }

  const filter: any = {};

  if (Array.isArray(taskId)) {
    filter.taskId = {
      $in: taskId
    };
  } else {
    filter.taskId = taskId;
  }
  if (options.from !== undefined && options.to !== undefined) {
    filter.date = dateParams;
  }

  const result = await Model.find(filter)
    .sort({
      date: -1
    })
    .select({ _id: 0, __v: 0 });
  return result;
}

export async function save(obj: IChangeData) {
  const stat = {
    status: obj.status,
    date: new Date(),
    reason: obj.reason,
    message: obj.message,
    stdout: obj.stdout,
    stderr: obj.stderr
  };

  function update() {
    return Model.findOneAndUpdate(
      { pid: obj.pid },
      {
        $push: { state: stat },
        taskId: obj.id,
        date: new Date(),
        pid: obj.pid
      },
      {
        upsert: true,
        new: true
      }
    ).exec();
  }

  while (true) {
    try {
      return await update();
    } catch (e) {
      // This error can happen if two upserts with the same pid are done very
      // quickly
      if (e.codeName !== 'DuplicateKey') {
        throw e;
      }
    }
  }
}
