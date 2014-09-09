module StateMachine {
    export interface IState {
        onEnter ? : (root ? : StateChart) => void;
        onExit ? : (root ? : StateChart) => void;
        onUpdate ? : (root ? : StateChart) => boolean;
        subStateChart ? : StateChart;
        transitions ? : {
            [transition: string]: (root ? : StateChart) => IState; // if returns false, then transition fails
        }
    }

    export class StateChart {
        currentState: IState = null;
        nextState: IState = null;
        states: {
            [name: string]: IState
        } = {};

        private getNextState(state: IState): IState {
            var foundCurrentState = (state === null);

            for (var i in this.states) {
                if (foundCurrentState)
                    return this.states[i];

                foundCurrentState = this.states[i] === state;
            }

            return null;
        }

        addState(name: string, state: IState): StateChart {
            if (state && !this.nextState)
                this.nextState = state;

            this.states[name] = state;
            return this;
        }

        transition(name: string): boolean {
            if (this.currentState && this.currentState[name])
                this.nextState = this.currentState[name](this);

            return this.nextState !== null;
        }

        update() {
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
        }
    }
}
