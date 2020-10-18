import { Request,Response } from 'express';
import {getRepository} from 'typeorm';
import Orphanage from '../models/Orphanage';
import orphanageView from '../views/orphanages_view';
import * as Yup from 'Yup';

const show = async function (request: Request, response: Response){
    const { id } = request.params;
    const orphanagesRepository = getRepository(Orphanage);

     const orphanage= await orphanagesRepository.findOneOrFail(id,
        {relations:['images']});

    return response.json(orphanageView.render(orphanage));
}

const index = async function (request: Request, response: Response){
    const orphanagesRepository = getRepository(Orphanage);

     const orphanage= await orphanagesRepository.find({
         relations:['images']
     });

    return response.json(orphanageView.renderMany(orphanage));
}

const create =  async function (request: Request, response: Response){
    const{
        name,
        latitude,
        longitude,
        about,
        instructions,
        open_on_weekends,
        opening_hours
    }= request.body;

    const orphanagesRepository = getRepository(Orphanage);

    const requestFiles =request.files as Express.Multer.File[];

    const images = requestFiles.map(image =>{
        return {path:image.filename}
    })

    const data = {
        name,
        latitude,
        longitude,
        about,
        instructions,       
        opening_hours,
        open_on_weekends: open_on_weekends === 'true',
        images:images
    }

    const schema = Yup.object().shape({
        name:Yup.string().required(),
        latitude:Yup.number().required(),
        about:Yup.string().required().max(300),
        instructions:Yup.string().required().required(),
        opening_hours:Yup.string().required(),
        open_on_weekends:Yup.boolean().required(),
        images: Yup.array(
            Yup.object().shape({
                path:Yup.string().required()
            })
        )
    });

    await schema.validate(data,{
        abortEarly:false
    });

    const orphanage= orphanagesRepository.create(data);

    await orphanagesRepository.save(orphanage);
    
    return response.status(201).json(orphanage);
};

export default {
    create,
    index,
    show
}