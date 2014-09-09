var StateMachine;
(function (StateMachine) {
    var StateChart = (function () {
        function StateChart() {
            this.currentState = null;
            this.nextState = null;
            this.states = {};
        }
        StateChart.prototype.getNextState = function (state) {
            var foundCurrentState = (state === null);

            for (var i in this.states) {
                if (foundCurrentState)
                    return this.states[i];

                foundCurrentState = this.states[i] === state;
            }

            return null;
        };

        StateChart.prototype.addState = function (name, state) {
            if (state && !this.nextState)
                this.nextState = state;

            this.states[name] = state;
            return this;
        };

        StateChart.prototype.transition = function (name) {
            if (this.currentState && this.currentState[name])
                this.nextState = this.currentState[name](this);

            return this.nextState !== null;
        };

        StateChart.prototype.update = function () {
            if (!this.currentState && this.nextState) {
                this.currentState = this.nextState;
                if (this.nextState && this.nextState.onEnter)
                    this.nextState.onEnter(this);
                this.nextState = this.getNextState(this.currentState);
            }

            if (this.currentState) {
                var isFinished = true;
                if (this.currentState.onUpdate)
                    isFinished = this.currentState.onUpdate(this);

                if (isFinished) {
                    if (this.currentState.onExit)
                        this.currentState.onExit(this);
                    this.currentState = null;
                }
            }
        };
        return StateChart;
    })();
    StateMachine.StateChart = StateChart;
})(StateMachine || (StateMachine = {}));
