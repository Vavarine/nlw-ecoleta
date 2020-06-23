import { Request, Response } from 'express';
import knex from '../database/conection';
import Knex, { KnexTimeoutError } from 'knex';
import ip from 'ip';

class PointsController {
    async index(request: Request, response: Response) {
        const myIp = ip.address()
        const { city, uf, items } = request.query;

        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim()));

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: 'http://' + myIp + ':3333/uploads/' + point.image
            }
        })

        return response.json(serializedPoints);
    }

    async show(request: Request, response: Response) {
        const { id } = request.params;
        const myIp = ip.address();
        
        const point = await knex('points').where('id', id).first();

        if(!point){
            return response.status(400).json({ message: 'point not found' });
        }

        const items = await knex('items')
            .select('items.title')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id);

        const serializedPoint = {
                ...point,
                image_url: 'http://' + myIp + ':3333/uploads/' + point.image
            }
        
        return response.json({ serializedPoint, items});
    }

    async create(request: Request, response: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;

        const point = {
            image: request.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        };  

        const trx = await knex.transaction();
    
        const insertedIds = await trx('points').insert(point); 
        
        const point_id = insertedIds[0];

        const pointItems = items
        .split(',')
        .map((item: string) => Number(item.trim()))
        .map((item_id: number) => {
            return {
                item_id,
                point_id,
            };
        })              

        await trx('point_items').insert(pointItems);
        
        await trx.commit();

        return response.json({
            id: point_id,
            ...point,
        });

    }
}

export default PointsController;