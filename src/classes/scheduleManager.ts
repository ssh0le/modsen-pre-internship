import schedule from 'node-schedule';

const rule = new schedule.RecurrenceRule();

const job = schedule.scheduleJob(rule, function () {
    console.log('asdasd')
})

interface ScheduleElement<T> {
    id: T,
    job: schedule.Job,
}

export class ScheduleManager<T> {
    _sheduleList: ScheduleElement<T>[];

    constructor() {
        this._sheduleList = []
    }

    addRecurrentJob(id: T, hours: number, minutes: number, scheduledJob: () => void) {
        const rule = new schedule.RecurrenceRule();
        rule.hour = hours;
        rule.minute = minutes;
        const job = schedule.scheduleJob(rule, scheduledJob);
        this._sheduleList.push({
            id,
            job
        })
    }

    addOneTimeJob(id: T, date: Date, scheduledJob: () => void) {
        const job = schedule.scheduleJob(date, scheduledJob);
        this._sheduleList.push({
            id,
            job
        })
    }

    cancelJob(id: T) {
        const [element] = this._sheduleList.filter(j => j.id === id);
        if (element) {
            element.job.cancel();
            this._sheduleList = this._sheduleList.filter(j => j.id !== id);
        }
    }
}