import { Request, Response } from 'express';
import knex from '../database/conection';
import ip from 'ip';

class ItemsContloller {
    async index(request: Request, response:Response) {

        const myIp = ip.address();
        
        const items = await knex('items').select('*');
    
        const serializedItems = items.map(item => {
            return {
                id: item.id,
                title: item.title,
                image_url: 'http://' + myIp + ':3333/uploads/' + item.image
            }
        })
    
        return response.json(serializedItems);
    }
}

export default ItemsContloller;


