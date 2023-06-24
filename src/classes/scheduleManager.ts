import schedule from 'node-schedule';

export class ScheduleManager<T> {
    private sheduleMap: Map<T, schedule.Job>;

    constructor() {
        this.sheduleMap = new Map();
    }

    addRecurrentJob(id: T, hours: number, minutes: number, scheduledJob: () => void) {
        const rule = new schedule.RecurrenceRule();
        rule.hour = hours;
        rule.minute = minutes;
        const job = schedule.scheduleJob(rule, scheduledJob);
        this.sheduleMap.set(id,job)
    }

    addOneTimeJob(id: T, date: Date, scheduledJob: () => void) {
        const job = schedule.scheduleJob(date, scheduledJob);
        this.sheduleMap.set(id, job)
    }

    hasJob(id: T) {
        return this.sheduleMap.has(id);
    }

    cancelJob(id: T) {
        if (this.sheduleMap.has(id)) {
            const job = this.sheduleMap.get(id);
            job.cancel();
            this.sheduleMap.delete(id);
        }
    }
}