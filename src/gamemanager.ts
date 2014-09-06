/// <reference path="_dependencies.ts" />
module CustomDeck {
    'use strict';

    export class GameManager {
        private roles: string[] = []; // e.g. noughts or crosses, white or black, ...
        private players: string[] = []; // e.g. player1, player2, ...
        private playerRole: {
            [player: string]: string
        };
        private rolePlayer: {
            [role: string]: string
        };

        addRole(role: string) {
            this.roles.push(role);
        }

        removeRole(role: string) {
            var i = this.roles.indexOf(role);
            if (i !== -1) {
                this.roles.splice(i, 1);
                this.clearAssign();
            }
        }

        renameRole(i: number, role: string) {
            this.roles[i] = role;
            this.clearAssign();
        }

        clearRoles() {
            this.roles.length = 0;
            this.clearAssign();
        }

        getRoles(): string[] {
            return this.roles; // ref
        }

        getUnassignedRoles(): string[] {
            var unassigned: string[] = [];

            for (var i = 0; i < this.roles.length; ++i) {
                var role = this.roles[i];
                if (!this.rolePlayer[role])
                    unassigned.push(role);
            }

            return unassigned;
        }

        addPlayer(player: string) {
            this.players.push(player);
        }

        removePlayer(player: string) {
            var i = this.players.indexOf(player);
            if (i !== -1) {
                this.players.splice(i, 1);
                this.clearAssign();
            }
        }

        renamePlayer(i: number, player: string) {
            this.players[i] = player;
            this.clearAssign();
        }

        getPlayers(): string[] {
            return this.players; // ref
        }

        getNumPlayers(): number {
            return this.players.length;
        }

        clearPlayers() {
            this.players.length = 0;
            this.clearAssign();
        }

        // must manually clear the assignment before re-assigning
        assignRole(player: string, role: string) {
            this.playerRole[player] = role;
            this.rolePlayer[role] = player;
        }

        clearAssign() {
            this.playerRole = {};
            this.rolePlayer = {};
        }

        getRole(player: string) {
            return this.playerRole[player];
        }

        getPlayer(role: string) {
            return this.rolePlayer[role];
        }

        save(): any {
            return {
                type: 'GameManager',
                roles: this.roles, // ref
                players: this.players // ref
            }
        }

        load(obj: any) {
            if (obj.type !== 'GameManager')
                return;

            this.clearPlayers();
            this.clearRoles();
            this.clearAssign();

            for (var i = 0; i < obj.roles.length; ++i)
                this.addRole(obj.roles[i]);

            for (var i = 0; i < obj.players.length; ++i)
                this.addPlayer(obj.players[i]);
        }
    }

    export
    var g_gameManager = new GameManager();
}
