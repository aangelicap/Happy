import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import orphanageView from '../views/orphanages_view';
import Orphanage from '../models/Orphanage';
import * as Yup from 'yup';

export default {
    async show(request: Request, response: Response) {
        const { id } = request.params;

        const orphanagesRepository = getRepository(Orphanage);

        const orphanage = await orphanagesRepository.findOneOrFail(id, {
            relations: ['images']
        });

        return response.json(orphanageView.render(orphanage));
    },

    async index(request: Request, response: Response) {
        const orphanagesRepository = getRepository(Orphanage);

        const orphanages = await orphanagesRepository.find({
            relations: ['images']
        });

        return response.json(orphanageView.renderMany(orphanages));
    },

    async create(request: Request, response: Response) {
        const {
            name,
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends,
        } = request.body;

        const orphanagesRepository = getRepository(Orphanage);

        const requestImages = request.files as Express.Multer.File[];
        const images = requestImages.map(image => {
            return { path: image.filename }
        })

        const data = {
            name,
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends,
            images
        };

        const schema = Yup.object().shape({
            name: Yup.string().required('O nome é obrigatório'),
            latitude: Yup.string().required('A Latitude é obrigatória'),
            longitude: Yup.string().required('A longitude é obrigatória'),
            about: Yup.string().required('O campo Sobre é obrigatório').max(300),
            instructions: Yup.string().required('O campo Instruções é obrigatório'),
            opening_hours: Yup.string().required('O campo Horários é obrigatório'),
            open_on_weekends: Yup.boolean().required('O campo Aberto no Final de Semana é obrigatório'),

            images: Yup.array(Yup.object().shape({
                path: Yup.string().required()
            }))
        });

        await schema.validate(data, {
            abortEarly: false,
        });

        const orphanage = orphanagesRepository.create(data);

        await orphanagesRepository.save(orphanage);

        return response.status(201).json(orphanage);
    }
}