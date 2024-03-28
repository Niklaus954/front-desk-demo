export class TaskSynchronizer {

    private resolveMap = {};

    private taskMap = {};

    public addTaskKey(key: string): void {
        this.taskMap[key] = new Promise(resolve => this.resolveMap[key] = resolve);
    }

    public finishTaskKey(key: string): void {
        this.resolveMap[key]();
    }

    public waitAll(): Promise<any> {
        return new Promise((resolve, reject) => {
            const promiseList = [];
            for (const k in this.taskMap) {
                promiseList.push(this.taskMap[k]);
            }
            Promise.all(promiseList).then(() => resolve()).catch(e => reject(e));
        })
    }
}