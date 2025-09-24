class Timer {
  constructor(workTime, breakTime, rounds) {
    this.workTime = workTime;
    this.breakTime = breakTime;
    this.totalRounds = rounds;
    this.reset();
    this.listeners = [];
  }

  reset() {
    this.rounds = this.totalRounds;
    this.status = "stop";
    this.startTime = null;
    this.endTime = null;
    clearInterval(this.timer);
  }

  start() {
    if (this.status === "stop" || this.status === "finished") {
      this.status = "work";
      this.startTime = Date.now();
      this.endTime = this.startTime + this.workTime * 60000;
    }

    this.timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.round((this.endTime - now) / 1000));

      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;

      this.notify({ minutes, seconds, rounds: this.rounds, status: this.status });

      if (remaining <= 0) {
        this.advance();
      }
    }, 1000);
  }

  advance() {
    clearInterval(this.timer);
    if (this.rounds <= 0 && this.status === "work") {
      this.status = "finished";
      this.notify({ minutes: 0, seconds: 0, rounds: 0, status: "finished" });
      return;
    }
    if (this.status === "work") {
      this.status = "break";
      this.startTime = Date.now();
      this.endTime = this.startTime + this.breakTime * 60000;
    } else if (this.status === "break") {
      this.status = "work";
      this.rounds--;
      this.startTime = Date.now();
      this.endTime = this.startTime + this.workTime * 60000;
    }
    this.start(); // reinicia el ciclo
  }

  stop() {
    this.reset();
  }

  pause() {
    clearInterval(this.timer);
  }

  next() {
    this.advance();
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify(state) {
    this.listeners.forEach((l) => l(state));
  }
}

module.exports = Timer;
