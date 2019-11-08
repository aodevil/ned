import shortId from 'shortid';
import { post, ROUTES } from '../services/post';
import { ACTIONS } from '../services/constants';
import errors from "../services/errors";

export class Disciplina {
    constructor(i) {
        if (i) {
            this.copy(i);
        } else {
            this.init();
        }
    }

    init() {
        this.ID = shortId.generate();
        this.nombre = '';
    }

    copy(i) {
        this.ID = i.ID || shortId.generate();
        this.nombre = i.nombre || '';
    }

    static async fetch(network, token, data={}, processDidEnd, route = ROUTES.DISCIPLINA, action=ACTIONS.select){
        if(network){
            let response = await post(route, {action, ...data}, token);
            processDidEnd(response);
        }else{
            processDidEnd({
                error:errors.network
            });
        }
    }

    static extract (items = []) {
        const labels = [];
        for (let i of items) {
            labels.push(i.nombre);
        }
        return labels;
    }
}