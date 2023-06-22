import schedule from 'node-schedule';

export class ScheduleManager<T> {
    _sheduleList: Map<T, schedule.Job>;

    constructor() {
        this._sheduleList = new Map();
    }

    addRecurrentJob(id: T, hours: number, minutes: number, scheduledJob: () => void) {
        const rule = new schedule.RecurrenceRule();
        rule.hour = hours;
        rule.minute = minutes;
        const job = schedule.scheduleJob(rule, scheduledJob);
        this._sheduleList.set(id,job)
    }

    addOneTimeJob(id: T, date: Date, scheduledJob: () => void) {
        const job = schedule.scheduleJob(date, scheduledJob);
        this._sheduleList.set(id, job)
    }

    cancelJob(id: T) {
        if (this._sheduleList.has(id)) {
            const job = this._sheduleList.get(id);
            job.cancel();
            this._sheduleList.delete(id);
        }
    }
}